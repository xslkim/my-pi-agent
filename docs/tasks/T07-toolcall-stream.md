# T07 · tool_call 增量解析

> 课：L2 · 规格：[specs/02-tools.md「工具调用的流式拼接」](../specs/02-tools.md) · 预算：15 行（`llm.ts` 增量） · 前置：T06

## 目标

让 `streamChat` 认识 `delta.tool_calls`，产出 `tool_call_delta` 事件。改动很小，但**这是 L2 最容易写错的地方**。

## 要写的文件

- `src/llm.ts`（修改，+15 行）
- `test/llm-toolcall.test.ts`（新建，不计预算）

## 实现要点

真实服务发来的分片长这样（本机 llama.cpp 抓包）：

```
{"index":0,"id":"call_abc","type":"function","function":{"name":"calculator","arguments":""}}
{"index":0,"function":{"arguments":"{\""}}
{"index":0,"function":{"arguments":"op"}}
{"index":0,"function":{"arguments":"\":\""}}
{"index":0,"function":{"arguments":"mul"}}
...
```

三条铁律：

1. **`index` 是唯一身份**，不是 `id`。`id` 只在第一片出现，后续片只有 `index` 和 `arguments`。用 `id` 做 key 会导致后续分片全部丢失。
2. `arguments` 是**字符串碎片**，只能字符串拼接。中间任何一刻 `JSON.parse` 都会失败——所以本层**绝不解析**，只透传碎片。
3. 碎片可以细到单个引号。不要假设一片是一个完整的 key 或 value。

产出事件：

```ts
{ type: "tool_call_delta", index, id?, name?, argsDelta? }
```

`llm.ts` 只做「把 delta 原样转成事件」。**累积成完整 `ToolCall` 是 T08 loop 的职责**——分层清楚，`llm.ts` 才能保持无状态。

同时确认 T03 已实现的 `opts.tools` 会通过 `toApiTools` 进请求体。

## 验收

```bash
node --test test/llm-toolcall.test.ts
npx tsc --noEmit
```

- [ ] 上面那种逐字符 `arguments` 脚本，产出的 `argsDelta` 按序拼接后等于完整 JSON
- [ ] 只有第一个事件带 `id` 和 `name`，后续事件不带
- [ ] **两个并行 tool_call**（`index` 0 和 1 交替出现）能按 `index` 正确分离
- [ ] `finish_reason: "tool_calls"` 出现在 `done` 事件里
- [ ] 请求体里含 `tools` 字段（用假服务器的 `requests` 断言）
- [ ] `llm.ts` 总行数 ≤ 135

## 不要做

- 不在 `llm.ts` 里做 `JSON.parse` 或累积状态
- 不在这里执行工具

## 完成动作

`git commit -m "T07: streaming tool_call deltas"`，看板标 `done`。
