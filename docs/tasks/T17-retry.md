# T17 · 请求重试

> 课：L4 · 规格：[specs/04-usable.md「重试」](../specs/04-usable.md) · 预算：40 行 · 前置：T16

## 目标

本地推理服务会因为显存、并发、模型加载而偶发失败。加一层克制的重试，让长任务不会因为一次抖动前功尽弃。

## 要写的文件

- `src/retry.ts`（新建）
- `src/llm.ts`（接入，含在本任务预算内）
- `test/retry.test.ts`（新建，不计预算）

## 实现要点

```ts
export async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts?: {
  retries?: number; baseMs?: number; signal?: AbortSignal;
}): Promise<T>;
```

- 默认重试 3 次，指数退避 `baseMs * 2^n`（500 / 1000 / 2000），加 ±20% 抖动。
- **只重试可恢复错误**：网络错误、超时、HTTP 429、5xx。
- **绝不重试** 4xx（除 429）：400 通常是消息结构错（比如 T15 裁坏了 tool 组），重试只会把同样的错误再发三遍、浪费 30 秒并掩盖真正的 bug。
- `signal` 已中止时立即抛出，不再等待退避。
- 每次重试往 stderr 打一行 `retry 1/3 after 500ms: <原因>`。静默重试会让「慢」变成无法解释的现象。

接入点：**只包住建立请求那一步**（`fetch` 到拿到响应头），**不包整个流的消费**。流已经吐出一半再重试会导致内容重复——这个坑要在 [lessons/04-usable.md](../lessons/04-usable.md) 里讲。

## 验收

```bash
node --test test/retry.test.ts
npx tsc --noEmit
```

- [ ] 第 2 次成功时总共只调用 2 次，返回正确结果
- [ ] 全部失败时抛出**最后一次**的错误，且调用次数 = retries + 1
- [ ] HTTP 400 **只调用 1 次**（不重试）
- [ ] HTTP 500 会重试
- [ ] 已中止的 signal 立即抛出，不等待
- [ ] 退避时长递增（用假计时或断言调用间隔量级）
- [ ] 用假模型验证：首次 500、第二次正常，`streamChat` 最终产出完整文本
- [ ] 行数 ≤ 40

## 不要做

- 不做熔断 / 限流 / 请求队列
- 不重试工具执行（工具错误是给模型看的信息，不是基础设施故障）

## 完成动作

`git commit -m "T17: retry with backoff"`，看板标 `done`。
