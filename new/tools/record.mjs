// termcast · 录制器（WSL 版）：真实执行命令，按毫秒记录每个输出块的时间戳，存为 cast（JSONL）。
// 用法：LLM_BASE_URL=... LLM_API_KEY=... LLM_MODEL=... node new/tools/record.mjs <scenarioId>
// cast 格式：首行 {title} 元信息；其后每行 {t: 毫秒, s: "o"|"e"|"clear", d: 文本}
// 安全：LLM_API_KEY 只从环境变量读取，不写进本文件、不进 cast（display 一律用变量名占位）。
// 说明：远端模型秒回，trickle 把 stdout 按固定节奏滴出，还原「逐字流出」的真实观感；
// display 展示课程目标环境（Node ≥ 23.6）的命令，本机 node 22 实际带 --experimental-strip-types 跑。
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", ".."); // 仓库根
const CASTS = path.resolve(import.meta.dirname, "..", "casts");
fs.mkdirSync(CASTS, { recursive: true });

for (const name of ["LLM_BASE_URL", "LLM_API_KEY", "LLM_MODEL"]) {
  if (!process.env[name]) { console.error(`缺少环境变量 ${name}`); process.exit(1); }
}
const ENV = { ...process.env };

// 本机 node 22 需要类型剥离 flag；display 展示的是课程目标环境（Node ≥ 23.6）的命令
const NODE = ["node", "--experimental-strip-types"];

function killTree(pid) {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true });
  else try { process.kill(-pid, "SIGKILL"); } catch { /* gone */ }
}

/** 运行一个步骤：把输出按时间戳写进 events；timeoutMs 后强杀；返回结束时间。
 *  step.trickle = {bytes, ms} 时，stdout 先进缓冲区，按固定节奏滴出——
 *  用于远端模型秒回时把字节流摊成可见的逐行滚动（渲染器另有 90ms/行 下限）。 */
function runStep(events, step, t0) {
  const { cmd, display, timeoutMs = 300_000, trickle = null } = step;
  return new Promise((resolve) => {
    const now = () => Math.round(performance.now() - t0);
    events.push({ t: now(), s: "o", d: `\x1b[32m$\x1b[0m ${display ?? cmd.join(" ")}\r\n` });
    const child = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env: ENV });
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(now()); } };
    let buf = "";
    let iv = null;
    const drip = () => {
      if (!buf) return;
      events.push({ t: now(), s: "o", d: buf.slice(0, trickle.bytes) });
      buf = buf.slice(trickle.bytes);
    };
    if (trickle) iv = setInterval(drip, trickle.ms);
    const timer = timeoutMs ? setTimeout(() => { buf = ""; killTree(child.pid); finish(); }, timeoutMs) : null;
    child.stdout?.on("data", (d) => { if (trickle) buf += d.toString("utf8"); else events.push({ t: now(), s: "o", d: d.toString("utf8") }); });
    child.stderr?.on("data", (d) => events.push({ t: now(), s: "e", d: d.toString("utf8") }));
    child.on("error", (e) => { events.push({ t: now(), s: "e", d: String(e) + "\r\n" }); });
    child.on("close", () => {
      if (timer) clearTimeout(timer);
      if (iv) {
        clearInterval(iv);
        const flush = setInterval(() => { if (!buf) { clearInterval(flush); finish(); } else drip(); }, trickle.ms);
        return;
      }
      finish();
    });
  });
}

const SCENARIOS = {
  // L1-B04：curl 看真实 SSE 字节流（trickle 摊成逐行滚动；估算 19.9s，目标 ≥ 该值）
  "l1-curl": {
    title: "curl · 真实 SSE 字节流",
    steps: [{
      display: 'curl -N --limit-rate 300 $LLM_BASE_URL/chat/completions -d \'{"...count to 10 slowly..."}\'',
      cmd: ["bash", "-lc",
        'curl -sN --limit-rate 300 "$LLM_BASE_URL/chat/completions" -H "Authorization: Bearer $LLM_API_KEY" -H "content-type: application/json" -d \'{"model":"\'"$LLM_MODEL"\'","stream":true,"messages":[{"role":"user","content":"count from 1 to 10 slowly"}]}\' | head -c 5200'],
      trickle: { bytes: 110, ms: 400 },
      timeoutMs: 60_000,
    }],
  },
  // L1-B11：单发流式输出（思考暗色 + 逐字；旁白：思考先流出，接着正文。估算 21.4s）
  "l1-talk": {
    title: "node src/cli.ts",
    steps: [{ display: 'node src/cli.ts "用三句话解释什么是 SSE"', cmd: [...NODE, "src/cli.ts", "用三句话解释什么是 SSE"], trickle: { bytes: 12, ms: 300 } }],
  },
  // L2-B08：单次工具调用 21*2=42（旁白：先调工具再回答。估算 29.2s，目标 ≥ 19.5s）
  "l2-tools": {
    title: "node src/cli.ts",
    steps: [{ display: 'node src/cli.ts "用计算器算一下，二十一乘二等于多少，并简单解释"', cmd: [...NODE, "src/cli.ts", "用计算器算一下，二十一乘二等于多少，并简单解释"], trickle: { bytes: 8, ms: 300 } }],
  },
  // L3-B10：read + edit 改 hello.js（旁白：先 read 看现状，再 edit 精确替换。估算 26.3s）
  "l3-coding": {
    title: "node src/cli.ts --cwd demo/tmp",
    prepare: () => {
      fs.mkdirSync(path.join(ROOT, "demo/tmp"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, "demo/tmp/hello.js"), '// 打招呼\nconsole.log("hello world");\n');
    },
    steps: [{ display: 'node src/cli.ts --cwd demo/tmp "先读一下 hello.js，再用 edit 把 hello world 精确替换成 hello agent"',
      cmd: [...NODE, "src/cli.ts", "--cwd", "demo/tmp", "先读一下 hello.js，再用 edit 把 hello world 精确替换成 hello agent"],
      trickle: { bytes: 6, ms: 300 } }],
  },
  // L4-B04：会话落盘与 -c 续聊（旁白：退出再续聊，它还记得。估算 25.8s，目标 ≥ 17.2s）
  "l4-session": {
    title: "node src/cli.ts",
    prepare: () => fs.rmSync(path.join(ROOT, ".agent/sessions/vdemo.jsonl"), { force: true }),
    steps: [
      { display: 'node src/cli.ts "我的代号是紫葡萄，请记住。只回答：好的" -s vdemo',
        cmd: [...NODE, "src/cli.ts", "我的代号是紫葡萄，请记住。只回答：好的", "-s", "vdemo"], trickle: { bytes: 14, ms: 300 } },
      { pause: 1500 },
      { clear: true },
      { pause: 800 },
      { display: 'node src/cli.ts "我的代号是什么？只回答代号本身" -s vdemo -c',
        cmd: [...NODE, "src/cli.ts", "我的代号是什么？只回答代号本身", "-s", "vdemo", "-c"], trickle: { bytes: 14, ms: 300 } },
    ],
  },
};

const id = process.argv[2];
const sc = SCENARIOS[id];
if (!sc) { console.error("unknown scenario. available:", Object.keys(SCENARIOS).join(", ")); process.exit(1); }

sc.prepare?.();
const t0 = performance.now();
const events = [];
for (const step of sc.steps) {
  if (step.pause) { await new Promise((r) => setTimeout(r, step.pause)); continue; }
  if (step.clear) { events.push({ t: Math.round(performance.now() - t0), s: "clear", d: "" }); continue; }
  await runStep(events, step, t0);
  events.push({ t: Math.round(performance.now() - t0), s: "o", d: "\r\n" });
}
const out = path.join(CASTS, `${id}.cast.jsonl`);
fs.writeFileSync(out, JSON.stringify({ title: sc.title }) + "\n" + events.map((e) => JSON.stringify(e)).join("\n") + "\n");
console.log(`recorded ${id}: ${events.length} events, ${(events.at(-1).t / 1000).toFixed(1)}s -> ${out}`);
