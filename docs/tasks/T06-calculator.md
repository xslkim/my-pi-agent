# T06 · calculator 工具

> 课：L2 · 规格：[specs/02-tools.md「calculator」](../specs/02-tools.md) · 预算：40 行 · 前置：T05

## 目标

第一个工具。故意选一个模型**自己算不准、但正确答案唯一**的能力，这样工具是否真被调用一眼可辨。

## 要写的文件

- `src/tools/calculator.ts`（新建）
- `test/calculator.test.ts`（新建，不计预算）

## 实现要点

按 [spec 02 的代码原样实现](../specs/02-tools.md)：`op` 是 `["+", "-", "*", "/"]` 枚举，`a` / `b` 是 number，三个都必填。

- 用 `op` 枚举 + 两个操作数，**不要接受表达式字符串**。表达式意味着要写解析器或用 `eval`，前者浪费预算、后者是往教学代码里种后门。
- 除零**抛异常** `new Error("division by zero")`。这里刻意不自己返回错误文本——它要用来验证 [T08](T08-agent-loop.md) 的「工具异常被捕获成消息回给模型」这条路径确实生效。全项目只有这一个会抛异常的工具，它是那条自愈路径的活体测试。
- 返回值是给模型读的字符串，写成 `"42"` 这样的裸结果即可，不要包 JSON。
- description 里点明「用它做算术，不要自己心算」，否则模型经常绕过工具直接口算。

## 验收

```bash
node --test test/calculator.test.ts
npx tsc --noEmit
```

- [ ] `+` `-` `*` `/` 各一个用例结果正确
- [ ] 除零抛出 `division by zero`（捕获它的是 loop，不是本工具）
- [ ] 参数经 `validate` 后 `{"a":"3","b":"4","op":"*"}` 得到 `"12"`
- [ ] 行数 ≤ 40

## 不要做

- 不支持表达式字符串、不引入 `eval` / `new Function`
- 不加三角函数等扩展运算（对教学目标无增量）

## 完成动作

`git commit -m "T06: calculator tool"`，看板标 `done`。
