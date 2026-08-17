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
- 斜杠命令：`/exit`（或 Ctrl+D）、`/clear`（清空历史，保留 system）、`/history`（打印消息条数与估算 token）、`/save <name>`（另存会话）。未知命令给提示，**不要当成普通输入发给模型**
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
export function appendMessage(file: string, msg: Message): void;   // appendFileSync，JSON.stringify + "\n"
export function loadSession(file: string): Message[];              // 逐行 parse，跳过坏行；文件不存在返回 []
```

**同步 API**，不是 `Promise`。理由不是省事：这两个函数唯一的卖点是「进程被 Ctrl+C 杀掉时已写入的部分完好」，而异步写在事件循环里排队，恰恰可能在退出时丢掉最后一条。同步 `appendFileSync` 让「写完即落盘」这件事在代码上是显然的，实现也更短。

- 每条消息产生时立刻 append（不是退出时统一写，崩溃也不丢）
- 读取时**跳过解析失败的行**并警告——崩溃可能留下半行
- CLI 参数：`-s <name>` 指定会话**名字**，`-c` 续聊
- 路径由代码拼成 `.agent/sessions/<name>.jsonl`，**`-s` 不带后缀**（传 `x.jsonl` 会得到 `x.jsonl.jsonl`）
- 默认名字是时间戳

为什么 append-only：写入是 O(1) 且原子性好，崩溃最多丢最后一行。代价是没有分支、没有压缩历史。L5 会亲身体会这个代价。

## 3. 上下文预算（`context.ts`）

模型上下文 65536。超了服务端直接 400，整个会话作废——这是 L5 最容易踩的死法。

```ts
export function estimateTokens(s: string): number;                          // 收字符串，可组合
export function fitContext(messages: Message[], budget: number): Message[]; // 内部对每条消息套 estimateTokens
```

**估算**：不引 tokenizer（零依赖原则），但系数要用实测值，不能拍脑袋。

本机对 Qwen3.8 实测（用 `max_tokens: 1` 请求读 `usage.prompt_tokens`，减去约 12 token 的对话模板开销）：

| 文本 | 实测 | 折合 |
|---|---|---|
| 中文散文 97 字 | 56 token | **0.58 token/字** |
| TypeScript 代码 249 字符 | 68 token | **3.7 字符/token** |

所以：

```ts
const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/g;
export function estimateTokens(s: string): number {
  const cjk = (s.match(CJK) ?? []).length;
  return Math.ceil(cjk * 0.7 + (s.length - cjk) / 3.5);   // 实测 0.58 / 3.7，各留约 20% 余量
}
```

两个常见的错误取值，都别用：

- `chars / 3` 一刀切——对中文低估约 1.8 倍。这门课全程中文交互，低估意味着 `fitContext` 以为还有余量，实际已经逼近 65536。**为了避免 400 写的裁剪，反而保证了会 400。**
- CJK 一律按 1 token/字——比实测高 1.7 倍。安全但浪费：会在真实用量只有 60% 时就开始裁剪，L5 那种长任务经不起这么糟蹋。

**裁剪策略**（简单但正确）：

1. 永远保留 system prompt
2. 优先保留最近 4 轮；只有丢光更早的历史仍然超预算时才动它们。**最近一轮 user 消息是硬底线**，连它都放不下就返回 system + 该消息，让请求自然报错，不要静默返回空数组
3. 从最老的一轮开始丢弃，直到估算值低于 `budget`（CLI 默认 24000，参数 `--context-budget`）

预算默认值为什么不是 `65536 * 0.7`：估算本身有 ±20% 误差，模型还要留出生成空间，而超限的代价是整轮 400 作废。24000 大约是窗口的 37%，对 L5 的长任务实测够用；真不够时用 `--context-budget` 显式抬高，比默认值贴着上限安全。参数名刻意不叫 `--max-tokens`——那是 OpenAI 的生成长度上限，撞名会让人和模型都误解。
4. **丢弃必须成组**：一条 assistant(tool_calls) 和它对应的所有 `role: "tool"` 消息要么都留要么都丢。只丢一半会产生孤儿 `tool_call_id`，服务端报 400
5. 在裁剪位置插入一条 `{ role: "system", content: "[earlier conversation trimmed]" }`

不做 LLM 摘要压缩（pi 有 compaction，我们在 L5 的 pi 对照里讲）。

## 4. 重试（`retry.ts`）

```ts
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts?: { retries?: number; baseMs?: number; signal?: AbortSignal },
): Promise<T>;
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
