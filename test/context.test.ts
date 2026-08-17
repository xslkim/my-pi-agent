import test from "node:test";
import assert from "node:assert/strict";
import { estimateTokens, fitContext } from "../src/context.ts";
import type { Message } from "../src/types.ts";

// spec 04 的实测样本：中文散文 97 字 = 56 token；TS 代码 249 字符 = 68 token
// 用程序化补齐保证精确长度，断言才有依据。
function exactLen(base: string, target: number, pad: string): string {
  assert.ok(base.length <= target, "base fits");
  return base + pad.repeat(Math.ceil((target - base.length) / pad.length)).slice(0, target - base.length);
}
const chinese97 = exactLen("这是一段用来校准分词系数的中文散文样本，后续换模型时可用同样方法重新量一次系数。", 97, "汉字样本");
const code249 = exactLen(
  "export function greet(name: string): string {\n  return `hello, ${name}`.toUpperCase();\n}\n",
  249,
  "// padding line for calibration sample 0123456789 ",
);

test("estimateTokens: calibration samples from spec 04", () => {
  assert.equal(chinese97.length, 97, "fixture must be exactly 97 chars");
  const zh = estimateTokens(chinese97);
  assert.ok(zh >= 56, `chinese estimate ${zh} must cover measured 56`);
  assert.ok(zh <= 56 * 1.5, `chinese estimate ${zh} too high (over-trimming)`);

  assert.equal(code249.length, 249, "fixture must be exactly 249 chars");
  const code = estimateTokens(code249);
  assert.ok(code >= 68 && code <= 68 * 1.5, `code estimate ${code} within [68, 102]`);
});

test("fitContext: within budget returns messages unchanged", () => {
  const messages: Message[] = [
    { role: "system", content: "sys" },
    { role: "user", content: "hi" },
    { role: "assistant", content: "hello" },
  ];
  assert.equal(fitContext(messages, 10_000), messages); // 同一引用，未动
});

function bigTurn(i: number, toolRound = false): Message[] {
  const msgs: Message[] = [{ role: "user", content: `第${i}轮 ` + "很长的中文内容".repeat(200) }];
  if (toolRound) {
    msgs.push(
      { role: "assistant", content: "", tool_calls: [
        { id: `t${i}a`, name: "read", arguments: '{"path":"a.ts"}' },
        { id: `t${i}b`, name: "read", arguments: '{"path":"b.ts"}' },
      ] },
      { role: "tool", tool_call_id: `t${i}a`, content: "内容甲".repeat(300) },
      { role: "tool", tool_call_id: `t${i}b`, content: "内容乙".repeat(300) },
    );
  }
  msgs.push({ role: "assistant", content: `回答${i}` });
  return msgs;
}

test("fitContext: drops oldest turns first, keeps system at head, inserts marker", () => {
  const messages: Message[] = [
    { role: "system", content: "system prompt" },
    ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap((i) => bigTurn(i)),
  ];
  const out = fitContext(messages, 6_000);
  assert.equal(out[0].role, "system");
  assert.equal(out[0].content, "system prompt");
  assert.ok(out.some((m) => m.role === "system" && m.content.includes("trimmed")), "marker inserted");
  assert.ok(out.some((m) => m.role === "user" && m.content.startsWith("第8轮")), "newest turn kept");
  assert.ok(!out.some((m) => m.role === "user" && m.content.startsWith("第1轮")), "oldest dropped");
  // 每轮 1400+ token，6000 预算保不住 4 轮，但至少留 1 轮
  const userTurns = out.filter((m) => m.role === "user");
  assert.ok(userTurns.length >= 1 && userTurns.length < 8);
});

test("fitContext: tool groups stay atomic — no orphan tool, no unanswered assistant", () => {
  const messages: Message[] = [
    { role: "system", content: "sys" },
    ...bigTurn(1, true), // 含 assistant(tool_calls x2) + tool x2
    ...[2, 3, 4, 5, 6, 7].flatMap((i) => bigTurn(i)),
  ];
  const out = fitContext(messages, 6_000);
  // 重构校验：每个 tool_call_id 都有对应 assistant.tool_calls；反之亦然
  const callIds = new Set<string>();
  for (const m of out) if (m.role === "assistant") for (const c of m.tool_calls ?? []) callIds.add(c.id);
  const resultIds = new Set<string>();
  for (const m of out) if (m.role === "tool") resultIds.add(m.tool_call_id!);
  assert.deepEqual([...resultIds].sort(), [...callIds].filter((id) => resultIds.has(id)).sort());
  for (const id of callIds) assert.ok(resultIds.has(id), `call ${id} has no tool result`);
  for (const id of resultIds) assert.ok(callIds.has(id), `tool result ${id} has no parent call`);
  assert.notEqual(out[1]?.role, "tool", "first non-system message must not be an orphan tool");
});

test("fitContext: the newest user message is a hard floor even if oversized", () => {
  const messages: Message[] = [
    { role: "system", content: "sys" },
    ...[1, 2, 3, 4, 5].flatMap((i) => bigTurn(i)),
  ];
  const out = fitContext(messages, 50); // 远小于任何一轮
  assert.equal(out[0].role, "system");
  assert.ok(out.some((m) => m.role === "user" && m.content.startsWith("第5轮")), "latest user survives");
  assert.ok(out.length > 2, "not silently emptied");
});
