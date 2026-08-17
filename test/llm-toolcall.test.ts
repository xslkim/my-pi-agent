import test from "node:test";
import assert from "node:assert/strict";
import type { StreamEvent } from "../src/types.ts";
import { streamChat } from "../src/llm.ts";
import { toApiTools } from "../src/tools/registry.ts";
import { calculator } from "../src/tools/calculator.ts";
import { startFakeLLM } from "./fake-llm.ts";

const sse = (...events: unknown[]) =>
  events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");

async function collect(gen: AsyncGenerator<StreamEvent>): Promise<StreamEvent[]> {
  const out: StreamEvent[] = [];
  for await (const ev of gen) out.push(ev);
  return out;
}

function setup(fake: { url: string }) {
  process.env.LLM_BASE_URL = fake.url;
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
}

const messages = [{ role: "user" as const, content: "21*2" }];

test("per-character argument fragments reassemble into complete JSON", async () => {
  const fullArgs = '{"op":"*","a":21,"b":2}';
  // 第一片带 id/name 和第一个字符 "{"，其余按单字符碎片发——比真实服务切得更碎
  const events: unknown[] = [
    { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_abc", type: "function", function: { name: "calculator", arguments: "{" } }] } }] },
    ...[...fullArgs.slice(1)].map((ch) => ({
      choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: ch } }] } }],
    })),
    { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
    { choices: [], usage: { prompt_tokens: 9, completion_tokens: 8 } },
  ];
  const fake = await startFakeLLM({ chunks: [sse(...events), "data: [DONE]\n\n"] });
  setup(fake);
  try {
    const out = await collect(streamChat({ messages }));
    const deltas = out.filter((e) => e.type === "tool_call_delta") as Extract<StreamEvent, { type: "tool_call_delta" }>[];
    const first = deltas[0];
    assert.equal(first.id, "call_abc");
    assert.equal(first.name, "calculator");
    assert.equal(deltas.slice(1).every((d) => d.id === undefined && d.name === undefined), true);
    const joined = deltas.map((d) => d.argsDelta ?? "").join("");
    assert.equal(joined, fullArgs);
    assert.deepEqual(JSON.parse(joined), { op: "*", a: 21, b: 2 }); // 拼完确实是合法 JSON
  } finally {
    await fake.close();
  }
});

test("two parallel tool_calls separate by index", async () => {
  const events: unknown[] = [
    { choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "calculator", arguments: '{"a":' } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 1, id: "c2", function: { name: "calculator", arguments: '{"a":' } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: "1}" } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: "2}" } }] } }] },
    { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
  ];
  const fake = await startFakeLLM({ chunks: [sse(...events), "data: [DONE]\n\n"] });
  setup(fake);
  try {
    const out = await collect(streamChat({ messages }));
    const deltas = out.filter((e) => e.type === "tool_call_delta") as Extract<StreamEvent, { type: "tool_call_delta" }>[];
    const byIndex = new Map<number, string>();
    for (const d of deltas) byIndex.set(d.index, (byIndex.get(d.index) ?? "") + (d.argsDelta ?? ""));
    assert.equal(byIndex.get(0), '{"a":1}');
    assert.equal(byIndex.get(1), '{"a":2}');
  } finally {
    await fake.close();
  }
});

test("finish_reason tool_calls reaches the done event; tools go into the request body", async () => {
  const fake = await startFakeLLM({
    chunks: [
      sse(
        { choices: [{ delta: { tool_calls: [{ index: 0, id: "c", function: { name: "calculator", arguments: "{}" } }] } }] },
        { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
        { choices: [], usage: { prompt_tokens: 1, completion_tokens: 1 } },
      ),
      "data: [DONE]\n\n",
    ],
  });
  setup(fake);
  try {
    const out = await collect(streamChat({ messages, tools: toApiTools([calculator]) as never }));
    const done = out.at(-1)!;
    assert.equal(done.type, "done");
    assert.equal((done as { finishReason: string }).finishReason, "tool_calls");
    const req = fake.requests[0] as { tools?: { function: { name: string } }[] };
    assert.equal(req.tools?.[0].function.name, "calculator");
  } finally {
    await fake.close();
  }
});
