# T11 · read / write 工具

> 课：L3 · 规格：[specs/03-coding.md「read」「write」](../specs/03-coding.md) · 预算：85 行（read 55 + write 30） · 前置：T10

## 目标

让 agent 能看见和落地文件。

## 要写的文件

- `src/tools/read.ts`（新建）
- `src/tools/write.ts`（新建）
- `test/read-write.test.ts`（新建，不计预算）

## 实现要点

### read

参数：`path`（必填）、`offset`（可选，1 起）、`limit`（可选）。

- 路径过 `resolveInside`，内容过 `truncate`。
- **输出带行号**，格式 `   12| const x = 1`。行号不是装饰：T12 的 `edit` 失败时要靠它定位，模型报告改动位置时也要引用它。
- 文件不存在返回 `error: file not found: <path>`（**不抛异常**，让模型自己换个路径重试）。
- 目录返回 `error: is a directory: <path>`。
- 二进制文件：读前抽样检测 `\0`，命中则返回 `error: binary file, cannot read as text`。
- 空文件返回明确的 `(empty file)`，不要返回空串——空串会让模型以为工具坏了。

### write

参数：`path`、`content`。

- 自动 `mkdir -p` 父目录。
- 覆盖已有文件（不做备份，交给 git）。
- 返回 `wrote <path> (<n> lines)`，给模型一个可核对的回执。
- 拒绝写入 `.git/` 下的任何路径。

## 验收

```bash
node --test test/read-write.test.ts
npx tsc --noEmit
```

用 `fs.mkdtemp` 建临时目录，**测试结束清理**：

- [ ] `write` 后 `read` 能拿到内容，行号格式正确
- [ ] `write` 到多层不存在的目录会自动创建
- [ ] 超 200 行的文件被截断且输出含 `[truncated`
- [ ] `offset` / `limit` 正确切片，且行号仍是**文件中的真实行号**（不是从 1 重排）
- [ ] 读不存在的文件返回 `error:` 文本而非抛异常
- [ ] 读目录返回 `error: is a directory`
- [ ] 读含 `\0` 的文件返回二进制错误
- [ ] 空文件返回 `(empty file)`
- [ ] 越界路径（`../`）两个工具都拒绝
- [ ] 写 `.git/config` 被拒绝
- [ ] 行数：`read.ts` ≤ 55、`write.ts` ≤ 30

## 不要做

- 不做文件监听、不做 diff 输出（T12 的 edit 才需要）
- 不做编码探测（一律按 UTF-8）

## 完成动作

`git commit -m "T11: read/write tools"`，看板标 `done`。
