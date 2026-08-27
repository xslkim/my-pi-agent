# video_res · 视频课程素材

「从零手写一个 Coding Agent」五课视频（课程总览已并入第 1 课），按 [AutoVideo AUTHORING.md](/home/xsl/AutoVideo/docs/AUTHORING.md) 规范编写。

## 目录

| 文件夹 | 视频 | slug | 块数 | 预计时长 |
|---|---|---|---|---|
| `lesson1-talk/` | 第 1 课 · 让模型说话（课程总览 + 手写 SSE 客户端） | `pi-agent-lesson1-talk` | 19 | ~7 min |
| `lesson2-tools/` | 第 2 课 · 让模型动手（tool calling 与 agent loop） | `pi-agent-lesson2-tools` | 12 | ~4.5 min |
| `lesson3-coding/` | 第 3 课 · 让 agent 改代码（四个受约束的工具） | `pi-agent-lesson3-coding` | 13 | ~5 min |
| `lesson4-usable/` | 第 4 课 · 让 agent 好用（REPL · 中止 · 会话 · 上下文 · 重试） | `pi-agent-lesson4-usable` | 11 | ~5 min |
| `lesson5-delivery/` | 第 5 课 · 让 agent 交付（登录应用实战） | `pi-agent-lesson5-delivery` | 12 | ~5 min |

每个文件夹内：`meta.md`（元数据）+ `visuals.md`（视觉，`>>>` 分块）+ `narration.md`（旁白，块 ID 与 visuals.md 一一对应）+ `project.json`。

## AutoVideo 项目软连接

AutoVideo 工程内的项目目录不复制资源，逐文件软连接回本仓库（真实资源以本仓库为准）：

```
/home/xsl/AutoVideo/project/pi-agent-lesson1-talk/
├── meta.md      -> /home/xsl/my-pi-agent/video_res/lesson1-talk/meta.md
├── visuals.md   -> .../lesson1-talk/visuals.md
├── narration.md -> .../lesson1-talk/narration.md
├── project.json -> .../lesson1-talk/project.json
├── assets/      -> .../lesson1-talk/assets
└── build/       # 构建产物（实体目录，留在 AutoVideo 侧）
```

其余四课同理（`pi-agent-lesson2-tools` … `pi-agent-lesson5-delivery`）。
在本仓库改动脚本即等于改动 AutoVideo 项目，无需同步。

## 构建前必读

1. **voiceRef 假设**：各 `meta.md` 写的是 `voiceRef: ../../B00.wav`，按「项目在
   `/home/xsl/AutoVideo/project/<slug>/` 下」的惯例指向 `/home/xsl/AutoVideo/B00.wav`。
2. **视觉模式分布**（遵循 AUTHORING.md §3.0 的优先级规则）：
   - `video(./assets/*.mp4)`（9 处）：**真实终端实录**与真实源码滚动——录制与生成方式见
     [`assets/README.md`](assets/README.md)，该模式不调 AI；
   - `html`（多数块）：代码窗口、对比卡片、表格——手写 HTML 截图，不调 AI、零失败率；
   - `animation`（每课 3–4 块）：需要跟随旁白推进的动效（SSE 分片、agent loop、abort 贯穿、
     管道死锁、成组裁剪等），描述中已写明用 `props.lineTimings` 驱动；
   - 未使用 `image` API 模式（无文生图依赖）。
3. **内容来源**：讲稿与实况数据取自仓库 `docs/lessons/` 与 `docs/runs/run1.md`——第 5 课的
   bash 死锁事故、`jobs -p` 修复、run1/run2 对比均为本项目真实事件，非虚构。
4. 每课片尾都带 git tag 提示（`l1-talk` … `l5-delivery`），观众可 `git checkout` 到任意一课状态。

## 交给构建 Agent

把任一课程项目目录（例如 `/home/xsl/AutoVideo/project/pi-agent-lesson1-talk`）交给负责构建的 Agent，
按 `/home/xsl/AutoVideo/docs/BUILD.md` 流程生成 MP4 即可。五个视频相互独立，可分别构建。

## 写新脚本前必读

`guidelines/` 下有三份**写作主法** + 两份**通用工序**（编号 01–05 即流水线位置，非优先级）：

**写作主法（每次课程按症状三选一）：**

| 文档 | 方案 | 什么时候选它 |
|---|---|---|
| [01-goal-contract.md](guidelines/01-goal-contract.md) | 三层目标契约法 | 新系列从零起步；结构松散、内容膨胀 |
| [02-audience-persona.md](guidelines/02-audience-persona.md) | 受众画像先行法 | 受众混杂、深浅拿不准；要出多受众版本 |
| [04-block-design.md](guidelines/04-block-design.md) | 单块单点·先演后讲法 | 结构已定，要提高「看完能学会」的教学质量 |

**通用工序（不在选择之列，每次必过）：**

| 文档 | 工序 | 时机 |
|---|---|---|
| [03-fact-baseline.md](guidelines/03-fact-baseline.md) | 事实基线锁定 | 动笔前：建事实表，写稿只引用表内事实 |
| [05-av-acceptance.md](guidelines/05-av-acceptance.md) | 音画预算与验收 | 交构建前：时长预算 + 逐项验收清单 |

五份文档的「通用底线」节逐字一致，改动须五处同步（`guidelines/check-baseline.sh` 可校验）。
