>>> 第 4 课开场 #B01
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
标题页（命中预制组件库 TitleCard）：
kicker：「第 4 课 · L4」
主标题：「让 agent 好用」
副标题：「为什么 demo 里漂亮，一到真任务就崩？」
居中排版，主题默认配色。

--- narration ---
第四课要回答一个问题
为什么 demo 里漂亮的 agent，一到真任务就崩
因为真任务意味着四件事
聊得久、跑得长、会出错、要续上
这四件事 **没有一件和智能有关**
但少任何一件，第五课就会死在半路


>>> REPL 与斜杠命令 #B02
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center}
.term{width:1640px;background:#161b22;border:1px solid #30363d;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.bar{height:62px;background:#0d1117;display:flex;align-items:center;gap:14px;padding:0 28px;border-bottom:1px solid #30363d}
.dot{width:20px;height:20px;border-radius:50%}
.body{padding:44px 60px;font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.95}
.p{color:#ff7b72}.c{color:#79c0ff}.dim{color:#8b949e}.g{color:#3fb950}
.tag{position:fixed;right:48px;bottom:150px;font-family:"JetBrains Mono",monospace;font-size:24px;color:#8b949e}
</style></head><body>
<div class="term">
<div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span></div>
<div class="body">
<div><span class="p">$</span> node src/cli.ts</div>
<div><span class="c">&gt;</span> 帮我把 utils 里的死代码清掉</div>
<div class="dim">（agent 工作中，流式输出……）</div>
<div><span class="c">&gt;</span> /history</div>
<div>18 messages, ~9,400 tokens</div>
<div><span class="c">&gt;</span> /clear</div>
<div><span class="c">&gt;</span> /exit</div>
<div>&nbsp;</div>
<div class="g">✔ /exit /clear /history /save —— 斜杠命令本地处理，绝不发给模型</div>
</div>
</div>
<div class="tag">→ repl.ts</div>
</body></html>

--- narration ---
先把一次一问，变成坐下来一直聊
斜杠命令本地处理，**绝不发给模型**
查上下文用量、清空历史、另存会话
但注意，我们刻意不做 **TUI**——终端图形界面
学员要始终看得见发生了什么


>>> Ctrl+C 三层贯穿 #B03
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
流程图（命中预制组件库 FlowDiagram）：标题「中止：AbortSignal 必须贯穿三层」，纵向（column）4 节点链，跟随旁白推进（props.lineTimings 驱动）：
①「Ctrl+C · SIGINT」（详情：信号源）→ ②「fetch 的 signal」（详情：不传：SSE 继续流，字还在蹦）→ ③「工具 ctx.signal」（详情：不传：bash 子进程继续跑）→ ④「loop 检查 aborted」（详情：不查：下一步照常开始）
使用默认链式边即可。
节点高亮跟随旁白行：第 4、5、6 行分别对应节点 ②、③、④ 高亮，其余行整链常亮。
旁白第 8、9 行期间：流程图右上角浮现一个两行小字卡片（#161b22 底、1px #30363d 边、圆角 12px、padding 20px 26px）：「生成中 → 停本轮」「空闲 → 退出」，字号 26px 等宽，颜色 #8b949e（「→」用 accent #58a6ff）；不遮挡节点链。
画面左下角常驻小字标注「→ repl.ts · loop.ts · llm.ts」，字号 22px，颜色 #8b949e，避让底部 120px 字幕区。

--- narration ---
这一课的难点是 **中止**
**AbortSignal** 就是 fetch 那个取消信号
它必须贯穿三层，缺一层就会漏
不传给 fetch，SSE 继续流，字还在蹦
不传给工具，bash 子进程继续跑
loop 不检查，下一步照常开始
三层都接上，Ctrl+C 才真正停得下来
Ctrl+C 有两种含义：干活时停本轮，空闲时才退出
REPL 靠 generating 标志，区分这两种时刻


>>> 中止的残局 #B04
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:52px;margin-bottom:46px}
.msgs{display:flex;flex-direction:column;gap:18px;margin-bottom:44px}
.m{display:flex;align-items:center;gap:22px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px 30px;font-family:"JetBrains Mono",monospace;font-size:29px}
.r{width:140px;text-align:center;border-radius:8px;padding:6px 0;font-weight:700;font-size:25px}
.u{background:#1f3a5f;color:#79c0ff}.a{background:#2ea04326;color:#3fb950}.t{background:#4b4237;color:#d2a8ff}
.cut{border:1px dashed #f85149;color:#ff7b72}
.foot{background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:32px 44px;font-size:32px;line-height:1.8}
.foot b{color:#58a6ff}
.tag{position:fixed;right:48px;bottom:150px;font-family:"JetBrains Mono",monospace;font-size:24px;color:#8b949e}
</style></head><body><div class="wrap">
<h1>中止后，还有一盘残局</h1>
<div class="msgs">
<div class="m"><span class="r u">user</span>"重构这个模块"</div>
<div class="m"><span class="r a">assistant</span>tool_calls: [read, edit] &nbsp;<span style="color:#8b949e">← 已产生，不能丢</span></div>
<div class="m"><span class="r t">tool</span>"文件内容…" <span style="color:#8b949e">← 已完成</span></div>
<div class="m cut"><span class="r t">tool</span>"error: aborted" &nbsp;<span style="color:#ff7b72">← 没执行完的，补一条中止结果</span></div>
</div>
<div class="foot">丢弃部分输出，下一轮上下文就有空洞，模型答非所问。<br>对话状态的 <b>完整性</b>，比干净更重要。</div>
<div class="tag">→ repl.ts · loop.ts</div>
</div></body></html>

--- narration ---
中止后还有一盘残局
已经产生的部分输出，必须存进历史
没执行完的工具，补一条 aborted 结果
为什么这么较真
因为丢了它，下一轮上下文就有空洞
**完整性比干净更重要**


>>> 会话落盘 #B05
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 110px 0}
h1{font-size:54px;margin-bottom:44px}
pre{font-family:"JetBrains Mono",monospace;font-size:29px;line-height:1.9;background:#161b22;border:1px solid #30363d;border-radius:18px;padding:42px 56px;white-space:pre;margin-bottom:42px;color:#a5d6ff}
.c{color:#8b949e}.r{color:#ff7b72}.g{color:#3fb950}
.row{display:flex;gap:36px}
.b{flex:1;background:#0d1117;border:1px solid #30363d;border-left:6px solid #58a6ff;border-radius:12px;padding:26px 30px;font-size:28px;line-height:1.7}
.b b{color:#58a6ff}
.tag{position:fixed;right:48px;bottom:150px;font-family:"JetBrains Mono",monospace;font-size:24px;color:#8b949e}
</style></head><body><div class="wrap">
<h1>JSONL · 一行一条，追加写</h1>
<pre>.agent/sessions/work.jsonl
{"role":"system","content":"You are a coding agent…"}
{"role":"user","content":"21*2"}                        <span class="c">// appendFileSync，产生即落盘</span>
{"role":"assistant","tool_calls":[…]}
{"role":"tool","tool_call_id":"c1","content":"42"}
{"role":"assistant","content":"21*2 = 42"}
<span class="r">{"role":"user","content":"bro</span>   <span class="r">← 崩溃留下的半行：读取时跳过并警告</span></pre>
<div class="row">
<div class="b"><b>为什么追加写</b><br>Ctrl+C、断电都不该丢历史；最多丢最后一行</div>
<div class="b"><b>坏行容错</b><br>逐行 parse，半行 JSON 不至于毁掉整个会话</div>
<div class="b"><b>-c 续聊</b><br>退出后重开，模型记得上文</div>
</div>
<div class="tag">→ session.ts</div>
</div></body></html>

--- narration ---
会话用 JSONL，一行一条消息，追加写
为什么不是退出时写整个文件
因为 Ctrl+C 和断电都不该丢历史
追加写最多丢最后一行
读取时跳过坏行，崩溃留下的半行
不至于毁掉整个会话


>>> 上下文怎么花光的 #B06
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 120px 0}
h1{font-size:54px;margin-bottom:56px}
.bar{margin-bottom:34px}
.lab{display:flex;justify-content:space-between;font-size:30px;margin-bottom:14px}
.lab span:last-child{font-family:"JetBrains Mono",monospace;color:#8b949e}
.track{height:64px;background:#161b22;border:1px solid #30363d;border-radius:12px;overflow:hidden}
.fill{height:100%;border-radius:10px}
.err{margin-top:40px;background:#2d1517;border:1px solid #f85149;border-radius:14px;padding:28px 40px;font-family:"JetBrains Mono",monospace;font-size:30px;color:#ff7b72}
.foot{margin-top:36px;font-size:31px;color:#8b949e}
.foot b{color:#e6edf3}
.badge{display:inline-block;vertical-align:middle;margin-left:24px;font-size:24px;font-weight:400;color:#d2a8ff;border:1px solid #d2a8ff;border-radius:10px;padding:6px 18px}
.tag{position:fixed;right:48px;bottom:150px;font-family:"JetBrains Mono",monospace;font-size:24px;color:#8b949e}
</style></head><body><div class="wrap">
<h1>/history · 上下文都被谁吃掉了<span class="badge">分类统计 = 本课练习</span></h1>
<div class="bar">
<div class="lab"><span>工具结果（一次 read 一个大文件）</span><span>~5,400 tokens</span></div>
<div class="track"><div class="fill" style="width:62%;background:#58a6ff"></div></div>
</div>
<div class="bar">
<div class="lab"><span>历史轮次（user / assistant）</span><span>~3,100 tokens</span></div>
<div class="track"><div class="fill" style="width:36%;background:#a5d6ff"></div></div>
</div>
<div class="bar">
<div class="lab"><span>system prompt</span><span>~180 tokens</span></div>
<div class="track"><div class="fill" style="width:2%;background:#8b949e"></div></div>
</div>
<div class="err">模型窗口 65,536 → 超限即 400，整个会话作废</div>
<div class="foot">会发现 <b>工具结果是大头</b>——一次 read 就是几千 token，几次就见底。<br><b>24,000</b> 是我们自己划的裁剪安全线（约窗口四成）：超它就地裁剪，不是 400。</div>
<div class="tag">→ repl.ts · context.ts</div>
</div></body></html>

--- narration ---
聊久了上下文会满
history 只报总量，谁吃掉的，要自己加分类统计
这正是本课的练习
结论先给你：**工具结果是大头**
一次 read 就是几千 token，几次就见底
24,000 是我们自己划的安全线，约为窗口四成
超它就地裁剪；真超 65,536，服务端才 400
这是第五课最容易踩的死法之一


>>> 系数要实测 #B07
@enter: slide-left
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:80px 100px 0}
h1{font-size:52px;margin-bottom:44px}
.row{display:flex;gap:40px;margin-bottom:42px}
.m{flex:1;background:#161b22;border:1px solid #30363d;border-top:6px solid #3fb950;border-radius:14px;padding:32px 34px;text-align:center}
.big{font-size:58px;font-weight:800;color:#3fb950}
.lab{font-size:27px;color:#8b949e;margin-top:14px;line-height:1.6}
pre{font-family:"JetBrains Mono",monospace;font-size:31px;line-height:1.9;background:#161b22;border:1px solid #30363d;border-radius:16px;padding:38px 50px;white-space:pre;color:#a5d6ff;margin-bottom:40px}
.k{color:#ff7b72}.c{color:#8b949e}
.wrong{display:flex;gap:36px}
.w{flex:1;background:#2d1517;border:1px solid #f85149;border-radius:12px;padding:24px 30px;font-size:28px;line-height:1.6;color:#ff7b72}
.tag{position:fixed;right:48px;bottom:150px;font-family:"JetBrains Mono",monospace;font-size:24px;color:#8b949e}
</style></head><body><div class="wrap">
<h1>估算不引 tokenizer，但系数要实测</h1>
<div class="row">
<div class="m"><div class="big">0.58</div><div class="lab">中文 token/字<br>（97 字散文实测 56 token）</div></div>
<div class="m"><div class="big">3.7</div><div class="lab">代码 字符/token<br>（249 字符 TS 实测 68 token）</div></div>
<div class="m"><div class="big">1 次</div><div class="lab">请求就够<br>max_tokens=1，读 usage.prompt_tokens</div></div>
</div>
<pre><span class="k">return</span> Math.ceil(cjk * 0.7 + rest / 3.5);  <span class="c">// 实测值再加安全余量</span></pre>
<div class="wrong">
<div class="w">✗ chars/3 一刀切：中文低估约 1.8 倍——裁剪以为还有余量，实际已贴着上限，照样 400</div>
<div class="w">✗ 中文一律 1 token/字：高估 1.7 倍——用量才六成就开始裁，长任务经不起这么糟蹋</div>
</div>
<div class="tag">→ context.ts</div>
</div></body></html>

--- narration ---
token 估算不引依赖，但系数要 **实测**
方法很土：发一次请求，读 usage 字段
中文零点五八 token 每字
代码三点七字符每 token
两个常见错误都别犯
一刀切断以三，中文低估近两倍，裁剪形同虚设
按一字一 token，又高估太多，历史被白白丢掉
十分钟的实测，胜过博客抄来的经验值


>>> 成组裁剪 #B08
@enter: fade-up
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「fitContext · 丢弃必须成组」字号 52px。
旁白第 1 行期间：中央出现一条消息时间轴（横向，宽 1700px），从左到右排列 6 轮共 16 张卡片代表消息——[sys] | [u₁] [asst₁+tools] [tool] | [u₂] [asst₂] | [u₃] [asst₃+tools] [tool] | [u₄] [asst₄] | [u₅] [asst₅+tools] [tool] | [u₆] [asst₆]，轮与轮之间留稍大间隙（16px）以显出分组，user/assistant/tool 用不同底色（#1f3a5f / #2ea04326 / #4b4237），卡片高 120px，字号 22px 等宽，首尾卡片不超出画布边界。卡面标签一律用上述缩写（sys / uₙ / asstₙ / tool），不得写全拼「assistant」「system」，避免 90px 卡面文字溢出。
旁白第 2 行期间：[sys] 卡片加金色 #d2a8ff 描边，上方标签「永远保留」字号 28px；最右侧第 3–6 轮（u₃ 起共 10 张卡）加 accent #58a6ff 描边，标签「最近 4 轮优先保」；左侧第 1、2 轮保持无描边，即为可丢区间。
旁白第 3 行期间：最左侧第 1 轮（u₁ 到 tool 三张卡）整体被一个红色 #f85149 半透明框选中，框上标签「从最老的整组丢 · 在保护区外」字号 28px，随后整组淡出消失。
旁白第 4 行期间：画面分裂出对比小图：下半部出现错误示例（示意用，卡片标成 [asstₓ+tools] / [toolₓ]，下标 x 表示泛指、与已删除的第 1 轮无关）——只丢了 asstₓ+tools 卡，留下孤零零的 toolₓ 卡变红闪烁，上方弹出红色标签「孤儿 tool_call_id → 400」字号 30px。
旁白第 5 行期间：底部浮现结论条（宽 1420px，#161b22 底，左 8px accent 边）：「你为了避免 400 做的裁剪，可能制造另一个 400」字号 31px。
画面左下角常驻小字标注「→ context.ts」，字号 22px，颜色 #8b949e；避让底部 120px 字幕区。

--- narration ---
裁剪策略朴素，但必须正确
system 永远保留，**最近 4 轮**优先保
从最老的开始丢
关键是 **成组**：assistant 和它的 tool 结果同生共死
只丢一半，就产生孤儿 tool_call_id
你为了避免 400 做的裁剪
制造了 **另一个 400**


>>> 重试的纪律 #B09
@enter: fade
@exit: fade
@visual: html

--- visual ---
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;background:#0d1117;font-family:"Noto Sans SC",sans-serif;color:#e6edf3}
.wrap{padding:90px 110px 0}
h1{font-size:54px;margin-bottom:52px}
.row{display:flex;gap:44px}
.col{flex:1;border-radius:18px;padding:42px 46px;background:#161b22;border:1px solid #30363d}
.col.ok{border-top:6px solid #3fb950}
.col.bad{border-top:6px solid #f85149}
.t{font-size:36px;font-weight:700;margin-bottom:30px}
.ok .t{color:#3fb950}.bad .t{color:#ff7b72}
li{font-size:31px;line-height:2.1;list-style:none;padding-left:44px;position:relative}
li::before{position:absolute;left:0;font-size:28px}
.ok li::before{content:"↻";color:#3fb950}
.bad li::before{content:"✋";color:#ff7b72}
.note{margin-top:44px;background:#0d1117;border:1px solid #30363d;border-left:8px solid #58a6ff;border-radius:14px;padding:30px 42px;font-size:31px;line-height:1.7}
.note b{color:#58a6ff}
.tag{position:fixed;right:48px;bottom:150px;font-family:"JetBrains Mono",monospace;font-size:24px;color:#8b949e}
</style></head><body><div class="wrap">
<h1>重试要克制：什么不该重试</h1>
<div class="row">
<div class="col ok">
<div class="t">↻ 重试</div>
<li>网络错误 / 连接失败</li>
<li>5xx 服务端抖动</li>
<li>429 限流（尊重 Retry-After）</li>
</div>
<div class="col bad">
<div class="t">✋ 绝不重试</div>
<li>其余 4xx——请求本身有错</li>
<li>已经 abort 的请求</li>
<li>工具执行的报错（那是给模型的信息）</li>
</div>
</div>
<div class="note">400 通常是<b>消息结构错</b>（比如裁剪裁出了孤儿）——重试只是把同一个错再发三遍，还掩盖真正的 bug。<br>每次重试打印一行提示：<b>不要静默重试</b>。</div>
<div class="tag">→ retry.ts</div>
</div></body></html>

--- narration ---
网络会抖，重试要克制
网络错误、五开头的、四二九，带抖动的指数退避
其余四开头的，**绝不重试**
四百通常是消息结构有错
重试只会把同一个错再发三遍
还会掩盖真正的 bug
每次重试都要打印，不要静默


>>> 首 token 分界线 #B10
@enter: slide-left
@exit: fade
@visual: animation

--- visual ---
深色背景 #0d1117 填满画面，视觉跟随旁白推进（用 props.lineTimings 驱动，不要硬编码时间戳）：
顶部标题「流式请求的重试窗口」字号 52px。
旁白第 1 行期间：画面中央出现一条水平时间轴（宽 1560px、6px 高、#30363d），左端点标「发起请求」右端点标「流结束」（字号 28px 等宽 #8b949e）。
旁白第 2 行期间：轴上 30% 处出现一个发光圆点标「第一个 token」（accent #58a6ff，字号 30px）。
旁白第 3 行期间：轴上 12% 处出现第二个圆点标「响应头」（金色 #d2a8ff，字号 30px），上方标签「实现里的真正分界线」字号 28px。
旁白第 4 行期间：从左端到「响应头」之间的轴段变绿 #3fb950 加粗，上方浮出绿色标签「唯一可重试的窗口」字号 32px。
旁白第 5 行期间：「第一个 token」之后的轴段变红 #f85149，下方浮出小图标：两段重复的正文条块（两个相同的浅色矩形并排，中间一个红色叉），标签「重放 = 内容重复」字号 28px。
旁白第 6、7 行期间：底部浮现结论条（宽 1400px、#161b22 底、左 8px accent 边）：「首 token 之后失败，只能作为错误上报」字号 31px。
画面左下角常驻小字标注「→ llm.ts · retry.ts」，字号 22px，颜色 #8b949e；避让底部 120px 字幕区。

--- narration ---
流式请求的重试窗口只有一段
从发起到收到 **第一个 token**
实现里收得更紧：**响应头**一到手就不再重试
这个窗口里失败，可以安全重来
已经吐了一半再重放，内容会重复
所以首 token 之后失败
只能作为错误上报


>>> 见真章与 pi 对照 #B11
@enter: fade-up
@exit: fade
@visual: video(./assets/session-resume.mp4)

--- visual ---
（此描述仅作文档用途，实际使用 ./assets/session-resume.mp4）
真实录屏：两次单发——先存「代号紫葡萄」，再 -s vdemo -c 续聊答出代号。

--- narration ---
见真章
连续聊十几轮，不炸上下文
中途 Ctrl+C，只停本轮还能继续
退出后再 -c 续聊，它记得上文
对照 pi：它会把旧对话压缩成摘要
丢历史还是压历史，没有免费的午餐
下一课，让它去交付真东西
