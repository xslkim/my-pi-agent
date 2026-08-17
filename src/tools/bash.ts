import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import type { Tool } from "./registry.ts";
import { truncate } from "./guard.ts";

// shell 选择必须显式：System32\bash.exe 是 WSL，它眼里 G:\ 是 /mnt/g，
// agent 用它会在一个和文件工具完全不同的文件系统里操作，症状极难排查。
export function pickShell(): { cmd: string; args: string[] } {
  if (process.platform !== "win32") return { cmd: "/bin/bash", args: ["-c"] };
  const gitBash = `${process.env.ProgramFiles ?? "C:\\Program Files"}\\Git\\bin\\bash.exe`;
  if (fs.existsSync(gitBash)) return { cmd: gitBash, args: ["-c"] };
  return { cmd: "powershell.exe", args: ["-NoProfile", "-Command"] };
}

export function clampTimeout(ms: number): number {
  return Math.min(ms, 120_000);
}

/** 杀整个进程组：bash -c 的子进程不是直接子进程，只杀 bash 会留下孤儿占着端口。 */
function killGroup(child: ChildProcess): void {
  if (child.pid === undefined) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
  } else {
    try {
      process.kill(-child.pid, "SIGKILL"); // 配合 detached: true，pid 是进程组长
    } catch { child.kill("SIGKILL"); }
  }
}

let announced = false;

export const bash: Tool = {
  name: "bash",
  description: "Run a shell command in the workspace. Returns exit code, stdout and stderr (both truncated).",
  parameters: {
    type: "object",
    properties: {
      command: { type: "string" },
      timeout_ms: { type: "number", description: "default 30000, capped at 120000" },
    },
    required: ["command"],
  },
  async execute(args, ctx) {
    const { command, timeout_ms } = args as { command: string; timeout_ms?: number };
    const timeoutMs = clampTimeout(timeout_ms ?? 30_000);
    const shell = pickShell();
    if (!announced) {
      announced = true;
      process.stderr.write(`[shell] ${shell.cmd}\n`); // 启动时自证一次，排错用
    }

    const child = spawn(shell.cmd, [...shell.args, command], {
      cwd: ctx.cwd, // 不是 process.cwd()——--cwd 给什么就是什么
      detached: process.platform !== "win32", // POSIX 下自成进程组才能整组杀
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let out = "";
    let err = "";
    child.stdout?.on("data", (d: Buffer) => (out += d.toString("utf8")));
    child.stderr?.on("data", (d: Buffer) => (err += d.toString("utf8")));
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; killGroup(child); }, timeoutMs);
    const onAbort = () => killGroup(child);
    ctx.signal?.addEventListener("abort", onAbort, { once: true });

    const code: number | null = await new Promise((resolve) => {
      child.on("error", (e) => {
        err += String(e);
        resolve(-1);
      });
      child.on("close", (c) => resolve(c));
    });
    clearTimeout(timer);
    ctx.signal?.removeEventListener("abort", onAbort);

    // 非零退出码不算工具失败：测试挂了正是模型需要读到的信息
    const body = `exit: ${code}\n--- stdout ---\n${truncate(out)}\n--- stderr ---\n${truncate(err)}`;
    if (timedOut) {
      return `error: command timed out after ${timeoutMs}ms (partial output below)\n${body}`;
    }
    if (ctx.signal?.aborted) {
      return `error: command aborted\n${body}`;
    }
    return body;
  },
};
