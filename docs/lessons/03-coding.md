# 第 3 课 · 让 agent 改代码

> 目标：实现 read / write / edit / bash 四个受约束的工具，让 agent 能在指定目录里真正干活。
> 实现规格：[specs/03-coding.md](../specs/03-coding.md) · Tag `l3-coding` · 约 110 分钟

## 这节课要回答的问题

**为什么 coding agent 是四个工具，而不是四十个？**

Claude Code、Cursor、pi，剥开都是这几件套：读文件、写文件、改文件、跑命令。这节课我们自己写一遍，然后会发现真正难的不是「怎么读文件」——那是 `fs.readFile` 一行——而是**怎么不让它把事情搞砸**。

一个没有约束的 `bash` 工具加上一个爱幻觉的模型，等于把 `rm -rf` 的执行权交给一个喝醉的实习生。

## 先修

第 2 课的 loop 能跑通 calculator。

## 课堂流程

### 1. 先写没有约束的版本（15 分钟）

四个工具的裸实现都很短，20 分钟能写完：

```ts
read:  fs.readFile(args.path, "utf8")
write: fs.writeFile(args.path, args.content)
edit:  content.replace(args.oldText, args.newText)
bash:  exec(args.command)
```

跑一下，它真的能改文件了。学员会有点兴奋。**接下来的 40 分钟专门用来打碎这份兴奋。**

### 2. 故障注入 —— 四种搞砸方式（40 分钟）

一个一个演示，每演示一个就当场修一个。

**A. 路径逃逸**

让 agent 读 `../../../../Windows/System32/drivers/etc/hosts`。它读到了。工作目录形同虚设。

修：`resolveInside(cwd, p)`，用 `path.relative` 判断是否越界。

```ts
const rel = path.relative(cwd, path.resolve(cwd, p));
if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error(`path escapes workspace: ${p}`);
```

顺带一个陷阱题：为什么不用 `abs.startsWith(cwd)`？因为 cwd 是 `/work` 时，`/work-evil/secret` 也能通过。**字符串前缀不等于路径包含。**

**B. 上下文爆炸**

让 agent 读一个 `package-lock.json`（几 MB）。请求直接 400——超出 65536 上下文。整个会话报废。

修：`truncate()`，默认 200 行 / 20KB。关键是截断后**必须告诉模型**：

```
[truncated: showing first 200 of 12043 lines]
```

阈值不是拍脑袋定的：按实测的分词比例（代码约 3.7 字符/token），20KB 约 5400 token，占 64K 上下文的 8%；放到 50KB 就是 20% 以上，读三四个文件就没法干活了。**上下文是这门课最稀缺的资源，任何往里塞东西的地方都要按 token 占比算账。**

否则模型以为自己看完了全文，然后基于残缺信息做判断——比报错更糟。

**C. edit 改错地方**

文件里有三处 `const x = 1`，让 agent 改其中一处。`String.replace` 只替换第一个匹配。改错了，而且**没有任何报错**。

修，也是本课最重要的一条规则：**oldText 必须在文件中唯一，否则拒绝执行。**

```ts
const count = content.split(oldText).length - 1;
if (count === 0) throw new Error("oldText not found in file");
if (count > 1) throw new Error(`oldText appears ${count} times; include more surrounding context to make it unique`);
```

注意错误信息里那句 "include more surrounding context"——它是写给模型看的。模型读到后会自己扩大匹配范围重试。**好的错误信息是 agent 的一部分。**

这条约束是所有 coding agent 编辑机制的基石，值得单独花 10 分钟讲透。

**D. 命令挂起**

让 agent 执行 `sleep 300` 或一个等待输入的命令。整个 agent 卡死，Ctrl+C 也不一定救得回来。

修：超时 + 杀进程树。注意杀的是**进程树**不是进程——`bash -c "sleep 300"` 里 sleep 是子进程，只杀 bash 会留下孤儿。Windows 用 `taskkill /F /T /PID`，POSIX 用 `process.kill(-pid)`。

### 3. Windows 的真坑（15 分钟）

这一段不能跳过，因为本课在 Windows 上讲。

`where bash` 在本机返回三个结果：

```
C:\Windows\System32\bash.exe                              ← WSL！
C:\Users\xsl\AppData\Local\Microsoft\WindowsApps\bash.exe ← 也是 WSL
C:\Program Files\Git\bin\bash.exe                         ← Git Bash，我们要的
```

如果 agent 用了第一个，它进的是 WSL：那里 `G:\my-pi-agent` 变成 `/mnt/g/my-pi-agent`，`node` 可能根本不存在，而且报错信息完全看不出根因。**排查这个能耗掉一下午。**

所以 `pickShell()` 显式优先 Git Bash，找不到才回退 PowerShell，并且在启动时打印一次实际使用的 shell 路径。

这也是一个更普遍的教训：**agent 的执行环境必须是显式的、可打印的，不能靠 PATH 碰运气。**

### 4. system prompt（15 分钟）

工具装好了，模型还得知道怎么用。写 `src/prompt.ts`：

```
You are a coding agent working in ${cwd}.
- Read a file before editing it. Never guess its contents.
- Prefer `edit` over `write` for existing files.
- `edit` requires oldText to appear exactly once. If it fails, read more context and retry.
- All paths must stay inside the workspace.
- Explain what you changed after you finish.
```

核心原则：**prompt 里说的每一条，代码里都必须真的强制。** 只在 prompt 里写「不要越界」而代码不检查，等于没写——模型会忘、会幻觉、会被绕过。反过来，代码强制了但 prompt 没说，模型会反复撞墙浪费轮次。

两者要一一对应。这是写 agent prompt 最实用的一条规矩。

### 5. 见真章（15 分钟）

```bash
mkdir -p demo/tmp && echo "hello world" > demo/tmp/hello.txt
node src/cli.ts --cwd demo/tmp "把 hello.txt 里的 world 改成 pi，然后用命令确认改成功了"
```

演示目录用**仓库内的相对路径**，不用 `/tmp`。这一课刚讲完 Windows 路径的坑，自己就别再踩：Git Bash 会对 `/tmp` 做 MSYS 路径转换，传给 node 之后落到哪不可靠。

观察它：`read` 看内容 → `edit` 改 → `bash cat` 验证 → 报告完成。

**这是本课的高光时刻。** 900 行代码，一个能改代码的 agent。

### 6. pi 对照（10 分钟）

| 模块 | 我们 | pi |
|---|---|---|
| edit | ~60 行 | `edit.ts` 127 + `edit-diff.ts` **500** 行 |
| 执行环境 | ~80 行 | `nodejs.ts` **695** 行 |

打开 `pi/packages/agent/src/harness/tools/edit-diff.ts`，看那 500 行在干什么：多重编辑一次提交、CRLF/LF 行尾保持、BOM 处理、生成 unified diff、编辑冲突检测。

再打开 `pi/packages/agent/src/harness/env/nodejs.ts` 第 196 行 `getShellConfig`——它把我们刚才讲的 Windows shell 探测做成了完整的候选链，还处理了「System32\bash.exe 需要用 stdin 传命令」这种细节（`isLegacyWslBashPath`）。

**说白了：pi 踩过的坑，我们今天踩了四个，它踩了四十个。** 但四个已经足够让你理解这类工具的设计原则。

## 练习

1. 给 `edit` 加上多重编辑（一次传多个替换），并处理「两个编辑范围重叠」的情况。
2. 给 `bash` 加命令白名单模式，只允许 `node` / `git` / `ls` 等。
3. 实现 `ls` 工具（第 5 课会需要），要求忽略 `node_modules` 和 `.git`。
4. 让 `read` 支持读图片并返回 base64（模型支持视觉输入时）。
5. 思考题：`resolveInside` 挡得住文件工具，但 `bash` 能执行 `cat /etc/passwd`。要真正约束住，需要什么？（引出沙箱，第 5 课再谈）

## 本课完成标准

- 真实 Qwen 能在临时目录完成 read → edit → 验证
- 四种搞砸方式全部有回归测试
- Windows 上确认走的是 Git Bash（启动打印可自证）
- 累计 ≤ 900 行，`node --test` 全绿且离线可跑
