>>> 开场：本集定位 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页（命中 TitleCard 组件）：主标题「第 3 课 · 让 agent 改代码」，副标题「四个受约束工具 read / write / edit / bash」。
深色背景 #0d1117 填满整个 1920×1080 画面。主标题白色 #e6edf3、粗体、字号 96px，画面垂直居中偏上；副标题颜色 #8b949e、字号 56px，位于主标题正下方 40px 处。
副标题下方 48px 处再放一条小字标签行：「从 git tag l2-tools 出发 → 本集交付 l3-coding」，颜色 #58a6ff，字号 32px，等宽字体。
主标题正下方 16px 处一条 4px 粗的 accent 蓝 #58a6ff 横线（宽度与主标题相同），从左向右扫入。
整体内容占画布约 80% 宽度，所有元素底边距画面底部 ≥ 160px（避让底部 120px 字幕安全区）。


>>> 总览：四个工具加统一收口 #B02
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    color: #e6edf3; padding: 56px 64px 0 64px; overflow: hidden;
  }
  .title { font-size: 60px; font-weight: 700; }
  .title .accent { color: #58a6ff; }
  .subtitle { font-size: 30px; color: #8b949e; margin-top: 16px; }
  .grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 32px; margin-top: 48px;
  }
  .card {
    background: #161b22; border: 1px solid #30363d; border-radius: 16px;
    padding: 36px 40px; height: 240px;
  }
  .card .name { font-family: "JetBrains Mono", monospace; font-size: 40px; font-weight: 700; color: #58a6ff; }
  .card .lines { font-family: "JetBrains Mono", monospace; font-size: 30px; color: #e6edf3; margin-top: 14px; }
  .card .role { font-size: 28px; color: #8b949e; margin-top: 12px; }
  .card.guard { border: 2px solid #58a6ff; }
  .footer {
    margin-top: 40px; font-size: 32px; color: #8b949e;
    font-family: "JetBrains Mono", monospace;
  }
  .footer b { color: #58a6ff; font-size: 36px; }
</style>
</head>
<body>
  <div class="title">总览：四个工具 <span class="accent">+ 统一收口</span></div>
  <div class="subtitle">所有工具实现同一个 Tool 接口，安全规则集中在 guard.ts</div>
  <div class="grid">
    <div class="card">
      <div class="name">read.ts</div>
      <div class="lines">47 行</div>
      <div class="role">读文件，分段 + 截断</div>
    </div>
    <div class="card">
      <div class="name">write.ts</div>
      <div class="lines">29 行</div>
      <div class="role">写文件</div>
    </div>
    <div class="card">
      <div class="name">edit.ts</div>
      <div class="lines">60 行</div>
      <div class="role">唯一匹配后替换</div>
    </div>
    <div class="card">
      <div class="name">bash.ts</div>
      <div class="lines">89 行</div>
      <div class="role">跑命令，限时 + 截断</div>
    </div>
    <div class="card guard">
      <div class="name">guard.ts</div>
      <div class="lines">64 行</div>
      <div class="role">统一收口：路径与截断</div>
    </div>
    <div class="card">
      <div class="name">prompt.ts</div>
      <div class="lines">12 行</div>
      <div class="role">系统提示词约束模型</div>
    </div>
  </div>
  <div class="footer">src 累计：422 行 → <b>735 行</b>（+313）</div>
</body>
</html>


>>> read：分段读加输出截断 #B03
@enter: fade
@exit: fade
@visual: animation

代码面板（命中 CodeBlock 组件）：语言 typescript，面板顶部标题栏显示「read.ts · 47 行」与要点标签「offset / limit 分段读 + 输出截断」，标题字号 56px、粗体、白色 #e6edf3，标签颜色 #58a6ff、字号 28px。
代码区域宽度占画布 ≥ 78%，高度占可用区域 ≥ 55%，等宽字号 28px，代码背景 #161b22，圆角 16px，深色背景 #0d1117 填满整个画面，代码面板底边距画面底部 ≥ 160px（避让字幕安全区）。
代码如下（逐字使用，不要改写）：

```typescript
parameters: {
  properties: {
    path:   { type: "string" },
    offset: { type: "number", description: "1-based line to start from" },
    limit:  { type: "number", description: "max number of lines to return" },
  },
  required: ["path"],
},
// ...
const slice = limit ? all.slice(start, start + limit) : all.slice(start);
const numbered = slice.map((line, i) => `${start + i + 1}| ${line}`).join("\n");
return truncate(numbered); // 输出截断，来自 guard.ts
```

高亮跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：第 2 行旁白讲 offset / limit 时，高亮 parameters 里 offset 与 limit 两行；第 3 行讲截断时，高亮最后一行 return truncate(numbered)；第 5、6 行讲 5MB 与 64K 时，truncate 那一行保持高亮并在其右侧浮现标签「不截断 → 5MB 文件炸掉 64K 上下文」（红色 #f85149，字号 28px）；其余行正常亮度，行切换时平滑过渡。


>>> edit：old_string 必须唯一 #B04
@enter: fade
@exit: fade
@visual: animation

代码面板（命中 CodeBlock 组件）：语言 typescript，面板顶部标题栏显示「edit.ts · 60 行」与要点标签「old_string 必须唯一」，标题字号 56px、粗体、白色 #e6edf3，标签颜色 #58a6ff、字号 28px。
代码区域宽度占画布 ≥ 78%，高度占可用区域 ≥ 55%，等宽字号 28px，代码背景 #161b22，圆角 16px，深色背景 #0d1117 填满整个画面，代码面板底边距画面底部 ≥ 160px（避让字幕安全区）。
代码如下（逐字使用，不要改写）：

```typescript
parameters: {
  properties: {
    path:       { type: "string" },
    old_string: { type: "string" },
    new_string: { type: "string" },
  },
  required: ["path", "old_string", "new_string"],
},
// ...
const hits = findLines(content, old_string);
if (hits.length === 0)
  return `error: old_string not found in ${p}`;
if (hits.length > 1 && !replace_all)
  return `error: old_string found ${hits.length} times ... make it unique`;
```

高亮跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：第 2 行旁白讲替换时，高亮 old_string 与 new_string 两行；第 4 行讲唯一约束时，高亮 hits.length > 1 判断那两行；第 5 行讲报错时，两个 return error 行以红色 #f85149 高亮，其余行变暗，行切换时平滑过渡。


>>> 故障注入：拆掉两个约束 #B05
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    color: #e6edf3; padding: 64px 64px 0 64px; overflow: hidden;
  }
  .title { font-size: 60px; font-weight: 700; text-align: center; }
  .title .warn { color: #f85149; }
  .row { display: flex; gap: 48px; margin-top: 56px; }
  .card {
    flex: 1; background: #161b22; border: 2px solid #f85149;
    border-radius: 16px; padding: 40px 48px; height: 600px;
  }
  .card h2 { font-size: 44px; color: #f85149; font-weight: 700; }
  .card .file { font-family: "JetBrains Mono", monospace; }
  .card p { font-size: 32px; line-height: 1.7; margin-top: 28px; color: #e6edf3; }
  .card .bad { color: #f85149; font-weight: 700; }
  .card code {
    font-family: "JetBrains Mono", monospace; color: #a5d6ff;
    background: #0d1117; padding: 2px 10px; border-radius: 6px;
  }
</style>
</head>
<body>
  <div class="title"><span class="warn">⚠</span> 故障注入：拆掉这两个约束</div>
  <div class="row">
    <div class="card">
      <h2><span class="file">edit</span> 不查唯一性</h2>
      <p><code>old_string</code> 在文件里匹配到 <span class="bad">两处</span></p>
      <p>替换发生在错误的那一处</p>
      <p class="bad">改错地方，而且没有任何报错</p>
    </div>
    <div class="card">
      <h2><span class="file">read</span> 不做截断</h2>
      <p>一次读入整个大文件</p>
      <p><span class="bad">5MB</span> 文本灌进 <span class="bad">64K</span> 上下文</p>
      <p class="bad">上下文瞬间爆掉</p>
    </div>
  </div>
</body>
</html>


>>> bash：超时、cwd、截断 #B06
@enter: fade
@exit: fade
@visual: animation

代码面板（命中 CodeBlock 组件）：语言 typescript，面板顶部标题栏显示「bash.ts · 89 行」与要点标签「超时 / cwd 约束 / 输出截断」，标题字号 56px、粗体、白色 #e6edf3，标签颜色 #58a6ff、字号 28px。
代码区域宽度占画布 ≥ 78%，高度占可用区域 ≥ 55%，等宽字号 28px，代码背景 #161b22，圆角 16px，深色背景 #0d1117 填满整个画面，代码面板底边距画面底部 ≥ 160px（避让字幕安全区）。
代码如下（逐字使用，不要改写）：

```typescript
export function clampTimeout(ms: number): number {
  return Math.min(ms, 120_000); // 默认 30_000，上限 120_000
}
// ...
const child = spawn(shell.cmd, [...shell.args, command], {
  cwd: ctx.cwd, // 不是 process.cwd() —— 工作目录被约束
  detached: process.platform !== "win32",
});
const timer = setTimeout(() => { timedOut = true; killGroup(child); }, timeoutMs);
// ...
const body = `exit: ${code}\n${truncate(out)}\n${truncate(err)}`;
```

高亮跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：第 2 行旁白讲三道保险时，clampTimeout、cwd、truncate 三处依次闪一下；第 3、4 行讲超时杀掉与进程组时，高亮 setTimeout 那一行；第 5 行讲工作目录与截断时，高亮 cwd 行与最后一行 body，行切换时平滑过渡。


>>> Windows 现实：WSL 的 bash #B07
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    color: #e6edf3; padding: 72px 96px 0 96px; overflow: hidden;
  }
  .title { font-size: 56px; font-weight: 700; }
  .title .warn { color: #f85149; }
  .card {
    background: #161b22; border: 2px solid #f85149; border-radius: 16px;
    padding: 40px 48px; margin-top: 48px;
  }
  .row { display: flex; align-items: center; gap: 32px; font-size: 34px; }
  .row + .row { margin-top: 32px; }
  .mono { font-family: "JetBrains Mono", monospace; }
  .path { color: #e6edf3; }
  .arrow { color: #f85149; font-weight: 700; font-size: 40px; }
  .bad { color: #f85149; font-weight: 700; }
  .fix {
    background: #161b22; border: 1px solid #30363d; border-radius: 16px;
    padding: 32px 48px; margin-top: 40px; font-size: 32px;
  }
  .fix b { color: #3fb950; }
  .fix .mono { color: #a5d6ff; }
</style>
</head>
<body>
  <div class="title"><span class="warn">⚠</span> Windows 现实：System32 的 bash 是 WSL</div>
  <div class="card">
    <div class="row mono">
      <span class="path">C:\Windows\System32\bash.exe</span>
      <span class="arrow">→</span>
      <span class="bad">其实是 WSL</span>
    </div>
    <div class="row mono">
      <span class="path">G:\</span>
      <span class="arrow">→</span>
      <span class="bad">/mnt/g</span>
      <span style="color:#8b949e; font-size:30px;">（它眼里没有盘符，路径完全是另一套）</span>
    </div>
  </div>
  <div class="fix">
    <b>对策：</b>优先用 Git 自带的 bash（<span class="mono">Git\bin\bash.exe</span>），否则回退 <span class="mono">PowerShell</span>
  </div>
</body>
</html>


>>> guard.ts：不许跳出工作目录 #B08
@enter: fade
@exit: fade
@visual: animation

代码面板（命中 CodeBlock 组件）：语言 typescript，面板顶部标题栏显示「guard.ts · 64 行」与要点标签「路径检查统一收口」，标题字号 56px、粗体、白色 #e6edf3，标签颜色 #58a6ff、字号 28px。
代码区域宽度占画布 ≥ 78%，高度占可用区域 ≥ 55%，等宽字号 28px，代码背景 #161b22，圆角 16px，深色背景 #0d1117 填满整个画面，代码面板底边距画面底部 ≥ 160px（避让字幕安全区）。
代码如下（逐字使用，不要改写）：

```typescript
/** 解析为 cwd 内的绝对路径；越界（含软链逃逸）抛错。 */
export function resolveInside(cwd: string, p: string): string {
  const abs = path.resolve(cwd, p);
  const rel = path.relative(cwd, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel))
    throw new Error(`path escapes workspace: ${p}`);
  if (fs.existsSync(abs)) {
    const real = fs.realpathSync(abs); // 软链指向外部同样拒绝
    if (outside(real)) throw new Error(`path escapes workspace: ${p}`);
  }
  return abs;
}
```

高亮跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：第 3 行旁白讲绝对路径必须在工作目录里时，高亮 path.resolve 与 path.relative 两行；第 4 行讲跳出就拒绝时，高亮第一个 throw 行并以红色 #f85149 强调「path escapes workspace」字样；第 5 行讲软链时，高亮 realpathSync 那三行，行切换时平滑过渡。


>>> prompt.ts：十二行系统提示词 #B09
@enter: fade
@exit: fade
@visual: animation

代码面板（命中 CodeBlock 组件）：语言 markdown，面板顶部标题栏显示「prompt.ts · 12 行」与要点标签「系统提示词约束模型用工具」，标题字号 56px、粗体、白色 #e6edf3，标签颜色 #58a6ff、字号 28px。
代码区域宽度占画布 ≥ 78%，高度占可用区域 ≥ 55%，等宽字号 30px，代码背景 #161b22，圆角 16px，深色背景 #0d1117 填满整个画面，代码面板底边距画面底部 ≥ 160px（避让字幕安全区）。
代码如下（逐字使用，不要改写）：

```markdown
You are a coding agent working in ${cwd}.

Rules:
- Read a file before editing it. Never guess its contents.
- Prefer `edit` over `write` for existing files.
- `edit` requires old_string to appear exactly once.
  If it fails, read more context and retry.
- All paths must stay inside the workspace.
- Explain what you changed after you finish.
```

高亮跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：第 3 行旁白讲规则时，逐条高亮 Rules 下的每一条规则行（讲到哪条亮哪条）；第 5 行讲「提示词说的每一条，代码里都必须真的强制」时，全部规则行保持高亮，并在面板右下角浮现对应关系小字「resolveInside / truncate / 唯一匹配」（颜色 #58a6ff，字号 26px），行切换时平滑过渡。


>>> 演示：agent 改 hello.js #B10
@enter: fade
@exit: fade
@visual: video(./assets/hellojs-demo.mp4)

（此描述仅作文档参考，实际使用 ./assets/hellojs-demo.mp4 视频文件；素材时长 31.5s）
终端录屏：agent 先用 read 工具读 hello.js，再用 edit 工具完成唯一匹配替换，文件被改好。
<!-- 2026-08-28 重录：read → edit 改 demo/tmp/hello.js（deepseek-v4-flash），31.5s。录制场景 record.mjs 的 l3-coding -->


>>> pi 对照：行数对比 #B11
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    color: #e6edf3; padding: 56px 64px 0 64px; overflow: hidden;
  }
  .title { font-size: 60px; font-weight: 700; text-align: center; }
  .title .icon { color: #d2a8ff; }
  .head {
    display: flex; gap: 48px; margin-top: 40px;
    font-size: 36px; font-weight: 700; text-align: center;
  }
  .head div { flex: 1; }
  .us { color: #58a6ff; }
  .pi { color: #d2a8ff; }
  .row { display: flex; gap: 48px; margin-top: 32px; }
  .cell {
    flex: 1; background: #161b22; border: 1px solid #30363d;
    border-radius: 16px; padding: 32px 40px; min-height: 250px;
  }
  .cell.us-cell { border-left: 6px solid #58a6ff; }
  .cell.pi-cell { border-left: 6px solid #d2a8ff; }
  .file { font-family: "JetBrains Mono", monospace; font-size: 30px; color: #8b949e; }
  .num { font-family: "JetBrains Mono", monospace; font-size: 80px; font-weight: 700; margin-top: 10px; }
  .us-cell .num { color: #58a6ff; }
  .pi-cell .num { color: #d2a8ff; }
  .feat { font-size: 26px; color: #8b949e; margin-top: 14px; line-height: 1.6; }
</style>
</head>
<body>
  <div class="title"><span class="icon">⚖</span> pi 对照</div>
  <div class="head">
    <div class="us">我们（l3-coding）</div>
    <div class="pi">pi @086c32e</div>
  </div>
  <div class="row">
    <div class="cell us-cell">
      <div class="file">edit.ts</div>
      <div class="num">60 行</div>
    </div>
    <div class="cell pi-cell">
      <div class="file">edit.ts + edit-diff.ts</div>
      <div class="num">127 + 500 行</div>
      <div class="feat">多重编辑 · 行尾/BOM 处理 · unified diff</div>
    </div>
  </div>
  <div class="row">
    <div class="cell us-cell">
      <div class="file">bash.ts</div>
      <div class="num">89 行</div>
    </div>
    <div class="cell pi-cell">
      <div class="file">nodejs.ts</div>
      <div class="num">695 行</div>
      <div class="feat">Result 错误模型 · 进程树 kill · 跨平台 shell 探测</div>
    </div>
  </div>
</body>
</html>


>>> 收束与钩子 #B12
@enter: fade-up
@exit: fade
@visual: html

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    color: #e6edf3; padding: 80px 96px 0 96px; overflow: hidden;
    text-align: center;
  }
  .ok { font-size: 60px; font-weight: 700; }
  .ok .check { color: #3fb950; }
  .card {
    background: #161b22; border: 1px solid #30363d; border-radius: 16px;
    padding: 40px 56px; margin-top: 48px; text-align: left;
  }
  .card h3 { font-size: 34px; color: #58a6ff; font-weight: 700; }
  .card p { font-size: 32px; line-height: 1.8; margin-top: 12px; }
  .card .mono { font-family: "JetBrains Mono", monospace; color: #a5d6ff; }
  .next {
    margin-top: 48px; font-size: 36px; color: #8b949e;
  }
  .next b { color: #58a6ff; font-size: 40px; }
</style>
</head>
<body>
  <div class="ok"><span class="check">✔</span> 本集达成：agent 能安全地改代码了</div>
  <div class="card">
    <h3>四个受约束工具</h3>
    <p><span class="mono">read / write / edit / bash</span> + <span class="mono">guard.ts</span> 统一收口 + 12 行系统提示词</p>
  </div>
  <div class="card">
    <h3>下一集 · 让 agent 好用</h3>
    <p>把它变成每天能用的 CLI：<b style="color:#e6edf3">REPL、中止、会话持久化</b></p>
  </div>
  <div class="next">从 <b>l3-coding</b> 出发，继续跟练</div>
</body>
</html>
