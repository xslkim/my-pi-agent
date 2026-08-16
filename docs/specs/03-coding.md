# Spec 03 · 让 agent 改代码（四个受约束的工具）

> 课程：[lessons/03-coding.md](../lessons/03-coding.md) · Tag `l3-coding` · 行数预算 ≤ 350（累计 ≤ 900）

## 目标

给 agent 装上 `read` / `write` / `edit` / `bash`，让它能在一个**指定的工作目录**里真正干活：读文件、改文件、跑命令。跑通「把 `hello.txt` 里的 world 改成 pi，然后用命令验证」。

这一课的重点不是四个工具有多难写，而是**约束**：不许跳出工作目录、不许把 5MB 文件塞进上下文、不许无限期挂起、不许改错地方。没有约束的工具会毁掉 agent，也会毁掉你的磁盘。

## 交付物

| 文件 | 职责 | 预算 |
|---|---|---|
| `src/tools/guard.ts` | 路径越界检查、输出截断、超时 | 80 |
| `src/tools/read.ts` | 读文件，带 offset/limit 与截断 | 60 |
| `src/tools/write.ts` | 写文件，自动建父目录 | 30 |
| `src/tools/edit.ts` | 唯一匹配的字符串替换 | 60 |
| `src/tools/bash.ts` | 跑命令，带超时、cwd、截断 | 90 |
| `src/prompt.ts` | system prompt | 30 |

## 约束层（`guard.ts`）

三个函数，四个工具共用。

```ts
/** 把用户/模型给的路径解析为绝对路径，并确保它在 cwd 内。越界抛错。 */
export function resolveInside(cwd: string, p: string): string;

/** 超长文本截断，保留头部并附带说明。 */
export function truncate(text: string, maxLines = 500, maxBytes = 50_000): string;

/** 给 promise 加超时。 */
export function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T>;
```

`resolveInside` 的实现要点：

```ts
const abs = path.resolve(cwd, p);
const rel = path.relative(cwd, abs);
if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error(`path escapes workspace: ${p}`);
return abs;
```

用 `path.relative` 判断，不要用字符串 `startsWith(cwd)`——`/work` 和 `/work-evil` 会误判。符号链接不做深度解析（讲清这是已知缺口，pi 用 `realpath` 处理）。

`truncate` 为什么必要：一个 5MB 的 `package-lock.json` 直接塞进 64K 上下文 = 立刻 400。截断后要**明确告诉模型被截断了**，否则它以为自己看到了全文：

```
[truncated: showing first 500 of 12043 lines]
```

## 四个工具

### read

参数：`path`、可选 `offset`（1 起）、可选 `limit`。

- 只读文本；检测到 NUL 字节判定为二进制，返回 `[binary file, N bytes]` 而不是乱码
- 输出带行号（`  12| content`），模型据此做 `edit` 更准
- 走 `truncate`

### write

参数：`path`、`content`。

- `mkdir -p` 父目录
- 返回 `Wrote N bytes to <relative path>`
- **不做覆盖确认**（教学版），但 system prompt 里要求优先用 `edit`

### edit（本课核心）

参数：`path`、`oldText`、`newText`。

```ts
const content = await fs.readFile(abs, "utf8");
const count = content.split(oldText).length - 1;
if (count === 0) throw new Error("oldText not found in file");
if (count > 1) throw new Error(`oldText appears ${count} times; include more surrounding context to make it unique`);
await fs.writeFile(abs, content.replace(oldText, newText));
```

**唯一匹配是整个 agent 编辑机制的安全根基。** 匹配到多处就报错，把「加更多上下文」的要求明确写进错误信息里——模型看到会自己补全上下文重试。这是最重要的一条自愈路径。

返回一个极简 diff（改动前后各 2 行），让终端里能看见改了什么。

### bash（Windows 有真坑）

参数：`command`、可选 `timeout`（秒，默认 60）。

```ts
export function pickShell(): { file: string; args: string[] } {
  if (process.platform !== "win32") return { file: "/bin/bash", args: ["-c"] };
  const gitBash = `${process.env.ProgramFiles}\\Git\\bin\\bash.exe`;
  if (fs.existsSync(gitBash)) return { file: gitBash, args: ["-c"] };
  return { file: "powershell.exe", args: ["-NoProfile", "-Command"] };
}
```

**必须避开 `C:\Windows\System32\bash.exe`**：它是 WSL 的入口，在它眼里 `G:\my-pi-agent` 是 `/mnt/g/my-pi-agent`，agent 用它执行相对路径命令会操作到完全不同的地方，而且报错很隐晦。本机已确认 `C:\Program Files\Git\bin\bash.exe` 存在，优先用它。

其余要求：

- `spawn` 而非 `exec`（避免缓冲区上限）
- `cwd` 固定为工作目录
- 超时后杀进程树（Windows 用 `taskkill /F /T /PID`，POSIX 用 `process.kill(-pid)`）
- 合并 stdout/stderr，走 `truncate`
- 返回值带退出码：`[exit 1]\n<output>`
- 响应 `AbortSignal`

## system prompt（`src/prompt.ts`）

```
You are a coding agent working in ${cwd}.

Rules:
- Read a file before editing it. Never guess its contents.
- Prefer `edit` over `write` for existing files.
- `edit` requires oldText to appear exactly once. If it fails, read more context and retry.
- All paths must stay inside the workspace.
- Explain what you changed after you finish.
```

短、具体、可执行。每一条都对应一个我们已经在代码里强制的约束——**prompt 说的和代码做的必须一致**，否则模型会被误导。

## 测试（离线，临时目录）

| 用例 | 断言 |
|---|---|
| **路径越界** | `../../etc/passwd`、绝对路径、`..\\..\\` 全部被拒 |
| 相似前缀目录 | cwd 为 `/work` 时，`/work-evil/x` 被拒 |
| read 截断 | 1000 行文件默认只返回 500 行且带截断提示 |
| read 二进制 | 含 NUL 的文件返回 `[binary file...]` |
| write 建目录 | 写 `a/b/c.txt` 会自动创建 `a/b` |
| **edit 唯一匹配** | 出现 2 次时报错且**文件未被修改** |
| edit 未找到 | 报错且文件未修改 |
| edit 成功 | 内容正确替换，返回 diff |
| bash 超时 | `sleep 5` + timeout 1 → 1 秒内返回超时错误，进程已死 |
| bash 退出码 | `exit 3` 的输出里含 `[exit 3]` |
| bash 截断 | 输出 10000 行被截断 |
| **完整闭环** | 假模型驱动 read → edit → 最终回答，临时目录里文件内容正确 |

## 验收

1. 真实 Qwen 在临时目录完成 read → edit，文件内容正确。
2. 越界路径在任何工具里都进不去。
3. 全部测试绿；累计 ≤ 900 行；`tsc --noEmit` 无错。
4. 在 Windows 上 `bash` 走的是 Git Bash（打印一次实际使用的 shell 路径以自证）。

## 不做

多重编辑、unified diff、符号链接解析、沙箱、危险命令拦截（L5 按需补确认机制）、`ls` / `grep`（L5 按需补）。
