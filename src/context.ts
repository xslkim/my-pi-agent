import type { Message } from "./types.ts";

// 系数来自对本机 Qwen3 分词的实测（spec 04）：中文 0.58 token/字、代码 3.7 字符/token，
// 各留约 20% 余量。照抄这两个数字，不要再叠加保守系数——会导致过早裁剪。
const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/g;

export function estimateTokens(s: string): number {
  const cjk = (s.match(CJK) ?? []).length;
  return Math.ceil(cjk * 0.7 + (s.length - cjk) / 3.5);
}

function messageTokens(m: Message): number {
  let t = estimateTokens(m.content) + 4; // role 与 JSON 框架的固定开销
  if (m.tool_calls) {
    for (const c of m.tool_calls) t += estimateTokens(c.name) + estimateTokens(c.arguments) + 4;
  }
  if (m.tool_call_id) t += 6;
  return t;
}

const KEEP_TURNS = 4; // 最近 4 轮优先保留

/**
 * 裁剪策略：system 永远保留；从最老的轮次开始丢；最近 4 轮尽量保住；
 * 最后一轮 user 是硬底线（放不下也保留，让请求自然报错，不静默清空）。
 * 「轮」= 一条 user 到下一条 user 之前——天然保证 assistant(tool_calls)
 * 和它的 tool 消息整进整出，绝不产生孤儿 tool_call_id。
 */
export function fitContext(messages: Message[], budget: number): Message[] {
  const firstUser = messages.findIndex((m) => m.role === "user");
  if (firstUser === -1) return messages;

  const prefix = messages.slice(0, firstUser); // system 等
  const turns: { msgs: Message[]; tokens: number }[] = [];
  for (let i = firstUser; i < messages.length; ) {
    let j = i + 1;
    while (j < messages.length && messages[j].role !== "user") j++;
    const msgs = messages.slice(i, j);
    turns.push({ msgs, tokens: msgs.reduce((s, m) => s + messageTokens(m), 0) });
    i = j;
  }

  const used = () => prefix.reduce((s, m) => s + messageTokens(m), 0) + kept.reduce((s, t) => s + t.tokens, 0);
  const kept = [...turns];
  if (used() <= budget) return messages; // 未超限：原样返回（同一引用）

  const protectedCount = Math.min(KEEP_TURNS, turns.length); // 最老的可丢区间：不碰最近 4 轮
  while (kept.length > protectedCount && used() > budget) kept.shift();

  const trimmedMarker: Message = { role: "system", content: "[earlier conversation trimmed]" };
  return [...prefix, ...(kept.length < turns.length ? [trimmedMarker] : []), ...kept.flatMap((t) => t.msgs)];
}
