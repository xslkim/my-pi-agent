import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startFakeLLM } from "./fake-llm.ts";

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

test("--cwd reaches the tools: bash pwd reports the given directory", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "clicwd-"));
  const sse = (...events: unknown[]) =>
    events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n";
  const fake = await startFakeLLM([
    {
      chunks: [
        sse(
          { choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", type: "function", function: { name: "bash", arguments: "" } }] } }] },
          { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{"command":"node -e \\"console.log(process.cwd())\\""}' } }] } }] },
          { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
          { choices: [], usage: { prompt_tokens: 1, completion_tokens: 1 } },
        ),
      ],
    },
    { chunks: [sse({ choices: [{ delta: { content: "done" } }] }, { choices: [{ delta: {}, finish_reason: "stop" }] })] },
  ]);
  try {
    // 环境探测：某些沙箱不允许「子进程 -> 127.0.0.1 回环」（进程内访问不受影响）。
    // 探不通就 skip——这是环境限制，不是代码缺陷；其它机器上该用例照常生效。
    const probe = spawnSync(
      process.execPath,
      ["-e", `fetch("${fake.url}/models").then(()=>process.exit(0)).catch(()=>process.exit(1))`],
      { encoding: "utf8", timeout: 4000 },
    );
    if (probe.status !== 0) {
      t.skip("child processes cannot reach 127.0.0.1 in this environment");
      return;
    }
    const r = spawnSync(
      process.execPath,
      ["src/cli.ts", "跑一下", "--cwd", dir],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          LLM_BASE_URL: fake.url,
          LLM_API_KEY: "k",
          LLM_MODEL: "m",
        },
      },
    );
    assert.equal(r.status, 0, r.stderr);
    const req2 = fake.requests[1] as { messages: { role: string; content: string }[] };
    const toolMsg = req2.messages.find((m) => m.role === "tool");
    assert.ok(toolMsg, "second request must carry the tool result");
    assert.equal(
      toolMsg.content.match(/--- stdout ---\r?\n(.*)/)?.[1]?.trim().toLowerCase(),
      path.resolve(dir).toLowerCase(),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    await fake.close();
  }
});

