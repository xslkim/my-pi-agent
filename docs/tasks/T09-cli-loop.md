# T09 · CLI 接 loop（L2 收尾）

> 课：L2 · 规格：[specs/02-tools.md](../specs/02-tools.md) · 预算：10 行（`cli.ts` 增量） · 前置：T08

## 目标

把 CLI 从「直连 `streamChat`」改成「走 `runAgent`」，让它真的会用工具。

## 要写的文件

- `src/cli.ts`（修改，+10 行）
- `src/render.ts`（可能微调，含在 L2 预算内）

## 实现要点

- 把 `streamChat(...)` 换成 `runAgent({ messages, tools: [calculator], cwd: process.cwd() })`。
- 渲染新增两类提示，让工具调用**可见**（看不见就没法教，也没法排错）：
  - 调用时：`\n→ calculator({"op":"mul","a":21,"b":2})\n`
  - 返回时：`← 42\n`
  - 结果超过 200 字符时截断显示，末尾加 `…`
- 保持单发模式，仍然是 `node src/cli.ts "..."`。

## 验收

```bash
node --test
npx tsc --noEmit
```

自动化：

- [ ] 全量测试全绿且断网可跑

真机冒烟（手工）：

- [ ] `node src/cli.ts "用计算器算 (21*2)+8 等于几"` → 终端可见工具调用与返回，最终答案 50
- [ ] `node src/cli.ts "北京到上海大概多远"` → 不调用工具，直接回答（验证模型没有滥用工具）
- [ ] 故意问一个会让模型传错参数的问题，观察它收到错误信息后自行改正

## L2 收尾（本任务额外要做）

- [ ] 预算检查：`src/` 总行数 ≤ 550
- [ ] `npx tsc --noEmit` 无错
- [ ] 打 tag：`git tag l2-tools`
- [ ] 核对 [lessons/02-tools.md](../lessons/02-tools.md) 的对照数字

## 不要做

- 不加计算器以外的工具（L3）
- 不做多轮对话（T18）

## 完成动作

`git commit -m "T09: CLI uses agent loop"`，打 tag，看板标 `done`。
