import http from "node:http";

// 假模型服务器：按脚本把 SSE 字节流写回去，用来离线复现真实网络的任意分片。
// 注意：本文件会被 node --test 当作"文件级测试"执行一遍，所以不得有任何顶层副作用。

export interface FakeScript {
  chunks: string[]; // 每个元素 = 一次 socket write 的原始字节（latin1 编码，见下）
  status?: number; // 默认 200
  headers?: Record<string, string>;
}

export interface FakeServer {
  url: string; // 形如 http://127.0.0.1:PORT/v1
  requests: unknown[]; // 收到的每个请求体（已 JSON.parse），供断言用
  close(): Promise<void>;
}

// chunks 用 latin1 存取：latin1 对字节无损（1 字符 = 1 字节），这样切片可以切在
// 多字节 UTF-8 字符的中间，拼回后仍是原字节——正是要测的客户端解码场景。
// 传入数组 = 每次请求消费一个脚本，耗尽后重复最后一个（多轮 loop / 重试测试用）。
export async function startFakeLLM(script: FakeScript | FakeScript[]): Promise<FakeServer> {
  const queue = Array.isArray(script) ? script : [script];
  const requests: unknown[] = [];

  const server = http.createServer((req, res) => {
    const bodies: Buffer[] = [];
    req.on("data", (c: Buffer) => bodies.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(bodies).toString("utf8");
      try {
        requests.push(JSON.parse(raw));
      } catch {
        requests.push({ raw });
      }
      const s = queue.length > 1 ? queue.shift()! : queue[0];
      const status = s.status ?? 200;
      const headers = {
        "content-type": status === 200 ? "text/event-stream" : "application/json",
        "cache-control": "no-cache",
        ...s.headers,
      };
      res.writeHead(status, headers);
      if (status !== 200) {
        res.end(JSON.stringify({ error: { message: "fake error" } }));
        return;
      }
      void (async () => {
        for (const chunk of s.chunks) {
          res.write(Buffer.from(chunk, "latin1"));
          await new Promise((r) => setImmediate(r)); // 分开 flush，模拟真实的分批到达
        }
        res.end();
      })();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;

  return {
    url: `http://127.0.0.1:${port}/v1`,
    requests,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

/** 把一段 SSE 文本按给定字节数切块（可切在多字节字符中间），拼回后与原字节一致。 */
export function sliceBytes(sse: string, size: number): string[] {
  const buf = Buffer.from(sse, "utf8");
  const out: string[] = [];
  for (let i = 0; i < buf.length; i += size) {
    out.push(buf.subarray(i, i + size).toString("latin1"));
  }
  return out;
}
