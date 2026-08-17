import test from "node:test";
import assert from "node:assert/strict";
import { sum } from "../src/sum.ts";

test("cross-file .ts import works (full extension required)", () => {
  assert.equal(sum(1, 2), 3);
});
