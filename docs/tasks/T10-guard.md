# T10 · 约束层 guard

> 课：L3 · 规格：[specs/03-coding.md「约束层」](../specs/03-coding.md) · 预算：75 行 · 前置：T09

## 目标

在写任何文件工具之前，先写好三道闸：**路径越界**、**输出爆炸**、**执行卡死**。四个工具共用这一层，先写它能避免同样的检查抄四遍。

## 要写的文件

- `src/tools/guard.ts`（新建）
- `test/guard.test.ts`（新建，不计预算）

## 实现要点

### `resolveInside(cwd, p): string`

把相对路径解析成绝对路径，并保证它在 `cwd` 内，越界抛错。

- 必须 `path.resolve` **之后**再比较，不能只检查字符串里有没有 `..`（`a/../../b` 这类要靠解析才能识破）。
- 用 `path.relative` 判断（`rel.startsWith("..") || path.isAbsolute(rel)`），不要用字符串 `startsWith(cwd)`，否则 `/work` 会误判 `/work-evil`。
- Windows 上做**大小写不敏感**比较。
- 拒绝符号链接逃逸：对已存在的路径用 `fs.realpathSync` 再校验一次（路径不存在时跳过，因为 `write` 要能创建新文件）。这一条比 spec 03 早先的口径更严——**它是刻意加的**，因为只做 `path.relative` 的话，工作目录里一个指向外部的软链就能让所有约束失效，而这几行成本极低。
- 错误信息统一：`path escapes workspace: <原始输入>`。

### `truncate(s, maxLines = 200, maxBytes = 20_000): string`

超限时截断并**明确告知**，例如 `[truncated: showing first 200 of 12043 lines]`。

为什么是 200 行 / 20KB：按 [spec 04 实测](../specs/04-usable.md)的分词比例（代码约 3.7 字符/token），20KB 代码约 5400 token，占 64K 上下文的 **8%**。放宽到 50KB 的话，一次 `read` 就吃掉 20% 以上，agent 读三四个文件就没法干活了。上下文是这门课最稀缺的资源，阈值要按 token 占比来定，不能凭感觉写个整数。

**截断必须显式告知模型**——静默截断会让它以为文件就这么长，然后基于残缺内容改代码。

### `withTimeout<T>(p, ms, onTimeout?): Promise<T>`

超时抛错。`onTimeout` 用于 T13 杀进程。

## 验收

```bash
node --test test/guard.test.ts
npx tsc --noEmit
```

- [ ] `resolveInside(cwd, "a/b.txt")` 返回正确绝对路径
- [ ] `../etc/passwd` 抛错
- [ ] `a/../../x` 抛错（解析后才越界）
- [ ] 绝对路径指向 cwd 外抛错
- [ ] `cwd` 为 `/work` 时，`/workspace/x` 不被误判为合法
- [ ] 指向外部的符号链接抛错（Windows 上无权限创建 symlink 则 skip 该用例，不要让测试变红）
- [ ] `truncate` 超行数 / 超字节各截断一次，且输出含 `[truncated`
- [ ] 未超限时原样返回
- [ ] `withTimeout` 超时抛错、未超时正常返回，且 `onTimeout` 被调用
- [ ] 行数 ≤ 75

## 不要做

- 不实现权限系统 / 白名单配置（超纲）
- 不在这里读写文件——guard 只做检查

## 完成动作

`git commit -m "T10: path/output/time guards"`，看板标 `done`。
