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
      process.kill(-child.pid, "SIGKILL"); // 配合 detached: true，pid 是进程组长；组长死后组仍可达
    } catch {
      child.kill("SIGKILL");
    }
  }
}

/** bash 已退出后，taskkill /T 无法再从死父进程走到孤儿（run1 死锁的残余问题：
 *  后台守护进程活到工具返回之后）。按 PPID 扫描补杀直接子进程。
 *  注意：这只对「直接 Windows 子进程」有效（PowerShell 兜底路径）；MSYS/Git Bash
 *  的后台任务在 Windows 进程树上不挂在我们 bash 名下，靠下面的 trap 方案清理。 */
function killOrphans(parentPid: number | undefined): void {
  if (process.platform !== "win32" || !parentPid) return;
  const script =
    `Get-CimInstance Win32_Process -Filter "ParentProcessId=${parentPid}" | ` +
    `ForEach-Object { taskkill /PID $($_.ProcessId) /F /T }`;
  spawnSync("powershell.exe", ["-NoProfile", "-Command", script], { windowsHide: true });
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

    // bash 退出即清场：记录退出码 -> 杀掉所有后台任务 -> 恢复退出码。
    // 不能用 trap 'kill 0'（会连 bash 一起 TERM，退出码变 3840）；也不能事后从
    // Windows 进程树外部杀（MSYS 后台任务不挂在我们 bash 名下，taskkill /T 够不着）。
    // 若命令内含 exit 导致后缀未执行，属接受的边界（exit 意味着通常没有遗留后台任务）。
    const cleanup = '; __rc=$?; kill $(jobs -p) 2>/dev/null; exit $__rc';
    const wrapped = shell.args[0] === "-c" ? `${command}${cleanup}` : command;
    const child = spawn(shell.cmd, [...shell.args, wrapped], {
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
    const reap = () => { killGroup(child); killOrphans(child.pid); };
    const timer = setTimeout(() => { timedOut = true; reap(); }, timeoutMs);
    const onAbort = () => reap();
    ctx.signal?.addEventListener("abort", onAbort, { once: true });

    // run1 踩过的死锁：等待 close（全部 stdio 关闭）会被「后台起的守护进程」
    // 占住管道——进程死了管道也关不上。所以以 exit 为准，给 close 一个宽限期，
    // 到点主动 destroy 流；返回前清理整个进程组，不留孤儿服务。
    const code: number | null = await new Promise((resolve) => {
      child.on("error", (e) => {
        err += String(e);
        resolve(-1);
      });
      child.on("exit", (c) => {
        let settled = false;
        const settle = () => {
          if (!settled) {
            settled = true;
            clearTimeout(grace);
            resolve(c);
          }
        };
        const grace = setTimeout(() => {
          child.stdout?.destroy();
          child.stderr?.destroy();
          settle();
        }, 1_000);
        child.on("close", settle);
      });
    });
    clearTimeout(timer);
    ctx.signal?.removeEventListener("abort", onAbort);
    reap(); // 清掉命令留下的后台进程：想「起服务再测」请在同一条命令里完成

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
