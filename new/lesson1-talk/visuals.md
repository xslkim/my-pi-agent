>>> 开场：本集定位 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页：主标题『第 1 课 · 让模型说话』，副标题『手写 SSE 客户端』。
具体要求：背景 #0d1117 填满整个画面。内容垂直居中，整体占画布约 80% 宽度：
主标题上方 48px 处放系列标签『从零实现一个 Coding Agent』，accent 色 #58a6ff，字号 30px，居中。
主标题白色 #e6edf3，粗体，字号 100px，居中。
副标题颜色 #8b949e，字号 52px，位于主标题下方 36px。
副标题下方 56px 处放一个圆角徽章：mono 字号 28px，文字『空仓库 → l1-talk』，accent 色 #58a6ff 描边，内边距 16px 32px。
最底部元素（徽章）底边距画面底部 ≥ 200px，避让底部 120px 字幕安全区。
入场编排：[0s] 系列标签淡入；[0.3s] 主标题 fade-up；[0.8s] 副标题淡入；[1.2s] 徽章淡入，同时主标题正下方 16px 处一条 4px 粗 accent 色横线从左向右扫入。


>>> 课程地图：五课五 tag #B02
@enter: fade
@exit: fade
@visual: animation

流程图：L1 让模型说话 → L2 让模型动手 → L3 让 agent 改代码 → L4 让 agent 好用 → L5 让 agent 交付，五个节点横向排列、箭头连接，各节点下方标注对应 git tag。
具体要求：背景 #0d1117 填满整个画面。
顶部标题『课程地图：五课五产物五 tag』，白色 #e6edf3，粗体，字号 56px，居中，距顶 64px。
五个节点卡片横向等距排列在画面中部（y ≈ 380–700），总宽占画布 90%，首尾节点向内缩进，卡片不超出画布左右边界；节点间用 accent 色箭头连接。
每张卡片背景 #161b22，圆角 16px，边框 1px solid #30363d，内边距 24px：节点标题字号 30px 白色（如『L1 让模型说话』），下方 mono 字号 22px 颜色 #8b949e 标注 git tag（依次为 l1-talk / l2-tools / l3-coding / l4-usable / l5-delivery）。
L1 是本集，卡片用 accent 色 #58a6ff 描边并轻微发光。
节点强调跟随旁白推进：第 2 行至第 5 行每行讲一课，讲到哪一课，对应节点卡片放大高亮、其余卡片变暗，行切换时平滑过渡（用 props.lineTimings 驱动，不要硬编码时间戳）。
最底部卡片底边距画面底部 ≥ 200px，避让底部 120px 字幕安全区。


>>> 环境基线：三条 #B03
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; background: #0d1117; overflow: hidden;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .mono { font-family: "JetBrains Mono", Menlo, Consolas, monospace; }
  .title { position: absolute; top: 64px; left: 0; width: 1920px; text-align: center;
    color: #e6edf3; font-size: 56px; font-weight: 700; }
  .title .accent { color: #58a6ff; }
  .row { position: absolute; top: 240px; left: 126px; width: 1668px; height: 560px;
    display: flex; justify-content: space-between; }
  .card { width: 520px; height: 560px; background: #161b22; border: 1px solid #30363d;
    border-radius: 20px; padding: 48px 40px; display: flex; flex-direction: column; }
  .tag { color: #8b949e; font-size: 28px; margin-bottom: 28px; }
  .big { color: #58a6ff; font-size: 56px; font-weight: 700; line-height: 1.25; margin-bottom: 32px; }
  .big.small { font-size: 44px; }
  .desc { color: #e6edf3; font-size: 30px; line-height: 1.6; }
  .note { color: #8b949e; font-size: 26px; line-height: 1.55; margin-top: 20px; }
  .env { color: #a5d6ff; font-size: 28px; line-height: 1.7; margin-top: 8px; }
  .foot { position: absolute; top: 860px; left: 0; width: 1920px; text-align: center;
    color: #8b949e; font-size: 28px; }
</style>
</head>
<body>
  <div class="title">环境基线 · <span class="accent">只有三条</span></div>
  <div class="row">
    <div class="card">
      <div class="tag">① 运行时</div>
      <div class="big mono">Node ≥ 23.6</div>
      <div class="desc">原生运行 TypeScript<br>类型剥离默认开启</div>
      <div class="note mono">22.x 需 --experimental-strip-types</div>
    </div>
    <div class="card">
      <div class="tag">② 依赖</div>
      <div class="big small mono">dependencies 为空</div>
      <div class="desc">运行时依赖为零<br>不装任何 npm 包</div>
    </div>
    <div class="card">
      <div class="tag">③ 模型接入</div>
      <div class="big small">三个环境变量</div>
      <div class="env mono">LLM_BASE_URL<br>LLM_API_KEY<br>LLM_MODEL</div>
      <div class="note">代码里不设默认值</div>
    </div>
  </div>
  <div class="foot">三条都满足，就可以开始写代码了</div>
</body>
</html>


>>> 现象：curl 打端点看原始字节流 #B04
@enter: fade
@exit: fade
@visual: video(./assets/curl-sse.mp4)

<!-- 2026-08-28 重录：curl 打 OpenAI 兼容端点（deepseek-v4-flash），原始 SSE 字节流滚屏，22.4s。录制场景 new/tools/record.mjs 的 l1-curl；本描述仅作文档用途，不参与生成。 -->
终端录屏：curl 请求模型端点并要求流式返回，终端里 data: 开头的原始 SSE 字节逐行滚出，最后以 [DONE] 收尾。画面为真实终端，无额外包装。


>>> 读流：事件结构与两个关键字段 #B05
@enter: fade
@exit: fade
@visual: animation

代码面板：语言 json，展示一段原始 SSE 字节流，代码如下（共 5 行，第 2、4 行为空行）：
data: {"choices":[{"delta":{"content":"你"}}]}

data: {"choices":[{"delta":{"content":"好"}}]}

data: [DONE]
具体要求：背景 #0d1117 填满整个画面。
顶部标题『读流：事件结构』，白色 #e6edf3，粗体，字号 56px，居中，距顶 64px。
代码面板宽占画布 78%，居中，背景 #161b22，圆角 16px，边框 1px solid #30363d，内边距 40px；mono 字号 28px，行高 1.8；所有 data: 前缀用 accent 色 #58a6ff。
高亮跟随旁白推进：第 2 行讲事件结构时，高亮第一个完整事件（data: 行加结尾空行）；第 3 行讲正文增量时，高亮两处 "content" 字段；第 4、5 行讲结束标记时，高亮 data: [DONE] 整行；用 props.lineTimings 驱动，不要硬编码时间戳。
代码面板底边距画面底部 ≥ 140px，避让底部 120px 字幕安全区。


>>> llama.cpp 特有：reasoning_content #B06
@enter: fade
@exit: fade
@visual: animation

代码面板：语言 json，展示思考增量与正文增量两个事件，代码如下（共 3 行，第 2 行为空行）：
data: {"choices":[{"delta":{"reasoning_content":"先理解题意"}}]}

data: {"choices":[{"delta":{"content":"答案是"}}]}
具体要求：背景 #0d1117 填满整个画面。
顶部标题『思考增量：reasoning_content』，白色 #e6edf3，粗体，字号 56px，居中，距顶 64px；标题右侧放一个圆角徽章『llama.cpp 特有』，accent 色 #58a6ff 描边，字号 26px。
代码面板宽占画布 82%，居中于画面中部，背景 #161b22，圆角 16px，边框 1px solid #30363d，内边距 40px；mono 字号 28px，行高 1.8；data: 前缀用 accent 色。
高亮跟随旁白推进：第 2 行讲思考字段时，高亮 "reasoning_content" 字段；第 3 行讲默认模型时，徽章下方出现小字标签『qwen3.8-27b』，mono 24px，颜色 #8b949e；第 4、5 行讲两股流时，两个事件行同时高亮；用 props.lineTimings 驱动，不要硬编码时间戳。
代码面板底边距画面底部 ≥ 140px，避让底部 120px 字幕安全区。


>>> 核心难点：TCP 不保证事件边界 #B07
@enter: fade
@exit: fade
@visual: animation

分阶段动画演示「事件被 TCP 切碎」。背景 #0d1117 填满整个画面，内容总宽占画布 ≥ 80%。
顶部标题『⚠ TCP 不保证事件边界』，白色 #e6edf3，粗体，字号 56px，居中，距顶 60px。
画面中部（y ≈ 260–400）：一个完整事件长条，宽占画布 60%，高 90px，圆角 12px，背景 #161b22，accent 色 #58a6ff 描边，内部 mono 字号 26px 白色文字：data: {"choices":[{"delta":{"content":"你好"}}}]。
长条下方（y ≈ 500–640）：两个 chunk 块并排，间距 60px，各宽占画布 36%，高 110px，背景 #161b22，边框 1px solid #30363d，圆角 12px；左上角标签 mono 字号 24px 颜色 #8b949e，分别为 chunk 1、chunk 2。
画面底部（y ≈ 720–800）：结论文字『网络只给你字节流，事件边界要自己找』，字号 30px，白色，居中；其底边距画面底部 ≥ 160px，避让底部 120px 字幕安全区。
分阶段跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
第 3 行讲「切成两半」时：完整事件长条中间出现红色 #f85149 锯齿切口，左半段滑入 chunk 1 尾部，右半段滑入 chunk 2 头部，切口描边保持红色。
第 4 行讲「挤在一块」时：chunk 1 的内容变为「一个完整事件 + 半个事件」粘连，粘连处用红色 #f85149 高亮标记。
第 5、6 行时：底部结论文字淡入。


>>> 故障注入：天真的 split #B08
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; background: #0d1117; overflow: hidden;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .mono { font-family: "JetBrains Mono", Menlo, Consolas, monospace; }
  .title { position: absolute; top: 64px; left: 0; width: 1920px; text-align: center;
    color: #f85149; font-size: 56px; font-weight: 700; }
  .row { position: absolute; top: 230px; left: 156px; width: 1608px; height: 600px;
    display: flex; justify-content: space-between; }
  .card { width: 760px; height: 600px; background: #161b22; border-radius: 20px;
    padding: 44px 44px; }
  .card.code { border: 1px solid #30363d; }
  .card.bad { border: 2px solid #f85149; }
  .tag { font-size: 30px; font-weight: 700; margin-bottom: 32px; }
  .card.code .tag { color: #e6edf3; }
  .card.bad .tag { color: #f85149; }
  pre { color: #e6edf3; font-size: 28px; line-height: 1.8; }
  .kw { color: #ff7b72; } .str { color: #a5d6ff; }
  .badline { color: #f85149; font-size: 30px; line-height: 1.9; }
  .badline .x { font-weight: 700; margin-right: 14px; }
  .foot { position: absolute; top: 880px; left: 0; width: 1920px; text-align: center;
    color: #8b949e; font-size: 28px; }
</style>
</head>
<body>
  <div class="title">⚠ 故障注入：天真的 split</div>
  <div class="row">
    <div class="card code">
      <div class="tag">天真的写法</div>
      <pre class="mono"><span class="kw">const</span> events = buffer.<span class="kw">split</span>(<span class="str">"\n\n"</span>);
<span class="kw">for</span> (<span class="kw">const</span> e <span class="kw">of</span> events) {
  JSON.<span class="kw">parse</span>(e); <span style="color:#8b949e">// 半个事件？</span>
}</pre>
    </div>
    <div class="card bad">
      <div class="tag">终端里的现象</div>
      <div class="badline"><span class="x">✗</span>事件被切成两半 → JSON.parse 抛错</div>
      <div class="badline"><span class="x">✗</span>半段事件被当成完整事件 → 丢字</div>
      <div class="badline"><span class="x">✗</span>输出乱码、缺字</div>
    </div>
  </div>
  <div class="foot">这不是模型的问题，是解析器太天真</div>
</body>
</html>


>>> 修法：跨 chunk 缓冲区 #B09
@enter: fade
@exit: fade
@visual: animation

分阶段动画演示「缓冲区拼接收割」。背景 #0d1117 填满整个画面，内容总宽占画布 ≥ 85%。
顶部标题『修法：跨 chunk 缓冲区』，白色 #e6edf3，粗体，字号 56px，居中，距顶 60px。
主舞台在画面中部（y ≈ 300–700），三个区域横向排列：
左侧为到达区，chunk 块（宽 22% 画布，高 100px，背景 #161b22，边框 1px solid #30363d，圆角 12px，标签 mono 24px『chunk』）从这里出发。
中央为 buffer 长条（宽 42% 画布，高 120px，背景 #161b22，accent 色 #58a6ff 描边 2px，圆角 12px，左上角标签 mono 24px『buffer』），内部 mono 字号 26px 显示字节内容。
右侧为收割区，标签『完整事件』字号 28px 白色，切好的事件卡片依次列在这里。
区域之间用 accent 色箭头连接。
底部（y ≈ 780–850）放结论文字，字号 30px，底边距画面底部 ≥ 150px，避让底部 120px 字幕安全区。
分阶段跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
第 2 行讲「拼到尾部」时：chunk 块从左侧滑入，拼接到 buffer 长条尾部。
第 3 行讲「切完留尾」时：buffer 内完整的部分变为绿色 #3fb950 并切出、滑入右侧收割区；切剩的尾巴留在 buffer 里，用 accent 色 #58a6ff 高亮并标注小字『留尾』。
第 4 行讲「再拼再切」时：第二个 chunk 到达拼上，与留尾拼成完整事件，再次变绿切出。
第 5、6 行时：底部结论淡入『不管 TCP 怎么切，事件一个都不丢 ✔』，绿色 #3fb950。


>>> 代码走读：llm.ts 主循环 #B10
@enter: fade
@exit: fade
@visual: animation

代码面板：语言 typescript，标题栏左侧显示文字『llm.ts · 主循环』，标题栏右侧放 accent 色 #58a6ff 描边徽章，mono 字号 26px，文字『78 行 @l1-talk』。代码内容为手循环骨架（讲解用，非逐字引用），如下：
const res = await fetch(url, opts);        // 发起请求
const reader = res.body.getReader();       // 拿到字节流
buffer += decoder.decode(chunk);           // 拼到缓冲区尾部
// 切出完整事件，尾巴留在缓冲区
if (data === "[DONE]") break;              // 流结束
const delta = JSON.parse(data).choices[0].delta;
print(delta.content);                      // 正文增量
print(delta.reasoning_content);            // 思考增量
具体要求：背景 #0d1117 填满整个画面。
代码面板宽占画布 80%，居中于画面中部（顶边距顶约 120px），背景 #161b22，圆角 16px，边框 1px solid #30363d；标题栏高 64px，文字字号 28px；代码区 mono 字号 26px，行高 1.75，注释颜色 #8b949e。
高亮跟随旁白推进：第 2 行讲发起请求时，高亮 fetch 与 reader 两行；第 3 行讲缓冲区时，高亮 buffer += 行与「切出完整事件」注释行；第 4 行讲分别打印时，高亮最后两行 print；第 5 行讲 DONE 时，高亮 if (data === "[DONE]") 行；用 props.lineTimings 驱动，不要硬编码时间戳。
代码面板底边距画面底部 ≥ 140px，避让底部 120px 字幕安全区。


>>> 演示：终端里说出第一句话 #B11
@enter: fade
@exit: fade
@visual: video(./assets/talk-demo.mp4)

<!-- 2026-08-28 重录：node src/cli.ts "用三句话解释什么是 SSE"（deepseek-v4-flash），思考与正文逐字流出，26.1s。录制场景 record.mjs 的 l1-talk；本描述仅作文档用途，不参与生成。 -->
终端录屏：运行 node src/cli.ts 并传入问题，思考内容先逐字流出，随后正文回答逐字流出，直至流结束。画面为真实终端，无额外包装。


>>> 教具：fake-llm 断网测试 #B12
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; background: #0d1117; overflow: hidden;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .mono { font-family: "JetBrains Mono", Menlo, Consolas, monospace; }
  .title { position: absolute; top: 64px; left: 0; width: 1920px; text-align: center;
    color: #e6edf3; font-size: 56px; font-weight: 700; }
  .title .accent { color: #58a6ff; }
  .row { position: absolute; top: 240px; left: 156px; width: 1608px; height: 580px;
    display: flex; justify-content: space-between; }
  .card { width: 760px; height: 580px; background: #161b22; border-radius: 20px; padding: 48px 44px; }
  .card.tool { border: 1px solid #58a6ff; }
  .card.pass { border: 2px solid #3fb950; display: flex; flex-direction: column;
    justify-content: center; align-items: center; }
  .tag { color: #58a6ff; font-size: 30px; font-weight: 700; margin-bottom: 36px; }
  .line { color: #e6edf3; font-size: 30px; line-height: 1.9; }
  .line .dot { color: #58a6ff; margin-right: 14px; }
  .bignum { color: #3fb950; font-size: 110px; font-weight: 700; }
  .passlabel { color: #e6edf3; font-size: 34px; margin-top: 16px; }
  .passnote { color: #8b949e; font-size: 26px; margin-top: 24px; }
  .foot { position: absolute; top: 880px; left: 0; width: 1920px; text-align: center;
    color: #8b949e; font-size: 28px; }
</style>
</head>
<body>
  <div class="title">教具：<span class="accent mono">fake-llm</span> · 断网也能测</div>
  <div class="row">
    <div class="card tool">
      <div class="tag">它做什么</div>
      <div class="line"><span class="dot">•</span>本地回放录好的 SSE 字节流</div>
      <div class="line"><span class="dot">•</span>切半、丢字的边缘用例可重放</div>
      <div class="line"><span class="dot">•</span>测试全程不需要模型服务</div>
    </div>
    <div class="card pass">
      <div class="bignum mono">110/111</div>
      <div class="passlabel">110/111 通过（1 跳过）</div>
      <div class="passnote">✔ node --test 全绿 · 全程断网</div>
    </div>
  </div>
  <div class="foot">教具和实现一样重要</div>
</body>
</html>


>>> pi 对照与下集钩子 #B13
@enter: fade
@exit: fade
@visual: video(./assets/pi-scroll.mp4)

<!-- 2026-08-28 重渲染：pi @086c32e 的 openai-completions.ts 源码滚动（render.mjs --pi，行 1–1200 步长 3），41.2s。本描述仅作文档用途，不参与生成。 -->
pi 参照实现源码滚动录屏：openai-completions.ts 的代码持续上滚，配合旁白做「78 行 vs 1577 行」的行数对照；旁白收尾给下集钩子。
