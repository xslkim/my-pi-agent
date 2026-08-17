# T13 · bash 工具（跨平台）

> 课：L3 · 规格：[specs/03-coding.md「bash」](../specs/03-coding.md) · 预算：90 行 · 前置：T12

## 目标

让 agent 能跑命令——装依赖、跑测试、启服务都靠它。同时这是**最危险**的工具，超时和进程清理必须做对。

## 要写的文件

- `src/tools/bash.ts`（新建）
- `test/bash.test.ts`（新建，不计预算）

## 实现要点

参数：`command`（必填）、`timeout_ms`（可选，默认 30000，上限 120000）。

### shell 选择（Windows 特有的坑）

```ts
function pickShell(): { cmd: string; args: string[] }
```

优先级：

1. `C:\Program Files\Git\bin\bash.exe`（Git Bash，**首选**）
2. 其它平台的 `/bin/bash`
3. 兜底 `powershell.exe -NoProfile -Command`

**必须显式跳过 `C:\Windows\System32\bash.exe`**。它是 WSL 入口，会把 `C:\foo` 当成 Linux 路径，导致 agent 在一个和文件工具完全不同的文件系统里操作——症状是「命令说成功了，但文件工具看不到任何变化」，极难排查。

把选中的 shell 打印到 stderr 一次，方便学员排错。

### 执行

- `spawn`，`cwd` 用 `ctx.cwd`（**不是 `process.cwd()`**），`shell: false`。
- stdout / stderr 分别收集，各自过 `truncate`。
- 返回格式固定：
  ```
  exit: 0
  --- stdout ---
  ...
  --- stderr ---
  ...
  ```
  非零退出码**不算工具失败**，照常返回文本——测试挂了正是模型需要读到的信息。
- 超时：`kill` 整个**进程组**（`spawn` 时 `detached: true`，然后 `process.kill(-pid)`；Windows 上用 `taskkill /pid <pid> /T /F`）。只 kill 直接子进程会留下孤儿 `node`/`npm` 占着端口。
- 超时返回 `error: command timed out after Nms` **并附上已收集到的输出**（部分输出往往就是诊断线索）。
- `ctx.signal` 中止时同样杀进程组。

## 验收

```bash
node --test test/bash.test.ts
npx tsc --noEmit
```

- [ ] `echo hello` 返回 exit 0 且 stdout 含 hello
- [ ] 非零退出码正常返回文本，不抛异常，`exit:` 行显示真实码
- [ ] stderr 被单独收集
- [ ] **超时**：`sleep 5` 配 `timeout_ms: 300` 返回超时错误，且总耗时明显小于 5s
- [ ] **进程被真正杀死**：起一个子进程写文件，超时后等 1s 断言文件没有继续增长
- [ ] `cwd` 生效：在临时目录跑 `pwd`/`cd` 得到的是 `ctx.cwd`
- [ ] `timeout_ms` 超过上限时被钳制到 120000
- [ ] 行数 ≤ 90

跨平台：Windows 下若无 Git Bash，用 `t.skip` 跳过 shell 相关用例，**不要让测试变红**。

## 不要做

- 不做交互式命令支持（无 TTY）
- 不做命令白名单 / 危险命令拦截（T23 才加，那时才有真实需求驱动）
- 不用 `exec`（无法流式、无法可靠杀进程组）

## 完成动作

`git commit -m "T13: bash tool with process-group timeout"`，看板标 `done`。
