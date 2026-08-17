>>> 第 2 课开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满整个画面，内容居中占画布约 80% 宽度。
[0s] 左上角标签 "第 2 课 · L2" 淡入，accent 色 #58a6ff，字号 30px，等宽字体。
[0.3s] 主标题 "让模型动手" 淡入上移，白色 #e6edf3，粗体，字号 120px。
[1s] 副标题 "聊天机器人和 agent 的区别是什么？" 淡入，#8b949e，42px。
[1.8s] 副标题下方 44px 出现答案行 "**一个 while 循环**"，字号 72px，accent 色 #58a6ff，粗体，伴随从左滑入。
[2.6s] 答案下 40px 淡入小字 "短得让人失望，但千真万确"，30px，#8b949e。
避让底部 120px 字幕区。

--- narration ---
第二课要回答一个问题
聊天机器人和 agent 的区别是什么
答案短得让人失望
**一个 while 循环**
模型自己什么都不会执行
真正让它成为 agent 的，是我们写的这段循环


>>> 请求带上 tools #B02
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
第一步，在请求体里加一个 **tools** 字段
每个工具就是名字、描述、一份手写 Schema
模型看到的，只是这张说明书
注意 description 里那句
不要自己心算，请用计算器
没有它，模型经常绕过工具直接口算


>>> 响应变了 #B03
@enter: fade
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
带上 tools 再问，响应就变了
正文是空的，多出来 **tool_calls**
finish_reason 变成了 tool_calls
注意，模型没有执行任何计算
它只是按格式说了一句
**请帮我调这个工具，参数如下**


>>> 坑一 · 参数是碎片 #B04
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
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

--- narration ---
第一个坑，工具参数是 **碎片**
真实抓包里，数字 21 是分成 2 和 1 两片吐出来的
只有第一片带 id 和名字，后面只有 index
必须按 index 累加，流结束后再 parse
中途 parse 一定失败
而且失败的样子，**看起来像个合法的中间状态**


>>> 坑二 · 类型不是校验 #B05
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
第二个坑，类型不是校验
TypeScript 的类型在运行时 **根本不存在**
而模型一定会传错
字符串当数字、缺字段、调不存在的工具
所以要自己写一个六十行的校验器
数字宽容转换，错误信息具体到字段名


>>> 错误也是消息 · 自愈 #B06
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「校验失败 → 当消息回传 → 模型自愈」字号 52px。
画面中央是一个三段流程，横向排列，间距 70px：
① 卡片「模型」(#161b22 圆角卡，宽 380px 高 240px，居中大字 "model" 字号 40px，下有小字 tool_calls 请求)
② 卡片「loop · 校验」(同尺寸，中间有放大镜图标和一行 error 文本样式)
③ 卡片「错误文本」(同尺寸，红色 #ff7b72 边框，内容 `error: field "op" is required` 字号 26px 等宽)
旁白第 2 行期间：①→② 之间出现 accent #58a6ff 箭头滑入，②→③ 之间出现红色箭头，②卡抖动一下闪红边。
旁白第 3 行期间：③的错误文本卡片沿着一条返回弧线飞回①（半透明轨迹），①上方浮现气泡「模型读到错误」字号 28px。
旁白第 4 行期间：①重新发出一条绿色 #3fb950 边框的请求卡（补全了 op 参数）飞向②，②亮绿边，下方弹出标签「自愈 ✓」字号 34px。
旁白第 5 行期间：底部浮现结论条（宽 1300px，#161b22 底，左 8px accent 边）：「错误信息是写给模型看的——这是 agent 最重要的自愈机制」字号 31px。
避让底部 120px 字幕区。

--- narration ---
关键设计：校验失败 **不抛异常**
把错误文本当成工具结果，回给模型
模型读到 field op is required
会自己补上参数重试
这是 agent 最重要的 **自愈机制**
也是它看起来有智能的来源之一


>>> agent loop #B07
@enter: fade
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
现在写心脏，**agent loop**
调模型，收到 tool_calls 就执行
结果作为 tool 消息塞回去，再调模型
直到模型不再要工具，循环结束
去掉包装，所谓 agent 就是这个 while


>>> 消息顺序铁律 #B08
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
loop 里有一条铁律
带 tool_calls 的 assistant 消息
必须紧跟它的全部 tool 结果
少一条，下一次请求直接 **400**
而且报错信息完全看不出根因
记住这条，第四课它还会回来


>>> maxSteps 防死循环 #B09
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「没有上限，循环会烧光上下文」字号 52px。
旁白第 1 行期间：中央出现一个循环示意：两张卡片（「模型」和「工具」）之间双向箭头，箭头上标注 `tool_calls` 与 `tool result`，卡片间开始循环闪烁（accent #58a6ff ↔ #8b949e 交替）。
旁白第 2 行期间：循环下方出现一条 1400px 宽的步数条（分 10 格，每格 140px，#161b22 底、#30363d 边框），随旁白从左到右逐格点亮 accent 色，右端标注 "maxSteps = 10" 字号 30px 等宽。
旁白第 3 行期间：步数条右侧出现上下文容量条（1000px 宽、细高 40px），随循环继续从 40% 涨到 90% 再到 100% 变红 #f85149，上方弹出标签「400: exceeds context size」字号 30px。
旁白第 4 行期间：整个循环与红条缩小下沉，上方浮出绿色 #3fb950 结论条：「maxSteps 拦下 → error: max steps exceeded (10)」字号 32px。
旁白第 5 行期间：底部两行小字对比（28px，#8b949e）：「本地免费模型：这一幕很便宜」「按 token 计费的云 API：这一幕很贵」，其中「很贵」用 #ff7b72 高亮。
避让底部 120px 字幕区。

--- narration ---
真实模型会陷入死循环，反复调同一个工具
所以 **maxSteps 是必需品**，不是防御性洁癖
没有上限，六万四的上下文会被烧光
然后服务端返回 400，会话作废
在本地免费模型上这一幕很便宜
在按 token 计费的云上，这一幕 **很贵**


>>> 真机踩坑 · 线格式 #B10
@enter: fade
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
分享一个真机才踩得出来的坑
回传 tool_calls 必须用 **线上格式**
带 type 冒号 function，再包一层 function
直接发内部形状，llama.cpp 直接 **500**
假模型测不出这个问题
因为它验的是我们自己定义的形状


>>> 见真章 #B11
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
.body{padding:46px 60px;font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.95}
.p{color:#ff7b72}.dim{color:#8b949e}.acc{color:#58a6ff}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">$</span> node src/cli.ts "用计算器算 (21*2)+8 等于几"</div>
<div>&nbsp;</div>
<div><span class="acc">→ calculator({"a":21,"b":2,"op":"*"})</span></div>
<div>← 42 (1ms)</div>
<div><span class="acc">→ calculator({"a":42,"b":8,"op":"+"})</span></div>
<div>← 50 (0ms)</div>
<div>&nbsp;</div>
<div>(21×2)+8 = <b>50</b>，已用计算器分两步验证。</div>
<div>&nbsp;</div>
<div class="dim">它现在是一个 agent 了 —— 约六百行代码</div>
</div>
</div>
</body></html>

--- narration ---
见真章
问它，用计算器算 21 乘 2 加 8
它先调乘法拿到 42
再把 42 喂给加法，得到 50
注意第二次调用的参数来自第一次的结果
到这里，它是一个 **agent** 了


>>> pi 对照与小结 #B12
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:54px;margin-bottom:46px}
.row{display:flex;gap:56px;justify-content:center;margin-bottom:46px}
.card{width:520px;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:40px 38px;text-align:center}
.file{font-family:"JetBrains Mono",monospace;font-size:25px;color:#a5d6ff;margin-bottom:20px}
.num{font-size:110px;font-weight:800;line-height:1}
.vs{display:flex;align-items:center;font-size:54px;color:#58a6ff;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:29px}
td{padding:16px 26px;border-top:1px solid #30363d}
td:first-child{color:#a5d6ff;font-family:"JetBrains Mono",monospace;font-size:26px}
td:last-child{color:#8b949e}
.foot{margin-top:36px;text-align:center;font-size:32px}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>pi 对照 · agent-loop.ts</h1>
<div class="row">
<div class="card"><div class="file">pi</div><div class="num">796 行</div></div>
<div class="vs">VS</div>
<div class="card"><div class="file">我们 · loop.ts</div><div class="num" style="color:#58a6ff">115 行</div></div>
</div>
<table>
<tr><td>parallel tools</td><td>并行执行、竞态与错误聚合</td></tr>
<tr><td>steering queue</td><td>跑到一半插话</td></tr>
<tr><td>lifecycle hooks</td><td>beforeToolCall 权限拦截</td></tr>
</table>
<div class="foot">pi 的复杂度不是炫技，是把我们跳过的边界一个个补上。<br>但要理解 agent 是什么——<b>一个循环就够了</b>。</div>
</div></body></html>

--- narration ---
pi 的 loop 七百九十六行
多出来的是并行工具、插话队列、生命周期钩子
每一个都对应我们刻意跳过的边界
但对于理解 agent 是什么
一百一十五行的一个循环，就够了
下一课，让它改代码
