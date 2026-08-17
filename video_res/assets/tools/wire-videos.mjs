// 把指定块切换到本地视频模式（@visual: video(./assets/xx.mp4)），visual 描述改为文档说明。
// 用法：node wire-videos.mjs   （映射表在下面）
import fs from "node:fs";
import path from "node:path";

const BASE = path.resolve(import.meta.dirname, "..", "..");

const MAP = [
  ["lesson1-talk", "B02", "curl-sse.mp4", "真实录屏：curl -N 以 300B/s 限速拉取 SSE 字节流，data: 事件逐行到达，最后 [DONE]。"],
  ["lesson1-talk", "B10", "talk-demo.mp4", "真实录屏：node src/cli.ts 真机流式输出——暗色思考、逐字正文、末尾 token 统计。"],
  ["lesson1-talk", "B11", "pi-scroll.mp4", "真实源码滚动：pi openai-completions.ts（1577 行）第 60–560 行快速滚过。"],
  ["lesson2-tools", "B11", "calc-tools.mp4", "真实录屏：模型串行两次调用 calculator（21*2 → 42+8），参数与结果实时可见。"],
  ["lesson2-tools", "B12", "pi-loop.mp4", "真实源码滚动：pi agent-loop.ts（796 行）开头快速滚过。"],
  ["lesson3-coding", "B12", "hellojs-demo.mp4", "真实录屏：agent 在 demo/tmp 创建 hello.js 并用 node 运行验证。"],
  ["lesson4-usable", "B11", "session-resume.mp4", "真实录屏：两次单发——先存「代号紫葡萄」，再 -s vdemo -c 续聊答出代号。"],
  ["lesson5-delivery", "B06", "run1-timelapse.mp4", "由 docs/runs/l5-run1.jsonl 会话记录回放的快进时间轴（真实工具序列，时间轴按比例重建）。"],
];

for (const [lesson, blockId, mp4, doc] of MAP) {
  const file = path.join(BASE, lesson, "script.md");
  let md = fs.readFileSync(file, "utf8");
  const re = new RegExp(`(>>>[^\\n]*#${blockId}\\s*\\n)((?:@\\w+:.*\\n|\\n)*?)--- visual ---\\n[\\s\\S]*?(?=\\n\\n--- narration ---)`, "m");
  const found = md.match(re);
  if (!found) { console.error(`✗ ${lesson} ${blockId}: block not matched`); process.exitCode = 1; continue; }
  const keepEnter = found[2].match(/@enter:.*\n/)?.[0] ?? "@enter: fade\n";
  const keepExit = found[2].match(/@exit:.*\n/)?.[0] ?? "@exit: fade\n";
  const replacement = `${found[1]}${keepEnter}${keepExit}@visual: video(./assets/${mp4})\n\n--- visual ---\n（此描述仅作文档用途，实际使用 ./assets/${mp4}）\n${doc}`;
  md = md.replace(re, replacement);
  fs.writeFileSync(file, md);
  console.log(`✓ ${lesson} ${blockId} -> video(./assets/${mp4})`);
}
