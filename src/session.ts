import fs from "node:fs";
import path from "node:path";
import type { Message } from "./types.ts";

// 同步 API 是刻意的：这两个函数唯一的卖点就是「进程被 Ctrl+C 杀掉时已写入的部分完好」，
// 异步写在事件循环里排队，恰恰可能在退出时丢掉最后一条。appendFileSync 让「写完即落盘」显然。

/** `-s` 收名字不带后缀：l5-run1 -> .agent/sessions/l5-run1.jsonl */
export function sessionFile(name: string): string {
  return path.join(".agent", "sessions", `${name}.jsonl`);
}

export function appendMessage(file: string, m: Message): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(m) + "\n"); // 换行由 stringify 转义，天然安全
}

export function loadSession(file: string): Message[] {
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return []; // 文件不存在：首次运行就是这种情况，不是错误
  }
  const out: Message[] = [];
  for (const [i, line] of raw.split("\n").entries()) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as Message);
    } catch {
      // 崩溃可能留下半行——跳过并警告，不能让整个会话读不出来
      process.stderr.write(`[session] skipping corrupt line ${i + 1} in ${file}\n`);
    }
  }
  return out;
}
