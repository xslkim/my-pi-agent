# 事实表（全系列共用一张）

> 规则（工序：事实基线锁定）：脚本只准引用本表事实；画面文字逐字取「上屏形式」，旁白逐字取「上口形式」，不改写、不约数、不换单位。本表没有的事实不进脚本。
> 核查环境：本机 Linux，node v22.23.2（< 23.6，测试经 `node --experimental-strip-types --test` 运行），2026-08-27 实测。pi 参照实现 @ `086c32e`（submodule 已 checkout）。
> 敏感信息：LLM 内网地址、API key、真实用户名一律不进脚本；脚本只出现环境变量名。
> 录制说明（2026-08-28）：五段演示录屏全部重录——curl / cli 演示用 deepseek-v4-flash（OpenAI 兼容端点，SSE 协议字段与课程默认 qwen3.8-27b 一致，录屏字节中可见该模型名）；本机 node 22 经 `--experimental-strip-types` 运行，录屏展示的命令为课程目标环境（Node ≥ 23.6）写法。run2 延时与 pi 源码滚动为本地素材重渲染（放慢回放）。工具 `new/tools/record.mjs` + `new/tools/render.mjs`，cast 存 `new/casts/`。

## 通用

| 断言 | 值 | 出处 | 核查命令/方式 | 上屏形式 | 上口形式 |
|---|---|---|---|---|---|
| 环境基线 Node 版本 | ≥ 23.6（类型剥离默认开启；22.x 需 `--experimental-strip-types`） | `package.json` engines；`docs/teaching-agent-plan.md:34` | `cat package.json`、`node -v`（本机 v22.23.2，课程目标环境 23.6+） | Node ≥ 23.6 | Node 二十三点六及以上 |
| 运行时依赖 | 0（`dependencies: {}`；devDependencies 只服务 `tsc --noEmit`） | `package.json` | `cat package.json` | dependencies 为空 | 运行时依赖为零 |
| 测试总数 | 111 个：110 通过、1 跳过、0 失败 | 本机实测 2026-08-27 | `node --experimental-strip-types --test` | 110/111 通过（1 跳过） | 一百一十个测试通过，一个跳过 |
| 全系列 src 累计行数 @l5-delivery | 1106 行 | git | `git ls-tree -r l5-delivery --name-only -- src` 逐文件 `git show` 累加 | 1106 行 | 一千一百零六行 |
| 行数预算口径 | 只算 `src/`，`test/` 不计 | `docs/teaching-agent-plan.md:114` | 文档逐字比对 | 只算 src/ | 只算 src 目录 |
| 五课 git tag | l1-talk / l2-tools / l3-coding / l4-usable / l5-delivery | git | `git tag` | — | — |
| 默认模型 | qwen3.8-27b（局域网 llama.cpp，OpenAI 兼容，上下文 65536，单并发，思考增量在 reasoning_content 字段） | `docs/teaching-agent-plan.md:6,64` | 文档逐字比对；服务在线状态本机未复测，脚本不声称「当前在线」 | qwen3.8-27b | 见发音词典 |
| LLM 接入方式 | 三个环境变量，代码里不设默认值 | `docs/teaching-agent-plan.md:68` | 文档逐字比对 | LLM_BASE_URL / LLM_API_KEY / LLM_MODEL | 三个环境变量 |
| TTS 时长系数 | 未校准，按约 4.5 字/秒兜底估算 | — | 交构建前按「音画验收」工序步骤 1 实测校准 | — | — |

## 第 1 课 · 让模型说话

| 断言 | 值 | 出处 | 核查命令/方式 | 上屏形式 | 上口形式 |
|---|---|---|---|---|---|
| l1-talk 时 src 累计 | 176 行 | git | `git ls-tree -r l1-talk -- src` 累加 | 176 行 | 一百七十六行 |
| llm.ts 行数 @l1-talk | 78 行（现状 149 行，L4 重试并入所致） | git | `git show l1-talk:src/llm.ts \| wc -l`；`wc -l src/llm.ts` | 78 行 | 七十八行 |
| types.ts / render.ts / cli.ts @l1-talk | 28 / 37 / 30 行 | git | `git show l1-talk:<f> \| wc -l` | — | — |
| SSE 协议四点 | 每块 `data: {...}\n\n`、以 `data: [DONE]` 结束；`choices[0].delta.content` 正文增量；`delta.reasoning_content` 思考增量（llama.cpp 特有）；`finish_reason` = stop / tool_calls / length，末块带 usage | `docs/teaching-agent-plan.md:84-90` | 人工逐字比对 | data: / [DONE] / delta.content / reasoning_content | 见发音词典 |
| tool_calls 增量 | `arguments` 是字符串碎片，按 index 累加后再 `JSON.parse` | `docs/teaching-agent-plan.md:88` | 人工逐字比对 | 按 index 累加 | 按 index 累加 |
| pi 兼容层行数 | `openai-completions.ts` 1577 行 @086c32e（处理 40 家 provider 兼容等） | `pi/packages/ai/src/api/openai-completions.ts`；`docs/teaching-agent-plan.md:257` | `wc -l`（已执行）；「40 家」文档比对 | 1577 行 | 一千五百七十七行 |
| 素材 curl-sse.mp4 | 22.4s（curl 打端点看原始 SSE 字节流，2026-08-28 重录） | `new/lesson1-talk/assets/curl-sse.mp4` | `ffprobe` 实测 22.400s | — | — |
| 素材 talk-demo.mp4 | 26.1s（`node src/cli.ts` 提问，思考与正文逐字流出，2026-08-28 重录） | `new/lesson1-talk/assets/talk-demo.mp4` | `ffprobe` 实测 26.133s | — | — |
| 素材 pi-scroll.mp4 | 41.2s（pi `openai-completions.ts` 源码滚动，2026-08-28 自 pi @086c32e 重渲染，行 1–1200 步长 3） | `new/lesson1-talk/assets/pi-scroll.mp4` | `ffprobe` 实测 41.233s | — | — |

## 第 2 课 · 让模型动手

| 断言 | 值 | 出处 | 核查命令/方式 | 上屏形式 | 上口形式 |
|---|---|---|---|---|---|
| l2-tools 时 src 累计 | 422 行（较 l1-talk +246） | git | `git ls-tree -r l2-tools -- src` 累加 | 422 行 | 四百二十二行 |
| loop.ts / registry.ts / calculator.ts @l2-tools | 90 / 69 / 24 行 | git | `git show l2-tools:<f> \| wc -l` | 90 行 | 九十行 |
| Tool 接口四件 | `name` / `description` / `parameters`（手写 JSON Schema）/ `execute` | `docs/teaching-agent-plan.md:122` | 文档逐字比对 | — | — |
| L2 演示产物 | calculator 算对 21*2=42 并解释 | `docs/teaching-agent-plan.md:105` + calc-tools.mp4 录像 | 录像核对（命令于录制时验证；本机无模型服务未重跑） | 21*2 = 42 | 二十一乘二等于四十二 |
| L2 三个坑 | arguments 按 index 拼接；类型不等于校验（模型会传 `"21"` 字符串）；loop 要有 maxSteps 上限 | `docs/teaching-agent-plan.md:124` | 文档逐字比对 | maxSteps | max steps（见发音词典） |
| pi agent loop 行数 | `agent-loop.ts` 796 行 @086c32e（并行工具、steering/follow-up 队列、生命周期钩子、中止语义） | `pi/packages/agent/src/agent-loop.ts`；`docs/teaching-agent-plan.md:258` | `wc -l`（已执行）；特性清单文档比对 | 796 行 | 七百九十六行 |
| 素材 calc-tools.mp4 | 22.7s（calculator 单次调用算 21×2=42 并解释，2026-08-28 重录，渲染 0.66× 放慢） | `new/lesson2-tools/assets/calc-tools.mp4` | `ffprobe` 实测 22.733s | — | — |
| 素材 pi-loop.mp4 | 22.3s（pi agent loop 源码滚动录屏） | `new/lesson2-tools/assets/pi-loop.mp4` | `ffprobe` 实测 22.333s | — | — |

## 第 3 课 · 让 agent 改代码

| 断言 | 值 | 出处 | 核查命令/方式 | 上屏形式 | 上口形式 |
|---|---|---|---|---|---|
| l3-coding 时 src 累计 | 735 行（较 l2-tools +313） | git | `git ls-tree -r l3-coding -- src` 累加 | 735 行 | 七百三十五行 |
| 各文件 @l3-coding | prompt.ts 12 / guard.ts 64 / read.ts 47 / write.ts 29 / edit.ts 60 / bash.ts 89 行 | git | `git show l3-coding:<f> \| wc -l` | 60 行 | 六十行 |
| edit 核心约束 | `old_string` 在文件中必须唯一，不唯一就报错 | `docs/teaching-agent-plan.md:132` | 文档逐字比对 | old_string 必须唯一 | old string 必须唯一（见发音词典） |
| read 截断动机 | 不截断，一个 5MB 文件会炸掉 64K 上下文 | `docs/teaching-agent-plan.md:131` | 文档逐字比对 | — | — |
| Windows 坑 | `C:\Windows\System32\bash.exe` 是 WSL，它眼里 `G:\` 是 `/mnt/g`；优先用 Git 自带 bash，否则回退 PowerShell | `docs/teaching-agent-plan.md:137` | 文档逐字比对 | /mnt/g | 见发音词典 |
| pi edit 行数 | `edit.ts` 127 行 + `edit-diff.ts` 500 行 @086c32e（多重编辑、行尾/BOM 处理、unified diff） | `pi/packages/agent/src/harness/tools/edit.ts`、`edit-diff.ts` | `wc -l`（已执行）；特性清单文档比对 | 127 + 500 行 | 一百二十七加五百行 |
| pi 执行环境行数 | `nodejs.ts` 695 行 @086c32e（Result 错误模型、进程树 kill、跨平台 shell 探测） | `pi/packages/agent/src/harness/env/nodejs.ts` | `wc -l`（已执行）；特性清单文档比对 | 695 行 | 六百九十五行 |
| 素材 hellojs-demo.mp4 | 31.5s（agent 用 read+edit 改 hello.js，2026-08-28 重录） | `new/lesson3-coding/assets/hellojs-demo.mp4` | `ffprobe` 实测 31.533s | — | — |

## 第 4 课 · 让 agent 好用

| 断言 | 值 | 出处 | 核查命令/方式 | 上屏形式 | 上口形式 |
|---|---|---|---|---|---|
| l4-usable 时 src 累计 | 1066 行（较 l3-coding +331，超单课预算 300；原因是重试与 abort 加固并入 llm.ts 落在 L4 窗口，总量余量充足未回砍） | git；`docs/teaching-agent-plan.md:112` | `git ls-tree -r l4-usable -- src` 累加；原因文档比对 | 1066 行 | 一千零六十六行 |
| 各文件 @l4-usable | repl.ts 110 / session.ts 36 / context.ts 52 / retry.ts 39 行 | git | `git show l4-usable:<f> \| wc -l` | — | — |
| L4 五项改造 | REPL、Ctrl+C 只中止当前轮（AbortSignal 贯穿 fetch 与工具）、JSONL 会话持久化与 -c 续聊、上下文预算（估 token 超阈值裁最老轮次）、429/超时重试；另每轮打印耗时与 token | `docs/teaching-agent-plan.md:141` | 文档逐字比对 | — | — |
| 超上下文的后果 | 聊超 64K 报 400 | `docs/teaching-agent-plan.md:248` | 文档逐字比对 | 64K | 六十四 K |
| pi 会话层 | `JsonlSessionRepo`（`pi/packages/agent/src/harness/session/jsonl/repo.ts`），有分支 / lane / 压缩 / 崩溃恢复 | 文件存在已核实；特性清单 `docs/teaching-agent-plan.md:261` 文档比对 | `ls` 该文件（已执行） | — | — |
| 素材 session-resume.mp4 | 21.1s（-s 落盘后 -c 续聊演示，2026-08-28 重录，渲染 0.8× 放慢） | `new/lesson4-usable/assets/session-resume.mp4` | `ffprobe` 实测 21.067s | — | — |

## 第 5 课 · 让 agent 交付

| 断言 | 值 | 出处 | 核查命令/方式 | 上屏形式 | 上口形式 |
|---|---|---|---|---|---|
| l5-delivery 时 src 累计 | 1106 行（较 l4-usable +40，全部在 bash.ts：+46/-6，T23 后台任务修复） | git | `git diff --stat l4-usable..l5-delivery -- src` | 1106 行 | 一千一百零六行 |
| 考卷设计 | 冒烟测试 `acceptance/login-app.smoke.ts` 与任务描述 `acceptance/task-prompt.md` 预先写好，`lock.sha256` + `verify-lock.ts` 校验和锁定，agent 不许修改 | `acceptance/` 目录；`docs/teaching-agent-plan.md:152` | `ls acceptance/`；文档逐字比对 | — | — |
| 冒烟检查项数 | 10 项（注册 201 → 重复注册 409 → 错密码 401 且无 cookie → 登录 200 且 HttpOnly+SameSite=Strict cookie → 带 cookie 访问 /api/me 得用户名 → 无 cookie 401 → 登出 200 → 登出后 401 → 首页含表单 → 数据库搜不到明文密码） | `docs/runs/README.md:5`（10/10）；条目清单 `docs/teaching-agent-plan.md:152` | 文档逐字比对 | 10/10 | 十项全过 |
| 考题技术栈 | `server.ts` 零依赖 `node:http` 四路由（register/login/me/logout）；`node:sqlite` 存用户；`scrypt` 加盐哈希不存明文；`randomUUID()` token 放 httpOnly cookie；产物在 `demo/login-app/`（server.ts + public/，已存在） | `docs/teaching-agent-plan.md:147-149`；`ls demo/login-app/`（已执行） | 文档逐字比对 + 目录核实 | — | — |
| run1（加固前） | 交付 10/10；bash 后台自测永久挂死；人工救援 1 次；11 步 / 17 次工具调用；会话 token ~11.6K | `docs/runs/README.md:5-9` | 人工逐字比对 | 11 步 / 17 次 | 十一步、十七次工具调用 |
| run2（加固后） | 交付 10/10；bash 自测 653ms 正常返回；人工救援 0 次；7 步 / 9 次工具调用；会话 token ~6.8K | `docs/runs/README.md:5-9` | 人工逐字比对 | 7 步 / 9 次 | 七步、九次工具调用 |
| run1 vs run2 结论 | 任务两次都做成——差别不在「能不能」，在「要不要人救」 | `docs/runs/README.md:12` | 人工逐字比对 | — | — |
| 素材 run1-timelapse.mp4 | 23.8s（run1 延时录屏） | `new/lesson5-delivery/assets/run1-timelapse.mp4` | `ffprobe` 实测 23.833s | — | — |
| 素材 run2-timelapse.mp4 | 24.8s（run2 延时录屏；2026-08-28 自 `docs/runs/l5-run2.jsonl` 以 0.75× 放慢重渲染） | `new/lesson5-delivery/assets/run2-timelapse.mp4` | `ffprobe` 实测 24.767s | — | — |
