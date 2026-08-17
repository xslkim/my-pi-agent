import type { Message, StreamEvent, ToolCall } from "./types.ts";
import { streamChat, type ToolSchema } from "./llm.ts";
import { toApiTools, validate, type Tool, type ToolContext } from "./tools/registry.ts";

// agent 的本体：调模型 -> 有工具调用就执行 -> 结果塞回消息 -> 再调模型。
// 一切输出经 yield 交给调用方，loop 内部不许 console.log——否则测试没法安静地跑。

export type AgentEvent =
  | StreamEvent // text / thinking / tool_call_delta / done，实时透传
  | { type: "tool_call"; name: string; args: unknown }
  | { type: "tool_result"; id: string; name: string; result: string; ms: number }
  | { type: "error"; message: string };

export async function* runAgent(opts: {
  messages: Message[];
  tools: Tool[];
  cwd: string;
  maxSteps?: number; // 默认 10。没有上限，模型循环调同一个工具会把上下文烧光
  signal?: AbortSignal;
}): AsyncGenerator<AgentEvent> {
  const maxSteps = opts.maxSteps ?? 10;
  const ctx: ToolContext = { cwd: opts.cwd, signal: opts.signal };
  const apiTools = toApiTools(opts.tools) as ToolSchema[];

  for (let step = 1; step <= maxSteps; step++) {
    // 1) 调模型：透传流事件，同时把 tool_call 碎片按 index 累积、text 攒成整段
    let text = "";
    let sawToolCalls = false;
    const pending = new Map<number, { id: string; name: string; args: string }>();

    for await (const ev of streamChat({ messages: opts.messages, tools: apiTools, signal: opts.signal })) {
      if (ev.type === "tool_call_delta") {
        sawToolCalls = true;
        const cur = pending.get(ev.index) ?? { id: "", name: "", args: "" };
        if (ev.id) cur.id = ev.id;
        if (ev.name) cur.name = ev.name;
        if (ev.argsDelta) cur.args += ev.argsDelta; // 中途绝不 parse：碎片不是合法 JSON
        pending.set(ev.index, cur);
      } else if (ev.type !== "done") {
        yield ev;
        if (ev.type === "text") text += ev.delta;
      }
    }

    // 2) assistant 消息先入历史：role:"tool" 必须紧跟带 tool_calls 的 assistant，否则服务端 400
    const calls: ToolCall[] = [...pending.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, c]) => ({ id: c.id, name: c.name, arguments: c.args }));
    opts.messages.push({
      role: "assistant",
      content: text,
      ...(calls.length ? { tool_calls: calls } : {}),
    });
    if (!sawToolCalls) return; // 模型不再要工具：正常结束

    // 3) 串行执行。校验失败、未知工具、执行异常一律 catch 成 error: 文本回给模型——这是自愈机制
    for (const call of calls) {
      const started = Date.now();
      let parsed: unknown = call.arguments;
      try {
        parsed = JSON.parse(call.arguments || "{}");
      } catch {
        // 解不开就保持原始字符串，validate 会给出具体字段的错误
      }
      yield { type: "tool_call", name: call.name, args: parsed };

      const tool = opts.tools.find((t) => t.name === call.name);
      let result: string;
      if (!tool) {
        result = `error: unknown tool: ${call.name}`;
      } else {
        const v = validate(tool.parameters, parsed);
        if (!v.ok) {
          result = `error: invalid arguments for ${tool.name}: ${v.error}`;
        } else {
          try {
            result = await tool.execute(v.value, ctx);
          } catch (e) {
            result = `error: ${(e as Error).message}`;
          }
        }
      }
      opts.messages.push({ role: "tool", tool_call_id: call.id, content: result });
      yield { type: "tool_result", id: call.id, name: call.name, result, ms: Date.now() - started };
    }

    if (opts.signal?.aborted) return; // 中止后不再发起下一轮请求
  }
  yield { type: "error", message: `max steps exceeded (${maxSteps})` };
}
