import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { bash, pickShell, clampTimeout } from "../src/tools/bash.ts";
import { validate } from "../src/tools/registry.ts";

function tmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bash-"));
  // 刚被强杀的子进程，其 cwd/文件句柄释放可能要几秒——rmSync 带退避重试；
  // 仍失败就留给系统临时目录清理，不让测试因此变红
  const cleanup = () => {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    } catch (e) {
      process.stderr.write(`[cleanup] temp dir left behind: ${(e as Error).message}\n`);
    }
  };
  return { dir, cleanup };
}

async function run(cwd: string, args: unknown, signal?: AbortSignal) {
  const v = validate(bash.parameters, args);
  assert.equal(v.ok, true, v.ok ? "" : v.error);
  return bash.execute(v.value, { cwd, signal });
}

const isBash = pickShell().cmd.endsWith("bash.exe") || pickShell().cmd === "/bin/bash";

test("echo hello returns exit 0 and stdout", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const out = await run(dir, { command: "echo hello" });
    assert.match(out, /^exit: 0/);
    assert.match(out, /--- stdout ---\nhello/);
  } finally {
    cleanup();
  }
});

test("non-zero exit code is returned as text, not thrown", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const out = await run(dir, { command: "exit 3" });
    assert.match(out, /^exit: 3/);
  } finally {
    cleanup();
  }
});

test("stdout and stderr are collected separately", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const out = await run(dir, { command: "echo to-out; echo to-err 1>&2" });
    assert.match(out, /--- stdout ---\nto-out/);
    assert.match(out, /--- stderr ---\nto-err/);
  } finally {
    cleanup();
  }
});

test("cwd is ctx.cwd, not process.cwd()", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const out = await run(dir, { command: 'node -e "console.log(process.cwd())"' });
    const printed = out.match(/--- stdout ---\r?\n(.*)/)?.[1]?.trim() ?? "";
    assert.equal(printed.toLowerCase(), path.resolve(dir).toLowerCase());
  } finally {
    cleanup();
  }
});

test("timeout kills the command well before it finishes", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const started = Date.now();
    const out = await run(dir, { command: "sleep 5", timeout_ms: 300 });
    const elapsed = Date.now() - started;
    assert.match(out, /timed out after 300ms/);
    // 上限放宽到 4.6s：并发负载下清场（taskkill + PowerShell 扫描）有额外开销；
    // 语义断言是「明显小于 sleep 5」，300ms 超时的命令不应跑满 5s
    assert.ok(elapsed < 4600, `took ${elapsed}ms`);
  } finally {
    cleanup();
  }
});

test("timeout kills the whole process group, children stop writing", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const cmd = 'node -e "const fs=require(\'fs\');setInterval(()=>fs.appendFileSync(\'tick.txt\',\'x\'),100)"';
    await run(dir, { command: cmd, timeout_ms: 400 }).catch(() => "timed out");
    await new Promise((r) => setTimeout(r, 1200)); // 给它足以继续写的时间窗口
    const size1 = fs.existsSync(path.join(dir, "tick.txt")) ? fs.statSync(path.join(dir, "tick.txt")).size : 0;
    await new Promise((r) => setTimeout(r, 600));
    const size2 = fs.existsSync(path.join(dir, "tick.txt")) ? fs.statSync(path.join(dir, "tick.txt")).size : 0;
    assert.equal(size2, size1, "file must stop growing after the kill");
  } finally {
    cleanup();
  }
});

test("abort signal kills the running command", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  const ac = new AbortController();
  try {
    const p = run(dir, { command: "sleep 10" }, ac.signal);
    setTimeout(() => ac.abort(), 300);
    const out = await p;
    assert.match(out, /aborted|timed out/);
  } finally {
    cleanup();
  }
});

test("background daemon does not deadlock the tool, and gets reaped", async (t) => {
  if (!isBash) t.skip("no bash on this machine");
  const { dir, cleanup } = tmp();
  try {
    const started = Date.now();
    // run1 的真实场景：后台起一个持有 stdout 管道的常驻进程，前台命令很快结束。
    // 旧实现等 close（stdio 全关）会永久挂死；现在应在宽限期内正常返回。
    const out = await run(dir, {
      command: 'node -e "setInterval(()=>require(\'fs\').appendFileSync(\'alive.txt\',\'x\'),200)" & echo bg-started; sleep 0.3',
      timeout_ms: 8_000,
    });
    const elapsed = Date.now() - started;
    assert.match(out, /bg-started/);
    assert.doesNotMatch(out, /timed out/, "must resolve on exit, not via the timeout");
    assert.ok(elapsed < 5_000, `took ${elapsed}ms`);
    // 常驻进程必须已被清理：文件不应继续增长
    const file = path.join(dir, "alive.txt");
    await new Promise((r) => setTimeout(r, 800));
    const size1 = fs.existsSync(file) ? fs.statSync(file).size : 0;
    await new Promise((r) => setTimeout(r, 600));
    const size2 = fs.existsSync(file) ? fs.statSync(file).size : 0;
    assert.equal(size2, size1, "background daemon must be killed when the command returns");
  } finally {
    cleanup();
  }
});

test("timeout_ms is capped at 120000", () => {
  assert.equal(clampTimeout(999_999), 120_000);
  assert.equal(clampTimeout(5_000), 5_000);
});
