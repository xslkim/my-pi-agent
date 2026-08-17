# T06 · calculator 工具

> 课：L2 · 规格：[specs/02-tools.md「calculator」](../specs/02-tools.md) · 预算：40 行 · 前置：T05

## 目标

第一个工具。故意选一个模型**自己算不准、但正确答案唯一**的能力，这样工具是否真被调用一眼可辨。

## 要写的文件

- `src/tools/calculator.ts`（新建）
- `test/calculator.test.ts`（新建，不计预算）

## 实现要点

```ts
export const calculator: Tool = {
  name: "calculator",
  description: "Evaluate a basic arithmetic operation. Use this for any arithmetic; do not compute in your head.",
  parameters: { /* op: enum[add,sub,mul,div,pow], a: number, b: number */ },
  async execute(args) { ... }
};
```

- 用 `op` 枚举 + 两个操作数，**不要接受表达式字符串**。表达式意味着要写解析器或用 `eval`，前者浪费预算、后者是往教学代码里种后门。
- 除零返回错误文本 `error: division by zero`，不要抛异常也不要返回 `Infinity`。
- 返回值是给模型读的字符串，写成 `"21"` 这样的裸结果即可，不要包 JSON。
- description 里那句「do not compute in your head」很重要——没有它，模型经常绕过工具直接口算。

## 验收

```bash
node --test test/calculator.test.ts
npx tsc --noEmit
```

- [ ] `add/sub/mul/div/pow` 各一个用例结果正确
- [ ] `div` 除零返回错误文本且**不抛异常**
- [ ] 参数经 `validate` 后 `{"a":"3","b":"4","op":"mul"}` 得到 `"12"`
- [ ] 行数 ≤ 40

## 不要做

- 不支持表达式字符串、不引入 `eval` / `new Function`
- 不加三角函数等扩展运算（对教学目标无增量）

## 完成动作

`git commit -m "T06: calculator tool"`，看板标 `done`。
