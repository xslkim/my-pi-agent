import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveInside, truncate, withTimeout } from "../src/tools/guard.ts";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "guard-"));
}

test("resolveInside: relative path resolves inside cwd", () => {
  const dir = tmp();
  try {
    const abs = resolveInside(dir, "a/b.txt");
    assert.equal(abs, path.resolve(dir, "a/b.txt"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects ../ escape, hidden ../../ escape, and absolute paths outside", () => {
  const dir = tmp();
  try {
    assert.throws(() => resolveInside(dir, "../etc/passwd"), /path escapes workspace/);
    assert.throws(() => resolveInside(dir, "a/../../x"), /path escapes workspace/);
    assert.throws(() => resolveInside(dir, path.resolve(dir, "..", "x")), /path escapes workspace/);
    // 错误信息保留原始输入
    assert.throws(() => resolveInside(dir, "../etc/passwd"), /\.\.\/etc\/passwd/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("similar-prefix sibling directory is not confused with cwd (/work vs /work-evil)", () => {
  const parent = tmp();
  const work = path.join(parent, "work");
  const evil = path.join(parent, "work-evil");
  fs.mkdirSync(work);
  fs.mkdirSync(evil);
  try {
    assert.throws(() => resolveInside(work, path.join(evil, "x")), /path escapes workspace/);
    assert.equal(resolveInside(work, "x"), path.join(work, "x"));
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test("symlink pointing outside the workspace is rejected", (t) => {
  const parent = tmp();
  const work = path.join(parent, "work");
  const outside = path.join(parent, "outside");
  fs.mkdirSync(work);
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, "secret.txt"), "s");
  try {
    fs.symlinkSync(outside, path.join(work, "link"), "dir");
  } catch (e) {
    t.skip(`no permission to create symlink on this machine: ${(e as Error).message}`);
    fs.rmSync(parent, { recursive: true, force: true });
    return;
  }
  try {
    assert.throws(() => resolveInside(work, "link/secret.txt"), /path escapes workspace/);
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test("truncate: over maxLines keeps head and announces it", () => {
  const input = Array.from({ length: 1000 }, (_, i) => `line ${i}`).join("\n");
  const out = truncate(input);
  assert.ok(out.startsWith("line 0\nline 1"));
  assert.match(out, /\[truncated: showing first 200 of 1000 lines\]/);
});

test("truncate: over maxBytes cuts a huge single line", () => {
  const input = "x".repeat(50_000);
  const out = truncate(input, 200, 20_000);
  assert.ok(out.length < 21_000);
  assert.match(out, /\[truncated: showing first \d+ of 1 lines\]/);
});

test("truncate: within limits returns input unchanged", () => {
  const input = "short\nfile";
  assert.equal(truncate(input), input);
});

test("withTimeout: rejects on timeout and calls onTimeout first", async () => {
  let cleaned = false;
  await assert.rejects(
    () => withTimeout(new Promise(() => {}), 20, () => (cleaned = true)), // eslint-disable-line @typescript-eslint/no-empty-function
    /timed out after 20ms/,
  );
  assert.equal(cleaned, true);
});

test("withTimeout: resolves normally when the promise wins the race", async () => {
  const v = await withTimeout(Promise.resolve(7), 1000);
  assert.equal(v, 7);
  const rej = await withTimeout(Promise.reject(new Error("boom")), 1000).then(
    () => "resolved",
    (e: Error) => e.message,
  );
  assert.equal(rej, "boom"); // 原始错误透传
});
