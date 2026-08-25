>>> 第 3 课开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页（命中预制组件库 TitleCard）：
kicker：「第 3 课 · L3」
主标题：「让 agent 改代码」
副标题：「为什么是四个工具，而不是四十个？」
居中排版，主题默认配色。


>>> 裸实现 #B02
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:33px;line-height:2.0;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:46px 60px;white-space:pre;color:#a5d6ff}
.c{color:#8b949e}.k{color:#ff7b72}
.warn{margin-top:46px;background:#0d1117;border:1px solid #30363d;border-left:8px solid #f85149;border-radius:14px;padding:34px 44px;font-size:33px;line-height:1.7}
.warn b{color:#ff7b72}
</style></head><body><div class="wrap">
<h1>裸实现：二十分钟写完</h1>
<pre>read:  fs.readFile(args.path, <span class="k">"utf8"</span>)
write: fs.writeFile(args.path, args.content)
edit:  content.replace(args.old_string, args.new_string)
bash:  exec(args.command)</pre>
<div class="warn">跑一下，它真的能改文件了。学员会有点兴奋。<br>
<b>接下来这一课，专门用来打碎这份兴奋。</b></div>
</div></body></html>


>>> 故障 A · 路径逃逸 #B03
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;margin-bottom:42px}
h1 span{color:#ff7b72}
.term{width:100%;background:#161b22;border:1px solid #30363d;border-radius:18px;overflow:hidden;margin-bottom:42px}
.bar{height:54px;background:#0d1117;display:flex;align-items:center;gap:12px;padding:0 26px;border-bottom:1px solid #30363d}
.dot{width:18px;height:18px;border-radius:50%}
.body{padding:34px 48px;font-family:"JetBrains Mono",monospace;font-size:29px;line-height:1.9}
.p{color:#ff7b72}.r{color:#ff7b72}.g{color:#3fb950}.c{color:#8b949e}
.fix{background:#0d1117;border:1px solid #30363d;border-left:8px solid #3fb950;border-radius:14px;padding:30px 44px;font-size:30px;line-height:1.8}
.fix b{color:#3fb950}
code{font-family:"JetBrains Mono",monospace;color:#a5d6ff}
</style></head><body><div class="wrap">
<h1>故障 A · 路径逃逸：<span>工作目录形同虚设</span></h1>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">$</span> 让 agent 读 ../../../../Windows/System32/drivers/etc/hosts</div>
<div class="r">→ 它读到了。约束不存在。</div>
</div>
</div>
<div class="fix">修法：<code>resolveInside(cwd, p)</code><br>
<b>path.relative</b> 判断：<code>rel.startsWith("..") || path.isAbsolute(rel)</code> 即越界，抛 <code>path escapes workspace</code><br>
错误信息保留模型的<b>原始输入</b>，方便它自己改路径重试。</div>
</div></body></html>


>>> 前缀陷阱 #B04
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
h1{font-size:54px;margin-bottom:60px}
.diagram{display:flex;align-items:center;justify-content:center;gap:40px;margin-bottom:70px}
.node{font-family:"JetBrains Mono",monospace;font-size:44px;padding:34px 54px;border-radius:16px}
.ok{background:#161b22;border:3px solid #3fb950}
.evil{background:#161b22;border:3px solid #f85149;margin-top:60px}
.eq{font-size:70px;color:#8b949e}
.verdict{display:flex;gap:44px}
.v{flex:1;border-radius:16px;padding:36px 40px;font-size:31px;line-height:1.7}
.v b{font-size:34px}
.bad{background:#2d1517;border:1px solid #f85149;color:#ff7b72}
.good{background:#12261e;border:1px solid #3fb950;color:#3fb950}
code{font-family:"JetBrains Mono",monospace}
</style></head><body><div class="wrap">
<h1>陷阱题：为什么不用 startsWith？</h1>
<div class="diagram">
<div class="node ok">/work</div>
<div class="eq">vs</div>
<div class="node evil">/work-evil</div>
</div>
<div class="verdict">
<div class="v bad"><b>✗ abs.startsWith(cwd)</b><br>cwd 是 <code>/work</code> 时，<code>/work-evil/secret</code> 一样通过——前缀相同</div>
<div class="v good"><b>✓ path.relative 再判断</b><br>算出 <code>../evil/secret</code>，以 <code>..</code> 开头，正确拒绝</div>
</div>
</div></body></html>


>>> 软链与约束的边界 #B05
@enter: fade-up
@exit: fade
@visual: animation

深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「软链逃逸与约束的边界」字号 52px。
旁白第 1 行期间：画面中央画一个工作区：一个大的圆角矩形「工作目录」（1400px 宽 420px 高，#161b22 底、#30363d 边框、居中标签字号 36px），内部左下有一个文件夹图标和文字 `secret.txt`。
旁白第 2 行期间：工作目录内部出现一条曲线（软链，accent #58a6ff 虚线），从目录内一点延伸出目录外，指向外部的一个红色 #f85149 边框小卡片「外部文件」。
旁白第 3 行期间：虚线中部出现一把锁图标和标签「realpathSync 再验一次」字号 30px #3fb950，软链曲线被打上一个红色叉号。
旁白第 4 行期间：工作目录右侧出现一小段灰色虚线时间窗（两端标「检查」「读写」），中间标注「TOCTOU 竞态窗口」字号 28px #8b949e，窗口内画一个问号。
旁白第 5 行期间：底部浮现结论条（宽 1400px、#161b22 底、左 8px accent 边框）「诚实画出约束的边界，比假装安全有价值」字号 32px。
避让底部 120px 字幕区。


>>> 故障 B · 上下文爆炸 #B06
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;margin-bottom:42px}
.err{background:#2d1517;border:1px solid #f85149;border-radius:16px;padding:30px 44px;font-family:"JetBrains Mono",monospace;font-size:31px;color:#ff7b72;margin-bottom:44px}
.math{display:flex;gap:36px;margin-bottom:44px}
.m{flex:1;background:#161b22;border:1px solid #30363d;border-top:6px solid #58a6ff;border-radius:14px;padding:32px 30px;text-align:center}
.big{font-size:64px;font-weight:800;color:#58a6ff}
.lab{font-size:26px;color:#8b949e;margin-top:16px;line-height:1.6}
.foot{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:30px 40px;font-size:30px;line-height:1.7}
.foot b{color:#58a6ff}.foot .r{color:#ff7b72}
code{font-family:"JetBrains Mono",monospace;color:#a5d6ff}
</style></head><body><div class="wrap">
<h1>故障 B · 一次 read 炸掉整个会话</h1>
<div class="err">400: the request exceeds the available context size —— 会话直接作废</div>
<div class="math">
<div class="m"><div class="big">5 MB</div><div class="lab">package-lock.json 整个塞进请求<br>≈ 超过 65536 上下文</div></div>
<div class="m"><div class="big">8%</div><div class="lab">截断默认 200 行 / 20 KB<br>按实测分词比例 ≈ 5400 token</div></div>
<div class="m"><div class="big">1 行</div><div class="lab">[truncated: showing first 200<br>of 12043 lines]</div></div>
</div>
<div class="foot">阈值不是拍脑袋：要按 <b>token 占比</b> 算账。<br>截断后<code class="r">必须告诉模型被截断了</code>——静默截断让它以为看完了全文，比报错更糟。</div>
</div></body></html>


>>> 故障 C · edit 改错地方 #B07
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;margin-bottom:42px}
pre{font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.95;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:44px 56px;white-space:pre;margin-bottom:40px}
.n{color:#8b949e}.hl{background:#1f3a5f;border-radius:6px;padding:2px 10px}.bad{background:#3d1d20;border-radius:6px;padding:2px 10px;color:#ff7b72}
.rule{background:#0d1117;border:1px solid #30363d;border-left:10px solid #58a6ff;border-radius:16px;padding:38px 48px;font-size:34px;line-height:1.8}
.rule b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>故障 C · String.replace 改错地方</h1>
<pre><span class="n"> 8|</span> const x = 1;
<span class="n">12|</span> <span class="hl">const x = 1;</span>   <span class="n">← replace 改了第一个匹配</span>
<span class="n">45|</span> <span class="bad">const x = 1;</span>   <span class="n">← 模型想改的是这处？</span>
<span class="n">78|</span> const x = 1;      <span class="n">← 静默失败，没有任何报错</span></pre>
<div class="rule">本课最重要的规则：<b>old_string 必须在文件中唯一，否则拒绝执行</b><br>
出现多次 → 报错并列出<b>全部行号</b>，文件一个字节都不动。</div>
</div></body></html>


>>> 好错误信息 #B08
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
h1{font-size:54px;margin-bottom:50px}
pre{font-family:"JetBrains Mono",monospace;font-size:32px;line-height:1.9;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:48px 56px;white-space:pre;color:#ff7b72;margin-bottom:50px}
pre b{color:#58a6ff;font-weight:700}
.flow{display:flex;align-items:center;justify-content:center;gap:30px;font-size:30px;color:#e6edf3}
.step{background:#0d1117;border:1px solid #30363d;border-radius:12px;padding:22px 34px}
.arr{color:#58a6ff;font-size:38px}
.note{margin-top:46px;text-align:center;font-size:33px;color:#8b949e}
.note b{color:#e6edf3}
</style></head><body><div class="wrap">
<h1>错误信息不是写给人的</h1>
<pre>error: old_string found 3 times in src/app.ts (<b>lines 12, 45, 78</b>).
<b>Provide more surrounding context</b> to make it unique, or set replace_all.</pre>
<div class="flow">
<div class="step">模型收到报错</div><div class="arr">→</div>
<div class="step">read 那几行</div><div class="arr">→</div>
<div class="step">补上下文重试</div><div class="arr">→</div>
<div class="step" style="border-color:#3fb950;color:#3fb950">成功 ✓</div>
</div>
<div class="note">行号是给模型的 <b>定位坐标</b>，那句英文提示是给模型的 <b>修复指引</b>。<br>好的错误信息，是 agent 的一部分。</div>
</div></body></html>


>>> 故障 D · 命令挂起 #B09
@enter: slide-left
@exit: fade
@visual: animation

深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「故障 D · 命令挂起与进程树」字号 52px。
旁白第 1 行期间：中央出现进程树图：顶部节点 `bash -c "sleep 300"`（圆角卡 340x110px，#161b22 底，字号 30px 等宽），下方两个子节点 `sleep 300` 和 `node server.ts`（各 300x100px），节点间用 #8b949e 线连接；整棵树上方一个时钟图标缓慢旋转，标注「agent 卡死，Ctrl+C 也不一定救得回来」字号 28px #ff7b72。
旁白第 3 行期间：一条红色 #f85149 大叉只打在 bash 顶部节点上，bash 节点变暗消失，两个子节点仍亮着并标注「孤儿进程，还占着端口」字号 27px #ff7b72。
旁白第 4 行期间：场景重置为完整进程树，一条 accent #58a6ff 的横扫光线从上到下穿过整棵树，三个节点全部变绿 #3fb950 并打上对勾，上方标签「kill 整个进程树」字号 32px。
旁白第 5 行期间：底部浮现两行等宽代码（字号 28px，#a5d6ff）：`Windows: taskkill /PID <pid> /T /F` 和 `POSIX:   process.kill(-pid)`，左 6px accent 边框。
避让底部 120px 字幕区。


>>> Windows 的真坑 #B10
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:52px;margin-bottom:46px}
pre{font-family:"JetBrains Mono",monospace;font-size:30px;line-height:2.0;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:44px 56px;white-space:pre;margin-bottom:44px}
.c{color:#8b949e}
.r{color:#ff7b72}.rb{border-left:8px solid #f85149;display:inline-block;padding-left:18px}
.g{color:#3fb950}.gb{border-left:8px solid #3fb950;display:inline-block;padding-left:18px}
.foot{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:30px 42px;font-size:31px;line-height:1.7}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>同一台机器上有三个 bash</h1>
<pre><span class="c">$ where bash</span>
<span class="rb">C:\Windows\System32\bash.exe</span>                  <span class="r">← 这是 WSL！</span>
C:\Users\you\...\WindowsApps\bash.exe      <span class="c">← 也是 WSL</span>
<span class="gb">C:\Program Files\Git\bin\bash.exe</span>          <span class="g">← Git Bash，要这个</span></pre>
<div class="foot">在 WSL 眼里，<b>G 盘是 /mnt/g</b>——agent 会在一个和文件工具<b>完全不同的文件系统</b>里操作，症状极难排查。<br>所以 shell 必须<b>显式探测</b>：优先 Git Bash，启动时打印实际使用的路径自证。</div>
</div></body></html>


>>> system prompt #B11
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:30px;line-height:1.95;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:44px 58px;white-space:pre;color:#a5d6ff;margin-bottom:44px}
.c{color:#8b949e}
.rule{display:flex;gap:36px}
.r{flex:1;background:#0d1117;border:1px solid #30363d;border-radius:14px;padding:30px 32px;font-size:29px;line-height:1.7}
.r b{font-size:32px}
.r.bad b{color:#ff7b72}.r.good b{color:#3fb950}
</style></head><body><div class="wrap">
<h1>system prompt · 五条，与代码一一对应</h1>
<pre>You are a coding agent working in <span class="c">${cwd}</span>.
- Read a file before editing it. Never guess its contents.
- Prefer edit over write for existing files.
- edit requires old_string to appear exactly once.
- All paths must stay inside the workspace.
- Explain what you changed after you finish.</pre>
<div class="rule">
<div class="r bad"><b>✗ 只写不做</b><br>「不要越界」写在 prompt 里，代码不检查——模型会忘、会幻觉、会被绕过</div>
<div class="r good"><b>✓ 一一对应</b><br>prompt 每一条，代码里都真的强制；代码强制的，prompt 里都说清</div>
</div>
</div></body></html>


>>> 见真章 #B12
@enter: zoom-in
@exit: fade
@visual: video(./assets/hellojs-demo.mp4)

（此描述仅作文档用途，实际使用 ./assets/hellojs-demo.mp4）
真实录屏：agent 在 demo/tmp 创建 hello.js 并用 node 运行验证。


>>> pi 对照 #B13
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:54px;margin-bottom:48px}
.row{display:flex;gap:40px;margin-bottom:44px}
.m{flex:1;background:#161b22;border:1px solid #30363d;border-radius:16px;padding:34px 38px;text-align:center}
.f{font-family:"JetBrains Mono",monospace;font-size:26px;color:#a5d6ff;margin-bottom:20px}
.n{font-size:76px;font-weight:800}
.n.our{color:#58a6ff}
.d{font-size:26px;color:#8b949e;margin-top:14px}
.foot{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:32px 44px;font-size:32px;line-height:1.8;text-align:center}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>pi 对照 · 它踩了四十个坑，我们踩了四个</h1>
<div class="row">
<div class="m"><div class="f">pi · edit.ts + edit-diff.ts</div><div class="n">627</div><div class="d">多重编辑 · CRLF 保持 · BOM · unified diff</div></div>
<div class="m"><div class="f">我们 · edit.ts</div><div class="n our">60</div><div class="d">唯一匹配 + 行号报错 + replace_all</div></div>
<div class="m"><div class="f">pi · env/nodejs.ts</div><div class="n">695</div><div class="d">完整 shell 候选链 · 进程树 · 跨平台</div></div>
<div class="m"><div class="f">我们 · bash.ts</div><div class="n our">129</div><div class="d">超时 · 进程组 · 截断</div></div>
</div>
<div class="foot">四个坑已经足够理解这类工具的<b>设计原则</b>：<br>约束在代码里，不在愿望里。</div>
</div></body></html>
