# T22 · ls / grep 工具

> 课：L5 · 规格：[specs/05-delivery.md「三、我们要补的能力」](../specs/05-delivery.md) · 预算：110 行（ls 45 + grep 65） · 前置：T21

## 目标

补上 [run1](T21-bare-run.md) 暴露出的最大缺口：agent 看不见项目结构，只能猜文件名。

**先确认 run1 里确实观察到了这个现象再动手。** 如果没有，说明前提变了，回到 T21 重新对齐。

## 要写的文件

- `src/tools/ls.ts`（新建，45 行）
- `src/tools/grep.ts`（新建，65 行）
- `test/ls-grep.test.ts`（新建，不计预算）
- `src/cli.ts`（注册两个工具，几行，含在预算内）

## 实现要点

### ls

参数：`path`（可选，默认 `.`）、`recursive`（可选，默认 false）。

- 过 `resolveInside`。
- 默认**跳过** `node_modules` / `.git` / `.agent`。不跳过的话，一次 `ls -R` 就能把上下文冲垮。
- 目录名后加 `/`，文件显示大小。
- 递归时限制最多 200 条，超出提示 `... and N more`。

### grep

参数：`pattern`（必填，正则）、`path`（可选，默认 `.`）、`glob`（可选，如 `*.ts`）。

- 用 `RegExp`，**非法正则要返回 `error: invalid regex: ...` 而不是抛异常**——模型写错正则很常见。
- 输出 `文件:行号:内容`，与 `read` 的行号体系一致，模型可以直接拿去 `read`。
- 每个文件最多 20 条匹配，总共最多 100 条，超出明确提示。
- 跳过二进制文件和被忽略目录。
- 单行内容超过 200 字符时截断（压缩过的文件会有超长行）。

两个工具都要给 `execute` 加**整体耗时保护**（复用 `withTimeout`），大目录递归可能很慢。

## 验收

```bash
node --test test/ls-grep.test.ts
npx tsc --noEmit
```

在临时目录构造一个小项目树：

- [ ] `ls` 列出目录与文件，目录带 `/`
- [ ] `ls` 默认跳过 `node_modules` 和 `.git`
- [ ] `recursive: true` 能列出嵌套内容，超 200 条时有提示
- [ ] `grep` 找到匹配，输出 `file:line:content` 格式
- [ ] `grep` 的 `glob` 过滤生效
- [ ] **非法正则**返回 error 文本，不抛异常
- [ ] 匹配数超限时有明确提示
- [ ] 二进制文件被跳过
- [ ] 越界路径两个工具都拒绝
- [ ] 行数：`ls.ts` ≤ 45、`grep.ts` ≤ 65

## 不要做

- 不实现 glob 库级别的完整语法（`*.ts` 这种后缀匹配够用）
- 不做 ripgrep 式的并行 / mmap 优化
- 不加 `find` 等更多工具（预算不够，且 ls + grep 已覆盖 run1 的缺口）

## 完成动作

`git commit -m "T22: ls/grep tools"`，看板标 `done`。
