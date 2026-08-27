>>> 本集定位 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页（TitleCard）：深色背景 #0d1117 填满整个画面，内容垂直居中，整体占画布约 80% 宽度，所有元素底边距画面底部 ≥ 120px（避让字幕区）。
- 主标题「第 4 课 · 让 agent 好用」，白色 #e6edf3 粗体，字号 96px，居中。
- 主标题正下方 16px 处一条 4px 粗 accent 蓝 #58a6ff 横线，宽度与主标题相同，从左向右扫入。
- 横线下方 32px 处副标题「REPL / 中止 / 持久化 / 预算 / 重试」，颜色 #8b949e，字号 40px。
- 副标题下方 48px 处标签行「从 git tag l3-coding 接着做」，等宽字体，字号 28px，颜色 #8b949e，其中 l3-coding 用 accent 蓝 #58a6ff。
[0s] 主标题从透明渐显并上移 32px；[0.5s] 横线扫入；[1s] 副标题淡入；[1.5s] 标签行淡入。


>>> REPL：readline 循环 #B02
@enter: fade
@exit: fade
@visual: animation

代码面板（CodeBlock）：语言 typescript，展示 readline 循环的概念骨架（教学示意，非源码逐字）：

```ts
// REPL：readline 循环（概念骨架）
while (true) {
  const line = await readline();  // 读一行输入
  const answer = await agent(line); // 跑一轮 agent loop
  print(answer);                  // 打印回答
}
```

布局与动效：
- 深色背景 #0d1117 填满全屏；顶部标题「REPL：从单发到对话」，字号 56px 粗体 #e6edf3，距顶 60px；标题左侧放图标 💬（accent 蓝 #58a6ff）。
- 代码面板宽占画布 80%、高约占可用区 55%，居中；代码字号 30px 等宽，行号 #8b949e；面板底边距画面底部 ≥ 160px（避让字幕区）。
- 代码面板正下方 40px 处一条说明卡（宽同面板，圆角 16px，背景 #161b22，左边框 4px #58a6ff）：文字「读一行 → 跑一轮 agent loop → 打印 → 回到提示符」，字号 30px #e6edf3。
- 行级高亮跟随旁白推进（共 9 行旁白，用 props.lineTimings 驱动，不硬编码时间戳）：第 1–2 行（「先看 REPL」「只能问一句话」）期间仅显示面板，无高亮；第 3 行（「把它改成对话」）高亮整个 while 循环体；第 4 行（「读一行输入，跑上一轮」）依次高亮 readline 行与 agent(line) 行；第 5 行（「打印回答」）高亮 print 行；第 6–7 行（「不用重新开场」「上下文滚下去」）循环体蓝色呼吸脉动；第 8 行（「收进 repl.ts」）高亮首行注释；第 9 行（「变成了 REPL」）全部代码亮起。高亮行左侧出现 4px accent 竖条，其余行保持 #8b949e 暗淡，行切换平滑过渡。
- 只渲染上述元素，不添加面包屑、进度条等多余 UI。


>>> 中止：AbortSignal 贯穿 #B03
@enter: fade
@exit: fade
@visual: animation

流程图 + 双状态卡（跟随旁白的动效编排，用 props.lineTimings 驱动，跟随旁白处禁止绝对时间戳）：
- 深色背景 #0d1117 填满全屏。顶部标题「Ctrl+C 只停当前轮」，字号 56px 粗体 #e6edf3，距顶 60px，居中。
- 标题下方 40px 起横向流程链（占画布 88% 宽，首尾节点向内缩进、卡片不超出画布左右边界），5 个圆角节点（高 140px，背景 #161b22，边框 1px #30363d，文字字号 28px #e6edf3），节点间箭头 3px #8b949e：
  ①⌨️ 按下 Ctrl+C → ②📡 AbortSignal → ③🌐 fetch 中断 → ④🔧 工具中断 → ⑤💬 回到提示符
- 流程链下方 48px 处左右两张状态卡并排（总宽 88%，间距 48px，底边距画面底部 ≥ 140px）：
  左卡（错误态）：⚠ 图标 64px #f85149 + 标题「没贯穿就僵住」40px 粗体 #f85149 + 正文「信号断在哪一环，哪一环就停不下来」28px #8b949e；卡片背景 #161b22，边框 2px #f85149，高 240px。
  右卡（正常态）：✔ 图标 64px #3fb950 + 标题「贯穿就回得来」40px 粗体 #3fb950 + 正文「这一轮停手，会话还在」28px #8b949e；卡片背景 #161b22，边框 2px #3fb950，高 240px。
- 入场编排：[0s] 标题淡入；[0.4s] 五个节点从左到右依次弹出（间隔 0.15s）；[1.2s] 两张状态卡同时淡入。
- 跟随旁白推进（共 8 行旁白）：第 1 行（「模型跑偏了，总不能干等」）期间整条链蓝色呼吸脉动；第 2 行（「按下 Ctrl+C」）高亮节点①（accent 蓝描边放大，其余变暗）；第 3 行（「AbortSignal 要一路贯穿」）高亮节点②并显示信号波纹向右扩散；第 4 行（「一环都不能漏」）节点③④同时蓝色描边预告；第 5 行（「贯穿到 fetch」）高亮节点③，蓝色脉冲沿箭头流动；第 6 行（「贯穿到工具」）高亮节点④；第 7 行（「没贯穿就僵住」）左卡红框闪烁两次、链条整体染红；第 8 行（「会话还在原地」）红色褪去、节点⑤与右卡绿色高亮。行切换平滑过渡。


>>> 会话持久化：-c 续聊演示 #B04
@enter: fade
@exit: fade
@visual: video(./assets/session-resume.mp4)

（此描述仅作文档参考，实际使用 ./assets/session-resume.mp4 视频文件：终端录屏，演示退出后用 -c 参数续聊，上一轮上下文仍在。）
<!-- 素材复用自旧版脚本 video_res/lesson4-usable 对应目录；素材时长 15.4s（facts.md）。录屏命令形如 `node src/cli.ts -c`，仅为录制记录，不参与生成。 -->


>>> 上下文预算：估 token 裁最老轮次 #B05
@enter: fade
@exit: fade
@visual: animation

流程图 + 错误卡（跟随旁白的动效编排，用 props.lineTimings 驱动，跟随旁白处禁止绝对时间戳）：
- 深色背景 #0d1117 填满全屏。顶部标题「上下文预算：超阈值裁最老轮次」，字号 56px 粗体 #e6edf3，距顶 60px，居中。
- 标题下方 40px 起横向流程链（占画布 88% 宽，首尾节点向内缩进，不超出画布左右边界），5 个圆角节点（高 140px，背景 #161b22，边框 1px #30363d，文字字号 28px #e6edf3），节点间箭头 3px #8b949e：
  ①📥 轮次累积 → ②🧮 估算 token → ③🔍 超阈值？ → ④✂️ 裁掉最老轮次 → ⑤✔ 照常请求
- 节点⑤下方 48px 处放一张错误卡（宽 52% 画布，居中，高 220px，背景 #161b22，边框 2px #f85149，底边距画面底部 ≥ 140px）：⚠ 图标 56px #f85149 + 标题「不修剪的后果」36px 粗体 #f85149 + 正文「聊超 64K，服务端直接报 400」30px #e6edf3。
- 入场编排：[0s] 标题淡入；[0.4s] 五个节点依次弹出（间隔 0.15s）；[1.2s] 错误卡淡入（初始半透明 0.35）。
- 跟随旁白推进（共 7 行旁白）：第 1 行（「上下文预算」）高亮节点①，节点上方叠加「第 1 轮…第 N 轮」小标签依次堆叠；第 2 行（「是有上限的」）错误卡轻微上浮提示（仍半透明）；第 3 行（「估算 token」）高亮节点②；第 4 行（「超阈值裁最老轮次」）高亮节点③与④，显示蓝色阈值刻度线；第 5 行（「越近的对话越值钱」）最左侧「最老轮次」标签变暗并被剪刀动画裁掉；第 6 行（「请求照常发出」）节点⑤亮起绿色、链条整体染绿；第 7 行（「聊超六十四 K，报四百」）绿色褪去，错误卡升至全不透明并红框闪烁两次，节点①处对话气泡无限堆高。行切换平滑过渡。


>>> 重试：retry.ts 39 行 #B06
@enter: fade
@exit: fade
@visual: animation

代码面板（CodeBlock）：语言 typescript，展示 retry.ts 的重试策略骨架（教学示意，非源码逐字）：

```ts
// retry.ts：429 / 超时退避（策略骨架，全文件 39 行）
while (true) {
  try {
    return await request();
  } catch (err) {
    if (!transient(err)) throw err; // 429 / 超时才值得重试
    await sleep(backoff());         // 等一等再试，间隔越来越长
  }
}
```

布局与动效：
- 深色背景 #0d1117 填满全屏；顶部标题「重试：退避，不是硬刚」，字号 56px 粗体 #e6edf3，距顶 60px；标题左侧放图标 🔁（accent 蓝 #58a6ff）。
- 代码面板宽占画布 80%、高约占可用区 58%，居中；代码字号 30px 等宽；面板底边距画面底部 ≥ 160px（避让字幕区）。
- 代码面板正下方 36px 处一行标签卡（宽同面板，圆角 16px，背景 #161b22，左边框 4px #58a6ff）：文字「retry.ts · 39 行 · 退避重试」，等宽字号 28px，「39 行」用 accent 蓝 #58a6ff 粗体，其余 #e6edf3。
- 行级高亮跟随旁白推进（共 7 行旁白，用 props.lineTimings 驱动，不硬编码时间戳）：第 1 行（「第五项，重试」）无高亮、面板整体呈现；第 2 行（「撞上 429 或者超时」）高亮 catch 行并把「429」标红 #f85149；第 3 行（「等一等再试一次」）高亮 sleep(backoff()) 行；第 4 行（「间隔越来越长」）在面板右侧弹出小字注「间隔：短 → 长」（24px #8b949e）并高亮 backoff()；第 5 行（「硬刚 vs 退避」）catch 行与 sleep 行交替呼吸；第 6 行（「请求照旧写」）高亮 try 内 request() 行；第 7 行（「收进 retry.ts」）高亮首行注释与「39 行」标签卡。其余行保持 #8b949e 暗淡，行切换平滑过渡。
- 只渲染上述元素，不添加多余 UI。


>>> 可观测：耗时与 token #B07
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .wrap { width: 1690px; margin: 0 auto; padding-top: 88px; }
  .head { font-size: 56px; font-weight: 700; color: #e6edf3; }
  .head .icon { color: #58a6ff; margin-right: 18px; }
  .term { margin-top: 56px; background: #161b22; border: 1px solid #30363d;
    border-radius: 16px; overflow: hidden; }
  .termbar { height: 56px; background: #0d1117; border-bottom: 1px solid #30363d;
    display: flex; align-items: center; padding: 0 24px; gap: 10px; }
  .dot { width: 18px; height: 18px; border-radius: 50%; }
  .body { padding: 44px 48px; font-family: "JetBrains Mono", Menlo, Consolas, monospace;
    font-size: 32px; line-height: 1.9; }
  .prompt { color: #58a6ff; }
  .dim { color: #8b949e; }
  .metric { color: #3fb950; font-weight: 700; }
  .tip { margin-top: 44px; background: #161b22; border-left: 6px solid #58a6ff;
    border-radius: 16px; padding: 26px 32px; font-size: 32px; color: #e6edf3; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head"><span class="icon">📈</span>可观测：每轮打印耗时与 token</div>
    <div class="term">
      <div class="termbar">
        <span class="dot" style="background:#f85149"></span>
        <span class="dot" style="background:#d29922"></span>
        <span class="dot" style="background:#3fb950"></span>
      </div>
      <div class="body">
        <div><span class="prompt">&gt;</span> <span style="color:#e6edf3">把标题改成登录</span></div>
        <div class="dim">agent 回答省略……</div>
        <div class="dim">本轮 耗时 3.2s · token 412 <span class="metric">← 每轮都打印</span></div>
      </div>
    </div>
    <div class="tip">耗时与 token 每轮可见 —— 成本看得见，优化才有下手处</div>
  </div>
</body>
</html>


>>> 诚实一刻：超了单课预算 #B08
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .wrap { width: 1690px; margin: 0 auto; padding-top: 72px; }
  .head { font-size: 56px; font-weight: 700; color: #e6edf3; }
  .head .icon { color: #3fb950; margin-right: 18px; }
  .grid { display: flex; gap: 48px; margin-top: 48px; }
  .colL { flex: 0 0 42%; background: #161b22; border: 1px solid #30363d;
    border-radius: 16px; padding: 48px 40px; text-align: center; }
  .label { font-size: 28px; color: #8b949e; }
  .big { font-size: 110px; font-weight: 700; color: #e6edf3; line-height: 1.15; }
  .delta { font-size: 36px; font-weight: 700; color: #f85149; margin-top: 12px; }
  .sub { font-size: 24px; color: #8b949e; margin-top: 20px; }
  .colR { flex: 1; background: #161b22; border: 1px solid #30363d;
    border-radius: 16px; padding: 40px 44px; }
  .rtitle { font-size: 34px; font-weight: 700; color: #e6edf3; margin-bottom: 20px; }
  .row { font-size: 29px; color: #e6edf3; line-height: 1.5; padding: 12px 0;
    border-bottom: 1px dashed #30363d; }
  .row:last-child { border-bottom: none; }
  .row:last-child .k, .row:last-child .v { color: #3fb950; }
  .k { color: #8b949e; display: inline-block; width: 132px; }
  .v { font-family: "JetBrains Mono", Menlo, Consolas, monospace; }
  .tip { margin-top: 40px; background: #161b22; border-left: 6px solid #3fb950;
    border-radius: 16px; padding: 24px 32px; font-size: 32px; color: #3fb950; font-weight: 700; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head"><span class="icon">✔</span>诚实一刻：+331 行，超了单课预算</div>
    <div class="grid">
      <div class="colL">
        <div class="label">l4-usable · src 累计</div>
        <div class="big">1066 行</div>
        <div class="delta">较 l3-coding +331 行</div>
        <div class="sub">单课预算 300 行 · 超了</div>
      </div>
      <div class="colR">
        <div class="rtitle">超了怎么办</div>
        <div class="row"><span class="k">口径</span><span class="v">只算 src/，test/ 不计</span></div>
        <div class="row"><span class="k">原因</span><span class="v">重试与 abort 加固并入 llm.ts，落在本课窗口</span></div>
        <div class="row"><span class="k">处置</span><span class="v">总量余量充足，未回砍</span></div>
      </div>
    </div>
    <div class="tip">预算是纪律，不是遮羞布 —— 超了，说清楚为什么</div>
  </div>
</body>
</html>


>>> pi 对照：会话层 #B09
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .wrap { width: 1690px; margin: 0 auto; padding-top: 88px; }
  .head { font-size: 56px; font-weight: 700; color: #e6edf3; }
  .head .icon { color: #d2a8ff; margin-right: 18px; }
  .grid { display: flex; gap: 48px; margin-top: 52px; }
  .card { flex: 1; border-radius: 16px; padding: 48px 48px; background: #161b22; }
  .us { border: 2px solid #58a6ff; }
  .pi { border: 2px solid #d2a8ff; }
  .name { font-size: 30px; color: #8b949e; font-family: "JetBrains Mono", Menlo, Consolas, monospace; }
  .big { font-size: 110px; font-weight: 700; color: #58a6ff; line-height: 1.15; }
  .feats { margin-top: 24px; font-size: 30px; color: #e6edf3; line-height: 1.9; }
  .feats .blue { color: #58a6ff; }
  .feats .purple { color: #d2a8ff; }
  .sub { margin-top: 24px; font-size: 24px; color: #8b949e; }
  .tip { margin-top: 44px; background: #161b22; border-left: 6px solid #d2a8ff;
    border-radius: 16px; padding: 24px 32px; font-size: 32px; color: #e6edf3; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head"><span class="icon">⚖</span>会话持久化：我们 vs pi</div>
    <div class="grid">
      <div class="card us">
        <div class="name">我们 · session.ts</div>
        <div class="big">36 行</div>
        <div class="feats"><span class="blue">•</span> JSONL 落盘<br><span class="blue">•</span> -c 续聊</div>
      </div>
      <div class="card pi">
        <div class="name">pi · JsonlSessionRepo</div>
        <div class="feats" style="margin-top:28px">
          <span class="purple">•</span> branch 分支<br>
          <span class="purple">•</span> lane<br>
          <span class="purple">•</span> 压缩<br>
          <span class="purple">•</span> 崩溃恢复
        </div>
        <div class="sub">harness/session/jsonl/repo.ts</div>
      </div>
    </div>
    <div class="tip">36 行理解本质；pi 的会话层是生产级</div>
  </div>
</body>
</html>


>>> 收束 + 钩子 #B10
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 1920px; height: 1080px; background: #0d1117;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif; }
  .wrap { width: 1690px; margin: 0 auto; padding-top: 88px; }
  .head { font-size: 64px; font-weight: 700; color: #e6edf3; }
  .head .icon { color: #58a6ff; margin-right: 18px; }
  .tags { display: flex; gap: 32px; margin-top: 64px; }
  .tag { flex: 1; text-align: center; padding: 34px 0; border-radius: 16px;
    background: #161b22; border: 2px solid #30363d;
    font-family: "JetBrains Mono", Menlo, Consolas, monospace; font-size: 27px; color: #3fb950; }
  .tag .st { display: block; font-size: 30px; margin-top: 12px; }
  .next { border-color: #58a6ff; color: #58a6ff; }
  .exam { margin-top: 56px; background: #161b22; border: 2px solid #58a6ff;
    border-radius: 16px; padding: 44px 48px; }
  .et { font-size: 44px; font-weight: 700; color: #e6edf3; }
  .et .flag { color: #58a6ff; margin-right: 14px; }
  .ed { margin-top: 18px; font-size: 30px; color: #e6edf3; line-height: 1.8; }
  .ed .m { color: #8b949e; }
  .tip { margin-top: 44px; background: #161b22; border-left: 6px solid #58a6ff;
    border-radius: 16px; padding: 24px 32px; font-size: 32px; color: #e6edf3; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head"><span class="icon">🏁</span>CLI 好用了 —— 下集大考</div>
    <div class="tags">
      <div class="tag">l1-talk<span class="st">✔</span></div>
      <div class="tag">l2-tools<span class="st">✔</span></div>
      <div class="tag">l3-coding<span class="st">✔</span></div>
      <div class="tag">l4-usable<span class="st">✔</span></div>
      <div class="tag next">l5-delivery<span class="st">大考</span></div>
    </div>
    <div class="exam">
      <div class="et"><span class="flag">🚩</span>第 5 课：让 agent 交付</div>
      <div class="ed">从空目录做出一个登录应用<br><span class="m">考卷与冒烟测试预先锁定 —— agent 不许改</span></div>
    </div>
    <div class="tip">前四课的 agent 原样上考场 —— 一集后见</div>
  </div>
</body>
</html>
