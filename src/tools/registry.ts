// Tool 接口与运行时参数校验。TS 类型在运行时不存在，而模型一定会传错——这是 agent 不崩的第一道闸。

export interface ToolContext {
  cwd: string;
  signal?: AbortSignal;
}

export interface JsonSchema {
  type: "object";
  properties: Record<string, { type: string; description?: string; enum?: string[] }>;
  required?: string[];
}

export interface Tool {
  name: string;
  description: string; // 直接发给模型：写得越具体，调用越准
  parameters: JsonSchema; // 手写 JSON Schema，原样发给模型
  execute(args: unknown, ctx: ToolContext): Promise<string>; // 结果必须是文本
}

export type ValidateResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

// 最小校验器：只覆盖自家工具会用到的规则。错误信息写给模型看，必须具体到字段名。
export function validate(schema: JsonSchema, args: unknown): ValidateResult {
  if (typeof args !== "object" || args === null || Array.isArray(args)) {
    return { ok: false, error: "arguments must be an object" };
  }
  const input = args as Record<string, unknown>;
  const value: Record<string, unknown> = {};

  for (const [key, rule] of Object.entries(schema.properties)) {
    const raw = input[key];
    if (raw === undefined) continue; // 缺字段交给 required 检查报更明确的错

    let v: unknown = raw;
    if (rule.type === "number" && typeof raw === "string" && raw.trim() !== "") {
      const n = Number(raw); // 数字宽容转换："21" -> 21（模型最高频错误，容错比报错实用）
      if (Number.isNaN(n)) {
        return { ok: false, error: `field "${key}" must be a number, got ${JSON.stringify(raw)}` };
      }
      v = n;
    }
    const actual = Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
    if (actual !== rule.type) {
      return { ok: false, error: `field "${key}" must be ${rule.type}, got ${actual}` };
    }
    if (rule.enum && !rule.enum.includes(String(v))) {
      return { ok: false, error: `field "${key}" must be one of ${rule.enum.join(", ")}` };
    }
    value[key] = v; // 未知字段不进 value：忽略而非报错
  }

  for (const key of schema.required ?? []) {
    if (!(key in value)) {
      return { ok: false, error: `field "${key}" is required` };
    }
  }
  return { ok: true, value };
}

/** 转成 OpenAI 兼容 API 的 tools 请求格式。 */
export function toApiTools(tools: Tool[]): unknown[] {
  return tools.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}
