import type { StreamEvent } from "./types.ts";
import type { AgentEvent } from "./loop.ts";

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const RED = "\x1b[31m";

// 思考与前缀状态：done 事件会关掉打开的思考段，因此每个流结束后状态自然归零
let inThinking = false;

export type Writable = { write(s: string): void };

/** 把一个流事件渲染到终端。text 逐字直写，不缓冲——要的就是流式效果。 */
export function renderEvent(ev: StreamEvent, out: Writable = process.stdout): void {
  if (ev.type !== "thinking" && inThinking) {
    out.write(`${RESET}\n`);
    inThinking = false;
  }
  switch (ev.type) {
    case "text":
      out.write(ev.delta);
      break;
    case "thinking":
      if (!inThinking) {
        out.write(`\n${DIM}思考中…`);
        inThinking = true;
      }
      out.write(ev.delta);
      break;
    case "done":
      out.write("\n");
      if (ev.usage) {
        out.write(`${DIM}[tokens: in=${ev.usage.prompt_tokens} out=${ev.usage.completion_tokens}]${RESET}\n`);
      }
      break;
    default:
      break; // tool_call_delta：碎片没有独立渲染价值，最终工具调用会以 tool_call 事件呈现
  }
}

/** 超过 200 字符截断显示——终端是给人看的，模型看的是完整内容。 */
function preview(s: string): string {
  return s.length > 200 ? s.slice(0, 200) + "…" : s;
}

/** 渲染 agent 事件：流事件交给 renderEvent，工具调用/结果/错误在这里可见化。 */
export function renderAgentEvent(ev: AgentEvent, out: Writable = process.stdout): void {
  if (ev.type === "tool_call") {
    out.write(`\n→ ${ev.name}(${preview(JSON.stringify(ev.args))})\n`);
  } else if (ev.type === "tool_result") {
    out.write(`← ${preview(ev.result)} (${ev.ms}ms)\n`);
  } else if (ev.type === "error") {
    out.write(`${RED}! ${ev.message}${RESET}\n`);
  } else {
    renderEvent(ev, out);
  }
}
