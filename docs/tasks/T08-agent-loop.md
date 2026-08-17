# T08 · agent loop

> 课：L2 · 规格：[specs/02-tools.md「agent loop」](../specs/02-tools.md) · 预算：115 行 · 前置：T07

## 目标

写出整个项目的心脏：**「调模型 → 有工具调用就执行 → 结果塞回消息 → 再调模型」的循环**。所谓 agent，去掉包装后就是这个 while。

## 要写的文件

- `src/loop.ts`（新建）
- `test/loop.test.ts`（新建，不计预算）

## 实现要点

```ts
export async function* runAgent(opts: {
  messages: Message[]; tools: Tool[]; cwd: string;
  maxSteps?: number; signal?: AbortSignal;
}): AsyncGenerator<AgentEvent>;
```

循环体：

1. 调 `streamChat`，透传事件给调用方（CLI 要实时显示）
2. 同时按 `index` 累积 `tool_call_delta` 成完整 `ToolCall[]`
3. 流结束后：无 tool_calls → **退出循环**；有 → 继续
4. 把 assistant 消息（含 `tool_calls`）**先** push 进 `messages`
5. 逐个执行工具，每个结果 push 一条 `{ role: "tool", tool_call_id, content }`
6. `step++`，回到 1

### 必须守住的四点

- **消息顺序不可乱。** 带 `tool_calls` 的 assistant 消息必须紧跟它的全部 `tool` 消息，且每个 `tool_call_id` 都要有对应结果。少一条，下一次请求就会被 API 拒绝。这个约束在 T15 裁剪上下文时会再次咬人。
- **工具错误是消息，不是异常。** 参数校验失败、执行抛错、超时，一律 catch 成 `error: ...` 文本作为 tool 结果回给模型，让它自己改正重试。工具报错就 crash 的 agent 是没用的。
- **`maxSteps` 默认 10。** 超限时退出并产出一个明确的 `error` 事件，别静默停止。没有这个上限，模型循环调同一个工具会把 token 烧光。
- **`signal` 要贯穿**到 `streamChat` 和每个 `tool.execute`。

工具按数组顺序**串行**执行。并行是 [specs/02-tools.md](../specs/02-tools.md) 里的练习题，不在本任务范围。

## 验收

```bash
node --test test/loop.test.ts
npx tsc --noEmit
```

用假模型编排多轮脚本（第一轮返回 tool_calls，第二轮返回文本）：

- [ ] 单工具单轮：模型→工具→模型，最终文本正确，且假服务器第二次收到的 `messages` 里 assistant + tool 顺序正确
- [ ] **参数校验失败**：错误文本作为 tool 结果回给模型，循环继续，进程不崩
- [ ] **工具 execute 抛异常**：同上被捕获成文本
- [ ] 两个 tool_calls 都执行，产生两条 tool 消息，`tool_call_id` 一一对应
- [ ] `maxSteps: 2` 时死循环脚本能停下并产出错误事件
- [ ] `abort()` 后循环在当前步结束、不再发起新请求
- [ ] 行数 ≤ 115

## 不要做

- 不做上下文裁剪（T15）、不做重试（T17）、不做会话持久化（T16）
- 不做并行工具执行
- 不在 loop 里 `console.log`——所有输出都通过 yield 事件交给 CLI

## 完成动作

`git commit -m "T08: agent loop"`，看板标 `done`。
