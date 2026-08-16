# 第 2 课 · 让模型动手

> 目标：手写 tool calling 协议和 agent loop，让模型调用我们的工具、拿到结果后继续推理。
> 实现规格：[specs/02-tools.md](../specs/02-tools.md) · Tag `l2-tools` · 约 100 分钟

## 这节课要回答的问题

**聊天机器人和 agent 的区别到底是什么？**

答案短得让人失望：**一个 while 循环**。

模型本身不会执行任何东西，它只会输出「我想调用 calculator，参数是 a=21, b=2, op=*」这样一段文本。真正把它变成 agent 的，是我们写的那段循环：解析请求 → 执行 → 把结果塞回去 → 再问一次。这节课把这个循环写出来，你对 agent 的祛魅就完成了。

## 先修

第 1 课的 `streamChat` 能跑。

## 课堂流程

### 1. 让模型开口要工具（15 分钟）

在请求体里加一个 `tools` 字段：

```json
"tools": [{
  "type": "function",
  "function": {
    "name": "calculator",
    "description": "Compute a basic arithmetic expression on two numbers.",
    "parameters": { "type": "object", "properties": { ... }, "required": ["a","b","op"] }
  }
}]
```

再问「21 乘 2」，观察响应变了：`delta.content` 是空的，多出来 `delta.tool_calls`，`finish_reason` 变成 `"tool_calls"`。

**这就是全部魔法。** 模型没有执行任何计算，它只是按格式说了一句「请帮我调这个」。

### 2. 第一个坑：arguments 是碎片（20 分钟）

打印原始的 `tool_calls` 增量，学员会看到：

```
{"index":0,"id":"call_abc","function":{"name":"calculator","arguments":""}}
{"index":0,"function":{"arguments":"{\"a\""}}
{"index":0,"function":{"arguments":": 21, "}}
{"index":0,"function":{"arguments":"\"b\": 2}"}}
```

参数是**一片一片吐出来的字符串**，而且只有第一片带 `id` 和 `name`。必须按 `index` 累加，全部收完再 `JSON.parse`。中途 parse 一定失败——`{"a"` 不是合法 JSON。

让学员自己踩一次：先写「收到就 parse」的版本，看它炸掉。

### 3. 第二个坑：类型不是校验（20 分钟）

我们用 TypeScript 写 `execute(args: { a: number })`，但**类型在运行时不存在**。Node 25 的类型剥离只是把类型注解删掉，运行时什么都不检查。

而模型一定会传错。现场演示三种真实错误：

```json
{"a": "21", "b": 2, "op": "*"}     // 字符串而不是数字
{"a": 21, "b": 2}                   // 缺 op
{"name": "calc", ...}               // 调了不存在的工具
```

写一个 60 行的最小校验器。设计上有两个关键决定，都值得讨论：

**决定一：数字宽容转换。** `"21"` 自动转成 `21`。严格派会反对，但实测下来这是模型最高频的错误，容错的收益远大于纯度。

**决定二：校验失败不抛异常，把错误文本回给模型。**

```
Error: invalid arguments for calculator: field "op" is required
```

然后循环继续。模型看到错误会**自己改正重试**。这是 agent 的自愈机制，也是它看起来「有智能」的重要来源。让学员亲眼看一次模型自我纠错——这一幕比任何解释都有说服力。

### 4. 写 loop（25 分钟）

现场实现 `src/loop.ts`：

```
for step in 1..maxSteps:
    调 streamChat(messages, tools)
    收集文本和 tool_calls
    把 assistant 消息（含 tool_calls）追加进 messages
    if finish_reason != "tool_calls": 结束
    for each tool_call:
        校验 → 执行 → 追加 { role: "tool", tool_call_id, content }
```

三个必须强调的细节：

- **assistant 消息要连 `tool_calls` 一起回传**。少了它，下一轮的 `role: "tool"` 消息找不到对应的 `tool_call_id`，服务端直接 400。这个错误信息很不友好，值得预先打个预防针。
- **工具异常要捕获**，转成文本回给模型。一个除零错误不该让整个 agent 进程崩掉。
- **`maxSteps` 必须有。**

### 5. 故障注入 —— 死循环（15 分钟）

把假模型设成「永远返回同一个 tool_call」，然后把 `maxSteps` 去掉，跑起来。

学员会看到 agent 疯狂地反复调用同一个工具，上下文飞速膨胀，几十轮后服务端返回 400（超出 65536）。**在本地免费模型上，这一幕很便宜；在按 token 计费的云 API 上，这一幕很贵。**

真实模型也会陷入这种循环，尤其是工具持续返回错误的时候。所以 `maxSteps` 不是防御性编程的洁癖，是必需品。

### 6. 见真章（10 分钟）

```bash
node src/cli.ts "21 乘 2 等于多少？这个数有什么特别之处"
```

看着它：调用工具 → 得到 42 → 接着聊《银河系漫游指南》。

**它现在是一个 agent 了。** 只用了大约 550 行。

### 7. pi 对照（10 分钟）

打开 `pi/packages/agent/src/agent-loop.ts`：**796 行**，我们 120 行。

多出来的部分主要是：

| pi 有 | 干什么 | 我们为什么不做 |
|---|---|---|
| 并行工具执行 | 多个工具同时跑，按完成顺序发事件 | 串行够用，并行的竞态会淹没主线 |
| steering / follow-up 队列 | 跑到一半插话 | 交互功能，第 4 课再谈 |
| `beforeToolCall` / `afterToolCall` 钩子 | 权限拦截、结果改写 | 第 5 课需要时再手写一个确认 |
| 精细的中止语义 | 区分「中止流」和「中止工具」 | 第 4 课会自己踩一遍 |

看完这张表，学员应该有一个准确的感觉：**pi 的复杂度不是炫技，是把我们跳过的边界情况一个个补上。** 但对于理解 agent 是什么，120 行就够了。

## 练习

1. 加一个 `get_time` 工具，观察模型什么时候决定用它、什么时候不用。
2. 故意把工具 `description` 写得很含糊，看模型的调用准确率怎么变。**这是 prompt 工程最实在的一课。**
3. 让工具永远返回错误，观察模型重试几次后放弃。
4. 实现工具并行执行，并写一个测试证明结果顺序仍然稳定。
5. 思考题：模型同时要求调用 3 个工具，其中第 2 个抛异常，应该怎么处理才不会让对话状态损坏？

## 本课完成标准

- 真实 Qwen 下问 `21*2` 会调用 calculator 并给出 42
- 传字符串参数、缺字段、调不存在的工具，agent 都不崩且能自愈
- 死循环场景在 10 步内被 `maxSteps` 拦下
- 累计 ≤ 550 行，`node --test` 全绿且离线可跑
