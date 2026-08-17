# T04 · 渲染与单发 CLI（L1 收尾）

> 课：L1 · 规格：[specs/01-talk.md](../specs/01-talk.md) · 预算：100 行（render 40 + cli 60） · 前置：T03

## 目标

把流事件打到终端，做出 `node src/cli.ts "你好"`。这是第一个能给人看的产物。

## 要写的文件

- `src/render.ts`（新建，40 行）
- `src/cli.ts`（新建，60 行）
- `test/render.test.ts`（新建，不计预算）

## 实现要点

`render.ts`：

- 导出 `renderEvent(ev: StreamEvent, out = process.stdout)`。
- `text` → 直接 `write(ev.delta)`，不加换行、不缓冲整句（要的就是逐字效果）。
- `thinking` → 暗色 `\x1b[2m...\x1b[0m`。首次出现时打一个 `思考中…` 前缀，结束后换行，避免思考和正文糊在一起。
- `done` → 换行；若有 usage，打印一行 `[tokens: in=14 out=10]`。
- 为了可测，渲染函数**接收输出流参数**而不是直接写死 `process.stdout`。

`cli.ts`：

- argv：`node src/cli.ts "prompt"`。无参数时打印用法并退出码 1。
- 读环境变量（缺失时报可读的错并退出码 1，不要打印堆栈吓人）。
- 组装 `messages: [{ role: "user", content: prompt }]`，`for await` 消费 `streamChat`，逐个交给 `renderEvent`。
- 监听 `SIGINT` → `controller.abort()` → 干净退出（不要打印 `AbortError` 堆栈）。

## 验收

```bash
node --test
npx tsc --noEmit
```

自动化：

- [ ] `renderEvent` 对 `text` / `thinking` / `done` 的输出符合预期（用假的 `out` 收集字符串断言）
- [ ] 缺环境变量时 `cli.ts` 退出码为 1 且提示信息含变量名
- [ ] 全量 `node --test` 全绿且**断网可跑**

真机冒烟（手工，不进 CI）：

- [ ] `node src/cli.ts "用三句话解释什么是 SSE"` 有逐字流式输出
- [ ] 思考内容以暗色显示，与正文可区分
- [ ] 中途 `Ctrl+C` 能立刻停止且不打印堆栈

## L1 收尾（本任务额外要做）

- [ ] 预算检查：`src/` 总行数 ≤ 300
- [ ] `npx tsc --noEmit` 无错
- [ ] 打 tag：`git tag l1-talk`
- [ ] 核对 [lessons/01-talk.md](../lessons/01-talk.md) 的 pi 对照数字与实际一致

## 不要做

- 不做 REPL、多轮（T18）
- 不做工具（L2）
- 不做 TUI / 光标控制 / 进度条

## 完成动作

`git commit -m "T04: render + one-shot CLI"`，打 tag，看板标 `done`。
