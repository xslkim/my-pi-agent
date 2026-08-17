import readline from "node:readline/promises";
import type { Readable, Writable } from "node:stream";
import type { EventEmitter } from "node:events";
import { runAgent } from "./loop.ts";
import { renderAgentEvent } from "./render.ts";
import { systemPrompt } from "./prompt.ts";
import { fitContext, estimateTokens } from "./context.ts";
import { appendMessage, sessionFile } from "./session.ts";
import type { Message } from "./types.ts";
import type { Tool } from "./tools/registry.ts";

// Ctrl+C 两段语义：生成中 -> 中止本轮回提示符；空闲 -> 退出。REPL 发信号并收拾残局：
// 把部分输出补成 assistant 消息。question() 期间到达的行会被 readline 丢弃，必须自己排队。

const TRIMMED = "[earlier conversation trimmed]";

export async function startRepl(opts: {
  cwd: string;
  tools: Tool[];
  sessionFile?: string;
  budget?: number;
  maxSteps?: number;
  noThinking?: boolean;
  initial?: Message[]; // -c 续聊：从会话文件恢复的历史（没有则用 system 开新会话）
  input?: Readable;
  output?: Writable;
  interrupt?: EventEmitter; // 默认 process；测试注入后 emit("SIGINT") 模拟 Ctrl+C
}): Promise<void> {
  const input = opts.input ?? process.stdin;
  const output = opts.output ?? process.stdout;
  const interrupt = opts.interrupt ?? process;
  const rl = readline.createInterface({ input, output });
  const messages: Message[] = opts.initial?.length ? [...opts.initial] : [{ role: "system", content: systemPrompt(opts.cwd) }]; // -c 注入历史

  const queue: string[] = [];
  let lineWaiter: ((l: string) => void) | null = null;
  let closed = false;
  rl.on("line", (l) => {
    const r = lineWaiter;
    if (r) { lineWaiter = null; r(l); } else queue.push(l); // 生成期间敲的行：排队不丢
  });
  rl.on("close", () => { closed = true; lineWaiter?.(""); lineWaiter = null; });
  const nextLine = () =>
    queue.length ? Promise.resolve(queue.shift()!) : new Promise<string>((r) => (lineWaiter = r));

  let generating = false, running = true;
  let controller = new AbortController();
  const onSigint = () => {
    if (generating) return controller.abort();
    running = false;
    rl.close();
    if (interrupt === process) process.exit(0); // 注入环境只结束循环，不杀进程
  };
  interrupt.on("SIGINT", onSigint); // 全程一个监听器，杜绝 MaxListenersExceededWarning

  let persisted = 0;
  const flush = () => { while (opts.sessionFile && persisted < messages.length) appendMessage(opts.sessionFile, messages[persisted++]); };

  try {
    rl.setPrompt("> ");
    while (running) {
      rl.prompt();
      const line = (await nextLine()).trim();
      if (closed || line === "/exit") break;
      if (line === "/clear") { messages.length = 1; continue; } // 只留 system
      if (line === "/history") {
        output.write(`${messages.length} messages, ~${messages.reduce((s, m) => s + estimateTokens(m.content), 0)} tokens\n`);
        continue;
      }
      if (line.startsWith("/save ")) {
        const name = line.slice(6).trim();
        for (const m of messages) appendMessage(sessionFile(name), m);
        output.write(`saved ${sessionFile(name)}\n`);
        continue;
      }
      if (line.startsWith("/") || line === "") {
        if (line !== "") output.write(`unknown command ${line} (try /exit /clear /history /save <name>)\n`);
        continue; // 未知命令绝不发给模型
      }

      messages.push({ role: "user", content: line });
      flush();
      controller = new AbortController();
      generating = true;
      let partial = "";
      const before = messages.length;
      try {
        for await (const ev of runAgent({ messages, tools: opts.tools, cwd: opts.cwd, signal: controller.signal, maxSteps: opts.maxSteps })) {
          if (ev.type === "text") partial += ev.delta;
          if (!(opts.noThinking && ev.type === "thinking")) renderAgentEvent(ev, output);
          flush(); // 消息一产生就落盘，Ctrl+C 也不丢
        }
      } catch (err) {
        const e = err as Error;
        if (e.name === "AbortError" || /abort/i.test(e.message)) {
          output.write("\n[aborted]\n");
          if (messages.length === before && partial) messages.push({ role: "assistant", content: `${partial}\n[aborted]` });
        } else output.write(`error: ${e.message}\n`);
      }
      generating = false;
      flush();
      const cleaned = messages.filter((m) => m.content !== TRIMMED); // 摘旧标记防堆积
      const fitted = fitContext(cleaned, opts.budget ?? 24_000);
      if (fitted !== cleaned) { messages.length = 0; messages.push(...fitted); }
    }
  } finally {
    interrupt.off("SIGINT", onSigint);
    rl.close();
  }
}
