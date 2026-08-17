# T12 · edit 工具（唯一匹配）

> 课：L3 · 规格：[specs/03-coding.md「edit」](../specs/03-coding.md) · 预算：60 行 · 前置：T11

## 目标

实现字符串替换式编辑。**唯一匹配约束是这个工具的全部设计要点**——理解了它，就理解了为什么现代 coding agent 都这么做。

## 要写的文件

- `src/tools/edit.ts`（新建）
- `test/edit.test.ts`（新建，不计预算）

## 实现要点

参数：`path`、`old_string`、`new_string`、`replace_all`（可选，默认 false）。

核心规则：

- `old_string` 在文件中出现 **0 次** → `error: old_string not found in <path>`
- 出现 **≥2 次** 且未开 `replace_all` → 报错，并**列出所有匹配的行号**：
  ```
  error: old_string found 3 times in src/app.ts (lines 12, 45, 78).
  Provide more surrounding context to make it unique, or set replace_all.
  ```
- 恰好 1 次 → 替换，返回 `edited <path> (1 replacement at line N)`
- `replace_all: true` → 全替换，返回替换次数

为什么不用行号定位改：模型看到的文件内容和它调用工具时的文件状态**可能已经不同**（前一步刚改过），行号会漂移，按行号改会静默改错地方。唯一字符串匹配把「定位错误」变成**可检测的失败**——这是它唯一的、也是决定性的优势。

为什么失败信息要带行号：这是给模型的**可执行修复指引**。只说「找到 3 处」它无从下手；给出行号，它会去 `read` 那几行、补上下文再重试。

其它：

- 保持原文件的换行风格（若原文是 CRLF 就别改成 LF）。
- 路径过 `resolveInside`；文件不存在返回 `error:` 文本。
- `old_string === new_string` 时报错，避免模型空转。

## 验收

```bash
node --test test/edit.test.ts
npx tsc --noEmit
```

- [ ] 唯一匹配成功替换，返回信息含行号
- [ ] 0 次匹配返回 `not found` 错误
- [ ] **3 次匹配返回错误且信息里含全部 3 个行号**
- [ ] `replace_all: true` 时 3 处全被替换，返回次数 3
- [ ] 多行 `old_string` 能正确匹配替换
- [ ] CRLF 文件编辑后仍是 CRLF
- [ ] `old_string === new_string` 报错
- [ ] 越界路径被拒绝
- [ ] 行数 ≤ 60

## 不要做

- 不做模糊匹配 / 缩进自适应（会把「定位错误」重新变回静默失败）
- 不做多文件批量编辑
- 不生成 diff 展示（CLI 层的事，且不在预算内）

## 完成动作

`git commit -m "T12: edit tool with uniqueness constraint"`，看板标 `done`。
