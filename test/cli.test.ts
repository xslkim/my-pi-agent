import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("cli without prompt prints usage and exits 1", () => {
  const r = spawnSync(process.execPath, ["src/cli.ts"], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /usage/);
});

test("cli with missing env exits 1 and names the variable", () => {
  const env = { ...process.env };
  delete env.LLM_BASE_URL;
  delete env.LLM_API_KEY;
  delete env.LLM_MODEL;
  const r = spawnSync(process.execPath, ["src/cli.ts", "hi"], { encoding: "utf8", env });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /LLM_BASE_URL/);
  assert.doesNotMatch(r.stderr, /at /); // 不打印堆栈
});
