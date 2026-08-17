import fs from "node:fs";
import path from "node:path";
import type { Tool } from "./registry.ts";
import { resolveInside } from "./guard.ts";

export const write: Tool = {
  name: "write",
  description: "Create or overwrite a text file inside the workspace. Parent directories are created automatically.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "file path relative to the workspace" },
      content: { type: "string", description: "full file content" },
    },
    required: ["path", "content"],
  },
  async execute(args, ctx) {
    const { path: p, content } = args as { path: string; content: string };
    let abs: string;
    try {
      abs = resolveInside(ctx.cwd, p);
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    // .git 是仓库的账本，不许碰（relative 不以 .. 开头 = 在 .git 内）
    if (!path.relative(path.resolve(ctx.cwd, ".git"), abs).startsWith("..")) {
      return `error: refusing to write inside .git/: ${p}`;
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    return `wrote ${p} (${content.split("\n").length} lines)`; // 可核对的回执
  },
};
