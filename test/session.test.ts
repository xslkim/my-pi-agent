import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { appendMessage, loadSession, sessionFile } from "../src/session.ts";
import type { Message } from "../src/types.ts";

function tmpFile() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sess-"));
  return { file: path.join(dir, "a", "b", "s.jsonl"), cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

test("three appended messages load back in order", () => {
  const { file, cleanup } = tmpFile();
  try {
    const msgs: Message[] = [
      { role: "user", content: "一" },
      { role: "assistant", content: "二" },
      { role: "user", content: "三" },
    ];
    for (const m of msgs) appendMessage(file, m);
    assert.deepEqual(loadSession(file).map((m) => m.content), ["一", "二", "三"]);
  } finally {
    cleanup();
  }
});

test("newlines, quotes and Chinese survive the round trip", () => {
  const { file, cleanup } = tmpFile();
  try {
    const tricky = '含"引号"\n换行\t制表 中文 emoji 🎉';
    appendMessage(file, { role: "user", content: tricky });
    assert.equal(loadSession(file)[0].content, tricky);
  } finally {
    cleanup();
  }
});

test("half-written last line is skipped, earlier messages survive", () => {
  const { file, cleanup } = tmpFile();
  try {
    appendMessage(file, { role: "user", content: "ok1" });
    appendMessage(file, { role: "assistant", content: "ok2" });
    fs.appendFileSync(file, '{"role":"user","content":"bro'); // 模拟崩溃留下的半行
    assert.deepEqual(loadSession(file).map((m) => m.content), ["ok1", "ok2"]);
  } finally {
    cleanup();
  }
});

test("missing file returns []", () => {
  assert.deepEqual(loadSession(path.join(os.tmpdir(), "definitely-missing-9x.jsonl")), []);
});

test("appendMessage creates parent directories", () => {
  const { file, cleanup } = tmpFile();
  try {
    assert.equal(fs.existsSync(path.dirname(file)), false);
    appendMessage(file, { role: "user", content: "x" });
    assert.equal(fs.existsSync(file), true);
  } finally {
    cleanup();
  }
});

test("tool_calls structure survives the round trip", () => {
  const { file, cleanup } = tmpFile();
  try {
    const m: Message = {
      role: "assistant",
      content: "",
      tool_calls: [{ id: "c1", name: "read", arguments: '{"path":"a.ts"}' }],
    };
    appendMessage(file, m);
    appendMessage(file, { role: "tool", tool_call_id: "c1", content: "内容" });
    const back = loadSession(file);
    assert.deepEqual(back[0].tool_calls, m.tool_calls);
    assert.equal(back[1].tool_call_id, "c1");
  } finally {
    cleanup();
  }
});

test("sessionFile maps name (no extension) to .agent/sessions/<name>.jsonl", () => {
  assert.equal(sessionFile("l5-run1"), path.join(".agent", "sessions", "l5-run1.jsonl"));
});
