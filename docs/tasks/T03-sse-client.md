# T03 · SSE 解析与 streamChat

> 课：L1 · 规格：[specs/01-talk.md「核心实现」](../specs/01-talk.md) · 预算：120 行 · 前置：T02

## 目标

手写 OpenAI 兼容的流式客户端。**这是全课技术含量最高的一个任务**，三个坑必须全部处理对。

## 要写的文件

- `src/llm.ts`（新建）
- `test/llm.test.ts`（新建，不计预算）

## 实现要点

导出 `streamChat(opts): AsyncGenerator<StreamEvent>`。用 async generator，不用回调——`for await` 天然支持提前 `break`，T18 的中止会因此便宜很多。

请求体：

```jsonc
{
  "model": MODEL, "messages": [...], "stream": true,
  "stream_options": { "include_usage": true }
}
```

配置从环境变量读，**必填，不设默认值**，缺失时抛 `missing env LLM_BASE_URL; see README`。不要把内网 IP 和 key 写进源码。

### 坑 1：跨 chunk 缓冲

一个 SSE 事件可能被 TCP 切成两半。必须 `buffer += ...` 后循环找 `\n\n`，**绝不能对单个 chunk 做 `split("\n\n")`**。

### 坑 2：UTF-8 跨 chunk

`decoder.decode(chunk, { stream: true })`。少了 `{ stream: true }`，中文被切在字节中间时会吐 `<27>` 乱码。

### 坑 3：`done` 必须延迟发出

真实服务的末尾是这样的（本机抓包）：

```
data: {"choices":[{"finish_reason":"stop","index":0,"delta":{}}], ...}
data: {"choices":[],"usage":{"prompt_tokens":14,"completion_tokens":10,...}}
data: [DONE]
```

`finish_reason` 和 `usage` **不在同一块**，且 usage 块的 `choices` 是空数组。所以：把 `finishReason` 和 `usage` 存进局部变量，**收到 `[DONE]` 或流自然结束时才 yield 一次 `done`**。

在 `finish_reason` 出现时就 yield `done` 会导致 usage 永远丢失，而这个 bug 要到 T19 打印 token 用量时才暴露。

### 其它

- `data: [DONE]` 不是 JSON，判断在前，`JSON.parse` 在后。
- 首块 `delta.content` 是 **`null` 而非缺失**，用 `if (delta?.content)` 跳过；不要写 `if ("content" in delta)`。
- 思考字段只认 `reasoning_content`（llama.cpp 的字段名），产出 `thinking` 事件。
- `res.ok` 为假时抛错，错误信息要带**状态码和响应体**。
- `opts.signal` 透传给 `fetch`。
- `opts.tools` 有值时才放进请求体（本任务不产生 `tool_call_delta`，T07 再补）。

## 验收

```bash
node --test test/llm.test.ts
npx tsc --noEmit
```

测试全部用 T02 的假模型，**不得联网**：

- [ ] 正常流：三个 content 增量拼成完整文本
- [ ] **分片**：同一事件切成 2 段、3 段，结果不变
- [ ] **中文分片**：UTF-8 字节在中间断开，输出无乱码
- [ ] `reasoning_content` 产出 `thinking` 事件，与 `text` 分离
- [ ] **usage 末块**：脚本为「finish_reason 块 → `choices:[]` 的 usage 块 → `[DONE]`」，断言 `done` 事件**同时**带 `finishReason` 和 `usage`
- [ ] `delta.content: null` 不产生空 `text` 事件
- [ ] HTTP 500 抛出含状态码与响应体的错误
- [ ] `AbortController.abort()` 后生成器结束
- [ ] 行数 ≤ 120

## 不要做

- 不做重试（T17）
- 不做多 provider 兼容、不认 `reasoning` / `reasoning_text`
- 不产生 `tool_call_delta`（T07）

## 完成动作

`git commit -m "T03: hand-written SSE client"`，看板标 `done`。
