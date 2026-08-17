// termcast · 录制器：真实执行命令，按毫秒记录每个输出块的时间戳，存为 cast（JSONL）。
// 用法：node record.mjs <scenarioId>   （scenarios 在本文件底部定义）
// cast 格式：首行 {title, cmd} 元信息；其后每行 {t: 毫秒, s: "o"|"e", d: 文本}
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..", ".."); // 仓库根
const CASTS = path.resolve(import.meta.dirname, "..", "casts");
fs.mkdirSync(CASTS, { recursive: true });

const ENV = {
  ...process.env,
  LLM_BASE_URL: "http://192.168.3.28:8080/v1",
  LLM_API_KEY: "sk-local-qwen36",
  LLM_MODEL: "qwen3.8-27b",
};

function killTree(pid) {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true });
  else try { process.kill(-pid, "SIGKILL"); } catch { /* gone */ }
}

/** 运行一个步骤：把输出按时间戳写进 events；timeoutMs 后强杀；返回结束时间 */
function runStep(events, step, t0) {
  const { cmd, display, timeoutMs = 300_000 } = step;
  return new Promise((resolve) => {
    events.push({ t: Math.round(performance.now() - t0), s: "o", d: `\x1b[32m$\x1b[0m ${display ?? cmd.join(" ")}\r\n` });
    const child = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env: ENV, windowsHide: true });
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(Math.round(performance.now() - t0)); } };
    const timer = timeoutMs ? setTimeout(() => { killTree(child.pid); finish(); }, timeoutMs) : null;
    child.stdout?.on("data", (d) => events.push({ t: Math.round(performance.now() - t0), s: "o", d: d.toString("utf8") }));
    child.stderr?.on("data", (d) => events.push({ t: Math.round(performance.now() - t0), s: "e", d: d.toString("utf8") }));
    child.on("error", (e) => { events.push({ t: Math.round(performance.now() - t0), s: "e", d: String(e) + "\r\n" }); });
    child.on("close", () => { if (timer) clearTimeout(timer); finish(); });
  });
}

const SCENARIOS = {
  // L1-B02：curl 看真实 SSE 字节流（短平快，15s 后截断足够展示）
  "l1-curl": {
    title: "curl · 真实 SSE 字节流",
    steps: [{
      display: 'curl -N --limit-rate 300 $LLM_BASE_URL/chat/completions -d \'{"...count to 10 slowly..."}\'',
      cmd: ["C:/Program Files/Git/bin/bash.exe", "-c",
        `curl -sN --limit-rate 300 ${ENV.LLM_BASE_URL}/chat/completions -H "Authorization: Bearer ${ENV.LLM_API_KEY}" -H "content-type: application/json" -d '{"model":"qwen3.8-27b","stream":true,"messages":[{"role":"user","content":"count from 1 to 10 slowly"}]}' | head -c 3200`],
      timeoutMs: 25_000,
      timeoutMs: 20_000,
    }],
  },
  // L1-B10：单发流式输出（思考暗色 + 逐字 + tokens 行）
  "l1-talk": {
    title: "node src/cli.ts",
    steps: [{ display: 'node src/cli.ts "用三句话解释什么是 SSE"', cmd: ["node", "src/cli.ts", "用三句话解释什么是 SSE"] }],
  },
  // L2-B11：两次串行工具调用
  "l2-tools": {
    title: "node src/cli.ts",
    steps: [{ display: 'node src/cli.ts "用计算器算 (21*2)+8 等于几"', cmd: ["node", "src/cli.ts", "用计算器算 (21*2)+8 等于几"] }],
  },
  // L3-B12：创建并运行 hello.js（先清掉旧文件，保证真实首次运行）
  "l3-coding": {
    title: "node src/cli.ts --cwd demo/tmp",
    prepare: () => fs.rmSync(path.join(ROOT, "demo/tmp/hello.js"), { force: true }),
    steps: [{ display: 'node src/cli.ts --cwd demo/tmp "创建 hello.js，打印 hello world，然后用 node 跑一遍验证"',
      cmd: ["node", "src/cli.ts", "--cwd", "demo/tmp", "创建 hello.js，打印 hello world，然后用 node 跑一遍验证"] }],
  },
  // L4-B11：会话落盘与 -c 续聊（两条命令，中间清屏）
  "l4-session": {
    title: "node src/cli.ts",
    steps: [
      { display: 'node src/cli.ts "我的代号是紫葡萄，请记住。只回答：好的" -s vdemo --no-thinking',
        cmd: ["node", "src/cli.ts", "我的代号是紫葡萄，请记住。只回答：好的", "-s", "vdemo", "--no-thinking"] },
      { clear: true },
      { display: 'node src/cli.ts "我的代号是什么？只回答代号本身" -s vdemo -c --no-thinking',
        cmd: ["node", "src/cli.ts", "我的代号是什么？只回答代号本身", "-s", "vdemo", "-c", "--no-thinking"] },
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
  if (step.clear) { events.push({ t: Math.round(performance.now() - t0), s: "clear", d: "" }); continue; }
  await runStep(events, step, t0);
  events.push({ t: Math.round(performance.now() - t0), s: "o", d: "\r\n" });
}
const out = path.join(CASTS, `${id}.cast.jsonl`);
fs.writeFileSync(out, JSON.stringify({ title: sc.title }) + "\n" + events.map((e) => JSON.stringify(e)).join("\n") + "\n");
console.log(`recorded ${id}: ${events.length} events, ${(events.at(-1).t / 1000).toFixed(1)}s -> ${out}`);
