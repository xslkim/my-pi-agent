import type { Tool } from "./registry.ts";

// 教学工具：故意选一个模型自己算不准、但正确答案唯一的能力，工具是否真被调用一眼可辨。
// 注意：除零是全项目唯一会抛异常的工具——用来验证 loop 的「工具异常转消息」路径。
export const calculator: Tool = {
  name: "calculator",
  description:
    "Compute a basic arithmetic operation on two numbers. Use this for any arithmetic; do not compute it yourself.",
  parameters: {
    type: "object",
    properties: {
      a: { type: "number", description: "left operand" },
      b: { type: "number", description: "right operand" },
      op: { type: "string", enum: ["+", "-", "*", "/"], description: "operator" },
    },
    required: ["a", "b", "op"],
  },
  async execute(args) {
    const { a, b, op } = args as { a: number; b: number; op: string };
    if (op === "/" && b === 0) throw new Error("division by zero");
    const result = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
    return String(result); // 给模型读的裸结果，不包 JSON
  },
};
