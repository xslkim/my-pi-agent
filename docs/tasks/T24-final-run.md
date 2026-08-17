# T24 · 重跑 run2 + 验收 + 复盘（L5 收尾 / 项目收尾）

> 课：L5 · 规格：[specs/05-delivery.md「四、执行流程」](../specs/05-delivery.md) · 预算：0 行 · 前置：T23

## 目标

用加固后的 agent **重跑同一个任务**，通过锁定的冒烟测试，并把 run1 → run2 的差异写成复盘。这份对比就是整门课的结论。

## 要产出的文件

- `docs/runs/run2.md`
- `docs/runs/l5-run2.jsonl`（提交）
- `docs/runs/README.md`（run1 / run2 对比表）
- `demo/login-app/`（agent 产出的应用，提交）

## 怎么做

```powershell
Remove-Item -Recurse -Force demo/login-app -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force demo/login-app
node src/cli.ts --cwd demo/login-app -s l5-run2 --max-steps 30 (Get-Content -Raw acceptance/task-prompt.md)
```

**必须从空目录开始**，否则测的是「人 + agent」而不是 agent。任务描述同样从 `acceptance/task-prompt.md` 读取——它被 [T20](T20-lock-acceptance.md) 锁定，逐字一致由校验和保证，不靠人自觉。

验收：

```bash
node acceptance/verify-lock.ts            # 先证明考卷没被动过
node --test acceptance/login-app.smoke.ts
```

## 验收

- [ ] `verify-lock.ts` 退出码 0（**冒烟测试与任务 prompt 都与基线一致**）
- [ ] `node --test acceptance/login-app.smoke.ts` 全绿（10 条断言，含 logout 两条）
- [ ] `demo/login-app/data.db` 生成在应用目录下，且不含明文密码
- [ ] 应用本身零依赖（`node:http` + `node:sqlite` + `node:crypto`），`demo/login-app` 下没有 `package.json` 的 `dependencies`
- [ ] 浏览器打开能真的注册、登录、登出、看到欢迎页

如果没过：**修 agent 或 prompt，不修考卷**，然后从空目录重跑并记为 run3。允许多轮，但每轮都要留记录。

## 复盘要写什么

`docs/runs/run2.md`：

- [ ] 步数、token、耗时，与 run1 对比
- [ ] run1 的每个卡点在 run2 里的表现
- [ ] run2 里**新出现**的问题（如果有）

`docs/runs/README.md` 做成一张对比表，这是课上最后一页幻灯。

## 项目收尾（本任务额外要做）

- [ ] 预算检查：`src/` 总行数 ≤ 1400，并把**实际数字**回填到 [teaching-agent-plan.md](../teaching-agent-plan.md) 的预算表
- [ ] `node --test` 全绿且**断网可跑**（默认测试集里不含 `acceptance/`，见 [T20](T20-lock-acceptance.md)）
- [ ] `npx tsc --noEmit` 无错
- [ ] `dependencies` 仍为空
- [ ] 打 tag：`git tag l5-delivery`
- [ ] 核对五课 [lessons](../lessons/) 里的所有 pi 对照数字与实际代码一致
- [ ] 根 [README.md](../../README.md) 补上五个 tag 的说明，让学员能 `git checkout l2-tools` 回到任意一课的状态

## 不要做

- 不改 `acceptance/` 下的任何文件
- 不手工修补 agent 生成的应用代码（那样交付的就不是 agent 的作品了）

## 完成动作

`git commit -m "T24: run2 passes locked acceptance"`，打 tag，看板全部标 `done`。
