>>> 开场标题 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页：主标题『第 2 课 · 让模型动手』，副标题『tool calling 与 agent loop』。
深色背景 (#0d1117) 填满整个画面，整体内容占画布约 80% 宽度，垂直居中。
[0s] 主标题「第 2 课 · 让模型动手」淡入，白色 (#e6edf3)，粗体，字号 96px，居中。
[0.5s] 主标题正下方 32px 处出现副标题「tool calling 与 agent loop」，颜色 #8b949e，字号 44px。
[1s] 主标题与副标题之间出现一条 4px 粗的 accent 蓝 (#58a6ff) 横线（宽度 = 主标题宽度），从左向右扫入。
[1.5s] 副标题下方 28px 处出现一行标签「从 tag l1-talk 出发 → 本集目标 tag l2-tools」，accent 蓝 (#58a6ff)，等宽字体，字号 28px。
最底部元素距画面底部至少 120px（避让字幕区）。


>>> 钩子：模型算不对 #B02
@enter: fade
@exit: fade
@visual: animation

深色背景 (#0d1117) 填满整个画面，内容垂直居中、总宽度占画布约 85%，所有可见元素底边距画面底部至少 120px（避让字幕区）。
跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳；行切换时平滑过渡）：
- 第 1 行期间：画面中央出现等宽字体大字 "21*2 = ?"，accent 蓝 (#58a6ff)，字号 120px，问号带轻微闪烁。
- 第 2 行期间：算式下方 48px 处弹出模型的回答 "21*2 = 22"，白色 (#e6edf3)，字号 96px；其右侧出现小标签「模型，脱口而出」，颜色 #8b949e，字号 28px。
- 第 3 行期间：回答下方 32px 处出现一段「理直气壮的解释」示意文字「因为 21×2 = 20×2 + 2 = 22」，颜色 #8b949e，字号 32px。
- 第 4 行期间：错误答案与解释一起被打上红色 (#f85149) 大叉，画面右侧出现说明文字「只有语言，没有手脚」，白色 (#e6edf3)，字号 40px。
- 第 5 行期间：红叉与错误内容淡出，画面中部升起一张工具卡片：背景 #161b22、accent 蓝 (#58a6ff) 2px 边框、圆角 16px、内边距 32px，内含扳手图标（64px）与文字「calculator」（48px，粗体，白色）。


>>> 协议：tool_calls 增量 #B03
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1920px; height:1080px; background:#0d1117; font-family:"Noto Sans SC","Noto Sans",sans-serif; color:#e6edf3; padding:64px 90px 0; }
  h1 { font-size:56px; font-weight:700; text-align:center; margin-bottom:44px; }
  h1 .k { color:#58a6ff; font-family:"JetBrains Mono","Menlo",monospace; }
  .row { display:flex; gap:48px; width:100%; }
  .panel { background:#161b22; border:1px solid #30363d; border-radius:16px; padding:32px 36px; }
  .panel.left { flex:1.35; }
  .panel.right { flex:1; }
  .panel h2 { font-size:28px; color:#8b949e; font-weight:600; margin-bottom:20px; }
  pre { font-family:"JetBrains Mono","Menlo",monospace; font-size:24px; line-height:1.65; color:#a5d6ff; white-space:pre-wrap; word-break:break-all; }
  .hl { color:#ff7b72; font-weight:700; }
  .note { margin:40px auto 0; width:fit-content; font-size:32px; color:#e6edf3; background:#161b22; border:1px solid #58a6ff; border-radius:16px; padding:22px 44px; }
  .note b { color:#58a6ff; font-family:"JetBrains Mono","Menlo",monospace; font-weight:700; }
</style>
</head>
<body>
  <h1>协议：<span class="k">finish_reason = "tool_calls"</span></h1>
  <div class="row">
    <div class="panel left">
      <h2>SSE 增量片段（示意）</h2>
      <pre>data: {... "tool_calls": [{"index":0,
  "function": {"name": "calculator",
  "arguments": "{\"a\":21,"}}]}

data: {... "tool_calls": [{"index":0,
  "function": {"arguments": "\"b\":2}"}}]}

data: {... "finish_reason": <span class="hl">"tool_calls"</span>}</pre>
    </div>
    <div class="panel right">
      <h2>拼接规则</h2>
      <pre>args[i] += fragment
<span class="hl">// 按 index 累加</span>

input = JSON.parse(args[i])</pre>
    </div>
  </div>
  <div class="note">arguments 是字符串碎片：<b>按 index 累加</b>，拼完整再 JSON.parse</div>
</body>
</html>


>>> Tool 接口四件 #B04
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1920px; height:1080px; background:#0d1117; font-family:"Noto Sans SC","Noto Sans",sans-serif; color:#e6edf3; padding:72px 90px 0; }
  h1 { font-size:60px; font-weight:700; text-align:center; margin-bottom:56px; }
  h1 .k { color:#58a6ff; font-family:"JetBrains Mono","Menlo",monospace; }
  .cards { display:flex; gap:40px; width:100%; }
  .card { flex:1; background:#161b22; border:1px solid #30363d; border-radius:16px; padding:36px 28px; min-height:340px; }
  .card .name { font-family:"JetBrains Mono","Menlo",monospace; font-size:34px; font-weight:700; color:#58a6ff; margin-bottom:20px; }
  .card .desc { font-size:28px; line-height:1.55; color:#e6edf3; }
  .foot { margin:52px auto 0; width:fit-content; font-size:30px; color:#8b949e; background:#161b22; border:1px solid #30363d; border-radius:16px; padding:20px 44px; }
  .foot b { color:#58a6ff; font-family:"JetBrains Mono","Menlo",monospace; }
</style>
</head>
<body>
  <h1><span class="k">Tool</span> 接口四件</h1>
  <div class="cards">
    <div class="card">
      <div class="name">name</div>
      <div class="desc">工具的名字，模型按它点名调用</div>
    </div>
    <div class="card">
      <div class="name">description</div>
      <div class="desc">一句话说明：什么时候该用这个工具</div>
    </div>
    <div class="card">
      <div class="name">parameters</div>
      <div class="desc">手写的 JSON Schema，描述入参的形状</div>
    </div>
    <div class="card">
      <div class="name">execute</div>
      <div class="desc">真正干活的函数：接收参数，返回结果</div>
    </div>
  </div>
  <div class="foot">本集示例：<b>calculator.ts</b> —— 完整实现只有 <b>24 行</b></div>
</body>
</html>


>>> 坑一：类型只是注释 #B05
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1920px; height:1080px; background:#0d1117; font-family:"Noto Sans SC","Noto Sans",sans-serif; color:#e6edf3; padding:72px 90px 0; }
  h1 { font-size:56px; font-weight:700; text-align:center; margin-bottom:52px; }
  h1 .warn { color:#f85149; }
  .row { display:flex; gap:44px; width:100%; align-items:stretch; }
  .panel { flex:1; background:#161b22; border-radius:16px; padding:36px 40px; }
  .panel.bad { border:2px solid #f85149; }
  .panel.good { border:2px solid #58a6ff; }
  .panel h2 { font-size:30px; font-weight:600; margin-bottom:24px; }
  .panel.bad h2 { color:#f85149; }
  .panel.good h2 { color:#58a6ff; }
  pre { font-family:"JetBrains Mono","Menlo",monospace; font-size:26px; line-height:1.7; color:#a5d6ff; white-space:pre-wrap; word-break:break-all; }
  .badmark { color:#f85149; font-weight:700; }
  .goodmark { color:#3fb950; font-weight:700; }
  .foot { margin:48px auto 0; width:fit-content; font-size:34px; font-weight:700; color:#e6edf3; background:#161b22; border:1px solid #30363d; border-radius:16px; padding:22px 48px; }
  .foot .r { color:#f85149; }
</style>
</head>
<body>
  <h1><span class="warn">⚠</span> 坑一：类型只是注释</h1>
  <div class="row">
    <div class="panel bad">
      <h2>模型实际传入的</h2>
      <pre>{"a": <span class="badmark">"21"</span>, "b": 2}

<span class="badmark">"21" 是字符串，不是数字</span>
JSON Schema 的类型，对模型只是建议</pre>
    </div>
    <div class="panel good">
      <h2>execute 里的运行时校验</h2>
      <pre>if (typeof input.a !== "number")
  <span class="goodmark">→ 拒绝，返回错误信息</span>

不能信类型声明，必须运行时校验</pre>
    </div>
  </div>
  <div class="foot">类型只是注释，<span class="r">运行时校验</span> 才是防线</div>
</body>
</html>


>>> agent loop #B06
@enter: fade
@exit: fade
@visual: animation

流程图：agent loop 五节点循环。深色背景 (#0d1117) 填满整个画面。
顶部居中标题「agent loop」，字号 64px，粗体，白色 (#e6edf3)，距顶 60px。
五个节点横向排布成一行（整体占画布 90% 宽度，位于画面垂直中部，首尾节点向内缩进、卡片不超出画布左右边界），每个节点是圆角 16px 卡片：背景 #161b22，accent 蓝 (#58a6ff) 2px 描边，节点标题 32px（粗体，白色），说明文字 24px（#8b949e）：
① 发起请求（带上对话历史） ② 返回 tool_calls（模型想调工具） ③ 执行工具（拿到结果） ④ 追加 role:tool（结果进对话历史） ⑤ 再次请求（循环继续）
节点⑤之后画一条回流箭头（accent 蓝 #58a6ff，4px 粗）从节点⑤绕回节点①，箭头旁标注「直到模型直接回答」，字号 28px，颜色 #8b949e。
跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳；行切换时平滑过渡）：
- 第 1 行期间：五个节点从左到右依次弹出，回流箭头随后画出。
- 第 2 行：节点①②高亮放大，其余变暗。
- 第 3 行：节点③高亮放大，其余变暗。
- 第 4 行：节点④高亮放大，其余变暗。
- 第 5 行：节点⑤与回流箭头高亮，其余变暗。
- 第 6 行：全部节点恢复常亮，回流箭头末端出现「直接回答」终点标记（绿色 #3fb950）。
所有可见元素底边距画面底部至少 120px（避让字幕区）。


>>> 坑二：没有刹车的循环 #B07
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1920px; height:1080px; background:#0d1117; font-family:"Noto Sans SC","Noto Sans",sans-serif; color:#e6edf3; padding:80px 90px 0; }
  h1 { font-size:56px; font-weight:700; text-align:center; margin-bottom:60px; }
  h1 .warn { color:#f85149; }
  .row { display:flex; gap:48px; width:100%; align-items:stretch; }
  .panel { flex:1; background:#161b22; border-radius:16px; padding:40px 44px; min-height:420px; }
  .panel.bad { border:2px solid #f85149; }
  .panel.good { border:2px solid #3fb950; }
  .panel h2 { font-size:32px; font-weight:600; margin-bottom:28px; }
  .panel.bad h2 { color:#f85149; }
  .panel.good h2 { color:#3fb950; }
  .flow { font-family:"JetBrains Mono","Menlo",monospace; font-size:30px; line-height:2.0; color:#e6edf3; }
  .bad .flow .loop { color:#f85149; font-weight:700; }
  .big { font-family:"JetBrains Mono","Menlo",monospace; font-size:56px; font-weight:700; color:#58a6ff; margin:24px 0; }
  .desc { font-size:30px; line-height:1.6; color:#e6edf3; }
</style>
</head>
<body>
  <h1><span class="warn">⚠</span> 坑二：循环不能没有刹车</h1>
  <div class="row">
    <div class="panel bad">
      <h2>没有上限的循环</h2>
      <div class="flow">请求 → 工具 → 请求 → 工具 → <span class="loop">……</span></div>
      <div class="desc" style="margin-top:24px;">模型一轮接一轮地调工具，<br>直到把上下文烧光</div>
    </div>
    <div class="panel good">
      <h2>我们的刹车</h2>
      <div class="big">maxSteps</div>
      <div class="desc">步数到顶就强制停下，<br>把控制权交还给人</div>
    </div>
  </div>
</body>
</html>


>>> 演示：calculator 算对 21*2 #B08
@enter: fade
@exit: fade
@visual: video(./assets/calc-tools.mp4)

（此描述仅作文档参考，实际使用 ./assets/calc-tools.mp4 视频文件）
<!-- 2026-08-28 重录：calculator 单次调用算 21×2=42 并解释（deepseek-v4-flash），22.7s（渲染 0.66× 放慢）。录制场景 record.mjs 的 l2-tools -->
终端录屏：向 agent 提问「二十一乘二等于多少」，模型经 tool_calls 调用 calculator 工具，
屏幕显示 21*2 = 42，随后模型给出答案与解释。演示块图标约定：▶。


>>> 回归：假模型守住防线 #B09
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1920px; height:1080px; background:#0d1117; font-family:"Noto Sans SC","Noto Sans",sans-serif; color:#e6edf3; padding:80px 90px 0; }
  h1 { font-size:56px; font-weight:700; text-align:center; margin-bottom:56px; }
  h1 .ok { color:#3fb950; }
  .cards { display:flex; gap:48px; width:100%; }
  .card { flex:1; background:#161b22; border:1px solid #30363d; border-radius:16px; padding:40px 44px; min-height:300px; }
  .card h2 { font-size:32px; font-weight:600; color:#58a6ff; margin-bottom:20px; }
  .card .desc { font-size:30px; line-height:1.6; color:#e6edf3; }
  .card code { font-family:"JetBrains Mono","Menlo",monospace; color:#a5d6ff; }
  .banner { margin:52px auto 0; width:fit-content; font-size:40px; font-weight:700; color:#3fb950; background:#161b22; border:2px solid #3fb950; border-radius:16px; padding:24px 56px; }
</style>
</head>
<body>
  <h1><span class="ok">✔</span> 回归：假模型守住防线</h1>
  <div class="cards">
    <div class="card">
      <h2>注入 ① 字符串入参</h2>
      <div class="desc">假模型故意把参数传成 <code>"21"</code>，运行时校验必须拦住</div>
    </div>
    <div class="card">
      <h2>注入 ② 不存在的工具</h2>
      <div class="desc">假模型故意调一个没注册的工具名，必须被稳稳接住</div>
    </div>
  </div>
  <div class="banner">110/111 通过（1 跳过）</div>
</body>
</html>


>>> pi 对照：agent loop #B10
@enter: fade
@exit: fade
@visual: video(./assets/pi-loop.mp4)

（此描述仅作文档参考，实际使用 ./assets/pi-loop.mp4 视频文件）
<!-- 素材复用自旧版脚本 video_res/lesson2-tools；pi agent-loop.ts 源码滚动录屏，ffprobe 实测 22.3s -->
pi 参照实现的 agent-loop.ts（796 行）源码滚动画面，对照我们的 loop.ts（90 行）。
pi 对照块图标约定：⚖；pi 一方语义色为紫 #d2a8ff。


>>> 收束 + 钩子 #B11
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1920px; height:1080px; background:#0d1117; font-family:"Noto Sans SC","Noto Sans",sans-serif; color:#e6edf3; padding:80px 120px 0; }
  h1 { font-size:60px; font-weight:700; text-align:center; margin-bottom:56px; }
  .rows { display:flex; flex-direction:column; gap:28px; }
  .row { background:#161b22; border:1px solid #30363d; border-radius:16px; padding:28px 40px; font-size:32px; line-height:1.5; display:flex; align-items:center; gap:24px; }
  .row .tag { font-family:"JetBrains Mono","Menlo",monospace; color:#58a6ff; font-weight:700; }
  .row .num { color:#58a6ff; font-weight:700; }
  .row .ok { color:#3fb950; font-weight:700; }
  .hook { margin-top:40px; background:#161b22; border:2px solid #58a6ff; border-radius:16px; padding:32px 40px; font-size:34px; font-weight:700; text-align:center; }
  .hook code { font-family:"JetBrains Mono","Menlo",monospace; color:#58a6ff; }
</style>
</head>
<body>
  <h1>第 2 课 · 收束</h1>
  <div class="rows">
    <div class="row"><span class="ok">✔</span><span>模型从会说话，变成会动手：会调 <span class="tag">calculator</span> 了</span></div>
    <div class="row"><span class="ok">✔</span><span>src 累计 <span class="num">176 行</span> → <span class="num">422 行</span>（+246），其中 <span class="tag">loop.ts</span> <span class="num">90 行</span></span></div>
    <div class="row"><span class="ok">✔</span><span>本集产物已打 tag：<span class="tag">l2-tools</span></span></div>
  </div>
  <div class="hook">下一课：给它 <code>read / write / edit / bash</code> 四个能改代码的工具</div>
</body>
</html>
