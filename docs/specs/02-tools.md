# Spec 02 · 让模型动手（tool calling + agent loop）

> 课程：[lessons/02-tools.md](../lessons/02-tools.md) · Tag `l2-tools` · 行数预算 ≤ 250（累计 ≤ 550）

## 目标

模型能调用我们注册的工具，拿到结果后继续推理并给出最终答案。问「21 乘 2 等于多少，再说说这个数有什么特别」，agent 会先调 `calculator`，再基于 `42` 作答。

这一课把 L1 的「聊天客户端」变成「agent」。分界线只有一条：**loop**。

## 交付物

| 文件 | 职责 | 预算 |
|---|---|---|
| `src/tools/registry.ts` | `Tool` 接口、注册表、运行时参数校验 | 70 |
| `src/tools/calculator.ts` | 教学工具 | 40 |
| `src/loop.ts` | agent loop | 115 |
| `src/llm.ts` | 补 `tool_call_delta` 产出与 `tools` 请求参数（L1 已留位） | +15 |
| `src/cli.ts` | 改走 loop、显示工具调用 | +10 |
| `test/loop.test.ts` | loop 与工具测试 | — |

逐任务的拆分见 [tasks/T05–T09](../tasks/README.md)。

## 数据结构

```ts
// src/tools/registry.ts
export interface Tool {
  name: string;
  description: string;
  parameters: JsonSchema;                 // 手写 JSON Schema，直接发给模型
  execute(args: unknown, ctx: ToolContext): Promise<string>;
}

export interface ToolContext {
  cwd: string;
  signal?: AbortSignal;
}

export interface JsonSchema {
  type: "object";
  properties: Record<string, { type: string; description?: string; enum?: string[] }>;
  required?: string[];
}
```

`execute` 返回 `string`——工具结果最终都要变成文本塞回模型。返回结构化对象只会诱使学员以为模型能看见结构。

发给模型的形状（`llm.ts` 里包一层）：

```ts
{ type: "function", function: { name, description, parameters } }
```

## 核心实现

### 1. tool_call 增量拼接（本课第一个坑）

模型的工具调用是流式吐出来的。下面是**本机对真实服务的抓包**（已省略无关字段）：

```
delta: {"role":"assistant","content":null}
delta: {"tool_calls":[{"index":0,"id":"SQG4ApJz...","type":"function","function":{"name":"calculator","arguments":"{"}}]}
delta: {"tool_calls":[{"index":0,"function":{"arguments":"\"a\":"}}]}
delta: {"tool_calls":[{"index":0,"function":{"arguments":"2"}}]}
delta: {"tool_calls":[{"index":0,"function":{"arguments":"1"}}]}
delta: {"tool_calls":[{"index":0,"function":{"arguments":",\"b\":"}}]}
```

注意：只有**第一块**带 `id` 和 `name`，后续块只有 `index` 和 `arguments` 碎片，碎片可以细到单个字符（`"2"`、`"1"` 是分两块来的）。所以要按 `index` 累加：

```ts
// src/loop.ts 内的收集器
const pending = new Map<number, { id: string; name: string; args: string }>();

case "tool_call_delta": {
  const cur = pending.get(ev.index) ?? { id: "", name: "", args: "" };
  if (ev.id) cur.id = ev.id;
  if (ev.name) cur.name = ev.name;
  if (ev.argsDelta) cur.args += ev.argsDelta;
  pending.set(ev.index, cur);
  break;
}
```

流结束后才 `JSON.parse(cur.args)`。中途 parse 必然失败——`{"a": 2` 不是合法 JSON。

### 2. 运行时参数校验（第二个坑）

TypeScript 类型在运行时不存在，而模型**一定会**传错：`{"a": "21"}`（字符串而非数字）、缺字段、多字段、甚至调用不存在的工具。

`registry.ts` 里写一个 60 行的最小校验器：

```ts
export function validate(schema: JsonSchema, args: unknown): { ok: true; value: any } | { ok: false; error: string };
```

规则（够用即可，不追求完整 JSON Schema）：

- 顶层必须是对象
- `required` 字段必须存在
- `type` 检查 `string` / `number` / `boolean` / `array` / `object`
- **数字宽容转换**：`"21"` → `21`（模型高频错误，容错比报错更实用），但 `"abc"` 报错
- `enum` 成员检查
- 未知字段忽略（不报错）

校验失败**不抛异常**，而是把错误信息作为工具结果回给模型，让它自己改：

```
Error: invalid arguments for calculator: field "b" is required
```

这是 agent 的自愈机制——模型看到错误会重试。这一点比校验本身更重要。

### 3. Agent loop

```ts
export interface LoopOptions {
  messages: Message[];
  tools: Tool[];
  cwd: string;
  maxSteps?: number;                       // 默认 10
  signal?: AbortSignal;
}

export async function* runAgent(opts: LoopOptions): AsyncGenerator<AgentEvent>;
```

**做成 async generator 而不是「`Promise` + `onEvent` 回调」**，理由有三条，每条都在后面几课兑现：与 `streamChat` 同构（两层都是 `for await`，心智负担只有一份）；调用方 `break` 即中止，L4 的 `Ctrl+C` 几乎不用额外代码；测试里直接把事件收集成数组做断言，不用搭回调桩。

代价是调用方必须消费完生成器，否则 `finally` 不执行——这一点要在课上点明。

伪码：

```
for step in 1..maxSteps:
    调 streamChat(messages, tools)
    边流边 yield 事件（文本增量、思考、工具调用）
    收集 text 与 pending tool_calls
    把 assistant 消息（含 tool_calls）追加进 messages
    if 没有 tool_calls: return                             // 正常结束
    for each tool_call:
        找工具 → validate → execute（捕获异常转成文本）
        追加 { role: "tool", tool_call_id, content }
        yield 工具结果事件
yield 一个 error 事件（超出 maxSteps）
```

关键点：

- **loop 内部不许 `console.log`**。所有输出都经 yield 交给 CLI，否则 loop 没法在测试里安静地跑，也没法换一个前端。

- **`maxSteps` 必须有**。模型会陷入「反复调同一个工具」的循环，没有上限就把 64K 上下文烧光，然后报 400。
- **工具异常要捕获**，转成 `Error: ...` 文本回给模型，而不是崩掉整个进程。
- **assistant 消息必须带 `tool_calls` 一起回传**，否则下一轮请求里 `role: "tool"` 消息会因为找不到对应的 `tool_call_id` 被服务端拒绝。
- **回传的 `tool_calls` 要用线上格式**：`{id, type: "function", function: {name, arguments}}`。内部的 `ToolCall` 是扁平的 `{id, name, arguments}`，直接原样发会被 llama.cpp 以 500 拒绝（`Missing tool call type`）——真机实测踩到，转换放在 `llm.ts` 发请求处。
- 工具**串行执行**即可。并行不进主线，留作练习（[lesson 02 练习 4](../lessons/02-tools.md#练习)）——它带来的竞态、事件顺序和错误聚合会淹没这一课的主题。

### 4. calculator 工具

```ts
export const calculator: Tool = {
  name: "calculator",
  description: "Compute a basic arithmetic operation on two numbers. Use this for any arithmetic; do not compute it yourself.",
  parameters: {
    type: "object",
    properties: {
      a: { type: "number" },
      b: { type: "number" },
      op: { type: "string", enum: ["+", "-", "*", "/"] },
    },
    required: ["a", "b", "op"],
  },
  async execute(args) {
    const { a, b, op } = args as { a: number; b: number; op: string };
    if (op === "/" && b === 0) throw new Error("division by zero");
    return String(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b);
  },
};
```

## 测试（离线，用 L1 的假模型）

| 用例 | 断言 |
|---|---|
| 完整 loop | 假模型第一轮返回 `tool_calls`，第二轮返回文本；最终消息序列为 user → assistant(tool_calls) → tool → assistant |
| **args 分片** | `arguments` 被切成 5 个碎片，仍能正确 parse |
| **类型宽容** | 传 `{"a": "21", "b": 2}` 能算出 42 |
| **校验失败自愈** | 缺 `op` 时工具结果是错误文本，loop 继续而非崩溃 |
| 未知工具 | 结果是 `Error: unknown tool: xxx`，loop 继续 |
| 工具抛异常 | 除零错误变成文本回给模型 |
| **maxSteps** | 假模型永远返回 tool_calls，到上限后产出 error 事件并停止，不再发起新请求 |
| abort | 工具执行中 abort，loop 干净退出 |

## 验收

1. 真实 Qwen 下问 `21*2` 会调用 calculator 并给出 42。
2. 上表全部测试绿，断网可跑。
3. 累计 ≤ 550 行；`tsc --noEmit` 无错。
4. 故意让模型传字符串参数，agent 不崩。

## 不做

并行工具、工具流式进度、权限确认、嵌套 agent。
