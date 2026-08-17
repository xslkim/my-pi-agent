// 锁定的验收考卷——T20 建立后只读，任何改动都会被 verify-lock.ts 发现。
// 黑盒验证：打真实 HTTP，不 import 被测代码，避免实现细节渗进考卷。
import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const APP_DIR = path.resolve("demo/login-app");
const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;
const DB = path.join(APP_DIR, "data.db");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function killTree(pid: number | undefined): void {
  if (pid === undefined) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true });
  } else {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

test("login-app locked acceptance (10 assertions)", async (t) => {
  if (!fs.existsSync(APP_DIR)) {
    throw new Error(`demo/login-app does not exist yet — the agent has not built the app. This acceptance suite is meant to run after T21/T24.`);
  }
  // 显式 cwd：不设的话 server 用相对路径建的 data.db 会落在仓库根
  const child = spawn(process.execPath, ["server.ts"], {
    cwd: APP_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
  });
  let childErr = "";
  child.stderr?.on("data", (d: Buffer) => (childErr += d.toString("utf8")));
  child.on("error", (e) => (childErr += String(e)));
  t.after(() => {
    killTree(child.pid);
    if (fs.existsSync(DB)) fs.rmSync(DB); // 清理，下一轮从同一状态开始
  });

  // 轮询等端口就绪（最多 10s），不用固定 sleep
  const deadline = Date.now() + 10_000;
  for (;;) {
    if (child.exitCode !== null) {
      throw new Error(`login-app server exited early (code ${child.exitCode}). Is demo/login-app implemented? stderr: ${childErr.slice(0, 300)}`);
    }
    try {
      const r = await fetch(`${BASE}/`);
      if (r.status > 0) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      throw new Error(`cannot reach login-app server at ${BASE} within 10s — has demo/login-app been implemented? stderr: ${childErr.slice(0, 300)}`);
    }
    await sleep(200);
  }

  const post = (p: string, body: unknown, cookie?: string) =>
    fetch(`${BASE}${p}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
  const me = (cookie?: string) =>
    fetch(`${BASE}/api/me`, { headers: cookie ? { cookie } : {} });

  // 1. 注册新用户 -> 201
  let r = await post("/api/register", { username: "alice", password: "pw123456" });
  assert.equal(r.status, 201, `register should be 201, got ${r.status}`);
  // 2. 重复注册 -> 409
  r = await post("/api/register", { username: "alice", password: "other" });
  assert.equal(r.status, 409, `duplicate register should be 409, got ${r.status}`);
  // 3. 错密码 -> 401 且不下发 cookie
  r = await post("/api/login", { username: "alice", password: "wrong" });
  assert.equal(r.status, 401, `wrong password should be 401, got ${r.status}`);
  assert.equal(r.headers.getSetCookie().length, 0, "wrong password must not set a cookie");
  // 4. 正确密码 -> 200，HttpOnly + SameSite=Strict
  r = await post("/api/login", { username: "alice", password: "pw123456" });
  assert.equal(r.status, 200, `login should be 200, got ${r.status}`);
  const setCookie = r.headers.getSetCookie().join("; ");
  assert.match(setCookie, /HttpOnly/i, "cookie must be HttpOnly");
  assert.match(setCookie, /SameSite=Strict/i, "cookie must be SameSite=Strict");
  const sid = setCookie.match(/sid=([^;]+)/)?.[1];
  assert.ok(sid, "cookie name must be sid");
  // 5. 带 cookie 访问 /api/me -> 200 + 用户名
  r = await me(`sid=${sid}`);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).username, "alice");
  // 6. 不带 cookie -> 401
  r = await me();
  assert.equal(r.status, 401);
  // 7. 登出 -> 200
  r = await post("/api/logout", {}, `sid=${sid}`);
  assert.equal(r.status, 200, "logout should be 200");
  // 8. 登出后旧 cookie 失效 -> 401
  r = await me(`sid=${sid}`);
  assert.equal(r.status, 401, "old cookie must be rejected after logout");
  // 9. 首页是含表单的 HTML
  r = await fetch(`${BASE}/`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /<form/i, "index must contain a <form>");
  // 10. 数据库里搜不到明文密码（检验「按要求做对」，不只是「能跑」）
  assert.ok(fs.existsSync(DB), "data.db must live inside demo/login-app/");
  const raw = fs.readFileSync(DB).toString("latin1");
  assert.ok(!raw.includes("pw123456"), "plaintext password must not appear in data.db");
});
