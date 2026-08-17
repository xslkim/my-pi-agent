# T18 · REPL 与中止贯穿

> 课：L4 · 规格：[specs/04-usable.md「1. REPL 与中止」](../specs/04-usable.md) · 预算：110 行 · 前置：T17

## 目标

从「一次一问」变成「坐下来一直聊」。**Ctrl+C 的语义**是本任务最需要打磨的地方——它决定了这个 agent 用起来是舒服还是难受。

## 要写的文件

- `src/repl.ts`（新建）
- `test/repl.test.ts`（新建，不计预算）

## 实现要点

用 `node:readline/promises`，零依赖。

循环：读一行 → 追加 user 消息 → `fitContext` → `runAgent` → 渲染 → 落盘 → 回到读一行。

### 斜杠命令

- `/exit`（或 Ctrl+D）退出
- `/clear` 清空历史（保留 system）
- `/history` 打印当前消息条数与估算 token
- `/save <name>` 另存会话
- 未知命令给提示，**不要当成普通输入发给模型**

### Ctrl+C 的两段语义（重点）

- 生成中按 → **中止本轮**，回到提示符，会话保留
- 空闲时按 → 退出程序

这需要在每轮开始时新建 `AbortController`，`SIGINT` 处理器根据「当前是否在生成」分派。**注意在轮次结束时移除监听器**，否则 `MaxListenersExceededWarning` 会在聊到第 11 轮时冒出来。

中止后，**已经产生的部分助手输出仍要作为一条 assistant 消息存进历史**。丢弃它会让下一轮的上下文出现空洞，模型会答非所问。

### 落盘

每条消息产生时立即 `appendMessage`（T16），不要攒到退出——退出往往是 Ctrl+C，攒着就丢了。

## 验收

```bash
node --test test/repl.test.ts
npx tsc --noEmit
```

REPL 逻辑要能脱离真实 TTY 测试：把输入输出流做成可注入参数，测试时传入内存流。

- [ ] 连续两轮输入，第二轮请求的 `messages` 里含第一轮的问答（用假模型的 `requests` 断言）
- [ ] `/clear` 后历史只剩 system
- [ ] `/exit` 正常退出
- [ ] 未知斜杠命令不会被发给模型
- [ ] **中止**：模拟生成中触发 abort，部分输出被存为 assistant 消息，且 REPL 能继续下一轮
- [ ] 每轮消息都落盘，中途终止后 `loadSession` 能读到已完成的部分
- [ ] 连续 15 轮不产生 listener 警告
- [ ] 行数 ≤ 110

## 不要做

- 不做多行输入编辑器、语法高亮、补全
- 不做 TUI 框架
- 不做并发多会话

## 完成动作

`git commit -m "T18: REPL with abort semantics"`，看板标 `done`。
