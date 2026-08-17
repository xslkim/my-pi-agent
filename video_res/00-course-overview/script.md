>>> 课程开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满整个画面，内容整体居中占画布约 80% 宽度。
[0s] 主标题 "从零手写一个 Coding Agent" 淡入并上移 32px，白色 #e6edf3，粗体，字号 104px，居中，距顶部约 380px。
[1s] 主标题下方 48px 处副标题 "五课 · 全部自己实现 · 零运行时依赖" 淡入，颜色 #8b949e，字号 40px。
[1.8s] 副标题下方 40px 处出现一条 4px 粗的 accent 色 #58a6ff 横线，宽度 560px，从左向右扫入。
[2.4s] 横线下方 56px 处两行标签淡入："~1400 行代码 · 每一行都自己写"、"参照 pi，但不 import 它"，字号 30px，颜色 #8b949e。
背景四角可加极淡的 #161b22 网格纹理，所有元素避让底部 120px 字幕区。

--- narration ---
大家好
这是一门 **从零手写** Coding Agent 的课程
五节课，五个能跑的产物
一共 **一千四百行** 代码
每一行都要自己写


>>> 五课路线图 #B02
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
课程路线一共五站
第一课，手写 **SSE 客户端**，让模型开口说话
第二课，写 **agent loop**，让模型调用工具
第三课，四个受约束的工具，让它改代码
第四课，会话和上下文管理，让它每天能用
第五课，用它在空目录里 **交付一个登录应用**


>>> 为什么不 import pi #B03
@enter: fade
@exit: fade
@visual: html

--- visual ---
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
<div class="card"><div class="file">我们 · llm.ts</div><div class="num" style="color:#58a6ff">120</div><div class="who">行 · 只服务一个端点</div></div>
</div>
<div class="note">差的那 1457 行，就是这门课要讲清的 <b>兼容性税</b></div>
</div></body></html>

--- narration ---
我们参照工业级实现 **pi**，但不 import 它任何包
同样是模型兼容层
pi 一千五百七十七行，我们一百二十行
多出来的部分不是废话
是服务四十家厂商的 **兼容性税**
不懂这税交在哪，agent 就是玄学


>>> 零依赖运行 #B04
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
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
<div><span class="g">✔ pass 107</span>&nbsp;&nbsp;<span class="c"># 全部离线，拔掉网线也能跑</span></div>
<div>&nbsp;</div>
<div><span class="p">$</span> cat package.json <span class="c"># dependencies: {}</span></div>
</div>
</div>
</body></html>

--- narration ---
整个项目 **零运行时依赖**
Node 二十五 直接跑 TypeScript
不需要构建步骤，不需要装包
测试用内置的 node --test
断网也能全绿


>>> 三个固定环节 #B05
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
每节课都有三个固定环节
**验收先行**，考卷先锁定，agent 不许改
**故障注入**，主动把东西弄坏，先看见坏再修
最后十分钟 **对照 pi**
看工业级实现到底多做了什么、为什么


>>> 第五课预告 #B06
@enter: zoom-in
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面。视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
旁白第 2 行期间：中央出现一个宽 1500px、高 620px 的终端窗口（背景 #161b22、圆角 20px、边框 #30363d、顶部三个红黄绿圆点），窗口内逐行打出：
  → write({"path":"server.ts", ...})        （accent 色 #58a6ff）
  ← wrote server.ts (220 lines)
  → bash({"command":"node server.ts"})
  ← exit: 0
旁白第 3 行期间：终端下方 40px 处出现一排 10 个绿色对勾（每个 44px，#3fb950），从左到右依次点亮，左侧标签 "smoke test 10/10" 字号 34px。
旁白第 4 行期间：整个终端窗口外发一圈 accent 色 4px 描边光晕。
所有元素避让底部 120px 字幕区，内容整体占画布约 80%。

--- narration ---
最后一课不是讲课，是 **交付**
我们造的 agent 会在空目录里
写出一个带登录的网站，并通过锁定的冒烟测试
它到底能不能做到，第五课见


>>> 结尾 · 开始第一课 #B07
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
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

--- narration ---
每节课对应一个 git 标签
随时可以 checkout 回到任意一课的代码状态
现在，从第一课开始
