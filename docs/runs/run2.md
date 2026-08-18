# L5 · run2 记录（2026-08-18）

> 命令：`node src/cli.ts --cwd demo/login-app -s l5-run2 --max-steps 30 "$(cat acceptance/task-prompt.md)"`
> 与 run1 同一命令、同一锁定 prompt（校验和一致）。全程不干预——**本次零人工救援**。

## 结果：三条验收线全绿

| 验收 | 结果 |
|---|---|
| `node acceptance/verify-lock.ts` | OK ×2（考卷未被改动） |
| `node --test acceptance/login-app.smoke.ts` | **10/10 断言通过** |
| `npm test` | 110 项：108 pass / 2 环境性 skip / 0 fail |

## 运行数据（vs run1）

| 指标 | run1 | run2 |
|---|---|---|
| 步数 | 11 / 30 | **7 / 30** |
| 工具调用 | 17 次（bash 7 · write 5 · edit 4 · read 1） | **9 次**（bash 6 · write 3） |
| 会话规模 | 30 条消息 / ~11.6K token | **18 条 / ~6.8K token** |
| 墙钟时间 | ~26 分钟 | ~15 分钟（按步数比例估算） |
| 人工救援 | **1 次**（bash 死锁，杀 3100 端口进程） | **0 次** |
| 冒烟测试 | 10/10（救援后） | 10/10 |

## 修复验证（T23 的闭环）

run1 的死锁场景在 run2 中**真实复现且未再发生**：agent 同样用后台方式起服务自测
（其自述「All 14 tests passed」），bash 工具正常返回（可见的一次调用 653ms 完成），
服务进程由 `kill $(jobs -p)` 清场，无孤儿、无挂死。T23 的三层修复
（exit 为准 + 宽限 destroy + bash 侧清场）在真机上成立。

## 其它观察

- 相比 run1 少了 read/edit 轮次：一次性把三个文件写对，无需返工——同任务第二次生成的
  典型收敛，对比时注意这个变量（prompt 逐字一致，但代码层已加固）。
- agent 自述的运行说明写了 `--experimental-strip-types`（兼容旧 Node 的写法），
  在 Node 25 上不必要但无害；冒烟测试直接 `node server.ts` 通过。
- 自测覆盖超出考卷要求：路径穿越 404、坏 JSON 400、DB 无明文二次确认。

run1 与 run2 的会话原始记录：`l5-run1.jsonl` / `l5-run2.jsonl`（本目录）。
