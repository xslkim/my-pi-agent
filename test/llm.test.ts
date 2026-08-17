import test from "node:test";
import assert from "node:assert/strict";
import type { StreamEvent } from "../src/types.ts";
import { streamChat } from "../src/llm.ts";
import { startFakeLLM, sliceBytes } from "./fake-llm.ts";

// 把若干 SSE 事件拼成一段完整文本
const sse = (...events: unknown[]) =>
  events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n";

const text = (s: string) => ({ choices: [{ delta: { content: s } }] });
const think = (s: string) => ({ choices: [{ delta: { reasoning_content: s } }] });

async function collect(gen: AsyncGenerator<StreamEvent>): Promise<StreamEvent[]> {
  const out: StreamEvent[] = [];
  for await (const ev of gen) out.push(ev);
  return out;
}

function setEnv(url: string) {
  process.env.LLM_BASE_URL = url;
  process.env.LLM_API_KEY = "test-key";
  process.env.LLM_MODEL = "test-model";
}

const messages = [{ role: "user" as const, content: "hi" }];

test("normal stream: three deltas assemble into full text", async () => {
  const fake = await startFakeLLM({ chunks: [sse(text("你"), text("好"), text("世界"))] });
  setEnv(fake.url);
  try {
    const events = await collect(streamChat({ messages }));
    const textEvents = events.filter((e) => e.type === "text");
    assert.equal(textEvents.map((e) => (e as { delta: string }).delta).join(""), "你好世界");
    assert.equal(events.at(-1)?.type, "done");
  } finally {
    await fake.close();
  }
});

test("event split across 2 and 3 chunks yields identical result", async () => {
  const whole = sse(text("a"), text("b"));
  for (const n of [5, 9]) {
    const fake = await startFakeLLM({ chunks: sliceBytes(whole, n) });
    setEnv(fake.url);
    try {
      const events = await collect(streamChat({ messages }));
      assert.equal(
        events.filter((e) => e.type === "text").map((e) => (e as { delta: string }).delta).join(""),
        "ab",
        `slice size ${n}`,
      );
    } finally {
      await fake.close();
    }
  }
});

test("UTF-8 multibyte char split mid-byte produces no mojibake", async () => {
  const whole = sse(text("你好世界")); // 每个汉字 3 字节，size=2/4 必然切进字符内部
  const fake = await startFakeLLM({ chunks: sliceBytes(whole, 2) });
  setEnv(fake.url);
  try {
    const events = await collect(streamChat({ messages }));
    assert.equal(
      events.filter((e) => e.type === "text").map((e) => (e as { delta: string }).delta).join(""),
      "你好世界",
    );
  } finally {
    await fake.close();
  }
});

test("reasoning_content yields thinking events, separate from text", async () => {
  const fake = await startFakeLLM({ chunks: [sse(think("想一想"), text("答案"))] });
  setEnv(fake.url);
  try {
    const events = await collect(streamChat({ messages }));
    const thinking = events.filter((e) => e.type === "thinking");
    const txt = events.filter((e) => e.type === "text");
    assert.equal(thinking.length, 1);
    assert.equal((thinking[0] as { delta: string }).delta, "想一想");
    assert.equal(txt.length, 1);
  } finally {
    await fake.close();
  }
});

test("usage arrives in a separate final chunk with empty choices", async () => {
  const script = [
    'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n',
    'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
    'data: {"choices":[],"usage":{"prompt_tokens":14,"completion_tokens":10}}\n\n',
    "data: [DONE]\n\n",
  ];
  const fake = await startFakeLLM({ chunks: script });
  setEnv(fake.url);
  try {
    const events = await collect(streamChat({ messages }));
    const done = events.at(-1)!;
    assert.equal(done.type, "done");
    assert.equal((done as { finishReason: string }).finishReason, "stop");
    assert.deepEqual((done as { usage?: unknown }).usage, {
      prompt_tokens: 14,
      completion_tokens: 10,
    });
  } finally {
    await fake.close();
  }
});

test("first delta with content:null produces no empty text event", async () => {
  const fake = await startFakeLLM({
    chunks: [sse({ choices: [{ delta: { role: "assistant", content: null } }] }, text("ok"))],
  });
  setEnv(fake.url);
  try {
    const events = await collect(streamChat({ messages }));
    assert.equal(events.filter((e) => e.type === "text").length, 1);
  } finally {
    await fake.close();
  }
});

test("stream ending without [DONE] still emits done", async () => {
  const fake = await startFakeLLM({
    chunks: [
      'data: {"choices":[{"delta":{"content":"x"}}]}\n\n',
      'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
    ],
  });
  setEnv(fake.url);
  try {
    const events = await collect(streamChat({ messages }));
    assert.equal(events.at(-1)?.type, "done");
  } finally {
    await fake.close();
  }
});

test("HTTP 500 throws with status and body", async () => {
  const fake = await startFakeLLM({ chunks: [], status: 500 });
  setEnv(fake.url);
  try {
    await assert.rejects(() => collect(streamChat({ messages })), /LLM 500[\s\S]*fake error/);
  } finally {
    await fake.close();
  }
});

test("abort() ends the generator", async () => {
  const long = sse(...Array.from({ length: 60 }, (_, i) => text(`块${i}`)));
  const fake = await startFakeLLM({ chunks: sliceBytes(long, 8) });
  setEnv(fake.url);
  const ac = new AbortController();
  const events: StreamEvent[] = [];
  try {
    await assert.rejects(async () => {
      for await (const ev of streamChat({ messages, signal: ac.signal })) {
        events.push(ev);
        if (events.length === 1) ac.abort();
      }
    }, /abort/i);
    assert.ok(events.length >= 1);
  } finally {
    await fake.close();
  }
});

test("missing env vars rejects with the variable name", async () => {
  const fake = await startFakeLLM({ chunks: [sse(text("x"))] });
  const saved = { ...process.env };
  delete process.env.LLM_BASE_URL;
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
  try {
    await assert.rejects(() => collect(streamChat({ messages })), /LLM_BASE_URL/);
  } finally {
    process.env.LLM_BASE_URL = saved.LLM_BASE_URL;
    await fake.close();
  }
});
