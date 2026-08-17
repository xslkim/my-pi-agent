# T23 · 按失败记录加固

> 课：L5 · 规格：[specs/05-delivery.md「三、我们要补的能力」](../specs/05-delivery.md) · 预算：90 行 · 前置：T22

## 目标

把 [run1](T21-bare-run.md) 记录的**其余**卡点逐条修掉。**每一处改动都必须能指回记录里的某一条**——这是本任务的纪律，也是这一课要传达的方法：加固由证据驱动，不由想象驱动。

在 `docs/runs/run1.md` 里没有对应条目的改动，一律不做。

## 要改的文件（以 run1 为准，下面是预判清单）

### 1. bash 危险命令确认（约 30 行，`src/tools/bash.ts`）

- 匹配一组危险模式：`rm -rf /`、`rm -rf ~`、`:(){`、`mkfs`、`dd of=/dev/`、`> /dev/sd`、`git push --force`、`git reset --hard`、`shutdown`/`reboot`
- 命中时的分支：**REPL 模式**要求用户输入 `yes` 确认；**单发模式（带 prompt 参数）一律视为非交互，直接拒绝**并把原因作为工具结果回给模型
- 「单发即非交互」这条不能少：L5 的两次正式运行都是从终端发起的单发命令，stdin 确实是 TTY，若按 TTY 判断就会弹出确认并**阻塞等人**——而 [T21](T21-bare-run.md)/[T24](T24-final-run.md) 明确要求全程不干预，跑一半卡住就废了
- `--yolo` 可跳过确认（课上要讲清楚这个开关意味着什么）。参数名统一用 `--yolo`，spec 05 早先写的 `--yes` 已作废
- 正则要够窄：`rm -rf ./build` 属于正常操作，不该被拦

### 2. edit 错误信息增强（约 20 行，`src/tools/edit.ts`）

- 找不到 `old_string` 时，做一次**行级近似匹配**，提示最接近的那几行及行号：
  ```
  error: old_string not found in src/app.ts.
  Closest lines: 42| const port = 3000;
  Hint: whitespace or indentation may differ.
  ```
- 最常见的真实原因是缩进或行尾空白不一致，提示里要点明

### 3. 步数、上下文与 prompt（约 25 行，`src/prompt.ts` + `src/cli.ts`）

- `--max-steps` 默认在 `--cwd` 模式下提到 30（L5 任务实测需要 20+ 步）
- 若 run1 记录显示上下文被反复裁剪导致 agent 忘事，把 `--context-budget` 默认值上调（窗口是 65536，上调空间充足）；**没观察到就不要动**
- system prompt 增加**自验证条款**：完成前必须跑一次相关命令验证（`node --check` 或起服务打一次接口），且在汇报里附上验证输出
- prompt 增加：先 `ls` 了解项目结构再动手

### 4. 步数预警（约 15 行，`src/loop.ts`）

- 剩余步数 ≤ 3 时注入一条提示，让模型收敛去做最关键的事，而不是在步数耗尽时被硬砍
- 注入成 `{ role: "user", content: "[system] 剩余 N 步..." }`，**只注入一次**，并且和普通消息一样计入上下文预算。用 `user` 而不是再插一条 `system`：中途插入的 system 消息容易被模型当成设定变更，而 user 角色的提醒它照样会响应

## 验收

```bash
node --test
npx tsc --noEmit
```

- [ ] 危险命令在单发模式被拒绝，返回文本说明原因，**且不阻塞等待输入**
- [ ] `rm -rf ./build` 等正常命令**不被误拦**
- [ ] `--yolo` 下危险命令放行
- [ ] `edit` 找不到时给出近似行与行号提示
- [ ] 步数预警在剩余 3 步时以 `user` 角色注入且只注入一次
- [ ] 全量测试全绿且断网可跑
- [ ] 行数：本任务新增 ≤ 90，`src/` 总计 ≤ 1400

## 不要做

- 不做 run1 里没出现的「预防性」加固
- 不重构已有模块（预算不够，且会破坏前四课的教学快照）

## 完成动作

在 `docs/runs/run1.md` 每条卡点后标注「已由 T23-x 处理」。
`git commit -m "T23: harden agent based on run1 findings"`，看板标 `done`。
