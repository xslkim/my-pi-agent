// 贯穿全部五课的核心类型。只有类型，没有运行时代码。
// 约束：Node 类型剥离只支持可擦除语法——不用 enum / namespace，用字符串字面量联合。

export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: Role;
  content: string;
  tool_calls?: ToolCall[]; // assistant 专用，L2 起随消息原样回传
  tool_call_id?: string;   // role: "tool" 专用，必须对应某个 assistant 的 tool_call.id
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string; // 原始 JSON 字符串：流式拼接完成前的中间态本来就是不完整 JSON，类型如实反映
}

export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "thinking"; delta: string }
  | { type: "tool_call_delta"; index: number; id?: string; name?: string; argsDelta?: string }
  | { type: "done"; finishReason: string; usage?: Usage };

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
}
