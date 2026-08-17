# 任务看板

把 [教学方案](../teaching-agent-plan.md) 拆成 25 个可独立执行、可独立验收的任务。**给 agent 干活用的就是这些文档。**

- 规格（为什么这么设计）→ [docs/specs/](../specs/)
- 教学脚本（怎么讲）→ [docs/lessons/](../lessons/)
- 任务（现在做什么、怎么算做完）→ 本目录

---

## 给 agent 的执行规则

1. **一次只做一个任务**，按编号顺序。不要提前做后面的任务，不要顺手重构无关代码。
2. 开工前读三份：本任务文档、它引用的 spec 小节、以及它列出的「要改的文件」的当前内容。
3. **每个任务必须跑通自己的「验收」命令**才算完成。跑不通就修，不要跳过、不要改测试迁就实现。
4. 完成后按任务文档末尾的「完成动作」提交，并把本文件状态表里对应行改成 `done`。
5. **行数预算是硬约束。** 每完成一课跑一次预算检查（见下），超了就精简实现，不许突破总量。
6. 禁止引入任何运行时依赖。只用 Node 内置模块，`dependencies` 必须保持为空；`devDependencies` 只允许 `typescript` 和 `@types/node`。
7. 禁止修改 `acceptance/` 下的任何文件（[T20](T20-lock-acceptance.md) 建立后即锁定）。
8. **任务文档可以细化 spec，但不得与之矛盾。** 若发现两层说法不一致：按任务文档实现（它更新、更具体），完成后**回写 spec**，让两层重新对齐。别留着不管——下一个人不知道该信哪份。
9. 遇到 spec 与**现实**冲突（比如真实模型行为与文档描述不符），**先停下报告**，不要自行改设计。

### 常用命令

```bash
npm test                        # 全部单元测试（必须离线可跑、必须全绿）
node --test test/llm.test.ts    # 单个测试文件
npx tsc --noEmit                # 类型检查

node acceptance/verify-lock.ts             # L5：考卷未被篡改
node --test acceptance/login-app.smoke.ts  # L5：验收（显式运行，不在默认测试集里）
```

注意「全量测试」一律用 `npm test`（即 `node --test "test/*.test.ts"`），**不要**用裸 `node --test`：按下面的发现规则，它还会把 `pi/` 子模块里的 `*.test.ts` 全部执行——那是参考实现的测试，在我们的环境里必然红，会把默认测试集永久污染。

**`node --test` 的发现规则**（v25.2.1 实测）：`test/` 下递归的每个 `.ts` 都会被执行——哪怕它不叫 `*.test.ts`、哪怕里面没有一个 `test()`；此外仓库任意位置的 `*.test.ts` 也会被执行。所以 `test/` 里的辅助文件必须无顶层副作用，而 L5 的验收脚本放在 `acceptance/`，否则它会在应用存在之前就把默认测试集永久染红。

预算检查（PowerShell，只统计 `src/`）：

```powershell
(Get-ChildItem -Recurse src -Filter *.ts | Get-Content | Measure-Object -Line).Lines
```

真机冒烟需要先设环境变量（见仓库根 [README.md](../../README.md)），且 `test/` 里的任何测试都**不得**依赖它。

---

## 状态表

| # | 任务 | 课 | 预算(src) | 前置 | 状态 |
|---|---|---|---|---|---|
| [T00](T00-scaffold.md) | 仓库骨架与零依赖验证 | — | 0 | — | done |
| [T01](T01-types.md) | 核心类型定义 | L1 | 60 | T00 | done |
| [T02](T02-fake-llm.md) | 假模型服务器 | L1 | 0 | T01 | done |
| [T03](T03-sse-client.md) | SSE 解析与 streamChat | L1 | 120 | T02 | done |
| [T04](T04-cli-oneshot.md) | 渲染与单发 CLI | L1 | 100 | T03 | done |
| [T05](T05-tool-registry.md) | Tool 接口与参数校验 | L2 | 70 | T04 | done |
| [T06](T06-calculator.md) | calculator 工具 | L2 | 40 | T05 | done |
| [T07](T07-toolcall-stream.md) | tool_call 增量解析 | L2 | 15 | T06 | done |
| [T08](T08-agent-loop.md) | agent loop | L2 | 115 | T07 | done |
| [T09](T09-cli-loop.md) | CLI 接 loop + 冒烟 | L2 | 10 | T08 | done |
| [T10](T10-guard.md) | 约束层 guard | L3 | 75 | T09 | done |
| [T11](T11-read-write.md) | read / write 工具 | L3 | 85 | T10 | done |
| [T12](T12-edit.md) | edit 工具（唯一匹配） | L3 | 60 | T11 | done |
| [T13](T13-bash.md) | bash 工具（跨平台） | L3 | 90 | T12 | done |
| [T14](T14-coding-agent.md) | system prompt + `--cwd` | L3 | 40 | T13 | done |
| [T15](T15-context.md) | token 估算与上下文裁剪 | L4 | 70 | T14 | done |
| [T16](T16-session.md) | JSONL 会话持久化 | L4 | 60 | T15 | done |
| [T17](T17-retry.md) | 请求重试 | L4 | 40 | T16 | done |
| [T18](T18-repl.md) | REPL 与中止贯穿 | L4 | 110 | T17 | done |
| [T19](T19-cli-args.md) | CLI 参数整合 + 冒烟 | L4 | 20 | T18 | todo |
| [T20](T20-lock-acceptance.md) | **锁定验收脚本与任务 prompt** | L5 | 0 | T19 | todo |
| [T21](T21-bare-run.md) | 裸跑 run1 与失败记录 | L5 | 0 | T20 | todo |
| [T22](T22-ls-grep.md) | ls / grep 工具 | L5 | 110 | T21 | todo |
| [T23](T23-hardening.md) | 按失败记录加固 | L5 | 90 | T22 | todo |
| [T24](T24-final-run.md) | 重跑 run2 + 验收 + 复盘 | L5 | 0 | T23 | todo |

任务预算加总：L1 280 · L2 250 · L3 350 · L4 300 · L5 200 = **1380**。

每课的**硬上限**以 [specs/README.md](../specs/README.md) 为准（累计 300 / 550 / 900 / 1200 / 1400）。任务预算比它略紧，留出的余量用于吸收实现时的意外，不是用来加功能的。口径始终是「只算 `src/`，`test/` 不计」。

## 每课收尾

一课的最后一个任务完成后，额外做三件事：

1. 跑全量 `node --test` + `npx tsc --noEmit` + 预算检查
2. 打 tag：`l1-talk` / `l2-tools` / `l3-coding` / `l4-usable` / `l5-delivery`
3. 回填 [lessons](../lessons/) 里该课的「pi 对照」实数（如与文档不符）

## 两个任务是人工主导的

[T21](T21-bare-run.md) 和 [T24](T24-final-run.md) 是「让 agent 自己去做登录应用」的观察与验收环节，产出是记录和结论，不是代码。其余 23 个任务都可以直接交给 agent 执行。
