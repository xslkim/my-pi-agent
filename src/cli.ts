import path from "node:path";
import { parseArgs } from "node:util";
import { runAgent } from "./loop.ts";
import { renderAgentEvent } from "./render.ts";
import { systemPrompt } from "./prompt.ts";
import { startRepl } from "./repl.ts";
import { appendMessage, loadSession, sessionFile } from "./session.ts";
import { calculator } from "./tools/calculator.ts";
import { read } from "./tools/read.ts";
import { write } from "./tools/write.ts";
import { edit } from "./tools/edit.ts";
import { bash } from "./tools/bash.ts";
import type { Message } from "./types.ts";

const USAGE = `usage: node src/cli.ts [prompt] [options]
  --cwd <dir>            working directory (default process.cwd())
  -s, --session <name>   session name -> .agent/sessions/<name>.jsonl (default timestamp)
  -c, --continue         resume that session
  --max-steps <n>        agent loop step limit (default 10)
  --context-budget <n>   context token budget (default 24000)
  --no-thinking          hide thinking output
  --yolo                 skip dangerous-command confirmation
  -h, --help             show this help
example:
  LLM_BASE_URL=http://your-llm-host:8080/v1 LLM_API_KEY=your-key LLM_MODEL=your-model node src/cli.ts "21*2" -s demo`;

function num(v: string | undefined, fallback: number, name: string): number {
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    console.error(`invalid --${name}: ${v}`);
    process.exit(1);
  }
  return Math.floor(n);
}

async function main(): Promise<void> {
  let args;
  try {
    args = parseArgs({
      allowPositionals: true,
      options: {
        cwd: { type: "string" },
        session: { type: "string", short: "s" },
        continue: { type: "boolean", short: "c", default: false },
        "max-steps": { type: "string" },
        "context-budget": { type: "string" },
        "no-thinking": { type: "boolean", default: false },
        yolo: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (e) {
    console.error((e as Error).message);
    console.error(USAGE);
    process.exit(1); // 参数解析失败：打印用法并退出码 1
  }
  const { values, positionals } = args;
  if (values.help) {
    console.log(USAGE);
    return;
  }
  const prompt = positionals[0];
  const cwd = values.cwd ? path.resolve(values.cwd) : process.cwd();
  const file = sessionFile(values.session ?? new Date().toISOString().replace(/[:.]/g, "-"));
  const maxSteps = num(values["max-steps"], 10, "max-steps");
  const budget = num(values["context-budget"], 24_000, "context-budget");
  const noThinking = values["no-thinking"];
  const tools = [calculator, read, write, edit, bash];

  if (prompt === undefined) {
    const initial = values.continue ? loadSession(file) : [];
    await startRepl({ cwd, tools, sessionFile: file, budget, maxSteps, noThinking, initial });
    return;
  }

  // 单发模式：有 prompt 就视为非交互（T23 的危险命令确认依赖这一点）
  const base = values.continue ? loadSession(file) : [];
  const messages: Message[] = base.length ? [...base] : [{ role: "system", content: systemPrompt(cwd) }];
  messages.push({ role: "user", content: prompt });
  let persisted = base.length; // -c 时文件里已有的部分不重写
  const flush = () => {
    while (persisted < messages.length) appendMessage(file, messages[persisted++]);
  };
  const controller = new AbortController();
  process.on("SIGINT", () => controller.abort());
  try {
    flush();
    for await (const ev of runAgent({ messages, tools, cwd, signal: controller.signal, maxSteps })) {
      if (noThinking && ev.type === "thinking") continue;
      renderAgentEvent(ev);
      flush(); // 中途 Ctrl+C 也保留已产生的部分
    }
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError" || /abort/i.test(e.message)) {
      console.error("\n[aborted]");
      process.exit(130);
    }
    console.error(e.message);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
