# video_res · 视频课程素材

「从零手写一个 Coding Agent」五课视频 + 课程总览，按 [AutoVideo AUTHORING.md](D:/AutoVideo/docs/AUTHORING.md) 规范编写。

## 目录

| 文件夹 | 视频 | slug | 块数 | 预计时长 |
|---|---|---|---|---|
| `00-course-overview/` | 课程总览（先导片） | `pi-agent-course-overview` | 7 | ~2.5 min |
| `lesson1-talk/` | 第 1 课 · 让模型说话（SSE） | `pi-agent-lesson1-talk` | 12 | ~4.5 min |
| `lesson2-tools/` | 第 2 课 · 让模型动手（loop） | `pi-agent-lesson2-tools` | 12 | ~4.5 min |
| `lesson3-coding/` | 第 3 课 · 让 agent 改代码 | `pi-agent-lesson3-coding` | 13 | ~5 min |
| `lesson4-usable/` | 第 4 课 · 让 agent 好用 | `pi-agent-lesson4-usable` | 11 | ~4.5 min |
| `lesson5-delivery/` | 第 5 课 · 让 agent 交付 | `pi-agent-lesson5-delivery` | 12 | ~5 min |

每个文件夹内：`meta.md`（元数据）+ `script.md`（`>>>` 分块脚本）。

## 构建前必读

1. **voiceRef 假设**：各 `meta.md` 写的是 `voiceRef: ../../B00.wav`，按「文件夹被复制到
   `D:\AutoVideo\project\<slug>\` 下」的惯例指向 `D:\AutoVideo\B00.wav`。若直接在本目录构建，
   请把 `voiceRef` 改为绝对路径 `D:/AutoVideo/B00.wav`。
2. **视觉模式分布**（遵循 AUTHORING.md §3.0 的优先级规则）：
   - `video(./assets/*.mp4)`（9 处）：**真实终端实录**与真实源码滚动——录制与生成方式见
     [`assets/README.md`](assets/README.md)，该模式不调 AI；
   - `html`（多数块）：代码窗口、对比卡片、表格——手写 HTML 截图，不调 AI、零失败率；
   - `animation`（每课 2–3 块）：需要跟随旁白推进的动效（SSE 分片、agent loop、abort 贯穿、
     管道死锁、成组裁剪等），描述中已写明用 `props.lineTimings` 驱动；
   - 未使用 `image` API 模式（无文生图依赖）。
3. **内容来源**：讲稿与实况数据取自仓库 `docs/lessons/` 与 `docs/runs/run1.md`——第 5 课的
   bash 死锁事故、`jobs -p` 修复、run1/run2 对比均为本项目真实事件，非虚构。
4. 每课片尾都带 git tag 提示（`l1-talk` … `l5-delivery`），观众可 `git checkout` 到任意一课状态。

## 交给构建 Agent

把任一课程文件夹（例如 `G:\my-pi-agent\video_res\lesson1-talk`）交给负责构建的 Agent，
按 `D:\AutoVideo\docs\BUILD.md` 流程生成 MP4 即可。六个视频相互独立，可分别构建。
