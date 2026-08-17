import test from "node:test";
import assert from "node:assert/strict";
import { validate, toApiTools, type JsonSchema, type Tool } from "../src/tools/registry.ts";

const schema: JsonSchema = {
  type: "object",
  properties: {
    a: { type: "number" },
    op: { type: "string", enum: ["+", "-", "*", "/"] },
    items: { type: "array" },
    flag: { type: "boolean" },
  },
  required: ["a", "op"],
};

test("missing required field -> ok:false, message names the field", () => {
  const r = validate(schema, { op: "+" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /"a" is required/);
});

test('numeric string "21" coerces to number 21', () => {
  const r = validate(schema, { a: "21", op: "+" });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.a, 21);
    assert.equal(typeof r.value.a, "number");
  }
});

test('non-numeric string "abc" for a number field -> ok:false', () => {
  const r = validate(schema, { a: "abc", op: "+" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /"a" must be a number/);
});

test("enum violation -> ok:false", () => {
  const r = validate(schema, { a: 1, op: "^" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /"op" must be one of/);
});

test("unknown fields are ignored, not errors", () => {
  const r = validate(schema, { a: 1, op: "+", sneaky: "x" });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal("sneaky" in r.value, false);
});

test("top-level array or null -> ok:false without throwing", () => {
  assert.equal(validate(schema, [1, 2]).ok, false);
  assert.equal(validate(schema, null).ok, false);
});

test("wrong scalar types -> ok:false", () => {
  assert.equal(validate(schema, { a: true, op: "+" }).ok, false);
  assert.equal(validate(schema, { a: 1, op: 42 }).ok, false);
  assert.equal(validate(schema, { a: 1, op: "+", items: "nope" }).ok, false);
  assert.equal(validate(schema, { a: 1, op: "+", flag: "maybe" }).ok, false);
});

test("valid input passes through", () => {
  const r = validate(schema, { a: 2, op: "*", items: [1, 2] });
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value, { a: 2, op: "*", items: [1, 2] });
});

test("toApiTools emits OpenAI function format", () => {
  const tool: Tool = {
    name: "calculator",
    description: "d",
    parameters: schema,
    async execute() {
      return "";
    },
  };
  const api = toApiTools([tool]) as { type: string; function: Record<string, unknown> }[];
  assert.equal(api.length, 1);
  assert.equal(api[0].type, "function");
  assert.equal(api[0].function.name, "calculator");
  assert.equal(api[0].function.parameters, schema);
});
