import { runAgent } from "./loop.ts";
import { renderAgentEvent } from "./render.ts";
import { calculator } from "./tools/calculator.ts";
import type { Message } from "./types.ts";

async function main(): Promise<void> {
  const prompt = process.argv[2];
  if (!prompt) {
    console.error('usage: node src/cli.ts "你的问题"');
    process.exit(1);
  }
  const controller = new AbortController();
  process.on("SIGINT", () => controller.abort()); // Ctrl+C：中止本轮流式输出，干净退出

  const messages: Message[] = [{ role: "user", content: prompt }];
  try {
    for await (const ev of runAgent({
      messages,
      tools: [calculator],
      cwd: process.cwd(),
      signal: controller.signal,
    })) {
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
