# Spec 04 · 让 agent 好用（REPL / 中止 / 会话 / 上下文 / 重试）

> 课程：[lessons/04-usable.md](../lessons/04-usable.md) · Tag `l4-usable` · 行数预算 ≤ 300（累计 ≤ 1200）

## 目标

把 L3 的「能跑一次」变成「每天能用」：多轮 REPL、`Ctrl+C` 只停当前轮、关掉再开能续聊、聊很久也不炸上下文、网络抖动能自愈。

这一课全是工程细节，但它决定 L5 能不能撑住一个真实任务。**没有上下文管理，L5 一定死在半路。**

## 交付物

| 文件 | 职责 | 预算 |
|---|---|---|
| `src/repl.ts` | readline 循环、中止、斜杠命令 | 110 |
| `src/session.ts` | JSONL 持久化与恢复 | 60 |
| `src/context.ts` | token 估算与上下文裁剪 | 70 |
| `src/retry.ts` | 请求重试 | 40 |

`src/cli.ts` 扩展 argv 解析；`src/loop.ts` 接入 `context` 与 `retry`。

## 1. REPL 与中止

```ts
export async function startRepl(opts: { cwd: string; sessionFile?: string; resume?: boolean }): Promise<void>;
```

- `node:readline/promises` 循环，提示符 `> `
- 斜杠命令：`/exit`、`/reset`、`/tokens`（打印当前上下文用量）、`/tools`（列工具）
- 流式输出：正文直接写 stdout；思考用暗色包裹（`\x1b[2m`），可用 `--no-thinking` 关掉
- 工具调用打印一行 `· read(path=src/a.ts)`，结束后打印耗时

**中止是本节的难点。** `AbortSignal` 必须贯穿三层，缺一层就会「按了 Ctrl+C 但它还在打字」：

```
SIGINT → controller.abort()
      → fetch 的 signal（停止接收 SSE）
      → 工具 execute 的 ctx.signal（杀掉 bash 子进程）
      → loop 检查 signal.aborted，停止下一步
```

中止后**要把已经产生的部分消息保留在历史里**（带 `[aborted]` 标记），否则下一轮的 `tool_call_id` 会对不上导致 400。

`Ctrl+C` 语义：正在跑 → 中止当前轮，回到提示符；空闲时 → 退出程序。

## 2. 会话持久化（`session.ts`）

最小 append-only JSONL，一行一条消息：

```ts
export function appendMessage(file: string, msg: Message): Promise<void>;   // JSON.stringify + "\n"
export function loadMessages(file: string): Promise<Message[]>;             // 逐行 parse，跳过坏行
```

- 每条消息产生时立刻 append（不是退出时统一写，崩溃也不丢）
- 读取时**跳过解析失败的行**并警告——崩溃可能留下半行
- CLI 参数：`-s <file>` 指定会话文件，`-c` 续聊
- 默认路径 `.agent/sessions/<timestamp>.jsonl`

为什么 append-only：写入是 O(1) 且原子性好，崩溃最多丢最后一行。代价是没有分支、没有压缩历史。L5 会亲身体会这个代价。

## 3. 上下文预算（`context.ts`）

模型上下文 65536。超了服务端直接 400，整个会话作废——这是 L5 最容易踩的死法。

```ts
export function estimateTokens(messages: Message[]): number;
export function fitContext(messages: Message[], budget: number): Message[];
```

**估算**：`Math.ceil(chars / 3)`。中文约 1 token/字、英文约 1 token/4 字符，取 3 是保守折中。不引 tokenizer 依赖（零依赖原则），估算偏保守即可。

**裁剪策略**（简单但正确）：

1. 永远保留 system prompt
2. 永远保留最近 N 轮（默认 4 轮）
3. 从最老的一轮开始丢弃，直到估算值低于 `budget`（默认 `contextWindow * 0.7`）
4. **丢弃必须成组**：一条 assistant(tool_calls) 和它对应的所有 `role: "tool"` 消息要么都留要么都丢。只丢一半会产生孤儿 `tool_call_id`，服务端报 400
5. 在裁剪位置插入一条 `{ role: "system", content: "[earlier conversation trimmed]" }`

不做 LLM 摘要压缩（pi 有 compaction，我们在 L5 的 pi 对照里讲）。

## 4. 重试（`retry.ts`）

```ts
export async function withRetry<T>(fn: () => Promise<T>, opts?: { retries?: number; signal?: AbortSignal }): Promise<T>;
```

- 重试：网络错误、5xx、429
- **不重试**：4xx（除 429）——请求本身有问题，重试只会重复失败；abort
- 指数退避 `500ms * 2^n`，上限 8s，加 ±20% 抖动
- 尊重 `Retry-After` 响应头
- 每次重试打印一行提示，不要静默（学员要看见发生了什么）

注意：**流式响应重试只能在收到第一个 token 之前**。已经吐了一半再重来会产生重复内容。收到首个事件后失败，就作为错误上报。

## 测试（离线）

| 用例 | 断言 |
|---|---|
| 会话往返 | 写 3 条消息，重新加载后角色序列一致 |
| 坏行容错 | 文件中间插入半行 JSON，加载跳过并保留其余 |
| **上下文裁剪** | 构造超预算历史，裁剪后低于预算且 system 保留 |
| **成组丢弃** | 裁剪不会留下没有 assistant 父消息的 `role: "tool"` |
| 最近轮保留 | 最近 4 轮永不被裁 |
| 重试 5xx | 假模型前两次 500、第三次成功，最终成功且重试 2 次 |
| 不重试 400 | 立刻失败，无重试 |
| 重试 429 | 尊重 `Retry-After` |
| **abort 贯穿** | 流到一半 abort，fetch 停止、bash 子进程被杀、loop 退出 |
| REPL 多轮 | 注入两轮输入，第二轮能看到第一轮的上下文 |

## 验收

1. REPL 连续聊 5 轮以上稳定，`Ctrl+C` 只停当前轮。
2. 退出后 `-c` 续聊，模型记得上文。
3. 人为造一个超长会话，agent 自动裁剪而不是报 400。
4. 全部测试绿；累计 ≤ 1200 行；`tsc --noEmit` 无错。

## 不做

LLM 摘要压缩、会话分支、多会话管理、TUI 差分渲染、成本统计。
