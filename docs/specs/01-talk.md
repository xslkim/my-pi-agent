# Spec 01 · 让模型说话（SSE 客户端）

> 课程：[lessons/01-talk.md](../lessons/01-talk.md) · Tag `l1-talk` · 行数预算 ≤ 300

## 目标

手写一个 OpenAI 兼容的流式客户端，`node src/cli.ts "你好"` 能在终端逐字看到局域网 Qwen 的回答与思考过程。不用任何第三方库。

## 交付物

| 文件 | 职责 | 预算 |
|---|---|---|
| `src/types.ts` | 消息、内容块、流事件的类型 | 60 |
| `src/llm.ts` | `streamChat()`：构造请求 + 解析 SSE | 120 |
| `src/render.ts` | 把流事件打到终端 | 40 |
| `src/cli.ts` | 读 argv 与环境变量，跑一次对话 | 60 |
| `test/fake-llm.ts` | 假模型服务器（回放 SSE 脚本） | 80 |
| `test/llm.test.ts` | SSE 解析测试 | — |

## 数据结构

```ts
// src/types.ts
export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: Role;
  content: string;
  tool_calls?: ToolCall[];   // assistant 专用，L2 用
  tool_call_id?: string;     // role: "tool" 专用，L2 用
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;         // 原始 JSON 字符串，拼接完再 parse
}

export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "thinking"; delta: string }
  | { type: "tool_call_delta"; index: number; id?: string; name?: string; argsDelta?: string }
  | { type: "done"; finishReason: string; usage?: Usage };

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
}
```

L1 只产生 `text` / `thinking` / `done`；`tool_call_delta` 的字段先定义好，L2 填实现。

## 核心实现

### 请求

```ts
// src/llm.ts
export interface ChatOptions {
  messages: Message[];
  tools?: ToolSchema[];      // L2 起
  signal?: AbortSignal;
}

export async function* streamChat(opts: ChatOptions): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
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
```

`streamChat` 是 async generator：调用方 `for await` 消费，天然支持背压与提前 `break`。

### SSE 解析（本课唯一的真难点）

```ts
async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const line = raw.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      yield* toEvents(JSON.parse(payload));
    }
  }
}
```

三个必须做对的点：

1. **缓冲区跨 chunk**。一个 SSE 事件可能被切成两个 TCP chunk，必须 `buffer +=` 后再找 `\n\n`，不能对单个 chunk 做 split。
2. **`decode(chunk, { stream: true })`**。多字节 UTF-8（中文）会跨 chunk 断开，不加 `stream: true` 会吐乱码。
3. **`[DONE]` 不是 JSON**，先判断再 parse。

### 事件映射

```ts
function* toEvents(chunk: any): Generator<StreamEvent> {
  const choice = chunk.choices?.[0];
  if (chunk.usage && !choice) { /* 末块只带 usage，记下备用 */ }
  const delta = choice?.delta;
  if (delta?.content) yield { type: "text", delta: delta.content };
  if (delta?.reasoning_content) yield { type: "thinking", delta: delta.reasoning_content };
  if (choice?.finish_reason) {
    yield { type: "done", finishReason: choice.finish_reason, usage: chunk.usage };
  }
}
```

`reasoning_content` 是 llama.cpp 的思考字段（pi 还会兼容 `reasoning` / `reasoning_text`，我们只服务一个端点，只认这一个）。

### 配置

`src/cli.ts` 读三个环境变量，给出默认值并在缺失时报可读的错：

```ts
const BASE_URL = process.env.LLM_BASE_URL ?? "http://192.168.3.28:8080/v1";
const API_KEY = process.env.LLM_API_KEY ?? "sk-local-qwen36";
const MODEL = process.env.LLM_MODEL ?? "qwen3.8-27b";
```

## 假模型服务器

`test/fake-llm.ts`：起一个 `node:http` 服务，按给定脚本把 SSE 字节写回去。关键能力是**按任意字节边界切分**，用来复现真实网络的分片。

```ts
export interface FakeScript {
  chunks: string[];        // 每个元素是一次 socket write 的原始字节
  status?: number;
}

export async function startFakeLLM(script: FakeScript): Promise<{ url: string; close(): Promise<void>; requests: any[] }>;
```

用法：把一个完整 SSE 事件故意拆成 `['data: {"choi', 'ces":[{"delta":{"content":"hi"}}]}\n\n']` 两次写，验证解析器仍能正确产出一个 `text` 事件。

## 测试（`node --test`，全部离线）

| 用例 | 断言 |
|---|---|
| 正常流 | 三个 content 增量拼成 `"你好世界"` |
| **跨 chunk 切分** | 同一事件被切成 2/3 段，结果不变 |
| **中文跨 chunk** | UTF-8 字节在中间断开，不出现乱码 |
| thinking | `reasoning_content` 产出 `thinking` 事件，与 `text` 分离 |
| `[DONE]` | 正常终止，不抛 JSON 解析错 |
| HTTP 500 | 抛出含状态码与响应体的错误 |
| abort | `AbortController.abort()` 后生成器结束 |

## 验收

1. `node src/cli.ts "用一句话介绍你自己"` 对局域网模型有流式输出，思考与正文可区分。
2. `node --test` 全绿且断网可跑。
3. `npx tsc --noEmit` 无错。
4. 新增 ≤ 300 行。

## 不做

多 provider 兼容、重试（L4）、工具（L2）、多轮（L4）、token 计费。
