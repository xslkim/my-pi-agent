>>> 第 1 课开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满整个画面，内容居中占画布约 80% 宽度。
[0s] 左上角小标签 "第 1 课 · L1" 淡入，accent 色 #58a6ff，字号 30px，等宽字体。
[0.3s] 主标题 "让模型说话" 淡入上移，白色 #e6edf3，粗体，字号 120px，距顶约 360px。
[1s] 副标题 "调用一次大模型，到底发生了什么？" 淡入，颜色 #8b949e，字号 42px，主标题下方 48px。
[1.8s] 副标题下 36px 出现 4px 粗 accent 横线从左向右扫入，宽 480px。
[2.2s] 横线下 48px 淡入一行小字 "把 SDK 扔掉，从字节层面重造一遍"，字号 30px，#8b949e。
避让底部 120px 字幕区。

--- narration ---
第一课要回答一个问题
调用一次大模型，**到底发生了什么**
大多数人只见过 SDK 的一个函数调用
这一课我们把 SDK 扔掉
从字节层面把它重造一遍


>>> 先看协议 #B02
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center}
.term{width:1640px;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:62px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d}
.dot{width:20px;height:20px;border-radius:50%}
.body{padding:44px 56px;font-family:"JetBrains Mono",monospace;font-size:29px;line-height:1.85}
.p{color:#ff7b72}.d{color:#a5d6ff}.c{color:#8b949e}.k{color:#d2a8ff}.g{color:#3fb950}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">$</span> curl -N $LLM_BASE_URL/chat/completions <span class="c">\</span></div>
<div>&nbsp;&nbsp;-H <span class="d">"content-type: application/json"</span> <span class="c">\</span></div>
<div>&nbsp;&nbsp;-d <span class="d">'{"model":"qwen3.8-27b","stream":true,"messages":[...]}'</span></div>
<div>&nbsp;</div>
<div><span class="k">data:</span> {"choices":[{"delta":{"content":"数"}}]}</div>
<div>&nbsp;</div>
<div><span class="k">data:</span> {"choices":[{"delta":{"content":"到"}}]}</div>
<div>&nbsp;</div>
<div><span class="k">data:</span> {"choices":[{"delta":{"content":"三"}}]}</div>
<div>&nbsp;</div>
<div><span class="k">data:</span> <span class="g">[DONE]</span></div>
</div>
</div>
</body></html>

--- narration ---
不写代码，先用 curl 看真实的字节流
请求发出去，屏幕上滚过的就是 **SSE**
每个事件以 data 冒号开头
事件之间用 **两个换行** 分隔
最后以 data 中括号 DONE 结束


>>> 解剖一个事件 #B03
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
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
      <span class="a">"reasoning_content"</span>: "想想", <span class="c">// 思考增量</span>
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

--- narration ---
拆开一个事件看
content 是正文 **增量**，不是完整回答
reasoning_content 是思考过程
finish_reason 说明模型为什么停下
所谓流式，就是把回答拆成碎片逐个发给你


>>> 天真的解析器 #B04
@enter: fade
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
最直觉的写法，是收到一块就切一块
但 TCP 不保证事件边界
一个事件可能被切成 **两半** 送达
天真解析器拿到半截 JSON
直接吐出乱码或者丢字


>>> 坑一 · 跨 chunk 缓冲 #B05
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
画面中上部有一个宽 1600px 高 130px 的「字节流轨道」（背景 #161b22、圆角 14px、边框 #30363d），内部是一段浅色 #a5d6ff 等宽文本 `data: {"choices":[{"delta":{"content":"你"}}]}` 加尾部两个换行符标记。
旁白第 2 行期间：轨道上方落下三块碎片卡片（各约 500px 宽、110px 高、#0d1117 底、#30363d 边框、圆角 12px、等宽字号 30px），分别写着 `data: {"choi`、`ces":[{"delta":{"con`、`tent":"你"}}]}\n\n`，依次从上方淡入落到轨道里。
旁白第 3 行期间：轨道右侧出现一个大号 `buffer +=` 标签（accent 色 #58a6ff、字号 36px、等宽），三块碎片在轨道内合并成完整一串（平滑动画）。
旁白第 4 行期间：轨道内出现一条 4px accent 竖线扫描，找到 `\n\n` 位置停住并高亮成绿色 #3fb950，右侧弹出一张小卡「完整事件 ✓」字号 30px。
旁白第 5 行期间：完整事件卡上移飞出，轨道尾部剩余半截文字微微闪烁，旁边小字标注「切一半的留在缓冲区，等下一块」字号 26px #8b949e。
标题区：顶部距边 70px 有标题「坑 1 · 事件被 TCP 切两半」字号 54px #e6edf3。全部内容避让底部 120px 字幕区。

--- narration ---
第一个坑，**跨 chunk 缓冲**
一个事件到达时是三块碎片
修法：每收到一块，先拼进缓冲区
再循环找双换行，找到完整事件才处理
切一半的留在缓冲区，等下一块到齐


>>> 坑二 · 中文跨字节 #B06
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
旁白第 2 行期间：中央出现大字「你」（字号 200px，白色 #e6edf3），下方并列显示它的三个 UTF-8 字节方块：`e4` `bd` `a0`（各 150px 见方，#161b22 底、#30363d 边框、圆角 16px、等宽字号 44px、#a5d6ff），三块之间有细线连到「你」字。
旁白第 3 行期间：一条 4px 红色 #f85149 竖分割线从 `bd` 和 `a0` 之间落下，把三块字节分成左二右一，右侧那块微微下沉变暗，上方浮现红色小字「半个字符」字号 30px。
旁白第 4 行期间：分割线变绿色 #3fb950，字节块重新合拢，下方浮现一行等宽代码 `decoder.decode(chunk, { stream: true })` 字号 36px，accent 色 #58a6ff，「stream: true」高亮加粗。
旁白第 5 行期间：底部出现结论条（宽 1200px、#161b22 底、左侧 6px accent 边）：「解码器自己保留不完整的字节」字号 32px。
顶部标题「坑 2 · 多字节字符被切在中间」字号 54px。避让底部 120px 字幕区。

--- narration ---
第二个坑藏得更深
一个汉字是 **三个字节**，可能正好被切在中间
不加处理的解码器会把半截字节变成乱码
修法只有一行：decode 加上 **stream true**
让解码器自己保留不完整的字节


>>> 坑三 · usage 延迟的 done #B07
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border_box}
*{box-sizing:border-box}
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

--- narration ---
第三个坑，只有真机抓包才能看到
finish_reason 和 usage **不在同一块** 里
带 usage 的末块，choices 还是空数组
看到 finish_reason 就发 done，usage 永远是空的
正确做法：两个都先存着
**流结束时** 再统一发 done 事件


>>> 假模型服务器 #B08
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
怎么离线测试这些分片情况？
我们写一个 **假模型服务器**
它按脚本回放 SSE 字节流
可以切在任意字节边界，包括汉字中间
全部测试毫秒级，断网也能跑
能伪造协议，才说明你真的懂协议


>>> streamChat 设计 #B09
@enter: fade
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
客户端做成 **async generator**
调用方用 for await 消费，天然支持提前 break
这个设计让第四课的中止功能便宜了很多
测试也简单，收集成数组就能断言


>>> 见真章 #B10
@enter: zoom-in
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center}
.term{width:1640px;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:62px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d}
.dot{width:20px;height:20px;border-radius:50%}
.body{padding:46px 60px;font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.9}
.p{color:#ff7b72}.dim{color:#8b949e}.tok{color:#8b949e}.g{color:#3fb950}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">$</span> node src/cli.ts "用三句话解释什么是 SSE"</div>
<div class="dim">思考中…用户要求三句话，需要简洁……</div>
<div>&nbsp;</div>
<div>SSE 通常指 Server-Sent Events，一种服务器单向推送的技术。</div>
<div>它使用文本事件流，适合行情、通知等持续更新场景。</div>
<div>它比 WebSocket 更简单，并且支持自动重连。</div>
<div>&nbsp;</div>
<div class="tok">[tokens: in=58 out=330]</div>
<div>&nbsp;</div>
<div class="g">✔ 思考暗色显示 · 正文逐字流式 · 末尾打印 token 用量</div>
</div>
</div>
</body></html>

--- narration ---
见真章
一行命令，回答在终端里 **逐字蹦出来**
思考过程用暗色显示，和正文分得清
末尾一行 token 统计——延迟 done 的设计在这里兑现
记住，它现在只会说话，不会做事
下一课，给它装手


>>> pi 对照 #B11
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:56px;margin-bottom:50px}
.row{display:flex;align-items:stretch;gap:60px;justify-content:center;margin-bottom:52px}
.card{width:560px;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:44px 40px;text-align:center}
.file{font-family:"JetBrains Mono",monospace;font-size:26px;color:#a5d6ff;margin-bottom:24px}
.num{font-size:120px;font-weight:800;line-height:1}
.vs{display:flex;align-items:center;font-size:56px;color:#58a6ff;font-weight:700}
pre{font-family:"JetBrains Mono",monospace;font-size:28px;line-height:1.8;background:#161b22;border:1px solid #30363d;border-radius:16px;padding:36px 48px;white-space:pre;color:#a5d6ff}
.c{color:#8b949e}.k{color:#ff7b72}
.foot{margin-top:40px;text-align:center;font-size:32px}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>pi 对照 · openai-completions.ts</h1>
<div class="row">
<div class="card"><div class="file">pi</div><div class="num">1577 行</div></div>
<div class="vs">VS</div>
<div class="card"><div class="file">我们 · llm.ts</div><div class="num" style="color:#58a6ff">115 行</div></div>
</div>
<pre><span class="c">// pi 源码第 493 行：光"思考字段"就要兼容三种命名</span>
<span class="k">const</span> reasoningFields = [<span class="a">"reasoning_content"</span>, <span class="a">"reasoning"</span>, <span class="a">"reasoning_text"</span>];</pre>
<div class="foot">那 1462 行不是废话，是 <b>兼容性税</b>。你只打一个端点时，不必交这个税。</div>
</div></body></html>

--- narration ---
每课末尾，对照 pi
它的兼容层一千五百七十七行
光思考字段就要认三种名字，还得防重复
我们只服务一个端点，一百一十五行
多出来的行数不是废话
是四十家厂商的 **兼容性税**


>>> 第 1 课小结 #B12
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
第一课的三个坑，全部来自真实字节流
缓冲区、stream 解码、延迟的 done
假模型服务器会陪我们走到最后一课
课后有三道练习
下一课，让模型 **动手**
