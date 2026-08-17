import fs from "node:fs";
import type { Tool } from "./registry.ts";
import { resolveInside } from "./guard.ts";

// 唯一匹配是 agent 编辑机制的安全根基：行号会漂移（上一步刚改过），
// 唯一字符串匹配把「定位错误」变成可检测的失败，而不是静默改错地方。

function findLines(content: string, needle: string): number[] {
  const lines: number[] = [];
  let from = 0;
  for (let i = 1; ; i++) {
    const at = content.indexOf(needle, from);
    if (at === -1) break;
    lines.push(content.slice(0, at).split("\n").length); // 匹配起始行的真实行号
    from = at + 1;
  }
  return lines;
}

export const edit: Tool = {
  name: "edit",
  description:
    "Replace text in a file. old_string must match exactly once unless replace_all is true. Keep surrounding context to make it unique.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" },
      old_string: { type: "string" },
      new_string: { type: "string" },
      replace_all: { type: "boolean" },
    },
    required: ["path", "old_string", "new_string"],
  },
  async execute(args, ctx) {
    const { path: p, old_string, new_string, replace_all = false } = args as {
      path: string; old_string: string; new_string: string; replace_all?: boolean;
    };
    if (old_string === new_string) return "error: old_string and new_string are identical";
    let abs: string;
    try {
      abs = resolveInside(ctx.cwd, p);
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    let content: string;
    try {
      content = fs.readFileSync(abs, "utf8");
    } catch {
      return `error: file not found: ${p}`;
    }
    const hits = findLines(content, old_string);
    if (hits.length === 0) {
      return `error: old_string not found in ${p}`;
    }
    if (hits.length > 1 && !replace_all) {
      // 行号 + 补上下文的指引都是写给模型的：它读到就能自愈
      return `error: old_string found ${hits.length} times in ${p} (lines ${hits.join(", ")}). Provide more surrounding context to make it unique, or set replace_all.`;
    }
    // 保持原换行风格：CRLF 文件别被悄悄改成 LF
    const nl = content.includes("\r\n") && !new_string.includes("\r\n") && new_string.includes("\n")
      ? new_string.replaceAll("\n", "\r\n")
      : new_string;
    const updated = replace_all
      ? content.split(old_string).join(nl)
      : content.replace(old_string, nl);
    fs.writeFileSync(abs, updated);
    return `edited ${p} (${replace_all ? hits.length : 1} replacement${replace_all ? "s" : ""} at line${replace_all ? "s" : ""} ${hits.join(", ")})`;
  },
};
