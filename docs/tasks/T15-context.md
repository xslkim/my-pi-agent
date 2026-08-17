# T15 · token 估算与上下文裁剪

> 课：L4 · 规格：[specs/04-usable.md「上下文管理」](../specs/04-usable.md) · 预算：70 行 · 前置：T14

## 目标

多轮对话必然撑爆上下文窗口。实现一个**朴素但正确**的裁剪策略，重点在于理解「丢什么、怎么丢不出错」。

## 要写的文件

- `src/context.ts`（新建）
- `test/context.test.ts`（新建，不计预算）

## 实现要点

### `estimateTokens(s: string): number`

按 [specs/04-usable.md](../specs/04-usable.md) 的 CJK 感知公式实现（该公式来自对本地 Qwen3 tokenizer 的实测）：

- 中文约 1.5 字符/token，英文与代码约 3.3 字符/token
- 分别统计 CJK 字符数与其余字符数，加权求和，再乘一个保守系数

不要用 `length / 3` 一刀切：中文会被**低估一倍**，正好在长中文对话时溢出——而那恰恰是最常见的场景。

估算宁可偏高：低估的代价是 400 错误，高估的代价只是少几轮历史。

### `fitContext(messages, maxTokens): Message[]`

- **system 消息永远保留**，不参与裁剪
- 从最旧的非 system 消息开始丢，直到估算总量 ≤ `maxTokens`
- **assistant(带 tool_calls) 与它的全部 tool 消息必须整组丢弃**。只丢一半会造成「有 tool 结果没有对应调用」或反之，API 直接 400。这是 T08 那条消息顺序约束的延续。
- **最近一轮 user 消息必须保留**。如果连它都放不下，返回 system + 该消息并让请求自然报错，不要静默返回空数组。
- 裁掉内容时，插入一条 `{ role: "system", content: "[earlier conversation truncated]" }` 让模型知道有历史被丢了。

不做 LLM 摘要压缩——那需要额外一次请求和一套提示词工程，收益在教学场景不明显。这是刻意的取舍，[lessons/04-usable.md](../lessons/04-usable.md) 里要讲清楚。

## 验收

```bash
node --test test/context.test.ts
npx tsc --noEmit
```

- [ ] `estimateTokens` 对纯中文的估算 ≥ 实测值（用 spec 里记录的实测样本断言）
- [ ] 对纯英文代码估算与实测偏差在 30% 以内
- [ ] 未超限时 `fitContext` 原样返回
- [ ] 超限时丢弃最旧消息，system 仍在首位
- [ ] **tool 组原子性**：构造 `assistant(tool_calls) + tool + tool` 的历史，断言裁剪后不存在孤立的 tool 消息，也不存在 tool_calls 无结果的 assistant
- [ ] 最近一轮 user 消息永远存在
- [ ] 发生裁剪时插入了截断提示
- [ ] 行数 ≤ 70

## 不要做

- 不引入真实 tokenizer（会带依赖）
- 不做 LLM 摘要压缩

## 完成动作

`git commit -m "T15: context fitting"`，看板标 `done`。
