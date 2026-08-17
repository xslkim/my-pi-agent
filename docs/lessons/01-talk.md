# 第 1 课 · 让模型说话

> 目标：手写一个 SSE 客户端，在终端里逐字看到本地大模型的回答和它的思考过程。
> 实现规格：[specs/01-talk.md](../specs/01-talk.md) · Tag `l1-talk` · 约 90 分钟

## 这节课要回答的问题

**「调用一次大模型」到底发生了什么？**

大多数人只用过 SDK 的 `client.chat.completions.create()`。这节课我们把 SDK 扔掉，用 `fetch` 和一个字符串缓冲区，从字节层面把它重新造出来。造完你会发现：所谓 LLM API，就是一个会分期付款的 HTTP POST。

## 先修

- 会用 `async` / `await`、异步迭代 `for await`
- 知道 HTTP 请求头和响应体是什么
- 不需要懂 AI

## 环境（5 分钟）

```bash
node -v          # 需要 >= 23.6（类型剥离从 23.6 起默认开启），本课在 v25.2.1 验证
export LLM_BASE_URL="http://192.168.3.28:8080/v1"
export LLM_API_KEY="sk-local-qwen36"
export LLM_MODEL="qwen3.8-27b"
curl -s $LLM_BASE_URL/models -H "Authorization: Bearer $LLM_API_KEY"
```

看到 `qwen3.8-27b` 就绪。这三个环境变量**必填**，代码里不给默认值——不把内网 IP 和 key 硬编码进源码，换机器只改环境变量。

整个项目**零依赖**：Node 能直接运行 `.ts`，测试用内置的 `node --test`，不需要 npm install 任何东西。

## 课堂流程

### 1. 先看协议（15 分钟）

不写代码，先用 curl 看一眼真实的字节流：

```bash
curl -N $LLM_BASE_URL/chat/completions \
  -H "Authorization: Bearer $LLM_API_KEY" -H "content-type: application/json" \
  -d '{"model":"qwen3.8-27b","stream":true,"messages":[{"role":"user","content":"数到三"}]}'
```

屏幕上滚过的是：

```
data: {"choices":[{"delta":{"content":"一"}}]}

data: {"choices":[{"delta":{"content":"、"}}]}

...
data: [DONE]
```

带着学员逐字段读：`delta.content` 是正文增量，`delta.reasoning_content` 是思考增量（llama.cpp 特有），`finish_reason` 表示为什么停下。**要求学员当场说出：为什么是 `data:` 开头、为什么用两个换行分隔。**

### 2. 写一个天真的解析器（15 分钟）

故意先写错的版本：

```ts
for await (const chunk of res.body) {
  for (const line of decoder.decode(chunk).split("\n\n")) { ... }
}
```

问学员：这有什么问题？（多数人答不出来，正好引出下一节。）

### 3. 故障注入 —— 把它弄坏（20 分钟）

这是本课最重要的环节。我们不等真实网络偶发地暴露 bug，而是**主动伪造**。

写 `test/fake-llm.ts`：一个 `node:http` 服务器，按脚本把 SSE 内容分成任意字节块写回去。然后构造两个致命场景：

**场景 A：事件被切成两半**

```ts
chunks: ['data: {"choices":[{"delta":{"con', 'tent":"hi"}}]}\n\n']
```

天真解析器直接 `JSON.parse` 报错。

**场景 B：中文被切在字节中间**

```ts
// "你" 的 UTF-8 是 e4 bd a0，把它切在 e4 | bd a0
```

天真解析器吐出 `<27>` 乱码。

修法两行，但必须让学员先看见坏掉：

1. 用**跨 chunk 的缓冲区**：`buffer += ...`，循环找 `\n\n` 才切
2. `decoder.decode(chunk, { stream: true })`，让解码器自己保留不完整的字节

**这个假模型服务器会跟着我们到第 5 课。** 它让所有测试离线、毫秒级、可复现。能伪造协议，说明你真的懂协议。

### 4. 写对的版本（20 分钟）

现场实现 `src/llm.ts` 的 `streamChat()`，做成 async generator：

```ts
export async function* streamChat(opts: ChatOptions): AsyncGenerator<StreamEvent>
```

为什么用生成器而不是回调：`for await` 天然支持提前 `break`（用户按 Ctrl+C），也不用自己管背压。第 4 课的中止功能会因此便宜很多。

**这里还埋着一个只有看真实字节才会发现的坑。** 把流的最后几块打出来：

```
data: {"choices":[{"finish_reason":"stop","index":0,"delta":{}}], ...}
data: {"choices":[],"usage":{"prompt_tokens":14,"completion_tokens":10,...}}
data: [DONE]
```

`finish_reason` 和 `usage` **不在同一块里**，而且带 usage 的那块 `choices` 是空数组。所以「看到 finish_reason 就发 done 并带上 usage」永远拿不到 usage——第 4 课要打印每轮 token 用量时才会发现，那时候已经很难联想到是这里的问题。正确做法是把两者先存起来，流结束时再统一发 `done`。

这也是本课想传达的态度：**协议要看真实字节，不要看想象。**

然后 `src/render.ts` 把 `thinking` 事件用暗色输出、`text` 正常输出，`src/cli.ts` 串起来。

### 5. 见真章（10 分钟）

```bash
node src/cli.ts "用三句话解释什么是 SSE"
```

看着字一个个蹦出来。这时候提醒学员：**这还不是 agent，它只会说话，不会做事。** 下节课给它装手。

### 6. pi 对照（10 分钟）

打开 `pi/packages/ai/src/api/openai-completions.ts`。

| | 我们 | pi |
|---|---|---|
| 行数 | ~120 | **1577** |
| 服务的端点 | 1 个 llama.cpp | 40+ 家 provider |

跳到第 489 行附近，看 pi 怎么处理思考字段：

```ts
const reasoningFields = ["reasoning_content", "reasoning", "reasoning_text"];
```

三个字段名，因为不同厂商各起各的；还得判断重复（chutes.ai 同时返回两个相同内容）。我们只认 `reasoning_content`，因为我们只服务一个端点。

**结论要说清楚**：那多出来的 1400 行不是废话，是兼容性税。你的 agent 只打一个端点时，不必交这个税。

## 练习

1. 给 `streamChat` 加一个 `onFirstToken` 回调，测出局域网模型的首字延迟。
2. 假模型加一个「中途断开连接」的脚本，让客户端优雅报错而不是挂起。
3. 支持 `--no-thinking`：请求体里带 `chat_template_kwargs: { enable_thinking: false }`，对比响应差异。
4. 思考题：如果服务端发来的 `data:` 后面没有空格，我们的解析器还能工作吗？改一版更健壮的。

## 本课完成标准

- `node src/cli.ts "你好"` 有流式输出，思考与正文可区分
- `node --test` 全绿，**拔掉网线也能跑**
- 新增 ≤ 300 行，`npx tsc --noEmit` 无错
