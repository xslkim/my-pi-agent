import test from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startRepl } from "../src/repl.ts";
import { calculator } from "../src/tools/calculator.ts";
import { loadSession } from "../src/session.ts";
import { startFakeLLM, sliceBytes } from "./fake-llm.ts";

const sse = (...events: unknown[]) =>
  events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n";
const textRound = (s: string) =>
  sse(
    { choices: [{ delta: { content: s } }] },
    { choices: [{ delta: {}, finish_reason: "stop" }] },
    { choices: [], usage: { prompt_tokens: 1, completion_tokens: 1 } },
  );

async function waitFor(pred: () => boolean, ms = 5000): Promise<void> {
  const start = Date.now();
  while (!pred()) {
    if (Date.now() - start > ms) throw new Error("waitFor timeout");
    await new Promise((r) => setTimeout(r, 20));
  }
}

/** 起一个 REPL：返回可写的 stdin、累计的 stdout、SIGINT 模拟器和收尾函数 */
async function makeRepl(fakeUrl: string, extra?: { sessionFile?: string }) {
  process.env.LLM_BASE_URL = fakeUrl;
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
  const input = new PassThrough();
  const output = new PassThrough();
  const chunks: Buffer[] = [];
  output.on("data", (c: Buffer) => chunks.push(c));
  const textSoFar = () => Buffer.concat(chunks).toString();
  const interrupt = new EventEmitter();
  const done = startRepl({
    cwd: process.cwd(),
    tools: [calculator],
    input,
    output,
    interrupt,
    ...extra,
  });
  return { input, output, textSoFar, interrupt, done };
}

test("two turns: second request carries the first turn's exchange", async () => {
  const fake = await startFakeLLM([{ chunks: [textRound("回答一")] }, { chunks: [textRound("回答二")] }]);
  const { input, textSoFar, done } = await makeRepl(fake.url);
  try {
    input.write("第一问\n");
    await waitFor(() => fake.requests.length >= 1);
    // 生成中就把下一句敲进去——行队列必须保住它，而不是丢掉
    input.write("第二问\n");
    await waitFor(() => fake.requests.length >= 2);
    const req2 = fake.requests[1] as { messages: { role: string; content: string }[] };
    assert.equal(req2.messages[0].role, "system");
    assert.ok(req2.messages.some((m) => m.role === "user" && m.content === "第一问"));
    assert.ok(req2.messages.some((m) => m.role === "assistant" && m.content === "回答一"));
    input.write("/exit\n");
    await done;
    assert.ok(textSoFar().includes("回答二"));
  } finally {
    await fake.close();
  }
});

test("/clear keeps only the system message", async () => {
  const fake = await startFakeLLM([{ chunks: [textRound("好")] }, { chunks: [textRound("好")] }]);
  const { input, done } = await makeRepl(fake.url);
  try {
    input.write("问题\n");
    await waitFor(() => fake.requests.length >= 1);
    input.write("/clear\n");
    input.write("新问题\n");
    await waitFor(() => fake.requests.length >= 2);
    const req2 = fake.requests[1] as { messages: { role: string; content: string }[] };
    assert.equal(req2.messages.filter((m) => m.role !== "system").length, 1); // 只剩本轮 user
    input.write("/exit\n");
    await done;
  } finally {
    await fake.close();
  }
});

test("unknown slash command is answered locally, never sent to the model", async () => {
  const fake = await startFakeLLM([{ chunks: [textRound("x")] }]);
  const { input, textSoFar, done } = await makeRepl(fake.url);
  try {
    input.write("/whatever\n");
    await waitFor(() => textSoFar().includes("unknown command"));
    input.write("/exit\n");
    await done;
    assert.equal(fake.requests.length, 0);
  } finally {
    await fake.close();
  }
});

test("abort mid-generation stores partial assistant message, REPL continues", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repl-"));
  const sessionFile = path.join(dir, "s.jsonl");
  // 200 个独立 SSE 事件、每个单独 write、间隔 10ms——流足够慢，abort 一定落在中途
  const perEvent = Array.from(
    { length: 200 },
    (_, i) => `data: ${JSON.stringify({ choices: [{ delta: { content: `字${i}` } }] })}\n\n`,
  );
  perEvent.push("data: [DONE]\n\n");
  const fake = await startFakeLLM([{ chunks: perEvent, delayMs: 10 }]);
  const { input, textSoFar, interrupt, done } = await makeRepl(fake.url, { sessionFile });
  try {
    input.write("讲个长故事\n");
    await waitFor(() => textSoFar().includes("字"));
    interrupt.emit("SIGINT");
    await waitFor(() => textSoFar().includes("[aborted]"));
    // REPL 仍活着：/exit 能被处理（说明已回到取行状态），进程正常收尾
    input.write("/exit\n");
    await done;
    const stored = loadSession(sessionFile);
    assert.deepEqual(stored.map((m) => m.role), ["system", "user", "assistant"]);
    assert.ok(stored[2].content.includes("[aborted]"));
    assert.ok(stored[2].content.includes("字"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    await fake.close();
  }
});

test("messages hit the session file as they are produced", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repl-"));
  const sessionFile = path.join(dir, "s.jsonl");
  const fake = await startFakeLLM([{ chunks: [textRound("答")] }, { chunks: [textRound("答")] }]);
  const { input, done } = await makeRepl(fake.url, { sessionFile });
  try {
    input.write("问\n");
    await waitFor(() => loadSession(sessionFile).length >= 2); // user + assistant 立即可读
    input.write("/exit\n");
    await done;
    const roles = loadSession(sessionFile).map((m) => m.role);
    assert.deepEqual(roles, ["system", "user", "assistant"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    await fake.close();
  }
});

test("15 consecutive turns leave no listener leak", async () => {
  const fake = await startFakeLLM([{ chunks: [textRound("嗯")] }]);
  const { input, interrupt, done } = await makeRepl(fake.url);
  try {
    for (let i = 0; i < 15; i++) {
      input.write(`第${i}问\n`);
      await waitFor(() => fake.requests.length >= i + 1);
      assert.equal(interrupt.listenerCount("SIGINT"), 1); // 始终只有一个，不随轮次增长
    }
    input.write("/exit\n");
    await done;
  } finally {
    await fake.close();
  }
});
