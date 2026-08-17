import test from "node:test";
import assert from "node:assert/strict";
import { startFakeLLM, sliceBytes } from "./fake-llm.ts";

test("fake server responds 200 with text/event-stream", async () => {
  const fake = await startFakeLLM({ chunks: ['data: {"ok":1}\n\n'] });
  try {
    const res = await fetch(`${fake.url}/chat/completions`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "text/event-stream");
    assert.equal(await res.text(), 'data: {"ok":1}\n\n');
  } finally {
    await fake.close();
  }
});

test("three chunks arrive complete and in order", async () => {
  const parts = ["data: a\n\n", "data: b\n\n", "data: c\n\n"];
  const fake = await startFakeLLM({ chunks: parts });
  try {
    const text = await (await fetch(`${fake.url}/chat/completions`)).text();
    assert.equal(text, parts.join(""));
  } finally {
    await fake.close();
  }
});

test("captures parsed request bodies for assertions", async () => {
  const fake = await startFakeLLM({ chunks: ["data: [DONE]\n\n"] });
  try {
    await fetch(`${fake.url}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "x", tools: [{ type: "function" }] }),
    });
    assert.equal(fake.requests.length, 1);
    const body = fake.requests[0] as { model: string; tools: unknown[] };
    assert.equal(body.model, "x");
    assert.equal(body.tools.length, 1);
  } finally {
    await fake.close();
  }
});

test("status 500 returns error JSON", async () => {
  const fake = await startFakeLLM({ chunks: [], status: 500 });
  try {
    const res = await fetch(`${fake.url}/chat/completions`);
    assert.equal(res.status, 500);
    assert.match(await res.text(), /fake error/);
  } finally {
    await fake.close();
  }
});

test("script queue: each request gets the next script, last one repeats", async () => {
  const fake = await startFakeLLM([
    { chunks: ["data: first\n\n"] },
    { chunks: ["data: second\n\n"] },
  ]);
  try {
    const one = await (await fetch(`${fake.url}/x`)).text();
    const two = await (await fetch(`${fake.url}/x`)).text();
    const three = await (await fetch(`${fake.url}/x`)).text();
    assert.equal(one, "data: first\n\n");
    assert.equal(two, "data: second\n\n");
    assert.equal(three, "data: second\n\n"); // 耗尽后重复最后一个
  } finally {
    await fake.close();
  }
});

test("close() releases the port", async () => {
  const fake = await startFakeLLM({ chunks: ["data: x\n\n"] });
  await fake.close();
  await assert.rejects(() => fetch(`${fake.url}/chat/completions`));
});

test("sliceBytes splits mid-character and reassembles to identical bytes", () => {
  const sse = 'data: {"choices":[{"delta":{"content":"你好世界"}}]}\n\ndata: [DONE]\n\n';
  for (const size of [1, 2, 3, 7]) {
    const parts = sliceBytes(sse, size);
    assert.ok(parts.length > 1);
    const reassembled = Buffer.from(parts.join(""), "latin1").toString("utf8");
    assert.equal(reassembled, sse, `size=${size}`);
  }
});
