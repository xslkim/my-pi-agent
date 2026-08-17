# T05 · Tool 接口与运行时参数校验

> 课：L2 · 规格：[specs/02-tools.md「数据结构」「运行时参数校验」](../specs/02-tools.md) · 预算：70 行 · 前置：T04

## 目标

定义 `Tool` 接口，并写一个够用的运行时参数校验器。**类型在运行时不存在，而模型一定会传错**——这个校验器是 agent 不崩的关键。

## 要写的文件

- `src/tools/registry.ts`（新建）
- `test/registry.test.ts`（新建，不计预算）

## 实现要点

```ts
export interface Tool {
  name: string;
  description: string;
  parameters: JsonSchema;      // 手写 JSON Schema，直接发给模型
  execute(args: unknown, ctx: ToolContext): Promise<string>;
}
export interface ToolContext { cwd: string; signal?: AbortSignal }
```

`execute` 返回 `string`——工具结果最终都要变成文本回给模型，返回结构化对象会让人误以为模型能看见结构。

校验器：

```ts
export function validate(schema: JsonSchema, args: unknown):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };
```

规则（够用即可，不要实现完整 JSON Schema）：

- 顶层必须是对象，否则 `ok: false`
- `required` 列出的字段必须存在
- 检查 `string` / `number` / `boolean` / `array` / `object`
- **数字宽容转换**：`"21"` → `21`（模型最高频的错误，容错收益远大于纯度）；但 `"abc"` 必须报错
- `enum` 成员检查
- 未知字段忽略，不报错

**错误信息是写给模型看的**，必须具体到字段名，例如：

```
invalid arguments for calculator: field "op" is required
invalid arguments for calculator: field "a" must be a number, got "abc"
```

再导出一个把工具转成 API 格式的函数：

```ts
export function toApiTools(tools: Tool[]): unknown[];   // { type:"function", function:{ name, description, parameters } }
```

## 验收

```bash
node --test test/registry.test.ts
npx tsc --noEmit
```

- [ ] 缺 required 字段 → `ok: false`，错误信息含该字段名
- [ ] `{"a": "21"}` → `ok: true` 且 `value.a === 21`（数字类型）
- [ ] `{"a": "abc"}` → `ok: false`
- [ ] `enum` 取值不在列表 → `ok: false`
- [ ] 多余字段被忽略，不报错
- [ ] 顶层传数组或 `null` → `ok: false`，不抛异常
- [ ] `toApiTools` 输出结构符合 OpenAI 格式
- [ ] 行数 ≤ 70

## 不要做

- 不实现嵌套对象的深度校验（本课工具都是扁平参数）
- 不用第三方校验库（零依赖）
- 不在校验失败时抛异常——返回 `ok: false`，由 T08 的 loop 决定怎么回给模型

## 完成动作

`git commit -m "T05: tool interface + runtime validation"`，看板标 `done`。
