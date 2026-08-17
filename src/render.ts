import type { StreamEvent } from "./types.ts";

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

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
      break; // tool_call_delta：L2 的 CLI 层渲染，本函数不处理
  }
}
