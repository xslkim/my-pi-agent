import path from "node:path";
import { runAgent } from "./loop.ts";
import { renderAgentEvent } from "./render.ts";
import { systemPrompt } from "./prompt.ts";
import { calculator } from "./tools/calculator.ts";
import { read } from "./tools/read.ts";
import { write } from "./tools/write.ts";
import { edit } from "./tools/edit.ts";
import { bash } from "./tools/bash.ts";
import type { Message } from "./types.ts";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const cwdIdx = argv.indexOf("--cwd");
  const cwd =
    cwdIdx !== -1 && argv[cwdIdx + 1] ? path.resolve(argv[cwdIdx + 1]) : process.cwd();
  const positional = argv.filter(
    (a, i) => a !== "--cwd" && !(cwdIdx !== -1 && i === cwdIdx + 1) && !a.startsWith("--"),
  );
  const prompt = positional[0];
  if (!prompt) {
    console.error('usage: node src/cli.ts "你的问题" [--cwd <dir>]');
    process.exit(1);
  }
  const controller = new AbortController();
  process.on("SIGINT", () => controller.abort()); // Ctrl+C：中止本轮流式输出，干净退出

  const messages: Message[] = [
    { role: "system", content: systemPrompt(cwd) },
    { role: "user", content: prompt },
  ];
  const tools = [calculator, read, write, edit, bash];
  try {
    for await (const ev of runAgent({ messages, tools, cwd, signal: controller.signal })) {
      renderAgentEvent(ev);
    }
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError" || /abort/i.test(e.message)) {
      console.error("\n[aborted]");
      process.exit(130);
    }
    console.error(e.message); // 报错不打印堆栈：缺环境变量、网络错误，一行说清
    process.exit(1);
  }
}

void main();
