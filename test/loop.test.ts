import test from "node:test";
import assert from "node:assert/strict";
import type { Message } from "../src/types.ts";
import { runAgent, type AgentEvent } from "../src/loop.ts";
import { calculator } from "../src/tools/calculator.ts";
import type { Tool } from "../src/tools/registry.ts";
import { startFakeLLM } from "./fake-llm.ts";

// ---- 假模型脚本构造器 ----

const sse = (...events: unknown[]) =>
  events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n";

/** 一轮完整的 tool_calls 响应（含 finish_reason 和 usage 末块） */
const toolCallRound = (calls: { id: string; name: string; args: string }[]) =>
  sse(
    {
      choices: [
        {
          delta: {
            tool_calls: calls.map((c, i) => ({
              index: i,
              id: c.id,
              type: "function",
              function: { name: c.name, arguments: "" },
            })),
          },
        },
      ],
    },
    ...calls.map((c, i) => ({ choices: [{ delta: { tool_calls: [{ index: i, function: { arguments: c.args } }] } }] })),
    { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
    { choices: [], usage: { prompt_tokens: 1, completion_tokens: 1 } },
  );

const textRound = (s: string) =>
  sse(
    { choices: [{ delta: { content: s } }] },
    { choices: [{ delta: {}, finish_reason: "stop" }] },
    { choices: [], usage: { prompt_tokens: 1, completion_tokens: 1 } },
  );

/** 每轮响应文本 -> 一个 FakeScript；数组按请求次序消费 */
async function setup(rounds: string[]) {
  const fake = await startFakeLLM(rounds.map((r) => ({ chunks: [r] })));
  process.env.LLM_BASE_URL = fake.url;
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
  return fake;
}

async function run(messages: Message[], tools: Tool[], opts?: { maxSteps?: number; signal?: AbortSignal }) {
  const events: AgentEvent[] = [];
  for await (const ev of runAgent({ messages, tools, cwd: process.cwd(), ...opts })) events.push(ev);
  return events;
}

test("single tool, single round: model -> tool -> model, message order intact", async () => {
  const fake = await setup([
    toolCallRound([{ id: "c1", name: "calculator", args: '{"a":21,"b":2,"op":"*"}' }]),
    textRound("21 * 2 = 42"),
  ]);
  const messages: Message[] = [{ role: "user", content: "21*2" }];
  try {
    const events = await run(messages, [calculator]);
    assert.ok(events.some((e) => e.type === "tool_call" && e.name === "calculator"));
    const result = events.find((e) => e.type === "tool_result") as { result: string };
    assert.equal(result.result, "42");
    // 消息序列：user -> assistant(tool_calls) -> tool -> assistant(text)
    assert.deepEqual(
      messages.map((m) => m.role),
      ["user", "assistant", "tool", "assistant"],
    );
    assert.equal(messages[1].tool_calls?.[0].id, "c1");
    assert.equal(messages[2].tool_call_id, "c1");
    // 第二次请求原样携带 assistant + tool 消息
    const req2 = fake.requests[1] as { messages: Message[] };
    assert.equal(req2.messages[1].role, "assistant");
    assert.equal(req2.messages[2].role, "tool");
    assert.equal(req2.messages[2].tool_call_id, "c1");
  } finally {
    await fake.close();
  }
});

test("validation failure becomes an error message, loop continues", async () => {
  const fake = await setup([
    toolCallRound([{ id: "c1", name: "calculator", args: '{"a":21,"b":2}' }]), // 缺 op
    textRound("好的，我补上 op"),
  ]);
  const messages: Message[] = [{ role: "user", content: "算" }];
  try {
    const events = await run(messages, [calculator]);
    const result = events.find((e) => e.type === "tool_result") as { result: string };
    assert.match(result.result, /invalid arguments for calculator.*"op" is required/);
    assert.equal(messages.at(-1)?.role, "assistant"); // 循环继续并正常收尾
  } finally {
    await fake.close();
  }
});

test("tool exception is caught and returned as text", async () => {
  const fake = await setup([
    toolCallRound([{ id: "c1", name: "calculator", args: '{"a":1,"b":0,"op":"/"}' }]),
    textRound("除数为零"),
  ]);
  const messages: Message[] = [{ role: "user", content: "1/0" }];
  try {
    const events = await run(messages, [calculator]);
    const result = events.find((e) => e.type === "tool_result") as { result: string };
    assert.equal(result.result, "error: division by zero");
    assert.equal(messages[2].content, "error: division by zero");
  } finally {
    await fake.close();
  }
});

test("two parallel tool_calls both execute, ids map one-to-one", async () => {
  const fake = await setup([
    toolCallRound([
      { id: "c1", name: "calculator", args: '{"a":1,"b":2,"op":"+"}' },
      { id: "c2", name: "calculator", args: '{"a":10,"b":5,"op":"-"}' },
    ]),
    textRound("done"),
  ]);
  const messages: Message[] = [{ role: "user", content: "两道题" }];
  try {
    await run(messages, [calculator]);
    const toolMsgs = messages.filter((m) => m.role === "tool");
    assert.equal(toolMsgs.length, 2);
    assert.deepEqual(toolMsgs.map((m) => m.tool_call_id).sort(), ["c1", "c2"]);
    assert.deepEqual(toolMsgs.map((m) => m.content).sort(), ["3", "5"]);
  } finally {
    await fake.close();
  }
});

test("unknown tool produces error text, loop continues", async () => {
  const fake = await setup([
    toolCallRound([{ id: "c1", name: "nonexistent", args: "{}" }]),
    textRound("没有这个工具"),
  ]);
  try {
    const events = await run([{ role: "user", content: "x" }], [calculator]);
    const result = events.find((e) => e.type === "tool_result") as { result: string };
    assert.equal(result.result, "error: unknown tool: nonexistent");
  } finally {
    await fake.close();
  }
});

test("maxSteps: 2 stops the infinite tool_call loop with an error event", async () => {
  const fake = await setup([toolCallRound([{ id: "c1", name: "calculator", args: '{"a":1,"b":1,"op":"+"}' }])]);
  try {
    const events = await run([{ role: "user", content: "loop" }], [calculator], { maxSteps: 2 });
    const err = events.find((e) => e.type === "error") as { message: string };
    assert.equal(err.message, "max steps exceeded (2)");
    assert.equal(fake.requests.length, 2); // 恰好发起两次请求，没有第三次
  } finally {
    await fake.close();
  }
});

test("abort after first tool result: no second request", async () => {
  const fake = await setup([
    toolCallRound([{ id: "c1", name: "calculator", args: '{"a":1,"b":1,"op":"+"}' }]),
    textRound("不该被请求"),
  ]);
  const ac = new AbortController();
  const events: AgentEvent[] = [];
  try {
    for await (const ev of runAgent({
      messages: [{ role: "user", content: "x" }],
      tools: [calculator],
      cwd: process.cwd(),
      signal: ac.signal,
    })) {
      events.push(ev);
      if (ev.type === "tool_result") ac.abort();
    }
    assert.equal(fake.requests.length, 1);
    assert.equal(events.some((e) => e.type === "error"), false);
  } finally {
    await fake.close();
  }
});
