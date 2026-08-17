// 校验考卷未被篡改：比对 acceptance/lock.sha256 基线与当前文件，不一致退出码 1。
// 用法：node acceptance/verify-lock.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const lines = fs.readFileSync(path.join(root, "acceptance", "lock.sha256"), "utf8").trim().split(/\r?\n/);
let failed = false;
for (const line of lines) {
  const [expected, rel] = line.trim().split(/\s\s+|\s+/);
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.error(`FAIL ${rel}: file missing`);
    failed = true;
    continue;
  }
  const actual = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if (actual === expected) {
    console.log(`OK   ${rel}`);
  } else {
    console.error(`FAIL ${rel}: expected ${expected}, got ${actual}`);
    failed = true;
  }
}
if (failed) {
  console.error("acceptance files were modified — this delivery is void");
  process.exit(1);
}
