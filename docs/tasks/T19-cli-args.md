# T19 · CLI 参数整合（L4 收尾）

> 课：L4 · 规格：[specs/04-usable.md「CLI」](../specs/04-usable.md) · 预算：20 行 · 前置：T18

## 目标

把 L4 的四块（上下文、会话、重试、REPL）从命令行接通，做出一个**别人拿去能用**的 CLI。这是 L5 的施工工具，必须先顺手。

## 要写的文件

- `src/cli.ts`（修改，+20 行）

## 实现要点

参数（用 `node:util` 的 `parseArgs`，零依赖）：

| 参数 | 含义 | 默认 |
|---|---|---|
| `[prompt]` | 有则单发，无则进 REPL | — |
| `--cwd <dir>` | 工作目录 | `process.cwd()` |
| `-s, --session <name>` | 会话文件名 | 时间戳 |
| `-c, --continue` | 续上该会话 | false |
| `--max-steps <n>` | loop 步数上限 | 10 |
| `--max-tokens <n>` | 上下文预算 | 24000 |
| `--no-thinking` | 隐藏思考内容 | false |
| `-h, --help` | 用法 | — |

- `--help` 输出要**包含一个能直接复制运行的例子**。
- 无 prompt 时进 REPL；有 prompt 时单发后退出（脚本和 L5 都依赖这个行为）。
- `-c` 配合 `-s` 时从 JSONL 恢复历史。
- 参数解析失败打印用法并退出码 1。

## 验收

```bash
node --test
npx tsc --noEmit
```

自动化：

- [ ] 全量测试全绿且断网可跑
- [ ] `node src/cli.ts --help` 退出码 0，输出含全部参数
- [ ] 非法参数退出码 1

真机冒烟（手工）：

- [ ] `node src/cli.ts` 进入 REPL，连续三轮对话上下文连贯
- [ ] `Ctrl+C` 中止一次生成后仍能继续对话，再按一次退出
- [ ] `node src/cli.ts -s demo -c` 能读回上次会话并接着聊
- [ ] `--no-thinking` 确实隐藏思考内容
- [ ] 聊到超过 `--max-tokens 2000` 时能看到截断提示且不报 400

## L4 收尾（本任务额外要做）

- [ ] 预算检查：`src/` 总行数 ≤ 1200
- [ ] `npx tsc --noEmit` 无错
- [ ] 打 tag：`git tag l4-usable`
- [ ] 更新根 [README.md](../../README.md) 的用法段落，与 `--help` 一致

## 不要做

- 不加配置文件（环境变量 + 参数够用）
- 不做 shell 补全脚本

## 完成动作

`git commit -m "T19: CLI argument integration"`，打 tag，看板标 `done`。
