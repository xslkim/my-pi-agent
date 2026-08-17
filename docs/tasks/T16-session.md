# T16 · JSONL 会话持久化

> 课：L4 · 规格：[specs/04-usable.md「会话持久化」](../specs/04-usable.md) · 预算：60 行 · 前置：T15

## 目标

让会话能存下来、能续上。**JSONL 追加写**是这里的关键选择。

## 要写的文件

- `src/session.ts`（新建）
- `test/session.test.ts`（新建，不计预算）

## 实现要点

```ts
export function appendMessage(file: string, m: Message): void;
export function loadSession(file: string): Message[];
```

- 存到 `.agent/sessions/<name>.jsonl`，目录自动创建。
- **每条消息一行 JSON，追加写**。为什么不是「整个数组写成一个 JSON 文件」：追加写是 O(1) 且**进程被 Ctrl+C 杀掉时已写入的部分完好**；整文件重写在长会话里既慢，又会在中断时把整个文件写坏。
- 读取时**逐行 `JSON.parse`，坏行跳过**并往 stderr 打一条警告。上一次崩溃可能留下半行，不该让整个会话读不出来。
- 消息内容里的换行由 `JSON.stringify` 转义，天然安全——**不要**自己拼字符串。
- `loadSession` 对不存在的文件返回 `[]`，不抛错（首次运行就是这个情况）。

## 验收

```bash
node --test test/session.test.ts
npx tsc --noEmit
```

- [ ] 追加 3 条消息后 `loadSession` 按序返回 3 条
- [ ] 含换行、引号、中文的消息往返后完全一致
- [ ] **半行损坏**：手工往文件尾写一个不完整的 JSON，`loadSession` 仍返回前面的完整消息
- [ ] 文件不存在返回 `[]`
- [ ] 目录不存在时 `appendMessage` 自动创建
- [ ] 带 `tool_calls` 的 assistant 消息往返后结构完整
- [ ] 行数 ≤ 60

## 不要做

- 不用 `node:sqlite`（会话是纯追加的顺序数据，JSONL 更贴合，也更容易 `cat` 出来讲课）
- 不做会话压缩 / 归档 / 加密

## 完成动作

`git commit -m "T16: JSONL session persistence"`，看板标 `done`。
