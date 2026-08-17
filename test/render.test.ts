import test from "node:test";
import assert from "node:assert/strict";
import { renderEvent, renderAgentEvent } from "../src/render.ts";
import { startFakeLLM } from "./fake-llm.ts";
import { streamChat } from "../src/llm.ts";

function collector() {
  let text = "";
  return { out: { write: (s: string) => (text += s) }, get: () => text };
}

test("text events are written verbatim, unbuffered", () => {
  const c = collector();
  renderEvent({ type: "text", delta: "你" }, c.out);
  renderEvent({ type: "text", delta: "好" }, c.out);
  assert.equal(c.get(), "你好");
});

test("thinking gets a one-time prefix, closes on the next non-thinking event", () => {
  const c = collector();
  renderEvent({ type: "thinking", delta: "想" }, c.out);
  renderEvent({ type: "thinking", delta: "一想" }, c.out);
  renderEvent({ type: "text", delta: "答" }, c.out);
  const out = c.get();
  assert.ok(out.includes("思考中…"));
  assert.equal(out.indexOf("思考中…"), out.lastIndexOf("思考中…")); // 前缀只出现一次
  assert.ok(out.includes("\x1b[2m")); // 暗色包裹
  assert.ok(out.includes("\x1b[0m\n")); // 结束后换行
});

test("done prints newline and, with usage, a token line", () => {
  const c = collector();
  renderEvent({ type: "done", finishReason: "stop" }, c.out);
  assert.equal(c.get(), "\n");

  const c2 = collector();
  renderEvent(
    { type: "done", finishReason: "stop", usage: { prompt_tokens: 14, completion_tokens: 10 } },
    c2.out,
  );
  assert.ok(c2.get().includes("[tokens: in=14 out=10]"));
});

test("renderEvent consumes a full fake stream end to end", async () => {
  const fake = await startFakeLLM({
    chunks: [
      'data: {"choices":[{"delta":{"reasoning_content":"思考"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"回答"}}]}\n\n',
      'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
      'data: {"choices":[],"usage":{"prompt_tokens":5,"completion_tokens":3}}\n\n',
      "data: [DONE]\n\n",
    ],
  });
  process.env.LLM_BASE_URL = fake.url;
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
  try {
    const c = collector();
    for await (const ev of streamChat({ messages: [{ role: "user", content: "hi" }] })) {
      renderEvent(ev, c.out);
    }
    const out = c.get();
    assert.ok(out.includes("思考中…思考"));
    assert.ok(out.includes("回答"));
    assert.ok(out.includes("[tokens: in=5 out=3]"));
  } finally {
    await fake.close();
  }
});

test("tool_call / tool_result / error render visibly", () => {
  const c = collector();
  renderAgentEvent({ type: "tool_call", name: "calculator", args: { op: "*", a: 21, b: 2 } }, c.out);
  renderAgentEvent({ type: "tool_result", id: "c1", name: "calculator", result: "42", ms: 3 }, c.out);
  renderAgentEvent({ type: "error", message: "max steps exceeded (2)" }, c.out);
  const out = c.get();
  assert.ok(out.includes("→ calculator("));
  assert.ok(out.includes('"op":"*"'));
  assert.ok(out.includes("← 42 (3ms)"));
  assert.ok(out.includes("max steps exceeded"));
});

test("tool result over 200 chars is truncated with ellipsis", () => {
  const c = collector();
  renderAgentEvent(
    { type: "tool_result", id: "c1", name: "read", result: "x".repeat(500), ms: 1 },
    c.out,
  );
  const out = c.get();
  assert.ok(out.includes("…"));
  assert.ok(out.length < 300);
});
