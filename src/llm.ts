import type { Message, StreamEvent, Usage } from "./types.ts";
import { withRetry } from "./retry.ts";

/** 携带 HTTP 状态与 Retry-After 的错误，withRetry 据此判断是否可重试。 */
export class LlmError extends Error {
  status?: number;
  retryAfterMs?: number;
}

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

// 内部 Message 的 tool_calls 是 {id,name,arguments}；线上（OpenAI/llama.cpp）要求
// {id, type:"function", function:{name,arguments}}——少一层包装服务端直接 500。
// 转换只发生在发请求这一处，内部结构与会话持久化保持简单形状。
function toWire(messages: Message[]): unknown[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
    ...(m.tool_calls
      ? {
          tool_calls: m.tool_calls.map((c) => ({
            id: c.id,
            type: "function",
            function: { name: c.name, arguments: c.arguments },
          })),
        }
      : {}),
    ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
  }));
}

export async function* streamChat(opts: ChatOptions): AsyncGenerator<StreamEvent> {
  const baseUrl = requiredEnv("LLM_BASE_URL");
  const apiKey = requiredEnv("LLM_API_KEY");
  const model = requiredEnv("LLM_MODEL");
  // 只重试「发起到拿到响应头」这一段。流已经吐出一半再重放会产生重复内容，
  // 所以 res 到手之后发生的任何失败都不在重试范围内。
  const res = await withRetry(
    async () => {
      const r = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: toWire(opts.messages),
          stream: true,
          stream_options: { include_usage: true },
          ...(opts.tools?.length ? { tools: opts.tools } : {}),
        }),
        signal: opts.signal,
      });
      if (!r.ok) {
        const err = new LlmError(`LLM ${r.status}: ${await r.text()}`);
        err.status = r.status;
        const ra = Number(r.headers.get("retry-after"));
        if (Number.isFinite(ra) && ra > 0) err.retryAfterMs = ra * 1000;
        throw err;
      }
      return r;
    },
    { signal: opts.signal },
  );
  // 响应头到手后 undici 的 abort 不会中断已在流转的 body 迭代（实测），
  // 所以 parseSSE 里要自己检查 signal；finally 里 cancel 顺手掐断连接。
  try {
    yield* parseSSE(res.body!, opts.signal);
  } finally {
    await res.body!.cancel().catch(() => {});
  }
}

// SSE 解析，三个必须做对的点：
// 1) 一个事件可能被 TCP 切成多段 —— 先入缓冲区再按 "\n\n" 切，绝不 split 单个 chunk
// 2) 多字节 UTF-8 可能断在字符中间 —— decode(chunk, { stream: true })
// 3) finish_reason 与 usage 不在同一块，usage 末块的 choices 是空数组 ——
//    done 事件必须延迟到 [DONE] 或流结束时才发，否则 usage 永远拿不到
function abortError(): Error {
  const e = new Error("This operation was aborted");
  e.name = "AbortError";
  return e;
}

async function* parseSSE(body: ReadableStream<Uint8Array>, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
  const decoder = new TextDecoder();
  let buffer = "";
  let finishReason: string | undefined;
  let usage: Usage | undefined;
  for await (const chunk of body) {
    if (signal?.aborted) throw abortError();
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
        choices?: {
          delta?: {
            content?: string | null;
            reasoning_content?: string;
            tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[];
          };
          finish_reason?: string;
        }[];
      };
      if (ev.usage) usage = ev.usage;
      const choice = ev.choices?.[0]; // usage 末块 choices 为 []，这里自然是 undefined
      const delta = choice?.delta;
      if (delta?.content) yield { type: "text", delta: delta.content };
      if (delta?.reasoning_content) yield { type: "thinking", delta: delta.reasoning_content };
      // 工具调用增量：只有第一片带 id/name，arguments 是字符串碎片——本层只透传，拼接是 loop 的职责
      for (const tc of delta?.tool_calls ?? []) {
        yield {
          type: "tool_call_delta",
          index: tc.index,
          ...(tc.id !== undefined ? { id: tc.id } : {}),
          ...(tc.function?.name !== undefined ? { name: tc.function.name } : {}),
          ...(tc.function?.arguments !== undefined ? { argsDelta: tc.function.arguments } : {}),
        };
      }
      if (choice?.finish_reason) finishReason = choice.finish_reason;
    }
  }
  // 服务端没发 [DONE] 就断流：同样补发 done，调用方不必区分这两种结束方式
  yield { type: "done", finishReason: finishReason ?? "stop", usage };
}
