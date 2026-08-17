# 实现规格索引

开发时看这里。每篇包含：目标、交付物与行数预算、数据结构、核心实现、测试用例、验收、不做什么。

总纲见 [../teaching-agent-plan.md](../teaching-agent-plan.md)。课程脚本见 [../lessons/](../lessons/)。

| 课 | 文档 | 交付 | 新增预算 | 累计 | Tag |
|---|---|---|---|---|---|
| 1 | [01-talk.md](01-talk.md) | `llm.ts` `types.ts` `render.ts` `cli.ts`（+ `test/fake-llm.ts`，不计预算） | ≤ 300 | 300 | `l1-talk` |
| 2 | [02-tools.md](02-tools.md) | `tools/registry.ts` `tools/calculator.ts` `loop.ts` | ≤ 250 | 550 | `l2-tools` |
| 3 | [03-coding.md](03-coding.md) | `tools/guard.ts` `read/write/edit/bash.ts` `prompt.ts` | ≤ 350 | 900 | `l3-coding` |
| 4 | [04-usable.md](04-usable.md) | `repl.ts` `session.ts` `context.ts` `retry.ts` | ≤ 300 | 1200 | `l4-usable` |
| 5 | [05-delivery.md](05-delivery.md) | `tools/ls.ts` `tools/grep.ts` + 加固 | ≤ 200 | **1400** | `l5-delivery` |

行数预算是硬约束。超了就砍功能，不许突破 1400 行总量——学员必须读得完每一行。

**预算口径：只算 `src/`，`test/` 不计。** 测试和假模型服务器不计入，否则会出现「为了省预算而少写测试」的反向激励。

## 每课通用的完成标准

1. 目标产物能跑（真实局域网模型下手工验证一次）
2. `node --test` 全绿，且**断网也能跑**（全部走假模型）
3. 新增行数不超预算
4. `npx tsc --noEmit` 无错
5. 该课的故障注入场景已修复并有回归测试
6. spec 与代码路径对应，lesson 的 pi 对照已填实数

## 模块归属速查

| 文件 | 引入于 | 后续修改 |
|---|---|---|
| `src/types.ts` | L1 | L2 补 `ToolCall` 实现 |
| `src/llm.ts` | L1 | L2 加 `tools` 参数与 `tool_call_delta`；L4 接 retry |
| `src/cli.ts` | L1 | L3 加 `--cwd`；L4 加 `-s` / `-c` / REPL |
| `src/loop.ts` | L2 | L4 接 `fitContext`；L5 调 `maxSteps` |
| `src/tools/registry.ts` | L2 | — |
| `src/tools/guard.ts` | L3 | — |
| `src/prompt.ts` | L3 | L5 补自验证要求 |
| `src/repl.ts` `session.ts` `context.ts` `retry.ts` | L4 | — |
| `src/tools/ls.ts` `grep.ts` | L5 | — |
| `test/fake-llm.ts` | L1 | 全程复用 |
| `test/login-app.smoke.ts` | L5 | **锁定，不可改** |
