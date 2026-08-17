import type { Message, StreamEvent, Usage } from "./types.ts";

export interface ToolSchema {
  type: "function";
  function: { name: string; description: string; parameters: unknown };
}

export interface ChatOptions {
  messages: Message[];
  tools?: ToolSchema[]; // L2 起使用；本层不解析内容，只透传进请求体
  signal?: AbortSignal;
}

// 环境变量必填、不设默认值：缺失时报可读的错，也不把内网地址和 key 硬编码进源码。
function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env ${name}; see README for the LAN endpoint`);
  return v;
}

export async function* streamChat(opts: ChatOptions): AsyncGenerator<StreamEvent> {
  const baseUrl = requiredEnv("LLM_BASE_URL");
  const apiKey = requiredEnv("LLM_API_KEY");
  const model = requiredEnv("LLM_MODEL");
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      stream: true,
      stream_options: { include_usage: true },
      ...(opts.tools?.length ? { tools: opts.tools } : {}),
    }),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  yield* parseSSE(res.body!);
}

// SSE 解析，三个必须做对的点：
// 1) 一个事件可能被 TCP 切成多段 —— 先入缓冲区再按 "\n\n" 切，绝不 split 单个 chunk
// 2) 多字节 UTF-8 可能断在字符中间 —— decode(chunk, { stream: true })
// 3) finish_reason 与 usage 不在同一块，usage 末块的 choices 是空数组 ——
//    done 事件必须延迟到 [DONE] 或流结束时才发，否则 usage 永远拿不到
async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const decoder = new TextDecoder();
  let buffer = "";
  let finishReason: string | undefined;
  let usage: Usage | undefined;
  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const line = raw.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") {
        yield { type: "done", finishReason: finishReason ?? "stop", usage };
        return;
      }
      const ev = JSON.parse(payload) as {
        usage?: Usage;
        choices?: { delta?: { content?: string | null; reasoning_content?: string }; finish_reason?: string }[];
      };
      if (ev.usage) usage = ev.usage;
      const choice = ev.choices?.[0]; // usage 末块 choices 为 []，这里自然是 undefined
      const delta = choice?.delta;
      if (delta?.content) yield { type: "text", delta: delta.content };
      if (delta?.reasoning_content) yield { type: "thinking", delta: delta.reasoning_content };
      if (choice?.finish_reason) finishReason = choice.finish_reason;
    }
  }
  // 服务端没发 [DONE] 就断流：同样补发 done，调用方不必区分这两种结束方式
  yield { type: "done", finishReason: finishReason ?? "stop", usage };
}
