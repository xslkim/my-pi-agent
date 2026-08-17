import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { read } from "../src/tools/read.ts";
import { write } from "../src/tools/write.ts";
import { validate } from "../src/tools/registry.ts";

function tmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rw-"));
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

async function exec(tool: typeof read | typeof write, cwd: string, args: unknown) {
  const v = validate(tool.parameters, args);
  assert.equal(v.ok, true, v.ok ? "" : v.error);
  return tool.execute(v.value, { cwd });
}

test("write then read round-trips with numbered lines", async () => {
  const { dir, cleanup } = tmp();
  try {
    assert.equal(await exec(write, dir, { path: "a.txt", content: "hello\nworld" }), "wrote a.txt (2 lines)");
    const out = await exec(read, dir, { path: "a.txt" });
    assert.equal(out, "1| hello\n2| world");
  } finally {
    cleanup();
  }
});

test("write creates missing parent directories", async () => {
  const { dir, cleanup } = tmp();
  try {
    await exec(write, dir, { path: "a/b/c.txt", content: "deep" });
    assert.equal(fs.readFileSync(path.join(dir, "a/b/c.txt"), "utf8"), "deep");
  } finally {
    cleanup();
  }
});

test("read truncates files over 200 lines with an explicit notice", async () => {
  const { dir, cleanup } = tmp();
  try {
    await exec(write, dir, { path: "big.txt", content: Array.from({ length: 1000 }, (_, i) => `l${i}`).join("\n") });
    const out = await exec(read, dir, { path: "big.txt" });
    assert.match(out, /\[truncated: showing first 200 of 1000 lines\]/);
    assert.ok(out.includes("1| l0"));
  } finally {
    cleanup();
  }
});

test("offset/limit slice lines but keep real file line numbers", async () => {
  const { dir, cleanup } = tmp();
  try {
    await exec(write, dir, { path: "n.txt", content: "one\ntwo\nthree\nfour\nfive" });
    const out = await exec(read, dir, { path: "n.txt", offset: 2, limit: 2 });
    assert.equal(out, "2| two\n3| three"); // 不是从 1 重排
  } finally {
    cleanup();
  }
});

test("read: missing file, directory, binary, empty file all return error/notice text", async () => {
  const { dir, cleanup } = tmp();
  try {
    assert.match(await exec(read, dir, { path: "nope.txt" }), /^error: file not found/);
    fs.mkdirSync(path.join(dir, "sub"));
    assert.match(await exec(read, dir, { path: "sub" }), /^error: is a directory/);
    fs.writeFileSync(path.join(dir, "bin"), Buffer.from([0x61, 0x00, 0x62]));
    assert.match(await exec(read, dir, { path: "bin" }), /^error: binary file/);
    fs.writeFileSync(path.join(dir, "empty"), "");
    assert.equal(await exec(read, dir, { path: "empty" }), "(empty file)");
  } finally {
    cleanup();
  }
});

test("both tools reject paths that escape the workspace", async () => {
  const { dir, cleanup } = tmp();
  try {
    assert.match(await exec(write, dir, { path: "../evil.txt", content: "x" }), /^error: path escapes workspace/);
    assert.match(await exec(read, dir, { path: "../../etc/passwd" }), /^error: path escapes workspace/);
    assert.equal(fs.existsSync(path.join(dir, "..", "evil.txt")), false);
  } finally {
    cleanup();
  }
});

test("write refuses to touch .git/", async () => {
  const { dir, cleanup } = tmp();
  try {
    assert.match(await exec(write, dir, { path: ".git/config", content: "evil" }), /^error: refusing to write inside .git/);
    assert.match(await exec(write, dir, { path: ".gitignore", content: "node_modules" }), /^wrote/); // 相似名不受牵连
  } finally {
    cleanup();
  }
});
