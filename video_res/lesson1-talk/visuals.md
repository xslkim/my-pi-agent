>>> 你每天都在用的黑盒 #B01
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
.term{width:1700px;margin:0 auto;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:62px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d}
.dot{width:20px;height:20px;border-radius:50%}
.body{padding:40px 56px;font-family:"JetBrains Mono",monospace;font-size:30px;line-height:2.0}
.p{color:#ff7b72}.dim{color:#8b949e}.g{color:#3fb950}.a{color:#58a6ff}
.q{text-align:center;font-size:88px;font-weight:800;margin-top:70px}
.q b{color:#58a6ff}
</style></head><body><div class="wrap">
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">›</span> 帮我给登录页加上「记住我」</div>
<div class="dim">⠿ 读取 src/Login.tsx …</div>
<div class="dim">⠿ 修改 src/Login.tsx <span class="g">(+12 -3)</span></div>
<div class="dim">⠿ 运行 npm test <span class="g">✔ 14 passed</span></div>
<div class="a">✔ 完成：勾选后下发 30 天有效期的 cookie</div>
</div>
</div>
<div class="q">它是怎么<b>做到</b>的？</div>
</div></body></html>


>>> 拆开黑盒 #B02
@enter: fade-up
@exit: fade
@visual: animation

要点列表（命中预制组件库 KeyPoints）：标题「agent 的五层能力」，5 条要点，跟随旁白逐条高亮（旁白恰好 5 行，与 5 条一一对应，用 props.lineTimings 驱动）：
① 说话 —— 详情「一条到模型的流式通道」
② 动手 —— 详情「模型发号施令，loop 执行工具」
③ 改代码 —— 详情「read / write / edit / bash」
④ 好用 —— 详情「会话 · 中止 · 上下文 · 重试」
⑤ 交付 —— 详情「空目录里做出登录应用」


>>> 五课路线图 #B03
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 80px 0}
h1{font-size:64px;text-align:center;margin-bottom:70px}
.cards{display:flex;gap:40px}
.c{flex:1;background:#161b22;border:1px solid #30363d;border-top:6px solid #58a6ff;border-radius:18px;padding:44px 36px;height:560px}
.n{font-size:30px;color:#58a6ff;font-weight:700;letter-spacing:2px}
.t{font-size:42px;font-weight:700;margin:22px 0 18px}
.d{font-size:29px;color:#8b949e;line-height:1.6}
.tag{margin-top:26px;display:inline-block;font-family:"JetBrains Mono",monospace;font-size:24px;color:#a5d6ff;background:#0d1117;border:1px solid #30363d;border-radius:10px;padding:8px 16px}
</style></head><body><div class="wrap">
<h1>五课五目标 · 每课一个 git tag</h1>
<div class="cards">
<div class="c"><div class="n">L1</div><div class="t">让模型说话</div><div class="d">手写 SSE 客户端<br>终端流式输出回答与思考</div><div class="tag">l1-talk</div></div>
<div class="c"><div class="n">L2</div><div class="t">让模型动手</div><div class="d">tool calling 协议<br>agent loop 调工具再作答</div><div class="tag">l2-tools</div></div>
<div class="c"><div class="n">L3</div><div class="t">改代码</div><div class="d">read / write / edit / bash<br>四个受约束的工具</div><div class="tag">l3-coding</div></div>
<div class="c"><div class="n">L4</div><div class="t">让它好用</div><div class="d">REPL · 中止 · 会话<br>上下文预算 · 重试</div><div class="tag">l4-usable</div></div>
<div class="c"><div class="n">L5</div><div class="t">让它交付</div><div class="d">在空目录里做出<br>登录应用并通过验收</div><div class="tag">l5-delivery</div></div>
</div>
</div></body></html>


>>> 为什么不 import pi #B04
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:110px 80px 0}
h1{font-size:60px;text-align:center;margin-bottom:80px}
.row{display:flex;align-items:stretch;justify-content:center;gap:70px}
.card{width:660px;background:#161b22;border:1px solid #30363d;border-radius:20px;padding:56px 48px;text-align:center}
.file{font-family:"JetBrains Mono",monospace;font-size:28px;color:#a5d6ff;margin-bottom:34px}
.num{font-size:150px;font-weight:800;line-height:1}
.who{font-size:32px;color:#8b949e;margin-top:30px}
.vs{display:flex;align-items:center;font-size:64px;color:#58a6ff;font-weight:700}
.note{margin-top:70px;text-align:center;font-size:34px;color:#e6edf3}
.note b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>同一个模块，两种写法</h1>
<div class="row">
<div class="card"><div class="file">pi · openai-completions.ts</div><div class="num">1577</div><div class="who">行 · 服务 40 家模型厂商</div></div>
<div class="vs">VS</div>
<div class="card"><div class="file">我们 · llm.ts</div><div class="num" style="color:#58a6ff">149</div><div class="who">行 · 只服务一个端点</div></div>
</div>
<div class="note">差的那 1428 行，就是这门课要讲清的 <b>兼容性税</b></div>
</div></body></html>


>>> 零依赖运行 #B05
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center}
.term{width:1560px;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:62px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d}
.dot{width:20px;height:20px;border-radius:50%}
.body{padding:48px 56px;font-family:"JetBrains Mono",monospace;font-size:32px;line-height:1.9}
.p{color:#ff7b72}.c{color:#8b949e}.g{color:#3fb950}.y{color:#d2a8ff}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">$</span> node -v</div>
<div>v25.2.1&nbsp;&nbsp;<span class="c"># 原生跑 TypeScript，无构建步骤</span></div>
<div>&nbsp;</div>
<div><span class="p">$</span> node src/cli.ts <span class="y">"你好"</span></div>
<div class="c">（终端逐字流式输出……）</div>
<div>[tokens: in=58 out=330]</div>
<div>&nbsp;</div>
<div><span class="p">$</span> node --test</div>
<div><span class="g">✔ pass 108</span>&nbsp;&nbsp;<span class="c"># 全部离线，拔掉网线也能跑</span></div>
<div>&nbsp;</div>
<div><span class="p">$</span> cat package.json <span class="c"># dependencies: {}</span></div>
</div>
</div>
</body></html>


>>> 三个固定环节 #B06
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:100px 80px 0}
h1{font-size:60px;text-align:center;margin-bottom:80px}
.row{display:flex;gap:44px}
.c{flex:1;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:52px 44px;height:520px}
.i{font-size:76px}
.t{font-size:44px;font-weight:700;margin:28px 0 20px;color:#58a6ff}
.d{font-size:30px;color:#8b949e;line-height:1.7}
</style></head><body><div class="wrap">
<h1>每节课的三个固定环节</h1>
<div class="row">
<div class="c"><div class="i">🔒</div><div class="t">验收先行</div><div class="d">考卷在 agent 进场前写好锁定<br>改考卷比改代码容易<br>必须有机制挡住这个诱惑</div></div>
<div class="c"><div class="i">💥</div><div class="t">故障注入</div><div class="d">不等真实网络偶发 bug<br>主动把东西弄坏<br>先看见坏，再学会修</div></div>
<div class="c"><div class="i">📐</div><div class="t">pi 对照</div><div class="d">每课末尾打开 pi 源码<br>诚实给出行数差<br>讲清工业级多做了什么</div></div>
</div>
</div></body></html>


>>> 开始第一课 #B07
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3;display:flex;flex-direction:column;align-items:center;justify-content:center}
h1{font-size:100px;font-weight:800}
.sub{font-size:34px;color:#8b949e;margin:44px 0 64px}
.cmd{font-family:"JetBrains Mono",monospace;font-size:36px;background:#161b22;border:1px solid #30363d;border-radius:14px;padding:26px 48px;color:#a5d6ff}
.line{width:520px;height:4px;background:#58a6ff;margin-bottom:56px;border-radius:2px}
</style></head><body>
<div class="line"></div>
<h1>现在，从第一课开始</h1>
<div class="sub">每课一个标签，随时回到任意一课的状态</div>
<div class="cmd">git checkout l1-talk</div>
</body></html>


>>> 第 1 课开场 #B08
@enter: fade-up
@exit: fade
@visual: animation

标题页（命中预制组件库 TitleCard）：
kicker：「第 1 课 · L1」
主标题：「让模型说话」
副标题：「调用一次大模型，到底发生了什么？」
居中排版，主题默认配色。


>>> 先看协议 #B09
@enter: fade
@exit: fade
@visual: video(./assets/curl-sse.mp4)

（此描述仅作文档用途，实际使用 ./assets/curl-sse.mp4）
真实录屏：curl -N 以 300B/s 限速拉取 SSE 字节流，data: 事件逐行到达，最后 [DONE]。


>>> 解剖一个事件 #B10
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
pre{font-family:"JetBrains Mono",monospace;font-size:33px;line-height:1.8;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:52px 60px;white-space:pre}
.a{color:#58a6ff;font-weight:700}.s{color:#a5d6ff}.c{color:#8b949e}.k{color:#ff7b72}
.note{display:flex;gap:36px;margin-top:52px}
.n{flex:1;background:#0d1117;border:1px solid #30363d;border-left:6px solid #58a6ff;border-radius:12px;padding:26px 30px;font-size:28px;color:#e6edf3}
.n b{color:#58a6ff;font-family:"JetBrains Mono",monospace;font-size:26px}
</style></head><body><div class="wrap">
<pre>{
  "choices": [{
    "delta": {
      <span class="a">"content"</span>: "你",            <span class="c">// 正文增量</span>
      <span class="a">"reasoning_content"</span>: "想想"  <span class="c">// 思考增量</span>
    },
    <span class="a">"finish_reason"</span>: null          <span class="c">// 为什么停下</span>
  }],
  <span class="a">"usage"</span>: null                    <span class="c">// token 用量（最后才有）</span>
}</pre>
<div class="note">
<div class="n"><b>delta.content</b><br>正文的碎片，拼起来才是完整回答</div>
<div class="n"><b>reasoning_content</b><br>llama.cpp 特有的思考字段</div>
<div class="n"><b>finish_reason</b><br>stop 正常结束 / tool_calls 要调工具</div>
</div>
</div></body></html>


>>> 天真的解析器 #B11
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;color:#ff7b72;margin-bottom:40px}
pre{font-family:"JetBrains Mono",monospace;font-size:32px;line-height:1.8;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:40px 56px;white-space:pre}
.k{color:#ff7b72}.f{color:#d2a8ff}.c{color:#8b949e}.s{color:#a5d6ff}
.err{margin-top:40px;background:#2d1517;border:1px solid #f85149;border-radius:14px;padding:30px 44px;font-family:"JetBrains Mono",monospace;font-size:30px;color:#ff7b72}
.why{margin-top:34px;font-size:31px;color:#8b949e}
.why b{color:#e6edf3}
</style></head><body><div class="wrap">
<h1>✗ 最直觉的写法（错误示范）</h1>
<pre><span class="k">for await</span> (<span class="k">const</span> chunk <span class="k">of</span> res.body) {
  <span class="c">// 收到一块就切一块 —— 大多数人答不出这里错在哪</span>
  <span class="k">for</span> (<span class="k">const</span> line <span class="k">of</span> chunk.split(<span class="s">"\n\n"</span>)) { <span class="f">handle</span>(line) }
}</pre>
<div class="err">SyntaxError: Unexpected token in JSON at position 7 &nbsp;→ 输出乱码 / 丢字</div>
<div class="why">问题：<b>TCP 不保证事件边界</b>。一个 data 事件可能被切成两半送达，
split 拿到的是半截 JSON。</div>
</div></body></html>


>>> 坑一 · 跨 chunk 缓冲 #B12
@enter: fade-up
@exit: fade
@visual: animation

深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
画面中上部有一个宽 1600px 高 130px 的「字节流轨道」（背景 #161b22、圆角 14px、边框 #30363d），内部是一段浅色 #a5d6ff 等宽文本 `data: {"choices":[{"delta":{"content":"你"}}]}` 加尾部两个换行符标记。
旁白第 2 行期间：轨道上方落下三块碎片卡片（各约 500px 宽、110px 高、#0d1117 底、#30363d 边框、圆角 12px、等宽字号 30px），分别写着 `data: {"choi`、`ces":[{"delta":{"con`、`tent":"你"}}]}\n\n`，依次从上方淡入落到轨道里。
旁白第 3 行期间：轨道右侧出现一个大号 `buffer +=` 标签（accent 色 #58a6ff、字号 36px、等宽），三块碎片在轨道内合并成完整一串（平滑动画）。
旁白第 4 行期间：轨道内出现一条 4px accent 竖线扫描，找到 `\n\n` 位置停住并高亮成绿色 #3fb950，右侧弹出一张小卡「完整事件 ✓」字号 30px。
旁白第 5 行期间：完整事件卡上移飞出，轨道尾部剩余半截文字微微闪烁，旁边小字标注「切一半的留在缓冲区，等下一块」字号 26px #8b949e。
标题区：顶部距边 70px 有标题「坑 1 · 事件被 TCP 切两半」字号 54px #e6edf3。全部内容避让底部 120px 字幕区。


>>> 坑二 · 中文跨字节 #B13
@enter: fade-up
@exit: fade
@visual: animation

深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
旁白第 2 行期间：中央出现大字「你」（字号 200px，白色 #e6edf3），下方并列显示它的三个 UTF-8 字节方块：`e4` `bd` `a0`（各 150px 见方，#161b22 底、#30363d 边框、圆角 16px、等宽字号 44px、#a5d6ff），三块之间有细线连到「你」字。
旁白第 3 行期间：一条 4px 红色 #f85149 竖分割线从 `bd` 和 `a0` 之间落下，把三块字节分成左二右一，右侧那块微微下沉变暗，上方浮现红色小字「半个字符」字号 30px。
旁白第 4 行期间：分割线变绿色 #3fb950，字节块重新合拢，下方浮现一行等宽代码 `decoder.decode(chunk, { stream: true })` 字号 36px，accent 色 #58a6ff，「stream: true」高亮加粗。
旁白第 5 行期间：底部出现结论条（宽 1200px、#161b22 底、左侧 6px accent 边）：「解码器自己保留不完整的字节」字号 32px。
顶部标题「坑 2 · 多字节字符被切在中间」字号 54px。避让底部 120px 字幕区。


>>> 坑三 · usage 延迟的 done #B14
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;margin-bottom:46px}
h1 span{color:#ff7b72}
.row{display:flex;gap:44px}
.col{flex:1;border-radius:18px;padding:40px 44px;background:#161b22;border:1px solid #30363d}
.col.bad{border-top:6px solid #f85149}
.col.good{border-top:6px solid #3fb950}
.t{font-size:34px;font-weight:700;margin-bottom:28px}
.bad .t{color:#ff7b72}.good .t{color:#3fb950}
pre{font-family:"JetBrains Mono",monospace;font-size:27px;line-height:1.75;white-space:pre;color:#a5d6ff}
.c{color:#8b949e}.r{color:#ff7b72}.g{color:#3fb950}
.foot{margin-top:40px;font-size:30px;color:#8b949e}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>坑 3 · finish_reason 和 usage <span>不在同一块</span>（真机抓包）</h1>
<div class="row">
<div class="col bad">
<div class="t">✗ 看到 finish_reason 就发 done</div>
<pre>data: {"choices":[{...,"finish_reason":"stop"}]}   <span class="r">← 此刻 usage 还是 null</span>
data: {"choices":[],"usage":{...}}                 <span class="r">← usage 晚一块才到，被丢掉</span>
data: [DONE]

→ done 事件里 usage 永远是空的</pre>
</div>
<div class="col good">
<div class="t">✓ 攒到流结束再发 done</div>
<pre>finishReason = "stop"    <span class="c">// 先存变量</span>
usage = {...}            <span class="c">// 后到的存下来</span>
data: [DONE]

→ 流结束时 yield { done, finishReason, usage }</pre>
</div>
</div>
<div class="foot">这个 bug 要到第 4 课打印 token 用量时才暴露——<b>协议要看真实字节，不要看想象</b>。</div>
</div></body></html>


>>> 假模型服务器 #B15
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:56px;margin-bottom:36px}
pre{font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.8;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:42px 56px;white-space:pre}
.k{color:#ff7b72}.f{color:#d2a8ff}.c{color:#8b949e}.s{color:#a5d6ff}.n{color:#79c0ff}
.row{display:flex;gap:36px;margin-top:44px}
.b{flex:1;background:#0d1117;border:1px solid #30363d;border-left:6px solid #58a6ff;border-radius:12px;padding:26px 30px;font-size:28px;color:#e6edf3}
.b b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>test/fake-llm.ts · 能伪造协议，才真懂协议</h1>
<pre><span class="k">const</span> fake = <span class="k">await</span> <span class="f">startFakeLLM</span>({
  chunks: [
    <span class="s">'data: {"choices":[{"delta":{"con'</span>,   <span class="c">// 故意从中间切开</span>
    <span class="s">'tent":"hi"}}]}\n\n'</span>,
  ],
});
<span class="c">// 一个 node:http 服务器，按脚本把 SSE 字节写回去</span>
<span class="c">// 可以切在任意字节边界 —— 包括汉字的中间</span></pre>
<div class="row">
<div class="b"><b>离线</b><br>测试不依赖网络和真实模型</div>
<div class="b"><b>毫秒级</b><br>复现真实网络才有的分片</div>
<div class="b"><b>可复现</b><br>半个 chunk、碎片、断流都能精确重放</div>
</div>
</div></body></html>


>>> streamChat 设计 #B16
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
pre{font-family:"JetBrains Mono",monospace;font-size:34px;line-height:1.85;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:52px 60px;white-space:pre}
.k{color:#ff7b72}.f{color:#d2a8ff}.c{color:#8b949e}.t{color:#79c0ff}
.why{display:flex;gap:36px;margin-top:50px}
.b{flex:1;background:#0d1110;border:1px solid #30363d;border-left:6px solid #58a6ff;border-radius:12px;padding:28px 32px;font-size:29px;line-height:1.6}
.b b{color:#58a6ff}
</style></head><body><div class="wrap">
<pre><span class="k">export async function*</span> <span class="f">streamChat</span>(opts): <span class="t">AsyncGenerator&lt;StreamEvent&gt;</span> {
  <span class="k">const</span> res = <span class="k">await</span> <span class="f">fetch</span>(url, { ...opts, <span class="c">// signal 透传</span> signal });
  <span class="k">yield*</span> <span class="f">parseSSE</span>(res.body);
}

<span class="c">// 调用方：</span>
<span class="k">for await</span> (<span class="k">const</span> ev <span class="k">of</span> <span class="f">streamChat</span>({ messages })) <span class="f">render</span>(ev);</pre>
<div class="why">
<div class="b"><b>与流同构</b><br>解析层和消费层都是 for await，心智负担只有一份</div>
<div class="b"><b>break 即中止</b><br>第 4 课的 Ctrl+C 因此几乎不要额外代码</div>
<div class="b"><b>测试友好</b><br>把事件收集成数组就能断言</div>
</div>
</div></body></html>


>>> 见真章 #B17
@enter: zoom-in
@exit: fade
@visual: video(./assets/talk-demo.mp4)

（此描述仅作文档用途，实际使用 ./assets/talk-demo.mp4）
真实录屏：node src/cli.ts 真机流式输出——暗色思考、逐字正文、末尾 token 统计。


>>> pi 对照 #B18
@enter: fade
@exit: fade
@visual: video(./assets/pi-scroll.mp4)

（此描述仅作文档用途，实际使用 ./assets/pi-scroll.mp4）
真实源码滚动：pi openai-completions.ts（1577 行）第 60–560 行匀速滚过（19.1s）。


>>> 第 1 课小结 #B19
@enter: fade-up
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
h1{font-size:58px;margin-bottom:50px}
.row{display:flex;gap:40px;margin-bottom:50px}
.c{flex:1;background:#161b22;border:1px solid #30363d;border-top:6px solid #58a6ff;border-radius:16px;padding:38px 36px}
.n{font-size:56px;font-weight:800;color:#58a6ff}
.t{font-size:34px;font-weight:700;margin:18px 0 12px}
.d{font-size:27px;color:#8b949e;line-height:1.6}
.ex{background:#0d1117;border:1px dashed #30363d;border-radius:14px;padding:32px 44px;font-size:29px;color:#a5d6ff;line-height:1.8}
.ex b{color:#e6edf3}
</style></head><body><div class="wrap">
<h1>三个坑，全部来自真实字节流</h1>
<div class="row">
<div class="c"><div class="n">1</div><div class="t">跨 chunk 缓冲</div><div class="d">先入缓冲区再按双换行切</div></div>
<div class="c"><div class="n">2</div><div class="t">UTF-8 跨字节</div><div class="d">decode 加 stream: true</div></div>
<div class="c"><div class="n">3</div><div class="t">延迟的 done</div><div class="d">usage 攒到流结束再发</div></div>
</div>
<div class="ex"><b>课后练习</b><br>
① 给 streamChat 加 onFirstToken，测出局域网模型的首字延迟<br>
② 假模型加「中途断连」脚本，让客户端优雅报错<br>
③ 思考：data: 后面没有空格，解析器还能工作吗？</div>
</div></body></html>
