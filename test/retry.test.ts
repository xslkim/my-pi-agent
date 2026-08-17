import test from "node:test";
import assert from "node:assert/strict";
import type { Message } from "../src/types.ts";
import { withRetry } from "../src/retry.ts";
import { streamChat } from "../src/llm.ts";
import { startFakeLLM } from "./fake-llm.ts";

const httpError = (status: number, msg = `boom ${status}`): Error & { status: number } => {
  const e = new Error(msg) as Error & { status: number };
  e.status = status;
  return e;
};

test("succeeds on attempt 2 with exactly 2 calls", async () => {
  let calls = 0;
  const out = await withRetry(
    async () => {
      calls++;
      if (calls === 1) throw httpError(503);
      return "ok";
    },
    { baseMs: 1 },
  );
  assert.equal(out, "ok");
  assert.equal(calls, 2);
});

test("exhausts retries, throws the LAST error, calls = retries + 1", async () => {
  let calls = 0;
  let lastMsg = "";
  await assert.rejects(
    () =>
      withRetry(
        async (n) => {
          calls++;
          lastMsg = `fail-${n}`;
          throw new Error(lastMsg);
        },
        { retries: 3, baseMs: 1 },
      ),
    /fail-3/,
  );
  assert.equal(calls, 4);
});

test("HTTP 400 is never retried (1 call only)", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      withRetry(
        async () => {
          calls++;
          throw httpError(400);
        },
        { baseMs: 1 },
      ),
    /400/,
  );
  assert.equal(calls, 1);
});

test("HTTP 500 and 429 are retried", async () => {
  let calls = 0;
  const out = await withRetry(
    async () => {
      calls++;
      if (calls === 1) throw httpError(500);
      if (calls === 2) {
        const e = httpError(429) as Error & { status: number; retryAfterMs: number };
        e.retryAfterMs = 5;
        throw e;
      }
      return "fine";
    },
    { baseMs: 1 },
  );
  assert.equal(out, "fine");
  assert.equal(calls, 3);
});

test("AbortError is rethrown without retry", async () => {
  let calls = 0;
  const ac = new AbortController();
  await assert.rejects(
    () =>
      withRetry(
        async () => {
          calls++;
          const e = new Error("This operation was aborted");
          e.name = "AbortError";
          throw e;
        },
        { baseMs: 1, signal: ac.signal },
      ),
    /abort/i,
  );
  assert.equal(calls, 1);
});

test("pre-aborted signal fails fast without waiting through backoff", async () => {
  const ac = new AbortController();
  ac.abort();
  const started = Date.now();
  await assert.rejects(() =>
    withRetry(async () => {
      throw httpError(500);
    }, { baseMs: 10_000, signal: ac.signal }),
  );
  assert.ok(Date.now() - started < 1_000);
});

test("backoff grows exponentially (with jitter)", async () => {
  const times: number[] = [];
  let calls = 0;
  await assert.rejects(() =>
    withRetry(
      async () => {
        times.push(Date.now());
        calls++;
        throw httpError(500);
      },
      { retries: 2, baseMs: 40 },
    ),
  );
  assert.equal(calls, 3);
  const gap1 = times[1] - times[0];
  const gap2 = times[2] - times[1];
  // 窗口放宽：全量测试并发跑时定时器会抖，只锁下界和「递增」关系
  assert.ok(gap1 >= 25, `gap1 ${gap1}`);
  assert.ok(gap2 >= 50, `gap2 ${gap2}`);
  assert.ok(gap2 > gap1, `gap2 ${gap2} must exceed gap1 ${gap1}`);
});

test("streamChat integration: first request 500, second succeeds", async () => {
  const good =
    'data: {"choices":[{"delta":{"content":"recovered"}}]}\n\n' +
    'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n' +
    'data: [DONE]\n\n';
  const fake = await startFakeLLM([{ chunks: [], status: 500 }, { chunks: [good] }]);
  process.env.LLM_BASE_URL = fake.url;
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
  const messages: Message[] = [{ role: "user", content: "hi" }];
  try {
    let text = "";
    for await (const ev of streamChat({ messages })) {
      if (ev.type === "text") text += ev.delta;
    }
    assert.equal(text, "recovered");
    assert.equal(fake.requests.length, 2);
  } finally {
    await fake.close();
  }
});
