import test from "node:test";
import assert from "node:assert/strict";
import { calculator } from "../src/tools/calculator.ts";
import { validate } from "../src/tools/registry.ts";

const ctx = { cwd: process.cwd() };

test("four operators compute correctly", async () => {
  assert.equal(await calculator.execute({ a: 21, b: 2, op: "*" }, ctx), "42");
  assert.equal(await calculator.execute({ a: 10, b: 4, op: "+" }, ctx), "14");
  assert.equal(await calculator.execute({ a: 7, b: 2, op: "-" }, ctx), "5");
  assert.equal(await calculator.execute({ a: 9, b: 3, op: "/" }, ctx), "3");
});

test("division by zero throws (the loop must catch it)", async () => {
  await assert.rejects(() => calculator.execute({ a: 1, b: 0, op: "/" }, ctx), /division by zero/);
});

test('validated string operands still compute: {"a":"3","b":"4","op":"*"} -> "12"', async () => {
  const r = validate(calculator.parameters, { a: "3", b: "4", op: "*" });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(await calculator.execute(r.value, ctx), "12");
});
