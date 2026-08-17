# T02 · 假模型服务器

> 课：L1 · 规格：[specs/01-talk.md「假模型服务器」](../specs/01-talk.md) · 预算：0 行（在 `test/`，不计） · 前置：T01

## 目标

写一个能**按任意字节边界**回放 SSE 的假 LLM 服务器。它是后面所有测试的地基：让全部单测离线、毫秒级、可复现地覆盖真实网络才会出现的分片情况。

**先写它，再写 `llm.ts`**——否则 T03 无法测试。

## 要写的文件

- `test/fake-llm.ts`（新建）

## 实现要点

```ts
export interface FakeScript {
  chunks: string[];        // 每个元素 = 一次 socket write 的原始字节
  status?: number;         // 默认 200
  headers?: Record<string, string>;
}

export interface FakeServer {
  url: string;                       // 形如 http://127.0.0.1:PORT/v1
  requests: any[];                   // 收到的请求体（已 JSON.parse），供断言用
  close(): Promise<void>;
}

export async function startFakeLLM(script: FakeScript): Promise<FakeServer>;
```

- 用 `node:http`，监听 `127.0.0.1` 的 **0 端口**（让系统分配），从 `server.address()` 取实际端口拼出 `url`。绝不要写死端口，否则并行测试会互相抢占。
- 响应头 `content-type: text/event-stream`、`cache-control: no-cache`。
- 依次 `res.write(chunk)`，**每写一块 flush 一次**，最后 `res.end()`。
- `chunks` 里的内容原样写出，不要替 caller 补 `\n\n`——测试要靠这个精确控制切分点。
- 把请求体收全后 `JSON.parse` 塞进 `requests`，方便断言「`tools` 字段有没有正确发出去」。
- `status` 非 2xx 时直接返回错误 JSON，用于测 T03 的错误分支。
- 提供一个便捷函数把「一段完整 SSE 文本」按给定字节数切块，便于写分片用例：

```ts
export function sliceBytes(sse: string, size: number): string[];
```

- **不能有顶层副作用**（不要在模块顶层起服务、不要 `console.log`）。`node --test` 会把 `test/` 下每个 `.ts` 都当测试文件执行一遍，包括这个纯工具模块；有副作用就会在每次跑测试时莫名启动一个服务。

## 验收

```bash
node --test test/fake-llm.test.ts
```

写 `test/fake-llm.test.ts` 自测这个工具本身：

- [ ] 起服务后 `fetch(url)` 能拿到 200 和 `text/event-stream`
- [ ] 分成 3 块写出的内容，客户端完整收到且顺序一致
- [ ] `requests` 能拿到发出去的 JSON body
- [ ] `status: 500` 时客户端拿到 500
- [ ] `close()` 后端口释放（再次 `fetch` 失败）
- [ ] `sliceBytes` 对含中文的字符串按字节切分，拼回后与原文一致

## 不要做

- 不实现真实推理逻辑，不模拟模型智能——它只回放脚本
- 不放进 `src/`（这是测试设施，不占预算）

## 完成动作

`git commit -m "T02: fake LLM server for offline tests"`，看板标 `done`。
