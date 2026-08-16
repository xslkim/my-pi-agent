# 课程文档索引

讲课时看这里。每篇包含：目标、课堂流程、故障注入、见真章、pi 对照、练习、完成标准。

总纲见 [../teaching-agent-plan.md](../teaching-agent-plan.md)。实现规格见 [../specs/](../specs/)。

| 课 | 文档 | 目标 | 时长 | Tag |
|---|---|---|---|---|
| 1 | [01-talk.md](01-talk.md) | 让模型说话：手写 SSE 客户端 | 90 min | `l1-talk` |
| 2 | [02-tools.md](02-tools.md) | 让模型动手：tool calling + agent loop | 100 min | `l2-tools` |
| 3 | [03-coding.md](03-coding.md) | 让 agent 改代码：四个受约束的工具 | 110 min | `l3-coding` |
| 4 | [04-usable.md](04-usable.md) | 让 agent 好用：REPL / 中止 / 会话 / 上下文 | 100 min | `l4-usable` |
| 5 | [05-delivery.md](05-delivery.md) | 让 agent 交付：登录页 + 后端实战 | 150 min | `l5-delivery` |

## 每课的故障注入

课程的骨架。先弄坏，再修好。

| 课 | 注入的故障 | 学员该看到 |
|---|---|---|
| 1 | SSE 事件从中间切断、中文字节切断 | 天真解析器丢字、吐乱码 |
| 2 | 模型传字符串参数、调不存在的工具、无限循环 | 没有运行时校验就崩；没有 maxSteps 就烧光上下文 |
| 3 | 路径逃逸、读 5MB 文件、edit 匹配到多处、命令挂起 | 工作目录形同虚设；上下文爆炸；静默改错地方；agent 卡死 |
| 4 | Ctrl+C、聊到超过 64K | abort 不贯穿就停不下来；不裁剪就 400 |
| 5 | agent 自己制造的真实失败 | 前四课的简化决定被逐个逼出来 |

## 讲授顺序建议

L1→L4 可以每周一课。L5 建议拆成两次：一次裸跑 + 记录失败，一次回炉 + 重跑验收。裸跑那次务必录屏，失败过程比成功结果有教学价值。
