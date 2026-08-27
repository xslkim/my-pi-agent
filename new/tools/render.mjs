// termcast · 渲染器（WSL 版）：cast（JSONL 时间轴）-> 课程同款终端 HTML -> Windows Chrome 截帧 -> ffmpeg mp4。
// 用法：node new/tools/render.mjs <castFile> <outMp4> [speed]
// 另含两个合成源：--pi <file>（源码滚动）与 --jsonl <会话文件>（run 回放），见底部。
// WSL 适配：Chrome 是 Windows 侧二进制，帧文件落在 Windows 临时目录，路径经 wslpath 转换。
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME = "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";
const WIN_TMP = "/mnt/c/Users/xsl/AppData/Local/Temp"; // Windows 侧可见的临时目录
const WIDTH = 1920, HEIGHT = 1080;
const TERM_W = 1640, PAD = 56, FONT = 28, LINE_H = 48, WRAP = 88; // 每行字符数
const MAX_LINES = 16; // 终端可见行数

const winPath = (p) => spawnSync("wslpath", ["-w", p], { encoding: "utf8" }).stdout.trim();

// ---- 极简 ANSI 状态机：只认 2m/0m/31m/32m/34m，其余剥掉 ----
function ansiToHtml(raw) {
  let out = "", cls = null, i = 0;
  const open = (c) => { if (cls !== c) { if (cls) out += "</span>"; cls = c; out += `<span class="${c}">`; } };
  while (i < raw.length) {
    if (raw[i] === "\x1b" && raw[i + 1] === "[") {
      const m = raw.slice(i).match(/^\x1b\[([0-9;]*)m/);
      if (m) {
        const code = m[0] === "" ? "0" : m[1];
        if (code === "2") open("dim");
        else if (code === "31") open("red");
        else if (code === "32") open("grn");
        else if (code === "34") open("blu");
        else { if (cls) { out += "</span>"; cls = null; } }
        i += m[0].length;
        continue;
      }
      const g = raw.slice(i).match(/^\x1b\[[0-9;?]*[A-Za-z]/); // 其它序列：丢弃
      if (g) { i += g[0].length; continue; }
    }
    const ch = raw[i] === "<" ? "&lt;" : raw[i] === ">" ? "&gt;" : raw[i] === "&" ? "&amp;" : raw[i];
    out += ch;
    i++;
  }
  if (cls) out += "</span>";
  return out;
}

function wrapLines(text, width) {
  const lines = [];
  for (const line of text.split("\n")) {
    if (line.length <= width) { lines.push(line); continue; }
    for (let i = 0; i < line.length; i += width) lines.push(line.slice(i, i + width));
  }
  return lines;
}

function frameHtml(title, rawText) {
  const lines = wrapLines(rawText.replace(/\r/g, ""), WRAP).slice(-MAX_LINES);
  const body = lines.map((l) => ansiToHtml(l) || "&nbsp;").join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:${WIDTH}px;height:${HEIGHT}px;background:#0d1117;font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center}
.term{width:${TERM_W}px;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:62px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d;font-size:22px;color:#8b949e}
.dot{width:20px;height:20px;border-radius:50%}
.body{padding:44px ${PAD}px;font-family:"JetBrains Mono",Consolas,monospace;font-size:${FONT}px;line-height:${LINE_H}px;white-space:pre;min-height:${MAX_LINES * LINE_H}px}
.dim{color:#8b949e}.red{color:#ff7b72}.grn{color:#3fb950}.blu{color:#58a6ff}
</style></head><body><div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span><span style="margin-left:14px">${title}</span></div>
<div class="body">${body}</div>
</div></body></html>`;
}

function shoot(html, png) {
  fs.mkdirSync(WIN_TMP, { recursive: true });
  const tmp = path.join(WIN_TMP, `tc-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(tmp, html);
  const r = spawnSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    `--window-size=${WIDTH},${HEIGHT}`, "--force-device-scale-factor=1",
    `--screenshot=${winPath(png)}`, `file:///${winPath(tmp).replace(/\\/g, "/")}`,
  ], { timeout: 30_000 });
  fs.rmSync(tmp, { force: true });
  if (r.status !== 0 || !fs.existsSync(png)) throw new Error(`chrome failed: ${r.stderr?.toString().slice(0, 200)} status=${r.status}`);
}

/** cast 事件 -> 帧序列，结尾多停 1.2s；speed>1 加速回放（<1 减速拉长）。
 *  大块输出按「行」展开为连续帧（90ms/行），时间锚定真实事件时间取 max。 */
function castToFrames(castFile, speed, titleOverride) {
  const lines0 = fs.readFileSync(castFile, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const meta = lines0[0];
  const events = lines0.slice(1).filter((e) => !e.d?.includes("[shell]"));
  let raw = "";
  const frames = [{ t: 0, raw: "" }];
  const push = (t, r) => {
    const last = frames[frames.length - 1];
    frames.push({ t: Math.max(last.t + 90, t), raw: r });
  };
  for (const e of events) {
    const et = e.t / speed;
    if (e.s === "clear") { raw = ""; push(et, ""); continue; }
    const parts = e.d.replace(/\r/g, "").split("\n");
    parts.forEach((p, i) => {
      raw += p + (i < parts.length - 1 ? "\n" : "");
      push(et + 90 * i, raw);
    });
  }
  return { title: titleOverride ?? meta.title ?? "terminal", frames };
}

async function render(outMp4, { title, frames }) {
  const tmp = fs.mkdtempSync(path.join(WIN_TMP, "tcframes-"));
  const list = [];
  for (let i = 0; i < frames.length; i++) {
    const png = path.join(tmp, `f${String(i).padStart(4, "0")}.png`);
    shoot(frameHtml(title, frames[i].raw), png);
    const next = frames[i + 1]?.t ?? frames[i].t + 1200;
    const dur = Math.max(0.1, (next - frames[i].t) / 1000);
    list.push(`file '${png.replace(/\\/g, "/")}'\nduration ${dur.toFixed(3)}`);
    if (i % 25 === 0) console.log(`  frame ${i + 1}/${frames.length}`);
  }
  const lastPng = path.join(tmp, "f" + String(frames.length - 1).padStart(4, "0") + ".png");
  list.push(`file '${lastPng.replace(/\\/g, "/")}'`);
  const listFile = path.join(tmp, "list.txt");
  fs.writeFileSync(listFile, "ffconcat version 1.0\n" + list.join("\n") + "\n");
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });
  const r = spawnSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listFile,
    "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", outMp4],
    { timeout: 300_000 });
  fs.rmSync(tmp, { recursive: true, force: true });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr?.toString().slice(-400)}`);
  console.log(`ok -> ${outMp4}`);
}

// ---- 入口 ----
const [, , cmd, ...rest] = process.argv;
if (cmd === "--pi") {
  // 用法: render.mjs --pi <源文件> <outMp4> <起始行> <结束行> [行步长=6]
  const [file, out, from = 1, to = 200, step = 6] = rest;
  const src = fs.readFileSync(file, "utf8").split("\n");
  const frames = [];
  for (let top = +from; top <= +to; top += +step) {
    const win = src.slice(top - 1, top - 1 + MAX_LINES)
      .map((l, i) => `\x1b[2m${String(top + i).padStart(5)}|\x1b[0m ${l.slice(0, WRAP - 8)}`);
    frames.push({ t: frames.length * 90, raw: win.join("\n") });
  }
  frames.unshift({ t: 0, raw: `\x1b[2m${file.split(/[\\\/]/).pop()} · ${src.length} lines\x1b[0m` });
  await render(out, { title: file.split(/[\\\/]/).pop(), frames });
} else if (cmd === "--jsonl") {
  // 用法: render.mjs --jsonl <会话jsonl> <outMp4> [speed] —— 工具序列回放（快进节奏）
  const [file, out, speed = 1] = rest;
  const msgs = fs.readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const lines = [];
  let t = 0;
  const add = (d, dur) => { const acc = lines.length ? lines[lines.length - 1].raw + "\n" : ""; lines.push({ t, raw: acc + d }); t += dur / (+speed || 1); };
  for (const m of msgs) {
    if (m.role === "system") continue;
    if (m.role === "user") { add(`\x1b[32m$\x1b[0m ${m.content.slice(0, 70)}…`, 1400); continue; }
    if (m.role === "assistant") {
      for (const c of m.tool_calls ?? []) {
        let args = c.arguments; try { args = Object.entries(JSON.parse(c.arguments)).slice(0, 2).map(([k, v]) => `${k}:${String(v).slice(0, 24)}`).join(","); } catch {}
        add(`→ \x1b[34m${c.name}\x1b[0m({${args}…})`, 650);
      }
      if (m.content) add(m.content.split("\n").slice(0, 2).join(" ").slice(0, 80), 1100);
    }
    if (m.role === "tool") add(`← ${m.content.split("\n")[0].slice(0, 76)}`, 750);
  }
  await render(out, { title: "run · timelapse", frames: lines });
} else {
  // 用法: render.mjs <castFile> <outMp4> [speed]
  const [castFile, out, speed = 1] = [cmd, ...rest];
  const { title, frames } = castToFrames(castFile, +speed || 1);
  await render(out, { title, frames });
}
