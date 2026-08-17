import fs from "node:fs";
import path from "node:path";

// 三个工具共用的约束层：路径不许逃逸、输出不许爆炸、执行不许挂死。
// 没有这层，一个爱幻觉的模型加上一个没约束的工具，等于把 rm -rf 交给喝醉的实习生。

/** 解析为 cwd 内的绝对路径；越界（含软链逃逸）抛错。错误信息保留用户/模型的原始输入。 */
export function resolveInside(cwd: string, p: string): string {
  const abs = path.resolve(cwd, p);
  const outside = (a: string): boolean => {
    const rel = path.relative(cwd, a); // path.win32.relative 本身大小写不敏感
    return rel.startsWith("..") || path.isAbsolute(rel);
  };
  if (outside(abs)) throw new Error(`path escapes workspace: ${p}`);
  // 已存在的路径再看真实位置：工作目录里一个指向外部的软链能让上面的检查全部失效。
  // 不存在的路径跳过——write 还要能创建新文件。（TOCTOU 窗口是诚实承认的缺口）
  if (fs.existsSync(abs)) {
    const real = fs.realpathSync(abs);
    if (outside(real)) throw new Error(`path escapes workspace: ${p}`);
  }
  return abs;
}

/** 超长输出截断，保留头部并明确告知——静默截断会让模型以为看完了全文。 */
export function truncate(s: string, maxLines = 200, maxBytes = 20_000): string {
  const total = s.split("\n").length;
  let lines = s.split("\n");
  let cut = false;
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    cut = true;
  }
  let out = lines.join("\n");
  const bytes = Buffer.byteLength(out, "utf8");
  if (bytes > maxBytes) {
    // 末尾可能切掉半个多字节字符，去掉替换符即可
    out = Buffer.from(out, "utf8").subarray(0, maxBytes).toString("utf8");
    if (out.endsWith("\uFFFD")) out = out.slice(0, -1);
    cut = true;
  }
  if (!cut) return s;
  const shown = out.split("\n").length;
  return `${out}\n[truncated: showing first ${shown} of ${total} lines]`;
}

/** 给 promise 加超时。onTimeout 供调用方做清理（如杀进程树），发生在 reject 之前。 */
export function withTimeout<T>(p: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout?.();
      reject(new Error(`timed out after ${ms}ms`));
    }, ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}
