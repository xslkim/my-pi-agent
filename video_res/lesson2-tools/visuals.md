>>> 第 2 课开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页（命中预制组件库 TitleCard）：
kicker：「第 2 课 · L2」
主标题：「让模型动手」
副标题：「聊天机器人和 agent 的区别是什么？—— 一个 while 循环」
居中排版，主题默认配色。


>>> 请求带上 tools #B02
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:32px;line-height:1.8;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:46px 60px;white-space:pre;color:#a5d6ff}
.k{color:#ff7b72}.s{color:#a5d6ff}.n{color:#79c0ff}.c{color:#8b949e}
.note{margin-top:44px;display:flex;gap:36px}
.b{flex:1;background:#0d1117;border:1px solid #30363d;border-left:6px solid #58a6ff;border-radius:12px;padding:26px 30px;font-size:28px;line-height:1.6}
.b b{color:#58a6ff;font-family:"JetBrains Mono",monospace}
</style></head><body><div class="wrap">
<h1>第一步：把工具说明书放进请求体</h1>
<pre>{
  "model": "qwen3.8-27b",
  "messages": [...],
  <span class="n">"tools"</span>: [{
    "type": "<span class="k">function</span>",
    "function": {
      <span class="n">"name"</span>:      <span class="s">"calculator"</span>,
      <span class="n">"description"</span>: <span class="s">"Compute a basic arithmetic operation..."</span>,
      <span class="n">"parameters"</span>:  { <span class="c">/* 手写的 JSON Schema */</span> }
    }
  }]
}</pre>
<div class="note">
<div class="b"><b>name</b><br>模型用它声明要调哪个工具</div>
<div class="b"><b>description</b><br>写得越具体，调用越准——这是 prompt 工程最实在的一课</div>
<div class="b"><b>parameters</b><br>JSON Schema 原样发给模型，不做转换</div>
</div>
</div></body></html>


>>> 响应变了 #B03
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.9;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:46px 60px;white-space:pre;color:#a5d6ff}
.n{color:#79c0ff}.g{color:#3fb950}.c{color:#8b949e}.hl{color:#58a6ff;font-weight:700}
.callout{margin-top:44px;background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:34px 44px;font-size:33px;line-height:1.7}
.callout b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>同样的问题再问一次，响应变了</h1>
<pre>data: {"choices":[{"delta":{
  <span class="n">"content"</span>: null,          <span class="c">// 正文是空的</span>
  <span class="hl">"tool_calls"</span>: [{
    "index": 0,
    "id": "SQG4ApJz...",
    "function": { "name": "calculator", "arguments": "" }
  }]
}}]}
data: {"choices":[{"delta":{},"<span class="hl">finish_reason</span>":"<span class="hl">tool_calls</span>"}]}</pre>
<div class="callout">模型<b>没有执行任何计算</b>。<br>
它只是按格式说了一句：「请帮我调 calculator，参数是这些」——这就是全部魔法。</div>
</div></body></html>


>>> 坑一 · 参数是碎片 #B04
@enter: fade-up
@exit: fade
@visual: animation

深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「坑 1 · arguments 是一片一片吐出来的（真实抓包）」字号 52px。
旁白第 2 行期间：中央出现等宽字号的五条碎片行（每条一张 1400px 宽、92px 高的 #161b22 圆角卡，字号 32px，#a5d6ff），自上而下依次淡入，内容：
  {"index":0,"id":"SQG4...","function":{"name":"calculator","arguments":"{"}}   ← 第一条，id 和 name 用 accent #58a6ff 高亮
  {"index":0,"function":{"arguments":"\"op\""}}
  {"index":0,"function":{"arguments":"\"*\""}}
  {"index":0,"function":{"arguments":",\"a\":2"}}
  {"index":0,"function":{"arguments":",\"b\":1}}"}}
旁白第 3 行期间：右侧出现大号标注「只有第一片带 id 和 name」字号 34px #8b949e，一条弧线箭头指向第一条卡。
旁白第 4 行期间：五条卡向左收拢合并成一条绿色 #3fb950 边框的完整卡：{"op":"*","a":2,"b":1}（字号 36px），上方标签「按 index 累加 → 流结束再 JSON.parse」字号 32px accent。
旁白第 5 行期间：完整卡下方浮现红色 #ff7b72 警示条「中途 parse 必失败：{"a":2 看起来像个合法的中间状态」字号 28px。
避让底部 120px 字幕区。


>>> 坑二 · 类型不是校验 #B05
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:54px;margin-bottom:44px}
h1 span{color:#ff7b72}
.left{width:820px;float:left}
pre{font-family:"JetBrains Mono",monospace;font-size:29px;line-height:1.9;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:42px 50px;white-space:pre;color:#a5d6ff}
.c{color:#8b949e}
.err{border-top:6px solid #f85149}
.t{font-size:32px;font-weight:700;margin:0 0 26px;color:#ff7b72}
.fix{margin-top:46px;background:#0d1117;border:1px solid #30363d;border-left:8px solid #3fb950;border-radius:14px;padding:32px 44px;font-size:31px;line-height:1.7}
.fix b{color:#3fb950}
.clear{clear:both}
</style></head><body><div class="wrap">
<h1>坑 2 · 类型在运行时 <span>不存在</span></h1>
<div class="left">
<div class="t">模型一定会传错的三种方式</div>
<pre class="err">{ "a": "21", "b": 2, "op": "*" }   <span class="c">// 字符串当数字</span>
{ "a": 21, "b": 2 }                 <span class="c">// 缺 op</span>
{ "name": "calc", ... }             <span class="c">// 调不存在的工具</span></pre>
</div>
<div style="width:820px;float:right">
<div class="t" style="color:#3fb950">自己写 60 行运行时校验器</div>
<pre>validate(schema, args)
→ { ok: true,  value }        <span class="c">// 数字宽容："21"→21</span>
→ { ok: false, error: 
  'field "op" is required' }  <span class="c">// 错误具体到字段</span></pre>
</div>
<div class="clear"></div>
<div class="fix">TypeScript 的类型只是注释，运行时什么都不检查。<br>校验失败<b>不抛异常</b>——把错误文本当工具结果回给模型，让它自己改。</div>
</div></body></html>


>>> 错误也是消息 · 自愈 #B06
@enter: fade-up
@exit: fade
@visual: animation

流程图（命中预制组件库 FlowDiagram）：标题「校验失败 → 回传 → 自愈」，横向 3 节点，跟随旁白推进（props.lineTimings 驱动）：
节点：①「模型」（详情：发出 tool_calls）→ ②「loop · 校验」（详情：失败不抛异常）→ ③「错误文本」（详情：field "op" is required）
边：①→② 标注「tool_calls」；②→③ 标注「校验失败」；③→① 加一条返回边，标注「当消息回传，模型补全重试」。


>>> agent loop #B07
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:56px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:33px;line-height:1.85;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:50px 60px;white-space:pre;color:#a5d6ff}
.k{color:#ff7b72}.c{color:#8b949e}.f{color:#d2a8ff}.g{color:#3fb950}
.note{margin-top:42px;display:flex;gap:34px}
.b{flex:1;background:#0d1117;border:1px solid #30363d;border-left:6px solid #58a6ff;border-radius:12px;padding:24px 28px;font-size:27px;line-height:1.6}
.b b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>整个项目的心脏 · src/loop.ts</h1>
<pre><span class="k">for</span> step = 1 .. maxSteps:
    调 streamChat(messages, tools)          <span class="c">// 边流边透传事件</span>
    把 assistant(tool_calls) 追加进 messages  <span class="c">// 先入历史！</span>
    <span class="k">if</span> 没有 tool_calls: <span class="k">return</span>            <span class="c">// 正常结束</span>
    <span class="k">for</span> each tool_call:
        validate → execute（异常 catch 成文本）
        追加 { role: "tool", tool_call_id, content }
<span class="k">yield</span> error("max steps exceeded")</pre>
<div class="note">
<div class="b"><b>一切输出经 yield</b><br>loop 内部不许 console.log，测试才能安静地跑</div>
<div class="b"><b>串行执行</b><br>并行工具留作练习，竞态会淹没主线</div>
<div class="b"><b>error 是事件不是异常</b><br>超限退出要可见，不静默</div>
</div>
</div></body></html>


>>> 消息顺序铁律 #B08
@enter: slide-left
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
.row{display:flex;gap:50px}
.col{flex:1;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:42px 46px}
.col.ok{border-top:6px solid #3fb950}
.col.bad{border-top:6px solid #f85149}
.t{font-size:34px;font-weight:700;margin-bottom:28px}
.ok .t{color:#3fb950}.bad .t{color:#ff7b72}
.msg{display:flex;align-items:center;gap:20px;background:#0d1117;border:1px solid #30363d;border-radius:12px;padding:20px 28px;margin-bottom:18px;font-family:"JetBrains Mono",monospace;font-size:28px}
.r{width:130px;text-align:center;border-radius:8px;padding:6px 0;font-weight:700;font-size:25px}
.u{background:#1f3a5f;color:#79c0ff}.a{background:#2ea04326;color:#3fb950}.t2{background:#4b4237;color:#d2a8ff}
.x{color:#ff7b72;font-size:30px;margin-left:auto}
.foot{margin-top:40px;font-size:31px;color:#8b949e}
.foot b{color:#e6edf3}
</style></head><body><div class="wrap">
<h1>消息顺序不可乱</h1>
<div class="row">
<div class="col ok">
<div class="t">✓ 合法序列</div>
<div class="msg"><span class="r u">user</span>"21*2"</div>
<div class="msg"><span class="r a">assistant</span>tool_calls: [calculator]</div>
<div class="msg"><span class="r t2">tool</span>"42" &nbsp;<span style="color:#3fb950">tool_call_id ✓</span></div>
<div class="msg"><span class="r a">assistant</span>"21*2 = 42"</div>
</div>
<div class="col bad">
<div class="t">✗ 孤儿状态</div>
<div class="msg"><span class="r u">user</span>"21*2"</div>
<div class="msg"><span class="r t2">tool</span>"42" <span class="x">找不到父消息</span></div>
<div class="msg"><span class="r a">assistant</span>tool_calls 无结果 <span class="x">悬空</span></div>
<div class="msg" style="border-color:#f85149;color:#ff7b72">→ 服务端 400，错误信息极不友好</div>
</div>
</div>
<div class="foot">这条约束在第 4 课<b>裁剪上下文</b>时会再咬人一次——裁一半同样产生孤儿。</div>
</div></body></html>


>>> maxSteps 防死循环 #B09
@enter: fade-up
@exit: fade
@visual: animation

深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「没有上限，循环会烧光上下文」字号 52px。
旁白第 1 行期间：中央出现一个循环示意：两张卡片（「模型」和「工具」）之间双向箭头，箭头上标注 `tool_calls` 与 `tool result`，卡片间开始循环闪烁（accent #58a6ff ↔ #8b949e 交替）。
旁白第 2 行期间：循环下方出现一条 1400px 宽的步数条（分 10 格，每格 140px，#161b22 底、#30363d 边框），随旁白从左到右逐格点亮 accent 色，右端标注 "maxSteps = 10" 字号 30px 等宽。
旁白第 3 行期间：步数条右侧出现上下文容量条（1000px 宽、细高 40px），随循环继续从 40% 涨到 90% 再到 100% 变红 #f85149，上方弹出标签「400: exceeds context size」字号 30px。
旁白第 4 行期间：整个循环与红条缩小下沉，上方浮出绿色 #3fb950 结论条：「maxSteps 拦下 → error: max steps exceeded (10)」字号 32px。
旁白第 5 行期间：底部两行小字对比（28px，#8b949e）：「本地免费模型：这一幕很便宜」「按 token 计费的云 API：这一幕很贵」，其中「很贵」用 #ff7b72 高亮。
避让底部 120px 字幕区。


>>> 真机踩坑 · 线格式 #B10
@enter: fade
@exit: fade
@visual: html

<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;margin-bottom:44px}
.row{display:flex;gap:44px;margin-bottom:40px}
.col{flex:1;border-radius:18px;background:#161b22;border:1px solid #30363d;padding:38px 44px}
.col.bad{border-top:6px solid #f85149}
.col.good{border-top:6px solid #3fb950}
.t{font-size:32px;font-weight:700;margin-bottom:24px}
.bad .t{color:#ff7b72}.good .t{color:#3fb950}
pre{font-family:"JetBrains Mono",monospace;font-size:28px;line-height:1.8;white-space:pre;color:#a5d6ff}
.c{color:#8b949e}.r{color:#ff7b72}.g{color:#3fb950}
.note{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:30px 40px;font-size:30px;line-height:1.7}
.note b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>真机踩坑 · 回传 tool_calls 要用线上格式</h1>
<div class="row">
<div class="col bad">
<div class="t">✗ 直接发内部形状</div>
<pre>{ "id": "call_x",
  "name": "calculator",
  "arguments": "{...}" }

<span class="r">LLM 500: Missing tool call type</span></pre>
</div>
<div class="col good">
<div class="t">✓ OpenAI 线上格式</div>
<pre>{ "id": "call_x",
  "type": <span class="g">"function"</span>,
  "function": { "name": "calculator",
                "arguments": "{...}" } }</pre>
</div>
</div>
<div class="note">这个 bug <b>假模型测不出来</b>——它校验的是我们自己定义的形状。<br>真机第一跑工具就炸出来；转换放在 llm.ts 发请求处，内部结构保持简单。</div>
</div></body></html>


>>> 见真章 #B11
@enter: zoom-in
@exit: fade
@visual: video(./assets/calc-tools.mp4)

（此描述仅作文档用途，实际使用 ./assets/calc-tools.mp4）
真实录屏：模型串行两次调用 calculator（21*2 → 42+8），参数与结果实时可见。


>>> pi 对照与小结 #B12
@enter: fade-up
@exit: fade
@visual: video(./assets/pi-loop.mp4)

（此描述仅作文档用途，实际使用 ./assets/pi-loop.mp4）
真实源码滚动：pi agent-loop.ts 796 行全文匀速滚过（22.3s）。
