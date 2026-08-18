# my-pi-agent

从零手写一个 coding agent 的教学项目。五课，全部自己实现，**零运行时依赖**。
[earendil-works/pi](https://github.com/earendil-works/pi) 作为只读参考实现放在 `pi/` 子模块里，不作为依赖引入。

方案与课程：**[docs/teaching-agent-plan.md](docs/teaching-agent-plan.md)**
（实现规格 [docs/specs/](docs/specs/) · 执行任务 [docs/tasks/](docs/tasks/) · 教学脚本 [docs/lessons/](docs/lessons/)）

开工从 [docs/tasks/README.md](docs/tasks/README.md) 的 T00 开始，按编号顺序做。

## 运行

需要 Node >= 23.6（类型剥离默认开启），无需 `npm install`。

```bash
export LLM_BASE_URL="http://192.168.3.28:8080/v1"   # 局域网 llama.cpp
export LLM_API_KEY="sk-local-qwen36"
export LLM_MODEL="qwen3.8-27b"

node src/cli.ts "你好"                  # 单发
node src/cli.ts                         # REPL（Ctrl+C 中止本轮，再按退出）
node src/cli.ts "改一下" --cwd demo/tmp # 指定工作目录
node src/cli.ts -s work                 # 会话存 .agent/sessions/work.jsonl
node src/cli.ts -s work -c "接着说"     # 续聊
npm test                                # 全部单元测试，离线可跑
npx tsc --noEmit                        # 类型检查
```

常用参数：`--cwd <dir>` 工作目录 · `-s/--session <name>` 会话名 · `-c/--continue` 续聊 ·
`--max-steps <n>` 步数上限（默认 10）· `--context-budget <n>` 上下文预算（默认 24000）·
`--no-thinking` 隐藏思考 · `--yolo` 跳过危险命令确认 · `-h/--help` 完整用法。

三个环境变量必填，代码里不设默认值。上面的地址与 key 是本机自用环境，分享前请替换。

## 五课标签（回到任意一课的代码状态）

```bash
git checkout l1-talk       # 第 1 课：手写 SSE 客户端（176 行）
git checkout l2-tools      # 第 2 课：tool calling + agent loop（累计 422 行）
git checkout l3-coding     # 第 3 课：read/write/edit/bash 四工具（累计 735 行）
git checkout l4-usable     # 第 4 课：REPL/会话/上下文/重试（累计 1066 行）
git checkout l5-delivery   # 第 5 课：agent 交付登录应用，冒烟 10/10（累计 1106 行）
```

最后一课的两次实战记录见 [docs/runs/](docs/runs/)——run1 的 bash 死锁事故与修复、run1→run2 对比。
