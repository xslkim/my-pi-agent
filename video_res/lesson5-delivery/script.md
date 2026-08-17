>>> 第 5 课开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，内容居中占画布约 82% 宽度。
[0s] 左上角标签 "第 5 课 · L5" 淡入，accent 色 #58a6ff，字号 30px，等宽字体。
[0.3s] 主标题 "让 agent 交付" 淡入上移，白色 #e6edf3，粗体，字号 118px。
[1s] 副标题 "前四课的一千行，到底能不能干活？" 淡入，#8b949e，42px。
[1.8s] 副标题下 56px 三个短句依次淡入（间隔 0.3s，字号 34px，每行前置一个小图标方块）：「任务是真的」「验收是自动化的」「失败是公开的」。
[3.2s] 底部一行小字淡入："这一课的反直觉设计：我们预期它第一次会失败" 字号 30px，#8b949e。
避让底部 120px 字幕区。

--- narration ---
最后一课不是讲课，是 **交付**
前四课造的这个东西，到底能不能干活
任务是真的，验收是自动化的
失败是公开的
这一课有个反直觉的设计
我们预期它第一次 **会失败**


>>> 任务定义 #B02
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:30px;line-height:1.9;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:44px 58px;white-space:pre;color:#a5d6ff;margin-bottom:40px}
.c{color:#8b949e}.k{color:#ff7b72}
.row{display:flex;gap:32px}
.b{flex:1;background:#0d1117;border:1px solid #30363d;border-top:6px solid #58a6ff;border-radius:12px;padding:26px 28px;font-size:27px;line-height:1.7}
.b b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>任务：在空目录里做一个登录应用</h1>
<pre>demo/login-app/        <span class="c">← 初始为空，agent 从零开始</span>

server.ts   node:http    注册/登录/登出/me 四个接口 + 静态文件
存储        node:sqlite  users(id, username unique, salt, hash)
密码        node:crypto  scrypt 加盐哈希，<span class="k">禁止明文</span>
会话        randomUUID   sid cookie, HttpOnly, SameSite=Strict
前端        原生 JS      注册表单 · 登录 · Hello 展示 · 登出</pre>
<div class="row">
<div class="b"><b>零依赖</b><br>只用 Node 内置模块</div>
<div class="b"><b>逐字相同的 prompt</b><br>两轮运行用同一份任务描述</div>
<div class="b"><b>不干预</b><br>人只观察，不帮它写一行代码</div>
</div>
</div></body></html>

--- narration ---
任务：在一个空目录里，做一个登录应用
后端四个接口，sqlite 存用户
密码 scrypt 加盐哈希，**禁止明文**
会话用 httpOnly cookie
前端原生 JS
要求只有一条，零依赖，全程不干预


>>> 验收先行 #B03
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:20px}
.sub{font-size:30px;color:#8b949e;margin-bottom:38px}
table{width:100%;border-collapse:collapse;font-size:29px;margin-bottom:36px}
td{padding:15px 26px;border-top:1px solid #30363d}
td:first-child{width:110px;text-align:center;font-family:"JetBrains Mono",monospace;color:#79c0ff}
td:last-child{color:#e6edf3}
.hot{background:#2d1517}
.hot td{color:#ff7b72}
.foot{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:30px 42px;font-size:32px;line-height:1.7}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>考卷：十条断言，进场前就锁死</h1>
<div class="sub">acceptance/login-app.smoke.ts —— agent 不许改</div>
<table>
<tr><td>1–2</td><td>注册新用户 201 · 重复注册 409</td></tr>
<tr><td>3–4</td><td>错密码 401 且不下发 cookie · 登录 200 且 HttpOnly + SameSite=Strict</td></tr>
<tr><td>5–8</td><td>带 cookie 拿到用户名 · 不带 401 · 登出 200 · 登出后旧 cookie 失效</td></tr>
<tr><td>9</td><td>首页返回含表单的 HTML</td></tr>
<tr class="hot"><td>10</td><td>直接搜 data.db 的原始字节——明文密码一个字节都不许出现</td></tr>
</table>
<div class="foot">第 10 条检验的不是「能跑」，是「有没有按要求做对」。<br>这条规则解决了 agent 演示最常见的作弊：<b>改考卷让它过</b>。</div>
</div></body></html>

--- narration ---
关键设计，**验收先行**
冒烟测试十条，在 agent 进场之前写好并锁定
从注册到登出，覆盖全部接口
最后一条最狠
直接搜数据库文件的原始字节
明文密码一个字节都不许出现
验收先行，通过就是通过


>>> 两道锁 #B04
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「agent 不许改考卷：两道锁」字号 52px。
旁白第 2 行期间：画面中央出现一张「考卷」卡片（600x260px，#161b22 底、金色 #d2a8ff 边框，内容 "acceptance/*.ts + task-prompt.md" 字号 28px 等宽），左侧出现一把锁图标和标签「锁 1 · cwd 路径约束」字号 30px accent #58a6ff，一条 accent 实线从 agent 图标（左侧小圆卡 "agent"）指向考卷的方向被锁 1 拦截，弹出红色 ✗。
旁白第 3 行期间：agent 下方冒出第二条弯曲虚线路径，标注「bash 绝对路径绕过」字号 26px #ff7b72，虚线成功穿过锁 1 到达考卷附近——诚实展示缺口。
旁白第 4 行期间：考卷下方升起第二道更大的盾牌图标「锁 2 · sha256 校验和」字号 30px #3fb950，虚线路径被盾牌拦下弹回，弹出绿色 ✓，考卷卡上方浮现一行等宽小字 `node acceptance/verify-lock.ts → OK` 字号 26px。
旁白第 5 行期间：底部浮现结论条（宽 1460px、#161b22 底、左 8px accent 边）：「声明式约束挡不住能执行任意命令的工具——这正是 pi 要做沙箱的原因」字号 30px。
避让底部 120px 字幕区。

--- narration ---
agent 不许改考卷，上两道锁
第一道，路径约束让它够不到验收目录
但 bash 能用绝对路径绕过，我们诚实承认
第二道，校验和兜底
考卷改动一个字节，验收作废
**声明式约束挡不住能执行任意命令的工具**
这正是 pi 要做沙箱和权限确认的原因


>>> 裸跑开始 #B05
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
.body{padding:48px 60px;font-family:"JetBrains Mono",monospace;font-size:32px;line-height:2.0}
.p{color:#ff7b72}.dim{color:#8b949e}
.rec{color:#ff5f57;font-weight:700}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="rec">● REC</span>&nbsp;&nbsp;<span class="dim">全程录屏 · 不干预</span></div>
<div>&nbsp;</div>
<div><span class="p">$</span> node src/cli.ts --cwd demo/login-app \</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;-s l5-run1 --max-steps 30 "$(cat acceptance/task-prompt.md)"</div>
<div>&nbsp;</div>
<div class="dim">任务描述来自锁定的 prompt 文件</div>
<div class="dim">两轮运行逐字一致，由校验和保证</div>
</div>
</div>
</body></html>

--- narration ---
裸跑开始，全程录屏，不干预
任务描述来自锁定的 prompt 文件
两轮运行逐字一致，由校验和保证
课程的设计里，它预期会失败
因为 **失败清单才是这一课的主要产出**


>>> run1 实况 #B06
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center}
.term{width:1700px;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:60px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d}
.dot{width:18px;height:18px;border-radius:50%}
.body{padding:40px 56px;font-family:"JetBrains Mono",monospace;font-size:27px;line-height:1.9}
.acc{color:#58a6ff}.dim{color:#8b949e}.g{color:#3fb950}.r{color:#ff7b72}
.cursor{display:inline-block;width:16px;height:30px;background:#58a6ff;vertical-align:middle;animation:none}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="acc">→ write({"path":"server.ts", ...})</span>&nbsp;&nbsp;<span class="g">← wrote server.ts (220 lines)</span></div>
<div><span class="acc">→ write({"path":"public/login.html", ...})</span>&nbsp;<span class="g">← wrote (114 lines)</span></div>
<div><span class="acc">→ write({"path":"public/app.js", ...})</span>&nbsp;&nbsp;&nbsp;<span class="g">← wrote (107 lines)</span></div>
<div><span class="acc">→ write({"path":"package.json", ...})</span>&nbsp;&nbsp;&nbsp;<span class="g">← wrote (11 lines)</span></div>
<div class="dim">（五个文件全部写完）</div>
<div>&nbsp;</div>
<div><span class="acc">→ bash({"command":"PORT=3100 node server.ts > server.log 2>&1 &</span></div>
<div><span class="acc">&nbsp;&nbsp;&nbsp;&nbsp;sleep 1.5; cat server.log"})</span></div>
<div>&nbsp;</div>
<div class="r">（……没有返回。一直没有。）</div>
<div class="r">✖ 卡死了 —— 这不是剧本，是真实发生的事故</div>
</div>
</div>
</body></html>

--- narration ---
真实的 run1 是这样的
它写完了全部五个文件，做得很顺
然后想后台起个服务自测
接着，**卡死了**
注意，这不是剧本
是这门课真实发生的事故


>>> 死锁解剖 #B07
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「死锁解剖 · 管道被谁握着」字号 52px。
旁白第 2 行期间：中央出现管道示意：左侧「工具进程」小卡（240x110px），右侧「终端」小卡，中间一条粗管道（双线，#8b949e，标 "stdout 管道" 字号 26px）。管道下方一张小卡「bash」标签已经变暗消失（标 ✝ 已被超时杀掉，字号 26px #8b949e）。
旁白第 3 行期间：管道中部下方升起一张亮着的卡「后台 node 服务」(#161b22 底、#f85149 边框)，一只卡通"手"从它伸向管道，牢牢握住（红色 #f85149 高亮握点）。
旁白第 4 行期间：工具进程卡上方浮现等待图标（旋转时钟）和文字「等 close：全部 stdio 关闭」字号 28px #8b949e；一个红色大箭头从后台服务指向握点，标注「进程活着 → 管道关不上」字号 28px #ff7b72。
旁白第 5 行期间：底部浮现结论条（宽 1460px、#161b22 底、左 8px accent #58a6ff 边）：「修法：以 exit 为准返回，宽限后主动 destroy 流」字号 31px。
避让底部 120px 字幕区。

--- narration ---
解剖这次死锁
工具等的不是「进程退出」
而是「**全部 stdio 关闭**」
bash 被超时杀掉了
但后台的服务进程还活着，手里握着管道
close 事件永远不来
必须人工杀掉那个进程才恢复


>>> 失败记录表 #B08
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:54px;margin-bottom:42px}
table{width:100%;border-collapse:collapse;font-size:28px;margin-bottom:40px}
th{text-align:left;color:#8b949e;font-weight:400;font-size:26px;padding:0 24px 14px}
td{padding:20px 24px;border-top:1px solid #30363d;vertical-align:top;line-height:1.6}
td:first-child{font-family:"JetBrains Mono",monospace;color:#79c0ff;white-space:nowrap}
.r{color:#ff7b72}.g{color:#3fb950}
.note{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:30px 42px;font-size:32px;line-height:1.8}
.note b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>失败记录表 · 本课最重要的产出</h1>
<table>
<tr><th>#</th><th>现象</th><th>根因</th><th>对策</th><th>状态</th></tr>
<tr><td>1</td><td>后台起服务自测，工具永久挂死，需人工杀 3100 端口进程</td><td>bash 工具等 close 而非 exit；后台守护进程握住管道</td><td>exit+宽限 destroy；bash 侧 kill $(jobs -p) 清场</td><td class="g">已由 T23 修复</td></tr>
</table>
<div class="note">每一个失败，都指向前四课某个<b>被简化掉的决定</b>。<br>
预判清单里没发生的，一个都不做——<b>加固由证据驱动，不由想象驱动</b>。</div>
</div></body></html>

--- narration ---
事故记进 **失败记录表**
现象、根因、对策，一一对应
预判清单里列了七项缺口
但 run1 里没发生的，一个都不做
加固由 **证据驱动**
不由想象驱动
这份表，是整个第五课最重要的产出


>>> 回炉 · 三层修复 #B09
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:54px;margin-bottom:46px}
.steps{display:flex;flex-direction:column;gap:30px;margin-bottom:38px}
.s{display:flex;align-items:center;gap:32px;background:#161b22;border:1px solid #30363d;border-radius:16px;padding:30px 38px}
.n{width:74px;height:74px;border-radius:50%;background:#0d1117;border:3px solid #58a6ff;color:#58a6ff;font-size:36px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.s .t{font-size:31px;line-height:1.6}
.s .t b{color:#58a6ff}
.s .t code{font-family:"JetBrains Mono",monospace;color:#a5d6ff;font-size:28px}
.x{color:#ff7b72}
.foot{background:#0d1117;border:1px solid #30363d;border-left:8px solid #3fb950;border-radius:14px;padding:28px 40px;font-size:30px;line-height:1.7}
.foot b{color:#3fb950}
</style></head><body><div class="wrap">
<h1>回炉：一个事故，挖出三层</h1>
<div class="steps">
<div class="s"><div class="n">1</div><div class="t">改返回时机：以进程 <b>exit</b> 为准，宽限 1s 后主动 <code>destroy()</code> 流</div></div>
<div class="s"><div class="n">2</div><div class="t">发现仍漏杀：<span class="x">taskkill /T 够不着 MSYS 后台任务</span>——它们不在 Windows 进程树里</div></div>
<div class="s"><div class="n">3</div><div class="t">最终让 bash 自己清场：命令后缀 <code>; __rc=$?; kill $(jobs -p); exit $__rc</code></div></div>
</div>
<div class="foot">回归测试覆盖三件事：<b>不挂死 · 后台进程被清 · 退出码保留</b>。<br>（中间还试过 trap 'kill 0'——把 bash 自己也杀了，退出码变 3840，弃用。）</div>
</div></body></html>

--- narration ---
回炉修复，一个事故挖出三层
第一层，改成以进程 exit 为准返回
第二层，又发现外部杀不到后台任务
它们根本不在 Windows 进程树里
第三层，让 bash 自己清场
退出前 kill 掉所有后台任务
修复的每一步，都有实验证据


>>> run2 与验收 #B10
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:30px;line-height:1.95;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:44px 58px;white-space:pre;margin-bottom:38px}
.p{color:#ff7b72}.c{color:#8b949e}.g{color:#3fb950}.ok{color:#3fb950;font-weight:700}
</style></head><body><div class="wrap">
<h1>run2 · 同一命令，从空目录重跑</h1>
<pre><span class="p">$</span> node src/cli.ts --cwd demo/login-app -s l5-run2 --max-steps 30 "$(cat acceptance/task-prompt.md)"
<span class="c">（……这次没有卡死，自测顺利完成）</span>

<span class="p">$</span> node acceptance/verify-lock.ts
<span class="ok">OK</span>   acceptance/login-app.smoke.ts     <span class="c"># 考卷没被动过</span>
<span class="ok">OK</span>   acceptance/task-prompt.md

<span class="p">$</span> node --test acceptance/login-app.smoke.ts
<span class="g">✔ login-app locked acceptance (10 assertions)</span>
<span class="g">pass 1  fail 0</span></pre>
</div></body></html>

--- narration ---
修完之后，run2
同一个命令，同一个 prompt，从空目录重跑
这一次自测没有卡死
先验考卷，校验和一致
再跑冒烟测试
十条断言，**全绿**


>>> run1 vs run2 #B11
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
h1{font-size:56px;text-align:center;margin-bottom:60px}
table{width:100%;border-collapse:collapse;font-size:31px}
th{text-align:left;padding:0 30px 20px;color:#8b949e;font-weight:400;font-size:28px}
td{padding:26px 30px;border-top:1px solid #30363d}
td:first-child{color:#a5d6ff;width:34%}
td:nth-child(2){color:#ff7b72}
td:nth-child(3){color:#3fb950}
.foot{margin-top:56px;text-align:center;font-size:34px;line-height:1.7}
.foot b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>run1 → run2 · 整门课的结论</h1>
<table>
<tr><th></th><th>run1（加固前）</th><th>run2（加固后）</th></tr>
<tr><td>登录应用交付</td><td>✔ 通过（10/10）</td><td>✔ 通过（10/10）</td></tr>
<tr><td>bash 自测环节</td><td>✖ 永久挂死</td><td>✔ 正常完成</td></tr>
<tr><td>人工救援</td><td>1 次（杀 3100 端口进程）</td><td>0 次</td></tr>
</table>
<div class="foot">任务两次都做出来了——差别在于，run1 需要 <b>人</b> 救一次，run2 不需要。<br>把人从救援里解放出来，这才是加固的意义。</div>
</div></body></html>

--- narration ---
run1 和 run2 的对比，就是整门课的结论
有意思的是，登录应用两次都做出来了
差别在别的地方
run1 需要人工救一次
run2 一次都不需要
**把人从救援里解放出来**
这才是加固的意义


>>> 复盘收束 #B12
@enter: fade-up
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:46px}
.row{display:flex;gap:34px;margin-bottom:44px}
.q{flex:1;background:#161b22;border:1px solid #30363d;border-top:6px solid #58a6ff;border-radius:16px;padding:34px 32px}
.qh{font-size:30px;font-weight:700;color:#58a6ff;margin-bottom:20px}
.qa{font-size:27px;color:#e6edf3;line-height:1.75}
.fin{background:#0d1117;border:1px solid #30363d;border-left:10px solid #58a6ff;border-radius:16px;padding:40px 52px;font-size:36px;line-height:1.8;text-align:center}
.fin b{color:#58a6ff}
</style></head><body><div class="wrap">
<h1>复盘三问</h1>
<div class="row">
<div class="q"><div class="qh">它为什么能成？</div><div class="qa">任务边界清晰<br>验收可执行<br>工具够用</div></div>
<div class="q"><div class="qh">它为什么差点没成？</div><div class="qa">每个被简化掉的决定<br>都被真实任务逼出来一次<br>没有普遍正确的设计<br>只有针对约束的取舍</div></div>
<div class="q"><div class="qh">pi 是怎么解决的？</div><div class="qa">摘要压缩 · 沙箱<br>并行工具 · 可恢复中止<br>每一个都对应今天踩过的坑</div></div>
</div>
<div class="fin">这门课的终点，不是造一个替代 pi 的 agent<br>而是获得 <b>读懂它、并判断自己需不需要它</b> 的能力</div>
</div></body></html>

--- narration ---
最后复盘三个问题
它为什么能成？边界清晰，验收可执行，工具够用
它为什么差点没成？
每个简化决定都被真实任务逼出来一次
pi 是怎么解决的？
摘要、沙箱、并行工具，每个都对应今天的坑
这门课的终点
不是造一个替代 pi 的 agent
而是获得 **读懂它、并判断自己需不需要它** 的能力
