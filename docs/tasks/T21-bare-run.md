# T21 · 裸跑 run1 与失败记录

> 课：L5 · 规格：[specs/05-delivery.md「四、执行流程」](../specs/05-delivery.md) · 预算：0 行 · 前置：T20

## 目标

**用当前这个 agent 原样去做登录应用，然后如实记录它在哪里卡住。** 这一轮大概率不会成功——那正是目的。L5 后面所有的加固都必须由这份记录驱动，而不是凭想象。

这是本课程的核心教学时刻：让学员看见「能调工具」和「能交付」之间的真实差距。

## 要产出的文件

- `docs/runs/run1.md`（失败记录）
- `docs/runs/l5-run1.jsonl`（会话原始记录，**提交**以便课上回放）

## 怎么做

```powershell
New-Item -ItemType Directory -Force demo/login-app
node src/cli.ts --cwd demo/login-app -s l5-run1 --max-steps 30 (Get-Content -Raw acceptance/task-prompt.md)
```

bash 下等价写法：

```bash
mkdir -p demo/login-app
node src/cli.ts --cwd demo/login-app -s l5-run1 --max-steps 30 "$(cat acceptance/task-prompt.md)"
```

任务描述**必须**从 `acceptance/task-prompt.md` 读取，不要手工摘抄、不要临场润色——[T24](T24-final-run.md) 要拿 run2 和这一轮逐字对比，改了描述对比就失去意义。

跑完后：

```bash
node --test acceptance/login-app.smoke.ts
```

会话默认落在 `.agent/sessions/l5-run1.jsonl`（被 `.gitignore` 忽略）。记录完后复制一份到 `docs/runs/l5-run1.jsonl` 再提交：

```powershell
Copy-Item .agent/sessions/l5-run1.jsonl docs/runs/l5-run1.jsonl
```

## 记录什么

`docs/runs/run1.md` 至少覆盖：

- [ ] 冒烟测试结果：10 条断言里哪几条过了、哪几条没过
- [ ] **agent 每一步做了什么**（工具序列摘要）
- [ ] 卡住的具体位置和原因，每条都要能对应到一个可执行的改进项
- [ ] 消耗的步数、token、墙上时间
- [ ] 主观观察：它有没有反复读同一个文件？有没有瞎猜文件名？有没有跑测试验证？

### 预期会暴露的问题（**先别改，先确认**）

规格里预判了这几类，但**以实际观察为准**，不要把没发生的问题写进记录：

1. 没有 `ls` / `grep`，只能靠猜文件名 → 指向 [T22](T22-ls-grep.md)
2. `edit` 报错信息不够，模型反复试错 → 指向 [T23](T23-hardening.md)
3. 步数不够用 → 指向 T23
4. 危险命令无确认 → 指向 T23
5. prompt 里没要求自验证，它写完就说完成了 → 指向 T23
6. 上下文预算不够，中途开始裁剪历史 → 指向 T23

**如果实际卡点与预判不同，以实际为准，并相应调整 T23 的范围。** 这是记录的价值所在。

## 验收

- [ ] `docs/runs/run1.md` 写完，每个卡点都有对应的改进项编号
- [ ] `docs/runs/l5-run1.jsonl` 已提交
- [ ] `node acceptance/verify-lock.ts` 仍然通过（考卷没被 agent 动过）
- [ ] `demo/login-app/` 下 agent 产出的东西保留在一个分支或目录快照里，方便课上对比

## 不要做

- **不要手工帮 agent 写代码**。它做成什么样就是什么样。
- 不要中途改 prompt 或加工具（那是 T22/T23）
- 不要改 `acceptance/` 下的任何文件

## 完成动作

`git commit -m "T21: bare run1 + failure log"`，看板标 `done`。
