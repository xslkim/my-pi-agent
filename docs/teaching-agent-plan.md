# 从零实现一个 Coding Agent · 教学方案

> 状态：方案已定，L1 未开始
> 更新：2026-08-16
> 参考实现：[earendil-works/pi](https://github.com/earendil-works/pi)（`pi/` submodule，`086c32e74`）——**只读参考，不作依赖**
> 默认模型：局域网 llama.cpp `qwen3.8-27b`（已探通）

**5 课，5 个目标，全部自己实现。** 不 import pi 的任何包。pi 是我们的参照物：遇到问题先自己写，写完再打开 pi 对应文件，看工业级实现多做了什么、为什么。

最后一课不是讲，是**交付**：用我们自己造的 agent，从空目录做出一个能跑通冒烟测试的登录页 + 后端。

---

## 1. 核心决策

| 项 | 决定 | 理由 |
|---|---|---|
| 代码来源 | **自己实现**。可参考 pi、可复制片段，但必须删到教学最小 | 学员要能读完每一行 |
| 依赖 | **零依赖**。只用 Node 内置模块 | 见 §2，已实测 |
| 语言/运行 | TypeScript，`node src/cli.ts` 直接跑，无构建步骤 | Node 25 原生类型剥离 |
| 测试 | `node --test` 内置测试器 + 自制假模型服务器 | 不依赖网络、不依赖真实 LLM |
| 模型 | 局域网 `qwen3.8-27b`（OpenAI 兼容） | 免费、可控、离线可用 |
| 课程数 | **5 课**，每课一个可验收目标、一个 git tag | 见 §4 |
| pi 的角色 | 每课末尾「对照」环节，只读源码 | 讲清我们省了什么 |

### 为什么不 import pi

import pi 学员只能看见胶水层，看不见 SSE 怎么切、tool_call 增量怎么拼、loop 为什么会死循环。这些正是 agent 的本体。pi 的 `openai-completions.ts` 有 1577 行，处理 40 家 provider 的兼容差异；我们只服务一个 llama.cpp 端点，**120 行足够**。差的那 1400 行就是课程的对照素材。

---

## 2. 零依赖运行环境（已实测）

本机 `node v25.2.1` / `npm 11.6.2`。以下能力已在本机验证通过：

| 能力 | 验证结果 | 用途 |
|---|---|---|
| 原生运行 `.ts` | `node sum.test.ts` 直接跑，无需 tsx/ts-node | 无构建步骤 |
| `node --test` | 内置测试器可用，1 pass | 全部单测 |
| `node:sqlite` | `DatabaseSync` 可用（有 experimental 警告） | L5 登录后台存用户 |
| `node:crypto` `scryptSync` | 可用 | L5 密码哈希 |

`package.json` 里 **`dependencies` 为空**。`devDependencies` 最多只放 `typescript`（仅供 `tsc --noEmit` 类型检查，不参与运行）。

约束（类型剥离的代价，课程要讲）：

- import 必须写全扩展名：`import { sum } from "./sum.ts"`
- 不能用 `enum`、`namespace`、构造函数参数属性——用 `const` 对象和普通赋值代替
- 类型只是注释，运行时不校验；**工具入参必须自己写运行时校验**（L2 的重点）

---

## 3. 默认 LLM（局域网，已探通）

接口细节以 [G:\LlmLocal\内网API.md](G:/LlmLocal/内网API.md) 为准。刚探测：`GET /v1/models` 返回 `qwen3.8-27b`，服务在线。

| 项 | 值 |
|---|---|
| 端点 | `POST http://192.168.3.28:8080/v1/chat/completions`（本机可用 `127.0.0.1`） |
| 鉴权 | `Authorization: Bearer sk-local-qwen36` |
| 模型 | `qwen3.8-27b` |
| 上下文 | 65536，`-np 1` 单并发 |
| 思考 | 默认开，增量在 `reasoning_content` 字段 |
| 工具调用 | 服务已开 `--jinja`，走标准 `tools` / `tool_calls` |

环境变量：

```bash
export LLM_BASE_URL="http://192.168.3.28:8080/v1"
export LLM_API_KEY="sk-local-qwen36"
export LLM_MODEL="qwen3.8-27b"
```

风险：单并发（第二路排队）；WSL 重启后需重跑 `expose-lan-8080.ps1`；长会话 prefill 变慢；勿暴露公网。

### 我们要自己处理的协议细节（已对照 pi 源码核实）

请求体：`{ model, messages, stream: true, stream_options: { include_usage: true }, tools: [{ type: "function", function: { name, description, parameters } }] }`

SSE 响应，每块 `data: {...}\n\n`，以 `data: [DONE]` 结束。每块里：

- `choices[0].delta.content` —— 正文增量
- `choices[0].delta.reasoning_content` —— 思考增量（llama.cpp 特有）
- `choices[0].delta.tool_calls[]` —— `{ index, id?, function: { name?, arguments? } }`，**arguments 是字符串碎片，要按 index 累加后再 `JSON.parse`**
- `choices[0].finish_reason` —— `stop` / `tool_calls` / `length`
- 末块 `usage`

回传时：assistant 消息带 `tool_calls`，每个工具结果作为一条 `{ role: "tool", tool_call_id, content }`。

**这四行就是 L1 和 L2 的全部难点。** 不理解它们，agent 就是玄学。

---

## 4. 五课五目标

每课：一个目标 → 一个可运行产物 → 一个 git tag → 一次「故障注入」→ 一次 pi 对照。

| 课 | 目标（一句话） | 产物 | Tag | 新增行数预算 |
|---|---|---|---|---|
| **L1** | 让模型说话：手写 SSE 客户端，终端流式看到回答与思考 | `node src/cli.ts "你好"` | `l1-talk` | ≤ 300 |
| **L2** | 让模型动手：手写 tool calling 与 agent loop，模型调工具再据结果继续 | 算对 `21*2` 并解释 | `l2-tools` | ≤ 250 |
| **L3** | 让 agent 改代码：read/write/edit/bash 四个受约束工具 | 在指定目录改文件 | `l3-coding` | ≤ 350 |
| **L4** | 让 agent 好用：REPL、中止、会话持久化、上下文预算、重试 | 每天能用的 CLI | `l4-usable` | ≤ 300 |
| **L5** | 让 agent 交付：造出登录页 + 后端，通过冒烟测试 | `demo/login-app/` 全绿 | `l5-delivery` | ≤ 200 |

累计约 **1400 行**，学员读得完。超预算就砍功能，不许膨胀。

### L1 · 让模型说话

手写 `fetch` + SSE 解析。难点是**跨 chunk 的缓冲区切分**：一个 `data:` 事件可能被 TCP 切成两半，天真的 `chunk.split("\n\n")` 必错。产出 `src/llm.ts`（约 120 行）、`src/types.ts`、`src/cli.ts`。

### L2 · 让模型动手

定义 `Tool` 接口（`name` / `description` / `parameters` 手写 JSON Schema / `execute`），实现 agent loop：请求 → 若 `finish_reason === "tool_calls"` 则执行工具、追加 `role: "tool"` 消息 → 再请求，直到模型不再要工具。教学工具是 calculator。

必须讲三个坑：`arguments` 按 index 拼接；类型不等于校验（模型会传 `"21"` 字符串）；loop 要有 `maxSteps` 上限否则烧光上下文。

### L3 · 让 agent 改代码

四个工具，每个都自己写精简版：

- `read` —— 带 offset/limit 与**输出截断**（不截断会一个文件炸掉 64K 上下文）
- `write` —— 自动建父目录
- `edit` —— 精确字符串替换，**要求 oldText 在文件中唯一**，不唯一就报错（这是 agent 编辑的核心安全约束）
- `bash` —— 超时、cwd 约束、输出截断

外加 `guard.ts`：路径越界检查（不许跳出工作目录）、统一截断、统一超时。

**Windows 现实（必讲）**：`C:\Windows\System32\bash.exe` 是 WSL，它眼里 `G:\` 是 `/mnt/g`，agent 用它会写错地方。本机有 `C:\Program Files\Git\bin\bash.exe`，优先用它；否则回退 PowerShell。这个坑真实存在，不能回避。

### L4 · 让 agent 好用

readline REPL、`Ctrl+C` 只中止当前轮（`AbortSignal` 要贯穿 fetch 和工具）、JSONL 会话持久化与 `-c` 续聊、上下文预算（估算 token，超阈值裁剪最老的轮次）、429/超时重试、每轮打印耗时与 token。

### L5 · 让 agent 交付（重点）

**任务**：用我们自己的 agent，在空目录 `demo/login-app/` 里做出：

- `server.ts` —— 零依赖 `node:http`，路由 `POST /api/register`、`POST /api/login`、`GET /api/me`、`POST /api/logout`
- 用户存储 —— `node:sqlite`，密码用 `node:crypto` 的 `scrypt` 加盐哈希，**不存明文**
- 会话 —— `randomUUID()` token 放 httpOnly cookie
- 前端 —— `public/login.html` + `public/app.js`，能注册、登录、显示当前用户、登出

**验收方式（关键设计）**：冒烟测试 `test/login-app.smoke.ts` 由我们**预先写好并锁定**，agent 不许修改它。内容：起服务 → 注册 → 登录 → 带 cookie 访问 `/api/me` 拿到用户名 → 登出后 `/api/me` 返回 401 → 错误密码返回 401。

这条规则解决了 agent 演示最常见的作弊：改测试让它过。**验收先行、不可篡改**，通过就是通过。

**课程高潮是失败**：agent 大概率第一次做不完。预期失败点已列在 [lessons/05](lessons/05-delivery.md)——上下文炸掉、`edit` 匹配不唯一、不读已有文件就重写、反复调同一个工具。每个失败都回炉去改前四课的代码。这才是这门课真正教的东西。

---

## 5. 仓库形状

```
my-pi-agent/
  pi/                        # submodule：参考实现，只读，不是依赖
  package.json               # dependencies: {} ；scripts 全用 node
  tsconfig.json              # 仅供 tsc --noEmit
  src/
    types.ts                 # L1 消息/工具/事件类型
    llm.ts                   # L1 fetch + SSE 解析
    render.ts                # L1 终端输出
    cli.ts                   # L1→L4 入口
    loop.ts                  # L2 agent loop
    tools/
      registry.ts            # L2 Tool 接口 + 运行时参数校验
      calculator.ts          # L2
      guard.ts               # L3 路径/截断/超时
      read.ts write.ts edit.ts bash.ts   # L3
      ls.ts grep.ts          # L5 按需补
    session.ts               # L4 JSONL 持久化
    context.ts               # L4 上下文预算
  test/
    fake-llm.ts              # 自制假模型：node:http 回放 SSE 脚本
    *.test.ts                # node --test
    login-app.smoke.ts       # L5 锁定的验收脚本
  demo/login-app/            # L5 agent 的产出目录
  docs/
    teaching-agent-plan.md   # 本文件
    specs/01..05-*.md        # 每课实现规格
    lessons/01..05-*.md      # 每课教学脚本
```

命令：

```bash
node src/cli.ts "你好"        # 单发
node src/cli.ts               # REPL（L4 起）
node --test                   # 全部测试
npx tsc --noEmit              # 类型检查
```

---

## 6. 文档结构

每课两篇，编号一一对应：

- **[docs/specs/](specs/)** —— 实现规格。模块清单、函数签名、数据结构、测试用例、验收标准、行数预算。**开发时看这个。**
- **[docs/lessons/](lessons/)** —— 教学脚本。目标、90 分钟课堂流程、直播编码步骤、故障注入、练习、pi 对照。**讲课时看这个。**

顺序仍是**先实现后写课**：每课先按 spec 写代码并跑通，再回头写 lesson。

---

## 7. 贯穿全课的三条方法

### 自制假模型（L1 就建）

`test/fake-llm.ts` 是一个 `node:http` 服务器，按脚本回放 SSE 字节流。它让我们能测试「半个 chunk」「工具调用增量」「`[DONE]` 丢失」这些真实模型难以复现的情况，且测试不依赖网络、不烧算力、毫秒级。它本身就是 L1 的教具——**能伪造协议，说明你真懂协议。**

### 故障注入（每课必做）

每课留 15 分钟专门把东西弄坏，先看见坏，再修：

| 课 | 注入的故障 | 学员该看到 |
|---|---|---|
| L1 | 把 SSE chunk 从中间切断 | 天真解析器吐出乱码/丢字 |
| L2 | 模型传 `{"a": "21"}` 字符串、或调不存在的工具 | 没有运行时校验就崩 |
| L3 | `edit` 的 oldText 匹配到两处；`read` 一个 5MB 文件 | 改错地方 / 上下文瞬间爆 |
| L4 | 聊到超过 64K；中途 `Ctrl+C` | 报 400；abort 没贯穿会僵住 |
| L5 | agent 自己制造的真实失败 | 前四课的代码不够用 |

### pi 对照（每课末尾 10 分钟）

诚实给出行数差，讲清工业级实现多做了什么。已量好的实数：

| 模块 | 我们 | pi | pi 多做了什么 |
|---|---|---|---|
| OpenAI 兼容层 | ~120 行 | `openai-completions.ts` 1577 行 | 40 家 provider 兼容、缓存控制、deferred、encrypted reasoning |
| Agent loop | ~120 行 | `agent-loop.ts` 796 行 | 并行工具、steering/follow-up 队列、生命周期钩子、中止语义 |
| edit 工具 | ~60 行 | `edit.ts` 127 + `edit-diff.ts` 500 行 | 多重编辑、行尾/BOM 处理、unified diff |
| 执行环境 | ~80 行 | `nodejs.ts` 695 行 | Result 错误模型、进程树 kill、跨平台 shell 探测 |
| 会话 | ~60 行 | `JsonlSessionRepo` + harness | 分支/lane/压缩/崩溃恢复 |

---

## 8. 每课的完成标准

一个 tag 可以打，当且仅当：

1. 目标产物能跑（真实局域网模型下手工验证一次）
2. `node --test` 全绿，且**断网也能跑**（全部走假模型）
3. 新增行数不超预算
4. `npx tsc --noEmit` 无错
5. 该课的故障注入场景已被修复并有回归测试
6. spec 与代码路径对应，lesson 的 pi 对照已填实数

---

## 9. 已拍板

1. **不 import pi**，全部自己实现；pi 作为只读参考实现留在 submodule。
2. **零依赖**，Node 25 原生跑 TS，`node --test` 做测试。
3. **5 课 5 目标**，每课一 tag、一产物、一次故障注入、一次 pi 对照。
4. **L5 是交付课**：登录页 + 后端，冒烟脚本预先锁定，agent 不可修改。
5. 默认模型是局域网 `qwen3.8-27b`，不接云 API。
6. 先实现后写课；每课两篇文档（spec + lesson）。

**下一步**：L1 —— 按 [specs/01-talk.md](specs/01-talk.md) 写 `src/types.ts`、`src/llm.ts`、`src/cli.ts` 和 `test/fake-llm.ts`。
