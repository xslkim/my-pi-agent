// 重试的纪律：只重试「可能是暂时性」的失败（网络错误、超时、429、5xx）；
// 4xx 说明请求本身有错（比如上下文裁出了孤儿 tool 消息），重试只会把同一个错再发几遍、
// 掩盖真 bug。静默重试也不行——「有点慢」背后可能藏着 5 次失败，必须打出来。

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts?: { retries?: number; baseMs?: number; signal?: AbortSignal },
): Promise<T> {
  const retries = opts?.retries ?? 3;
  const baseMs = opts?.baseMs ?? 500;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (e) {
      const err = e as { status?: number; retryAfterMs?: number; name?: string; message?: string };
      const retryable = err.status === undefined || err.status === 429 || err.status >= 500;
      if (opts?.signal?.aborted || err.name === "AbortError" || !retryable || attempt >= retries) throw e;
      const wait = err.retryAfterMs ?? Math.round(baseMs * 2 ** attempt * (0.8 + Math.random() * 0.4));
      process.stderr.write(`retry ${attempt + 1}/${retries} after ${wait}ms: ${err.message}\n`);
      await sleep(wait, opts?.signal);
    }
  }
}

function abortError(): Error {
  const e = new Error("aborted");
  e.name = "AbortError";
  return e;
}

/** 退避等待；等待中途被 abort 立即抛出，不再傻等。 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const onAbort = () => { clearTimeout(t); reject(abortError()); };
    const t = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
