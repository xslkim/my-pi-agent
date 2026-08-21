# assets · 录屏素材与生成工具

5 段终端实录 + 2 段会话回放 + 2 段源码滚动，全部 1920×1080 / 30fps / H.264 / yuv420p，已接入对应课程的
`script.md`（`@visual: video(./assets/<file>.mp4)`，该模式**不调任何 AI 服务**）。

## 已生成的素材

| 文件 | 用在 | 时长 | 内容与来源 |
|---|---|---|---|
| `lesson1-talk/assets/curl-sse.mp4` | L1-B09 | 15.3s | 真实 `curl -N`（300B/s 限速）拉取 SSE 字节流 |
| `lesson1-talk/assets/talk-demo.mp4` | L1-B17 | 16.0s | 真机单发流式输出（暗色思考/逐字/token 行） |
| `lesson1-talk/assets/pi-scroll.mp4` | L1-B18 | 19.1s | pi `openai-completions.ts` 第 60–560 行匀速滚动（30 行/秒） |
| `lesson2-tools/assets/calc-tools.mp4` | L2-B11 | 15.2s | 真机串行两次 calculator 调用（21×2 → 42+8） |
| `lesson2-tools/assets/pi-loop.mp4` | L2-B12 | 22.3s | pi `agent-loop.ts` 796 行全文匀速滚动（40 行/秒） |
| `lesson3-coding/assets/hellojs-demo.mp4` | L3-B12 | 17.8s | 真机创建 hello.js 并运行验证 |
| `lesson4-usable/assets/session-resume.mp4` | L4-B11 | 15.4s | 真机 `-s` 存会话 + `-c` 续聊答出「紫葡萄」 |
| `lesson5-delivery/assets/run1-timelapse.mp4` | L5-B06 | 23.8s | 由 `docs/runs/l5-run1.jsonl` 回放的工具序列快进（真实序列，时间轴按比例重建） |
| `lesson5-delivery/assets/run2-timelapse.mp4` | L5-B10 | 17.1s | 由 `docs/runs/l5-run2.jsonl` 回放的工具序列快进（T24 真跑，无死锁） |

## 生成方式（全部可重复）

工具在 `tools/`，原理是「**真实输出 + 时间轴回放**」：真实执行命令、按毫秒记录每个输出块
（asciinema cast 思路），再用课程同款终端样式渲染成帧（headless Chrome 截图），ffmpeg 合成。
画面与节奏都是真的，且可随时重录。

```bash
cd tools
node record.mjs l1-curl        # 录制：cast 存 ../casts/<id>.cast.jsonl
node render.mjs ../casts/l1-curl.cast.jsonl ../../lesson1-talk/assets/curl-sse.mp4 1
#                              ^ speed：1 原速；0.55 放慢回放；>1 加速
node render.mjs --pi   <源文件> <out.mp4> <起行> <止行> [行步长=6]  # 源码滚动；步长 3 ≈ 30 行/秒
node render.mjs --jsonl <会话jsonl> <out.mp4> [speed]     # 会话回放快进
node wire-videos.mjs           # 把 script.md 的对应块切换到 video() 模式
```

场景定义在 `record.mjs` 底部的 `SCENARIOS`（真机场景走局域网 qwen3.8-27b）。

## 备注

- **L4 的 Ctrl+C 中止画面**未录制（Windows 管道模式下无法向子进程投递真实的 SIGINT 控制事件），
  该知识点由 L4-B03 的三层贯穿动画承担。
- 重录真机片段前先确认模型服务在线：`curl -s $LLM_BASE_URL/models -H "Authorization: Bearer $LLM_API_KEY"`。
