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

node src/cli.ts "你好"    # 单发
node src/cli.ts           # REPL（L4 起）
node --test               # 全部测试，离线可跑
npx tsc --noEmit          # 类型检查
```

三个环境变量必填，代码里不设默认值。上面的地址与 key 是本机自用环境，分享前请替换。
