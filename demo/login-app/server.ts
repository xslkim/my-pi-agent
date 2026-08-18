import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { sep, join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = join(__dirname, 'public');
const MAX_BODY = 100 * 1024; // 100KB

// ---------------- 存储：node:sqlite ----------------
const db = new DatabaseSync(join(__dirname, 'data.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    salt     TEXT NOT NULL,
    hash     TEXT NOT NULL
  )
`);
const stmtFindUser = db.prepare('SELECT id, username, salt, hash FROM users WHERE username = ?');
const stmtInsertUser = db.prepare('INSERT INTO users (username, salt, hash) VALUES (?, ?, ?)');

// ---------------- 密码：scrypt + 随机盐（绝不存明文） ----------------
const SCRYPT_KEYLEN = 64;
const hashPassword = (password: string, salt: Buffer): Buffer =>
  scryptSync(password, salt, SCRYPT_KEYLEN);

const verifyPassword = (password: string, saltHex: string, expectedHex: string): boolean => {
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = hashPassword(password, Buffer.from(saltHex, 'hex'));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

// ---------------- 会话：内存 Map（token -> username） ----------------
const sessions = new Map<string, string>();

const SID = 'sid';
const COOKIE_OPTS = 'HttpOnly; SameSite=Strict; Path=/';

// ---------------- 工具函数 ----------------
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function sendJson(res: ServerResponse, status: number, payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, '请求体过大'));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        reject(new HttpError(400, 'JSON 格式错误'));
      }
    });
    req.on('error', () => reject(new HttpError(400, '请求读取失败')));
  });
}

function getCookie(req: IncomingMessage, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return part.slice(eq + 1).trim();
    }
  }
  return undefined;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

async function serveStatic(res: ServerResponse, urlPath: string): Promise<void> {
  const rel = urlPath === '/' ? 'login.html' : urlPath.slice(1);
  const filePath = join(PUBLIC_DIR, normalize(rel));
  // 防目录穿越：解析后必须仍在 public/ 内
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + sep)) {
    sendJson(res, 404, { error: 'Not Found' });
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': data.length,
    });
    res.end(data);
  } catch {
    sendJson(res, 404, { error: 'Not Found' });
  }
}

// ---------------- 路由 ----------------
const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    if (path.startsWith('/api/')) {
      if (path === '/api/register' && req.method === 'POST') {
        const { username, password } = await readJson(req);
        if (
          typeof username !== 'string' ||
          typeof password !== 'string' ||
          username.trim() === '' ||
          password === ''
        ) {
          sendJson(res, 400, { error: 'username 和 password 必填' });
          return;
        }
        const name = username.trim();
        if (stmtFindUser.get(name) !== undefined) {
          sendJson(res, 409, { error: '用户名已存在' });
          return;
        }
        const salt = randomBytes(16);
        const hash = hashPassword(password, salt);
        try {
          stmtInsertUser.run(name, salt.toString('hex'), hash.toString('hex'));
        } catch {
          sendJson(res, 409, { error: '用户名已存在' });
          return;
        }
        sendJson(res, 201, { ok: true });
        return;
      }

      if (path === '/api/login' && req.method === 'POST') {
        const { username, password } = await readJson(req);
        if (typeof username !== 'string' || typeof password !== 'string') {
          sendJson(res, 400, { error: 'username 和 password 必填' });
          return;
        }
        const row = stmtFindUser.get(username) as
          | { username: string; salt: string; hash: string }
          | undefined;
        if (!row) {
          // 用户不存在时也跑一次 scrypt，避免通过响应时间枚举用户名
          hashPassword(password, randomBytes(16));
          sendJson(res, 401, { error: '用户名或密码错误' });
          return;
        }
        if (!verifyPassword(password, row.salt, row.hash)) {
          sendJson(res, 401, { error: '用户名或密码错误' });
          return;
        }
        const token = randomUUID();
        sessions.set(token, row.username);
        res.setHeader('Set-Cookie', `${SID}=${token}; ${COOKIE_OPTS}`);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (path === '/api/me' && req.method === 'GET') {
        const token = getCookie(req, SID);
        const username = token ? sessions.get(token) : undefined;
        if (!username) {
          sendJson(res, 401, { error: '未登录' });
          return;
        }
        sendJson(res, 200, { username });
        return;
      }

      if (path === '/api/logout' && req.method === 'POST') {
        const token = getCookie(req, SID);
        if (token) sessions.delete(token);
        res.setHeader('Set-Cookie', `${SID}=; ${COOKIE_OPTS}; Max-Age=0`);
        sendJson(res, 200, { ok: true });
        return;
      }

      sendJson(res, 405, { error: 'Method Not Allowed' });
      return;
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      await serveStatic(res, path);
      return;
    }

    sendJson(res, 405, { error: 'Method Not Allowed' });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : '服务器内部错误';
    try {
      sendJson(res, status, { error: message });
    } catch {
      // 连接已断开，忽略
    }
  }
});

server.on('error', (err) => {
  console.error('server error:', err.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
