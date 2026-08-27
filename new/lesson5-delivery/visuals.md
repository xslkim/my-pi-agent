>>> 开场：毕业考 #B01
@enter: fade-up
@exit: fade
@visual: animation

标题页：主标题『第 5 课 · 让 agent 交付』，副标题『登录应用大考 · 从 l4-usable 出发』。
深色背景 #0d1117 填满整个画面，内容垂直居中、占画布约 80% 宽度。
主标题白色 #e6edf3、粗体、字号 ≥96px；副标题颜色 #8b949e、字号 ≥40px，其中「l4-usable」用等宽字体、accent 蓝 #58a6ff。
主标题正下方 16px 处一条 4px 粗的 accent 蓝 #58a6ff 横线，从左向右扫入。
所有可见元素底边距画面底部至少 120px，避让字幕安全区。


>>> 考卷设计 #B02
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  .header { position: absolute; top: 56px; left: 120px; right: 120px; display: flex; align-items: center; gap: 24px; }
  .badge { font-size: 48px; color: #3fb950; }
  h1 { font-size: 60px; font-weight: 700; }
  .cards { position: absolute; top: 210px; left: 120px; right: 120px; display: flex; gap: 48px; }
  .card { flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 20px; padding: 40px 44px; height: 470px; }
  .card h2 { font-size: 38px; margin-bottom: 12px; color: #58a6ff; }
  .card .sub { font-size: 24px; color: #8b949e; margin-bottom: 36px; }
  .file { margin-bottom: 36px; }
  .file .name { font-size: 29px; color: #58a6ff; }
  .file .desc { font-size: 24px; color: #8b949e; margin-top: 10px; }
  .banner { position: absolute; top: 740px; left: 120px; right: 120px; height: 130px;
            border: 2px solid #f85149; border-radius: 20px; background: rgba(248,81,73,0.08);
            display: flex; align-items: center; justify-content: center; gap: 20px; }
  .banner .warn { font-size: 40px; color: #f85149; }
  .banner .text { font-size: 40px; font-weight: 700; }
  .banner .text em { font-style: normal; color: #f85149; }
</style>
</head>
<body>
  <div class="header"><span class="badge">✔</span><h1>考卷设计：验收先行，不可篡改</h1></div>
  <div class="cards">
    <div class="card">
      <h2>开考前，先写好</h2>
      <div class="sub">两份文件，agent 开工前已存在</div>
      <div class="file"><div class="name mono">acceptance/login-app.smoke.ts</div><div class="desc">冒烟测试 · 10 项检查</div></div>
      <div class="file"><div class="name mono">acceptance/task-prompt.md</div><div class="desc">任务描述</div></div>
    </div>
    <div class="card">
      <h2>再用校验和锁死</h2>
      <div class="sub">考卷一动，校验就失败</div>
      <div class="file"><div class="name mono">acceptance/lock.sha256</div><div class="desc">两份考卷文件的校验和</div></div>
      <div class="file"><div class="name mono">acceptance/verify-lock.ts</div><div class="desc">校验脚本</div></div>
    </div>
  </div>
  <div class="banner"><span class="warn">⚠</span><span class="text">agent 只许答题，<em>不许修改考卷</em></span></div>
</body>
</html>


>>> 考题：最小登录应用 #B03
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  h1 { position: absolute; top: 56px; left: 120px; right: 120px; font-size: 60px; font-weight: 700; }
  .grid { position: absolute; top: 190px; left: 120px; right: 120px; display: grid;
          grid-template-columns: 1fr 1fr; gap: 40px 48px; }
  .cell { background: #161b22; border: 1px solid #30363d; border-radius: 20px; padding: 32px 40px; height: 240px; }
  .cell .name { font-size: 36px; color: #58a6ff; font-weight: 700; }
  .cell .desc { font-size: 26px; color: #e6edf3; margin-top: 14px; line-height: 1.5; }
  .cell .desc .dim { color: #8b949e; }
  .bottom { position: absolute; top: 770px; left: 120px; right: 120px; height: 110px;
            background: #161b22; border: 1px solid #30363d; border-radius: 20px;
            display: flex; align-items: center; justify-content: center; gap: 16px; }
  .bottom .label { font-size: 30px; color: #8b949e; }
  .bottom .path { font-size: 32px; color: #58a6ff; font-weight: 700; }
</style>
</head>
<body>
  <h1>考题：一个最小登录应用</h1>
  <div class="grid">
    <div class="cell">
      <div class="name mono">server.ts</div>
      <div class="desc">零依赖 <span class="mono">node:http</span><br><span class="dim">四路由：</span><span class="mono">register / login / me / logout</span></div>
    </div>
    <div class="cell">
      <div class="name mono">node:sqlite</div>
      <div class="desc">存用户<br><span class="dim">内置模块，同样零依赖</span></div>
    </div>
    <div class="cell">
      <div class="name mono">scrypt</div>
      <div class="desc">加盐哈希<br><span class="dim">不存明文密码</span></div>
    </div>
    <div class="cell">
      <div class="name mono">randomUUID()</div>
      <div class="desc">生成 token<br><span class="dim">放进 httpOnly cookie</span></div>
    </div>
  </div>
  <div class="bottom"><span class="label">产物目录</span><span class="path mono">demo/login-app/（server.ts + public/）</span></div>
</body>
</html>


>>> run1 裸跑 #B04
@enter: fade
@exit: fade
@visual: video(./assets/run1-timelapse.mp4)

（此描述仅作文档参考，实际使用 ./assets/run1-timelapse.mp4 视频文件）
run1（加固前）延时录屏：agent 从空目录读任务描述、写代码、起服务自测，交付登录应用。
<!-- 素材复用自旧版脚本 video_res/lesson5-delivery。素材 23.8s（ffprobe 实测 23.833s，1920×1080 h264）；本块旁白估算约 30.0s，循环约 1.26×，可接受档。 -->


>>> 但是：挂死与救援 #B05
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  .header { position: absolute; top: 56px; left: 120px; right: 120px; display: flex; align-items: center; gap: 24px; }
  .warn { font-size: 48px; color: #f85149; }
  h1 { font-size: 60px; font-weight: 700; color: #f85149; }
  .alert { position: absolute; top: 200px; left: 120px; right: 120px; height: 210px;
           background: rgba(248,81,73,0.10); border: 2px solid #f85149; border-radius: 20px;
           display: flex; flex-direction: column; justify-content: center; padding: 0 48px; }
  .alert .big { font-size: 48px; font-weight: 700; color: #f85149; }
  .alert .small { font-size: 26px; color: #8b949e; margin-top: 14px; }
  .stats { position: absolute; top: 470px; left: 120px; right: 120px; display: flex; gap: 48px; }
  .stat { flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 20px;
          height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .stat .num { font-size: 60px; font-weight: 700; }
  .stat .num.red { color: #f85149; }
  .stat .num.mono { font-size: 52px; }
  .stat .label { font-size: 26px; color: #8b949e; margin-top: 16px; }
</style>
</head>
<body>
  <div class="header"><span class="warn">⚠</span><h1>但是：run1 并不干净</h1></div>
  <div class="alert">
    <div class="big">bash 后台自测 · 永久挂死</div>
    <div class="small">起后台服务做自测，进程再也不返回，整个会话卡住</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="num red">1 次</div><div class="label">人工救援</div></div>
    <div class="stat"><div class="num mono">11 步 / 17 次</div><div class="label">工具调用</div></div>
    <div class="stat"><div class="num mono">~11.6K</div><div class="label">会话 token</div></div>
  </div>
</body>
</html>


>>> 失败分析：回炉前四课 #B06
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  h1 { position: absolute; top: 56px; left: 120px; right: 120px; font-size: 60px; font-weight: 700; }
  .flow { position: absolute; top: 210px; left: 120px; right: 120px; display: flex; align-items: stretch; gap: 24px; }
  .node { flex: 1; background: #161b22; border-radius: 20px; padding: 32px 36px; height: 260px; }
  .node.red { border: 2px solid #f85149; }
  .node.blue { border: 2px solid #58a6ff; }
  .node.green { border: 2px solid #3fb950; }
  .node .stage { font-size: 24px; font-weight: 700; margin-bottom: 14px; }
  .node.red .stage { color: #f85149; }
  .node.blue .stage { color: #58a6ff; }
  .node.green .stage { color: #3fb950; }
  .node .title { font-size: 34px; font-weight: 700; line-height: 1.4; }
  .node .desc { font-size: 24px; color: #8b949e; margin-top: 12px; line-height: 1.5; }
  .arrow { align-self: center; font-size: 48px; color: #8b949e; }
  .strip { position: absolute; top: 560px; left: 120px; right: 120px; height: 160px;
           background: #161b22; border: 1px solid #30363d; border-radius: 20px;
           display: flex; align-items: center; justify-content: center; gap: 56px; }
  .strip .item { font-size: 32px; }
  .strip .item .dim { color: #8b949e; font-size: 26px; margin-right: 12px; }
  .strip .item .mono { color: #58a6ff; font-weight: 700; }
  .strip .item .green { color: #3fb950; font-weight: 700; }
</style>
</head>
<body>
  <h1>失败分析：回炉前四课</h1>
  <div class="flow">
    <div class="node red">
      <div class="stage">现象</div>
      <div class="title">bash 永久挂死</div>
      <div class="desc">起后台服务自测，进程不返回</div>
    </div>
    <div class="arrow">→</div>
    <div class="node blue">
      <div class="stage">定位</div>
      <div class="title">第 3 课的 bash 工具</div>
      <div class="desc">后台任务场景，露出了死角</div>
    </div>
    <div class="arrow">→</div>
    <div class="node green">
      <div class="stage">修复</div>
      <div class="title mono">T23 后台任务修复</div>
      <div class="desc">改动全部落在 bash.ts</div>
    </div>
  </div>
  <div class="strip">
    <div class="item"><span class="dim">改动</span><span class="mono">bash.ts +46/-6</span></div>
    <div class="item"><span class="dim">净增</span><span class="mono">较 l4-usable +40 行</span></div>
    <div class="item"><span class="dim">src 累计</span><span class="green">1106 行</span></div>
  </div>
</body>
</html>


>>> run2 加固后再考 #B07
@enter: fade
@exit: fade
@visual: video(./assets/run2-timelapse.mp4)

（此描述仅作文档参考，实际使用 ./assets/run2-timelapse.mp4 视频文件）
run2（加固后）延时录屏：同一份考卷再考一遍，bash 自测正常返回，零救援交付。
<!-- 2026-08-28 重渲染：自 docs/runs/l5-run2.jsonl 以 0.75× 放慢回放（render.mjs --jsonl），素材 24.8s；本块旁白估算约 34.9s，循环约 1.41×，可接受档。 -->


>>> run1 vs run2 对比 #B08
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  h1 { position: absolute; top: 56px; left: 120px; right: 120px; font-size: 60px; font-weight: 700; }
  h1 .mono { color: #58a6ff; }
  .table { position: absolute; top: 180px; left: 120px; right: 120px;
           background: #161b22; border: 1px solid #30363d; border-radius: 20px; overflow: hidden; }
  .row { display: flex; align-items: center; height: 112px; border-bottom: 1px solid #30363d; }
  .row:last-child { border-bottom: none; }
  .row.head { height: 88px; background: #0d1117; }
  .cell { padding: 0 48px; font-size: 32px; }
  .c1 { flex: 1.2; color: #8b949e; }
  .c2 { flex: 1; }
  .c3 { flex: 1; }
  .row.head .cell { font-size: 28px; font-weight: 700; color: #e6edf3; }
  .v { font-weight: 700; }
  .down { color: #3fb950; }
  .same { color: #3fb950; }
  .banner { position: absolute; top: 806px; left: 120px; right: 120px; height: 110px;
            border: 2px solid #58a6ff; border-radius: 20px; background: rgba(88,166,255,0.08);
            display: flex; align-items: center; justify-content: center; }
  .banner .text { font-size: 42px; font-weight: 700; }
  .banner .text em { font-style: normal; color: #58a6ff; }
</style>
</head>
<body>
  <h1><span class="mono">run1</span> vs <span class="mono">run2</span>：两遍都做成</h1>
  <div class="table">
    <div class="row head"><div class="cell c1">指标</div><div class="cell c2 mono">run1（加固前）</div><div class="cell c3 mono">run2（加固后）</div></div>
    <div class="row"><div class="cell c1">步数 / 工具调用</div><div class="cell c2 v mono">11 步 / 17 次</div><div class="cell c3 v mono down">7 步 / 9 次</div></div>
    <div class="row"><div class="cell c1">会话 token</div><div class="cell c2 v mono">~11.6K</div><div class="cell c3 v mono down">~6.8K</div></div>
    <div class="row"><div class="cell c1">人工救援</div><div class="cell c2 v">1 次</div><div class="cell c3 v down">0 次</div></div>
    <div class="row"><div class="cell c1">冒烟测试</div><div class="cell c2 v same">10/10</div><div class="cell c3 v same">10/10</div></div>
  </div>
  <div class="banner"><span class="text">差别不在能不能，在<em>要不要人救</em></span></div>
</body>
</html>


>>> 全系列收束 #B09
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  h1 { position: absolute; top: 52px; left: 0; right: 0; text-align: center; font-size: 56px; font-weight: 700; }
  .hero { position: absolute; top: 170px; left: 0; right: 0; text-align: center; }
  .hero .num { font-size: 128px; font-weight: 700; color: #58a6ff; }
  .hero .label { font-size: 28px; color: #8b949e; margin-top: 8px; }
  .tags { position: absolute; top: 460px; left: 120px; right: 120px; display: flex; justify-content: center; gap: 24px; }
  .tag { background: #161b22; border: 1px solid #30363d; border-radius: 12px;
         padding: 18px 28px; font-size: 28px; color: #58a6ff; }
  .tag.last { border: 2px solid #3fb950; color: #3fb950; }
  .tests { position: absolute; top: 600px; left: 0; right: 0; text-align: center;
           font-size: 36px; color: #3fb950; font-weight: 700; }
  .motto { position: absolute; top: 720px; left: 0; right: 0; text-align: center;
           font-size: 48px; font-weight: 700; }
</style>
</head>
<body>
  <h1>全系列收束</h1>
  <div class="hero">
    <div class="num">1106 行</div>
    <div class="label">src 累计 · dependencies 为空</div>
  </div>
  <div class="tags">
    <span class="tag mono">l1-talk</span>
    <span class="tag mono">l2-tools</span>
    <span class="tag mono">l3-coding</span>
    <span class="tag mono">l4-usable</span>
    <span class="tag last mono">l5-delivery</span>
  </div>
  <div class="tests">✔ 110/111 通过（1 跳过）</div>
  <div class="motto">你拥有每一行的解释权</div>
</body>
</html>


>>> 延伸阅读 #B10
@enter: fade
@exit: fade
@visual: html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1080px;
    background: #0d1117; color: #e6edf3;
    font-family: 'Noto Sans SC', 'Noto Sans', sans-serif;
    overflow: hidden; position: relative;
  }
  .mono { font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace; }
  .header { position: absolute; top: 56px; left: 120px; right: 120px; }
  h1 { font-size: 60px; font-weight: 700; }
  .header .sub { font-size: 28px; color: #8b949e; margin-top: 10px; }
  .cards { position: absolute; top: 250px; left: 120px; right: 120px; display: flex; gap: 48px; }
  .card { flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 20px;
          padding: 36px 40px; height: 330px; }
  .card .icon { font-size: 44px; margin-bottom: 16px; }
  .card.purple .icon, .card.purple .name { color: #d2a8ff; }
  .card.blue .icon, .card.blue .name { color: #58a6ff; }
  .card.green .icon, .card.green .name { color: #3fb950; }
  .card .name { font-size: 34px; font-weight: 700; }
  .card .desc { font-size: 25px; color: #8b949e; margin-top: 14px; line-height: 1.55; }
  .banner { position: absolute; top: 680px; left: 120px; right: 120px; height: 120px;
            border: 1px solid #30363d; border-radius: 20px; background: #161b22;
            display: flex; align-items: center; justify-content: center; }
  .banner .text { font-size: 40px; font-weight: 700; }
  .banner .text em { font-style: normal; color: #58a6ff; }
</style>
</head>
<body>
  <div class="header">
    <h1>延伸阅读</h1>
    <div class="sub">三条路，继续往下走</div>
  </div>
  <div class="cards">
    <div class="card purple">
      <div class="icon">⚖</div>
      <div class="name mono">pi/ 子模块</div>
      <div class="desc">@086c32e 已 checkout<br>只读对照 · 工业级参照实现</div>
    </div>
    <div class="card blue">
      <div class="icon">✔</div>
      <div class="name mono">docs/specs · docs/lessons</div>
      <div class="desc">每课的设计与教训<br>写在仓库里</div>
    </div>
    <div class="card green">
      <div class="icon">▶</div>
      <div class="name">你的项目</div>
      <div class="desc">把 agent 用进去<br>遇到的真实问题，就是下一课</div>
    </div>
  </div>
  <div class="banner"><span class="text">课程到此结束，<em>你的 agent 才刚刚开始</em></span></div>
</body>
</html>
