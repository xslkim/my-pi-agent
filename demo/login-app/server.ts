/**
 * 最小登录应用 —— 仅使用 Node 内置模块(零 npm 依赖)
 *
 * 运行(Node >= 22.5,推荐 24+ 可直接执行 .ts):
 *   node server.ts
 *
 * 监听 PORT 环境变量(默认 3000)。
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(rootDir, "public");
const PORT = Number(process.env.PORT) || 3000;
const SESSION_COOKIE = "sid";
const MAX_BODY_BYTES = 1024 * 1024; // 1 MiB

// ---------- 存储:node:sqlite ----------
const db = new DatabaseSync(join(rootDir, "data.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT    NOT NULL UNIQUE,
    salt     TEXT    NOT NULL,
    hash     TEXT    NOT NULL
  )
`);
const insertUser = db.prepare("INSERT INTO users (username, salt, hash) VALUES (?, ?, ?)");
const findUser = db.prepare("SELECT salt, hash FROM users WHERE username = ?");
const existsUser = db.prepare("SELECT 1 FROM users WHERE username = ?");

// ---------- 会话:内存 Map(token -> username) ----------
const sessions = new Map<string, string>();

// ---------- 小工具 ----------
function json(res: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
  });
  res.end(data);
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i <= 0) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

/** 读取并解析 JSON 请求体;解析失败/超大时已自行响应并返回 undefined。 */
async function readJsonBody(req: IncomingMessage, res: ServerResponse): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY_BYTES) {
      json(res, 413, { error: "payload too large" });
      req.destroy();
      return undefined;
    }
    chunks.push(buf);
  }
  if (size === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    json(res, 400, { error: "invalid JSON body" });
    return undefined;
  }
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: unknown; errstr?: unknown } | null;
  if (!e || typeof e !== "object") return false;
  if (typeof e.code === "string" && e.code.startsWith("SQLITE_CONSTRAINT")) return true;
  // 部分 Node 版本抛出 ERR_SQLITE_ERROR + errstr
  return typeof e.errstr === "string" && /UNIQUE|constraint/i.test(e.errstr);
}

// ---------- 密码:scrypt + 随机盐 ----------
function hashPassword(password: string, saltHex: string): string {
  return scryptSync(password, Buffer.from(saltHex, "hex"), 64).toString("hex");
}

function verifyPassword(password: string, saltHex: string, expectedHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ---------- API 处理 ----------
async function handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const raw = await readJsonBody(req, res);
  if (raw === undefined) return;
  const body: Record<string, unknown> = raw && typeof raw === "object" ? (raw as object) : {};
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return json(res, 400, { error: "username 和 password 不能为空" });
  }
  // 先检查再插入,UNIQUE 约束作为并发兜底
  if (existsUser.get(username)) return json(res, 409, { error: "用户名已存在" });
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  try {
    insertUser.run(username, salt, hash);
  } catch (err) {
    if (isUniqueViolation(err)) return json(res, 409, { error: "用户名已存在" });
    throw err;
  }
  json(res, 201, { ok: true });
}

async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const raw = await readJsonBody(req, res);
  if (raw === undefined) return;
  const body: Record<string, unknown> = raw && typeof raw === "object" ? (raw as object) : {};
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return json(res, 400, { error: "username 和 password 不能为空" });
  }
  const row = findUser.get(username) as { salt: string; hash: string } | undefined;
  if (!row || !verifyPassword(password, row.salt, row.hash)) {
    return json(res, 401, { error: "用户名或密码错误" });
  }
  const token = randomUUID();
  sessions.set(token, username);
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/`);
  json(res, 200, { ok: true });
}

function handleMe(req: IncomingMessage, res: ServerResponse): void {
  const sid = parseCookies(req)[SESSION_COOKIE];
  const username = sid ? sessions.get(sid) : undefined;
  if (!username) return json(res, 401, { error: "未登录" });
  json(res, 200, { username });
}

function handleLogout(req: IncomingMessage, res: ServerResponse): void {
  const sid = parseCookies(req)[SESSION_COOKIE];
  if (sid) sessions.delete(sid);
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
  json(res, 200, { ok: true });
}

// ---------- 静态文件(public/) ----------
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

async function serveStatic(res: ServerResponse, pathname: string): Promise<void> {
  let rel: string;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return json(res, 400, { error: "bad request" });
  }
  rel = rel === "/" ? "login.html" : rel.replace(/^\/+/, "");
  const filePath = normalize(join(PUBLIC_DIR, rel));
  // 防目录穿越:解析后必须仍位于 public/ 内
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + sep)) {
    return json(res, 404, { error: "not found" });
  }
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": data.length,
    });
    res.end(data);
  } catch {
    json(res, 404, { error: "not found" });
  }
}

// ---------- 路由 ----------
const server = createServer(async (req, res) => {
  try {
    const { method } = req;
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;

    if (method === "POST" && pathname === "/api/register") return await handleRegister(req, res);
    if (method === "POST" && pathname === "/api/login") return await handleLogin(req, res);
    if (method === "GET" && pathname === "/api/me") return handleMe(req, res);
    if (method === "POST" && pathname === "/api/logout") return handleLogout(req, res);
    if (method === "GET" || method === "HEAD") return await serveStatic(res, pathname);

    json(res, 405, { error: "method not allowed" });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) json(res, 500, { error: "internal server error" });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`login-app: http://localhost:${PORT} (db: ${join(rootDir, "data.db")})`);
});
