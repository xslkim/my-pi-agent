# T15 · token 估算与上下文裁剪

> 课：L4 · 规格：[specs/04-usable.md「3. 上下文预算」](../specs/04-usable.md) · 预算：70 行 · 前置：T14

## 目标

多轮对话必然撑爆上下文窗口。实现一个**朴素但正确**的裁剪策略，重点在于理解「丢什么、怎么丢不出错」。

## 要写的文件

- `src/context.ts`（新建）
- `test/context.test.ts`（新建，不计预算）

## 实现要点

### `estimateTokens(s: string): number`

按 [specs/04-usable.md](../specs/04-usable.md) 的实测系数实现，**照抄那两个数字，不要再自行加保守系数**（余量已经含在里面了，叠加会导致过早裁剪）：

```ts
const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/g;
export function estimateTokens(s: string): number {
  const cjk = (s.match(CJK) ?? []).length;
  return Math.ceil(cjk * 0.7 + (s.length - cjk) / 3.5);   // 实测 0.58 / 3.7，各留约 20% 余量
}
```

签名收 `string` 而不是 `Message[]`——更可组合，`fitContext` 里再套一层消息循环即可。

不要用 `length / 3` 一刀切：中文会被**低估约 1.8 倍**，正好在长中文对话时溢出——而那恰恰是最常见的场景。反过来按 1 token/字也不行，比实测高 1.7 倍，会在真实用量只有 60% 时就开始裁剪。

### `fitContext(messages, budget): Message[]`

- **system 消息永远保留**，不参与裁剪
- 从最旧的非 system 消息开始丢，直到估算总量 ≤ `budget`
- **assistant(带 tool_calls) 与它的全部 tool 消息必须整组丢弃**。只丢一半会造成「有 tool 结果没有对应调用」或反之，API 直接 400。这是 T08 那条消息顺序约束的延续。
- **优先保留最近 4 轮**：只有在丢光更早的历史仍然超预算时，才动这 4 轮。
- **最近一轮 user 消息是硬底线**。如果连它都放不下，返回 system + 该消息并让请求自然报错，不要静默返回空数组——静默返回空数组会让模型答非所问，而报错至少能被看见。
- 裁掉内容时，插入一条 `{ role: "system", content: "[earlier conversation trimmed]" }` 让模型知道有历史被丢了。

不做 LLM 摘要压缩——那需要额外一次请求和一套提示词工程，收益在教学场景不明显。这是刻意的取舍，[lessons/04-usable.md](../lessons/04-usable.md) 里要讲清楚。

## 验收

```bash
node --test test/context.test.ts
npx tsc --noEmit
```

- [ ] `estimateTokens` 对纯中文的估算 ≥ 实测值（spec 04 的样本：97 字 = 56 token）
- [ ] 对代码样本的估算 ≥ 实测值且不超过 1.5 倍（spec 04 的样本：249 字符 = 68 token）
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
