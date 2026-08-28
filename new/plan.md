# 《从零实现一个 Coding Agent》系列目标契约

> 本文件是全系列唯一契约存档（写作主法：三层目标契约法 ③.5）。各集脚本写作以此为准；事实只准引用同目录 `facts.md`。
> 受众一句话、块清单、视觉语义表任何改动，先改这里，再改脚本。

## 一、系列目标契约

- **受众**：写过 TypeScript、日常用命令行的程序员 / CS 学生，没写过 agent。**既有知识清单**（旁白免交代直接使用）：TypeScript 语法、命令行与 curl、环境变量、HTTP 请求/响应/状态码、JSON。**不属既有知识**（旁白首现须一句白话交代）：SSE 流式协议与事件结构、delta 增量、TCP 分包行为、llama.cpp 与部署拓扑、agent 领域概念（tool_calls、agent loop、REPL、上下文预算等）。
- **看完获得**：能从零写出一个 1106 行、零运行时依赖的 coding agent，并讲清每一层——SSE 客户端 → 工具调用与 agent loop → 四个改码工具 → CLI 加固 → 真实交付——为什么这样写。
- **不讲**（范围护栏）：不接云 API、不讲 40 家 provider 兼容、不 import pi（只读对照）、不造构建工具链、不教前端框架。
- **跟练前置**：Node ≥ 23.6（22.x 加 `--experimental-strip-types`）、零 npm 依赖、一个 OpenAI 兼容端点（`LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` 三个环境变量）。
- **每集交付物**：能跑的产物 + git tag + `node --test` 全绿（110/111 通过、1 跳过）。

## 二、单集递进图

| 集 | 一句话目标（能力台阶） | 入口状态 | 为什么排在上一集之后 |
|---|---|---|---|
| L1 让模型说话 | 手写 SSE 客户端，终端流式看到回答与思考 | 空仓库；既有知识见 §一清单；本集新教：SSE 协议、delta.content、reasoning_content、TCP 事件边界、跨 chunk 缓冲区 | 一切从协议字节开始，后四集都站在这个客户端上 |
| L2 让模型动手 | 手写 tool calling 与 agent loop，模型调工具再据结果继续 | 从 `l1-talk` 出发；前置：L1 的 SSE 解析 | 工具调用是协议层的第二类增量；loop 是会说话之后的自然下一步 |
| L3 让 agent 改代码 | read / write / edit / bash 四个受约束工具 + guard | 从 `l2-tools` 出发；前置：Tool 接口与 loop | 有了 loop 才挂得上工具；四个工具是同一接口的插件 |
| L4 让 agent 好用 | REPL、中止、会话持久化、上下文预算、重试 | 从 `l3-coding` 出发 | 能改代码才值得天天用；五项加固挂在已有 loop 上，不引入新机制层 |
| L5 让 agent 交付 | 前四课的 agent 原样上考场：从空目录做出登录应用，通过锁定的冒烟测试 | 从 `l4-usable` 出发 | 毕业考：不加新功能，只修真实暴露的 bug |

概念依赖链检查：tool_calls 增量（L2）依赖 SSE 解析（L1）✔；四个工具（L3）依赖 Tool 接口与 loop（L2）✔；中止贯穿工具（L4）依赖工具实现（L3）✔；交付（L5）依赖全部前集产物 ✔。

## 三、块清单

> 每块一句话要点 + 支撑关系；时长为粗估（4–8 行 × 约 20 字/行 ÷ 4.5 字/秒 + 行间 0.2s）。硬约束：每集总长 4.5–7 分钟；参考：每集 10–20 块、单块 15–40 秒。video 块的素材时长见 `facts.md` 素材表。

### L1 让模型说话（13 块，粗估约 6 分钟）

| 块 | 一句话要点 | 视觉建议 |
|---|---|---|
| B01 | 本集定位：从空仓库出发，让模型在终端说出第一句话 | TitleCard |
| B02 | 课程地图：五课五产物五 tag，每课都能 checkout 跟练 | FlowDiagram |
| B03 | 环境基线：Node ≥ 23.6 原生跑 TS、零依赖、三个环境变量 | html 卡片 |
| B04 | 现象：curl 直接打端点，看到原始 SSE 字节流 | video(./assets/curl-sse.mp4) |
| B05 | 读流：`data:` 事件结构、`delta.content` 与 `[DONE]` | CodeBlock/html |
| B06 | llama.cpp 特有：`reasoning_content` 思考增量 | CodeBlock/html |
| B07 | 核心难点：TCP 不保证事件边界，一个事件可能被切成两半 | animation |
| B08 | 故障注入：天真 `split("\n\n")` 吐乱码、丢字 | html 对比（错误态红） |
| B09 | 修法：跨 chunk 缓冲区，切完留尾、下块再拼 | animation/CodeBlock |
| B10 | 代码走读：`llm.ts` 78 行 @l1-talk 的主循环 | CodeBlock |
| B11 | 演示：`node src/cli.ts "你好"`，回答与思考逐字流出 | video(./assets/talk-demo.mp4) |
| B12 | 教具：fake-llm 回放字节流，110 个测试断网通过——真模型故障不可按需复现，测试必须断网可重放 | html 卡片 |
| B13 | pi 对照 + 钩子：78 行 vs 1577 行，差的是 40 家 provider；下集让模型动手 | video(./assets/pi-scroll.mp4) |

### L2 让模型动手（11 块，粗估约 5.5 分钟）

| 块 | 一句话要点 | 视觉建议 |
|---|---|---|
| B01 | 本集定位：从 `l1-talk` 出发，让模型动手调工具 | TitleCard |
| B02 | 钩子：模型算不对 21*2——它需要的不是更努力，是工具 | animation |
| B03 | 协议：`finish_reason=tool_calls`；`arguments` 是字符串碎片，按 index 累加再 `JSON.parse` | CodeBlock/html |
| B04 | Tool 接口四件：name / description / parameters / execute | html 卡片 |
| B05 | 坑一：类型只是注释——模型会传 `"21"` 字符串，必须运行时校验 | html 对比（错误态红） |
| B06 | agent loop：请求 → tool_calls → 执行 → 追加 role:tool → 再请求 | FlowDiagram/animation |
| B07 | 坑二：loop 必须有 maxSteps 上限，否则烧光上下文 | html（错误态红） |
| B08 | 演示：calculator 算对 21*2=42 并解释 | video(./assets/calc-tools.mp4) |
| B09 | 回归：假模型注入「字符串入参」「不存在的工具」，测试守住 | html 卡片 |
| B10 | pi 对照：loop.ts 90 行 vs agent-loop.ts 796 行 | video(./assets/pi-loop.mp4) |
| B11 | 收束 + 钩子：会调计算器了，下集给它能改代码的四个工具 | html 收束卡 |

### L3 让 agent 改代码（12 块，粗估约 6 分钟）

| 块 | 一句话要点 | 视觉建议 |
|---|---|---|
| B01 | 本集定位：从 `l2-tools` 出发，四个受约束工具让 agent 改代码 | TitleCard |
| B02 | 总览：read / write / edit / bash + guard.ts 统一收口 | html 卡片 |
| B03 | read：offset/limit + 输出截断——一个 5MB 文件能炸掉 64K 上下文 | CodeBlock |
| B04 | edit：`old_string` 必须唯一，不唯一就报错——编辑安全的核心约束 | CodeBlock |
| B05 | 故障注入：edit 匹配两处改错地方；read 不截断上下文瞬间爆 | html 对比（错误态红） |
| B06 | bash：超时、cwd 约束、输出截断 | CodeBlock |
| B07 | Windows 现实：System32 的 bash 是 WSL，它眼里 `G:\` 是 `/mnt/g`——优先 Git bash | html（错误态红） |
| B08 | guard.ts：路径越界检查，不许跳出工作目录 | CodeBlock |
| B09 | system prompt：prompt.ts 12 行怎么约束模型用工具 | CodeBlock |
| B10 | 演示：agent 用 read + edit 改 hello.js | video(./assets/hellojs-demo.mp4) |
| B11 | pi 对照：edit 60 行 vs 127+500 行；bash 89 行 vs nodejs.ts 695 行 | html 对照版式 |
| B12 | 收束 + 钩子：能改代码了，下集把它变成每天能用的 CLI | html 收束卡 |

### L4 让 agent 好用（10 块，粗估约 5.5 分钟）

| 块 | 一句话要点 | 视觉建议 |
|---|---|---|
| B01 | 本集定位：从 `l3-coding` 出发，五项好用化改造 | TitleCard |
| B02 | REPL：readline 循环，从单发到对话 | CodeBlock |
| B03 | 中止：Ctrl+C 只停当前轮——AbortSignal 要贯穿 fetch 和工具，没贯穿就僵住 | animation |
| B04 | 会话持久化：JSONL 落盘 + `-c` 续聊 | video(./assets/session-resume.mp4) |
| B05 | 上下文预算：估 token、超阈值裁最老轮次——聊超 64K 就报 400 | animation/html |
| B06 | 重试：429 / 超时退避，retry.ts 39 行 | CodeBlock |
| B07 | 可观测：每轮打印耗时与 token | html 卡片 |
| B08 | 诚实一刻：L4 +331 行超了单课预算 300——预算口径怎么算、超了怎么办 | html 卡片 |
| B09 | pi 对照：会话 36 行 vs JsonlSessionRepo 的分支 / lane / 压缩 / 崩溃恢复 | html 对照版式 |
| B10 | 收束 + 钩子：CLI 好用了，下集大考——让 agent 自己交付一个登录应用 | html 收束卡 |

### L5 让 agent 交付（10 块，粗估约 6 分钟）

| 块 | 一句话要点 | 视觉建议 |
|---|---|---|
| B01 | 本集定位：毕业考——前四课的 agent 原样上考场 | TitleCard |
| B02 | 考卷设计：冒烟测试 + 任务描述预先锁定，agent 不许改——验收先行、不可篡改 | html 卡片 |
| B03 | 考题：零依赖 node:http 四路由、sqlite 存用户、scrypt 哈希、httpOnly cookie | html 卡片 |
| B04 | run1 裸跑：交付 10/10 | video(./assets/run1-timelapse.mp4) |
| B05 | 但是：bash 后台自测永久挂死，人工救援 1 次——11 步 17 调用、11.6K token | html（错误态红） |
| B06 | 失败分析：每个失败回炉前四课代码——bash 死锁 → T23 加固（+46/-6） | animation/html |
| B07 | run2 加固后：10/10、自测 653ms、零救援 | video(./assets/run2-timelapse.mp4) |
| B08 | 对比表：11/17 → 7/9、11.6K → 6.8K、救援 1 → 0——差别不在能不能，在要不要人救 | DataBars/html |
| B09 | 全系列收束：1106 行、五个 tag、110 个测试——你拥有每一行的解释权 | html 收束卡 |
| B10 | 延伸阅读：pi submodule 只读对照、docs/specs 与 docs/lessons、把 agent 用到自己的项目 | html 收束卡 |

## 四、对齐检查

- L1：B04–B11 支撑「手写 SSE 客户端」；B02–B03 是系列契约必需的定位与基线（仅出现在本集）；B12 支撑可验收交付物；B13 是每集固定的 pi 对照。无脂肪块。
- L2：B03–B07 支撑「tool calling 与 loop」；B08–B09 支撑可验收产物；B01/B10/B11 是定位/对照/收束固定件。无脂肪块。
- L3：B03–B09 支撑「四个受约束工具」；B10 支撑可验收产物；B01/B11/B12 固定件。无脂肪块。
- L4：B02–B07 支撑「五项好用化改造」；B08 对应系列契约的诚实口径（行数预算即本系列契约的一部分）；B01/B09/B10 固定件。无脂肪块。
- L5：B02–B08 支撑「交付与验收」；B09–B10 是系列末集收束（替代下集钩子）；B01 固定件。无脂肪块。

## 五、系列视觉语义表（系列级冻结，逐集引用）

- 「我们」（本课程代码 / 终端 / 产物）：accent 蓝 `#58a6ff`
- pi 对照（工业级参照实现）：紫 `#d2a8ff`
- 错误态 / 故障注入：红 `#f85149`
- 成功 / 验收通过：绿 `#3fb950`
- 背景：dark-code 主题 `#0d1117` 填满全屏；内容避让底部 120px 字幕安全区
- 卡片语言：标题与正文中文；代码、命令、文件名保持英文原文
- 图标约定：演示块 ▶、故障 / 坑块 ⚠、pi 对照块 ⚖、验收块 ✔
- 对照版式：左「我们」右「pi」，行数大字对比

## 六、元约定

- slug（全小写显式声明）：`my-pi-agent-l1-talk` / `my-pi-agent-l2-tools` / `my-pi-agent-l3-coding` / `my-pi-agent-l4-usable` / `my-pi-agent-l5-delivery`
- `voiceRef: ../B00.wav`（相对各集 meta.md）；aspect 16:9、theme dark-code、fps 30
- 时长系数已实测校准：4.89 字/秒（B00 音色，2026-08-28 校准，见 `facts.md`）；早期估算曾按约 4.5 字/秒兜底
- 敏感信息：内网地址、token、真实用户名一律不进脚本；脚本只出现环境变量名
- 每集结构固定件：B01 开场定位（做什么、从哪个 tag 接着做）→ 中段 → pi 对照 → 收束 + 下一集钩子（L5 以全系列收束 + 延伸阅读替代）
