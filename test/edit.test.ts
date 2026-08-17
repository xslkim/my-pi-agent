import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { edit } from "../src/tools/edit.ts";
import { validate } from "../src/tools/registry.ts";

function tmp(content = "") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "edit-"));
  fs.writeFileSync(path.join(dir, "f.txt"), content);
  return { dir, file: path.join(dir, "f.txt"), cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

async function run(cwd: string, args: unknown) {
  const v = validate(edit.parameters, args);
  assert.equal(v.ok, true, v.ok ? "" : v.error);
  return edit.execute(v.value, { cwd });
}

test("unique match replaces and reports the line number", async () => {
  const { dir, file, cleanup } = tmp("alpha\nbeta\ngamma\nbeta\n");
  try {
    const out = await run(dir, { path: "f.txt", old_string: "gamma", new_string: "GAMMA" });
    assert.match(out, /edited f\.txt \(1 replacement at line 3\)/);
    assert.equal(fs.readFileSync(file, "utf8"), "alpha\nbeta\nGAMMA\nbeta\n");
  } finally {
    cleanup();
  }
});

test("zero matches -> not found error, file untouched", async () => {
  const { dir, file, cleanup } = tmp("hello");
  try {
    assert.match(await run(dir, { path: "f.txt", old_string: "nope", new_string: "x" }), /old_string not found/);
    assert.equal(fs.readFileSync(file, "utf8"), "hello");
  } finally {
    cleanup();
  }
});

test("three matches -> error lists all three line numbers, file untouched", async () => {
  const { dir, file, cleanup } = tmp("const x = 1;\nmid\nconst x = 1;\nmid\nconst x = 1;\n");
  try {
    const out = await run(dir, { path: "f.txt", old_string: "const x = 1;", new_string: "const y = 2;" });
    assert.match(out, /found 3 times .*lines 1, 3, 5/);
    assert.match(out, /Provide more surrounding context/);
    assert.equal(fs.readFileSync(file, "utf8").includes("const y"), false);
  } finally {
    cleanup();
  }
});

test("replace_all replaces every occurrence and reports the count", async () => {
  const { dir, file, cleanup } = tmp("a\nb\na\nb\na\n");
  try {
    const out = await run(dir, { path: "f.txt", old_string: "a", new_string: "z", replace_all: true });
    assert.match(out, /3 replacements at lines 1, 3, 5/);
    assert.equal(fs.readFileSync(file, "utf8"), "z\nb\nz\nb\nz\n");
  } finally {
    cleanup();
  }
});

test("multi-line old_string matches across lines", async () => {
  const { dir, file, cleanup } = tmp("function f() {\n  return 1;\n}\n");
  try {
    await run(dir, { path: "f.txt", old_string: "  return 1;\n}", new_string: "  return 2;\n}" });
    assert.equal(fs.readFileSync(file, "utf8"), "function f() {\n  return 2;\n}\n");
  } finally {
    cleanup();
  }
});

test("CRLF files stay CRLF after edit", async () => {
  const { dir, file, cleanup } = tmp();
  try {
    fs.writeFileSync(file, "one\r\ntwo\r\nthree\r\n");
    await run(dir, { path: "f.txt", old_string: "two", new_string: "TWO" });
    assert.equal(fs.readFileSync(file, "utf8"), "one\r\nTWO\r\nthree\r\n");
  } finally {
    cleanup();
  }
});

test("identical old/new and escaping paths return errors", async () => {
  const { dir, cleanup } = tmp("x");
  try {
    assert.match(await run(dir, { path: "f.txt", old_string: "x", new_string: "x" }), /identical/);
    assert.match(await run(dir, { path: "../f.txt", old_string: "x", new_string: "y" }), /path escapes workspace/);
    assert.match(await run(dir, { path: "missing.txt", old_string: "x", new_string: "y" }), /file not found/);
  } finally {
    cleanup();
  }
});
