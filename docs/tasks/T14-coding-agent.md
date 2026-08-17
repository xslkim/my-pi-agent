# T14 · system prompt + `--cwd`（L3 收尾）

> 课：L3 · 规格：[specs/03-coding.md「system prompt」](../specs/03-coding.md) · 预算：40 行（prompt 25 + cli 15） · 前置：T13

## 目标

把四个工具接进 CLI，写好 system prompt。**同一套工具配不同 prompt，行为差别巨大**——这一步是把「能调工具」变成「会干活」。

## 要写的文件

- `src/prompt.ts`（新建，25 行）
- `src/cli.ts`（修改，+15 行）

## 实现要点

`prompt.ts` 导出 `systemPrompt(cwd: string): string`，内容必须与 [specs/03-coding.md](../specs/03-coding.md) **逐字一致**（教学时会拿它逐条讲，不许自由发挥）。要点：

- 声明工作目录，声明所有路径都相对它
- **先读后改**：改文件前必须先 `read`
- `edit` 优先于 `write`（改动小、可追溯）
- 用 `bash` 验证自己的改动
- 结尾一句 `Explain what you changed.`

`cli.ts`：

- 加 `--cwd <dir>` 参数，默认 `process.cwd()`；解析成绝对路径后传进 `runAgent` 的 `ctx`。
- 注册四个工具：`read` / `write` / `edit` / `bash`（calculator 保留，无妨）。
- 把 system 消息放在 `messages[0]`。

## 验收

```bash
node --test
npx tsc --noEmit
```

自动化：

- [ ] 全量测试全绿且断网可跑
- [ ] `--cwd` 指向的目录被正确传给工具（可加一个小用例断言 `ctx.cwd`）

真机冒烟（手工，在 `demo/tmp` 下做，别在仓库根乱改）：

```bash
mkdir -p demo/tmp
node src/cli.ts --cwd demo/tmp "创建 hello.js，打印 hello world，然后用 node 跑一遍验证"
```

- [ ] agent 依次 `write` → `bash` 验证 → 汇报改动
- [ ] 让它改一个不存在的文件，能看到它先 `read` 失败再自行调整
- [ ] 让它访问 `../../etc/passwd`，被拒绝且 agent 能理解错误并放弃

## L3 收尾（本任务额外要做）

- [ ] 预算检查：`src/` 总行数 ≤ 900
- [ ] `npx tsc --noEmit` 无错
- [ ] 打 tag：`git tag l3-coding`
- [ ] 确认 `demo/tmp/` 已被 `.gitignore` 忽略

## 不要做

- 不加 `ls` / `grep`（T22，L5 才按真实缺口加）
- 不做危险命令确认（T23）

## 完成动作

`git commit -m "T14: coding agent prompt + --cwd"`，打 tag，看板标 `done`。
