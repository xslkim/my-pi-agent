import fs from "node:fs";
import type { Tool } from "./registry.ts";
import { resolveInside, truncate } from "./guard.ts";

// 行号不是装饰：edit 失败时的报错带行号，模型要能拿它回来 read 定位。
export const read: Tool = {
  name: "read",
  description:
    "Read a text file inside the workspace. Returns numbered lines. Use offset/limit for large files.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "file path relative to the workspace" },
      offset: { type: "number", description: "1-based line to start from" },
      limit: { type: "number", description: "max number of lines to return" },
    },
    required: ["path"],
  },
  async execute(args, ctx) {
    const { path: p, offset = 1, limit } = args as { path: string; offset?: number; limit?: number };
    let abs: string;
    try {
      abs = resolveInside(ctx.cwd, p);
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    let stat: fs.Stats;
    try {
      stat = fs.statSync(abs);
    } catch {
      return `error: file not found: ${p}`; // 不抛异常：让模型换个路径重试
    }
    if (stat.isDirectory()) return `error: is a directory: ${p}`;

    const buf = fs.readFileSync(abs);
    if (buf.includes(0)) return `error: binary file, cannot read as text (${buf.length} bytes)`;

    const all = buf.toString("utf8").split("\n");
    if (all.length === 1 && all[0] === "") return "(empty file)";

    const start = Math.max(1, offset) - 1;
    const slice = limit ? all.slice(start, start + limit) : all.slice(start);
    const width = String(start + slice.length).length;
    const numbered = slice.map((line, i) => `${String(start + i + 1).padStart(width)}| ${line}`).join("\n");
    return truncate(numbered); // 行号是文件里的真实行号，不从 1 重排
  },
};
