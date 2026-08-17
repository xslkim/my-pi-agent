# Spec 05 · 让 agent 交付（登录页 + 后端实战）

> 课程：[lessons/05-delivery.md](../lessons/05-delivery.md) · Tag `l5-delivery` · 行数预算 ≤ 200（累计 ≤ 1400）
>
> 行数预算只算**我们给 agent 补的能力**。`demo/login-app/` 是 agent 写的，不计入。

## 目标

用前四课造出来的 agent，在空目录里做出一个可运行的登录功能，并通过一份**预先写好、agent 不可修改**的冒烟测试。

这一课的产出有两份：一份是 agent 交付的应用，另一份是我们为了让它能交付而补的能力。后者才是课程内容。

## 一、任务定义（交给 agent 的需求）

工作目录 `demo/login-app/`，初始为空。要求（原样写进 prompt）：

```
用 Node 内置模块实现一个带登录的最小应用，不要用任何 npm 依赖。

后端 server.ts，监听 PORT 环境变量（默认 3000）：
- POST /api/register  {username, password} -> 201 {ok:true}；用户名已存在返回 409
- POST /api/login     {username, password} -> 200 {ok:true} 并下发 httpOnly cookie；密码错返回 401
- GET  /api/me        -> 200 {username} 需要有效 cookie；否则 401
- POST /api/logout    -> 200 {ok:true} 并使 cookie 失效
- GET  /              -> 返回 public/login.html
- 静态文件从 public/ 提供

存储：node:sqlite，文件 data.db，表 users(id, username unique, salt, hash)
密码：node:crypto scrypt 加盐哈希，禁止明文存储
会话：randomUUID token，内存 Map 即可，cookie 名 sid，HttpOnly、SameSite=Strict、Path=/

前端 public/login.html + public/app.js：
- 注册表单、登录表单、登出按钮
- 登录后显示 "Hello, <username>"
- 错误信息要显示出来
- 原生 JS + fetch，不要框架
```

技术前提已在本机验证：`node:sqlite` 的 `DatabaseSync` 可用（有 experimental 警告），`crypto.scryptSync` 可用。

## 二、验收：锁定的冒烟测试

`test/login-app.smoke.ts` **在放 agent 进场之前就写好**，agent 不许改。

```ts
// 流程（node --test 运行）
// 1. spawn("node", ["server.ts"], { cwd: "demo/login-app", env: { ...process.env, PORT: "3999" } })
//    ——必须显式指定 cwd，否则 server 用相对路径创建的 data.db 会落在仓库根目录
// 2. 轮询等端口就绪（最多 10s）
// 3. 用 fetch 手动管理 cookie：从 set-cookie 取 sid，后续请求带上
// 4. 结束后 kill 进程树，删除 demo/login-app/data.db
```

断言清单（全部必须过）：

| # | 请求 | 期望 |
|---|---|---|
| 1 | `POST /api/register {alice, pw123456}` | 201 |
| 2 | 重复注册 alice | 409 |
| 3 | `POST /api/login {alice, wrong}` | 401，且**不下发 cookie** |
| 4 | `POST /api/login {alice, pw123456}` | 200，`set-cookie` 同时含 `HttpOnly` 和 `SameSite=Strict` |
| 5 | `GET /api/me` 带 cookie | 200，body 里 `username === "alice"` |
| 6 | `GET /api/me` 不带 cookie | 401 |
| 7 | `POST /api/logout` 带 cookie | 200 |
| 8 | 登出后 `GET /api/me` 带原 cookie | 401 |
| 9 | `GET /` | 200，HTML 含 `<form` |
| 10 | 直接读 `demo/login-app/data.db` 的原始字节 | **搜不到明文 `pw123456`** |

第 10 条是重点：它检验的不是「功能能跑」，而是「有没有按要求做对」。agent 很喜欢偷懒存明文。

### 防篡改

agent 不能改验收脚本，用两道锁：

1. **L3 的路径约束天然生效**：agent 的 cwd 是 `demo/login-app/`，`resolveInside` 会拒绝任何指向 `test/` 的文件工具调用。
2. **校验和兜底**：`bash` 工具能用绝对路径绕过第一道锁（诚实承认这个缺口）。所以每轮验收前后都比对 `sha256(test/login-app.smoke.ts)`，不一致则本次交付作废。

   基线值 commit 进 `test/login-app.smoke.sha256`，比对逻辑写在 `test/verify-lock.ts` 里，两者都在 agent 的 cwd 之外。**基线必须进版本库**——只写在课件里、靠人肉记忆，等于没有。

这两道锁的对比本身就是教学点：**声明式约束（cwd）挡不住能执行任意命令的工具**。这正是 pi 要做沙箱和权限确认的原因。

## 三、我们要补的能力（≤ 200 行）

先让 agent 裸跑一次，记录它卡在哪里，再针对性补。下表是预判的高频缺口与对策，实际以第一次跑的结果为准。

| 缺口 | 表现 | 补什么 | 预算 |
|---|---|---|---|
| 不知道目录里有什么 | 反复 `read` 猜文件名、覆盖已有文件 | `ls` 工具（递归、忽略 `node_modules`/`.git`、上限 200 项） | 50 |
| 找不到符号 | 用 `bash grep` 但 Windows 上行为不一致 | `grep` 工具（`node:fs` + `RegExp`，返回 `文件:行号:内容`） | 60 |
| 一次只干一件事，轮次爆炸 | 10 步用光 `maxSteps` | 加 `--max-steps` argv 参数（CLI 目前没有），默认提到 30；prompt 里要求「一次 tool 调用尽量做完一件完整的事」 | 10 |
| 上下文吃满 | 第 15 轮开始报 400 | L4 的 `fitContext` 接进 loop，并加 `/tokens` 实时提示 | — |
| 危险命令 | `rm -rf`、`git reset --hard` | `bash` 加危险模式匹配 + 交互确认（`--yes` 可跳过） | 40 |
| 编辑失败循环 | `edit` 报「匹配到 3 处」后原样重试 | 错误信息里附带**匹配位置的行号**，帮模型定位 | 15 |
| 不验证自己的产出 | 说「完成了」但没跑过 | prompt 加一条：完成前必须用 `bash` 跑一次 `node --check` 或启动服务 | 5 |

合计约 180 行，留 20 行余量。**超预算就砍功能，不许突破 1400 行总量。**

## 四、执行流程（课堂上的真实节奏）

1. **裸跑**：`node src/cli.ts --cwd demo/login-app -s l5-run1.jsonl --max-steps 30`，输入任务 prompt，全程录屏，不干预。（用 `-s` 新建会话，不要用 `-c`——`-c` 是续聊，而每轮都要求从零开始；每重跑一轮换一个会话文件名。）
2. **记录失败**：把每次卡住的现象、agent 的原话、耗时、token 用量记进 lesson 文档的失败表。
3. **回炉**：按上表补能力，每补一项写一个回归测试。
4. **重跑**：清空 `demo/login-app/`，重新裸跑。
5. **验收**：`node --test test/login-app.smoke.ts` 全绿 + 校验和一致。
6. **复盘**：对照 pi，讲清它为什么需要那些我们省掉的机制。

允许多轮迭代，但**每一轮都必须从空目录重新开始**——否则测的是「人 + agent」而不是 agent。

## 五、测试

| 用例 | 断言 |
|---|---|
| `ls` 越界 | 拒绝 `../` |
| `ls` 忽略规则 | 结果不含 `node_modules` |
| `grep` 基本匹配 | 返回 `file:line:text` 且行号正确 |
| `grep` 无匹配 | 返回明确的「no matches」而非空字符串 |
| 危险命令确认 | `rm -rf /` 在无 `--yes` 时被拦下 |
| `edit` 错误信息 | 多处匹配时错误里带行号 |
| **登录应用冒烟** | 上面 10 条断言全绿 |
| 校验和 | 改动冒烟脚本一个字节，`verify-lock.ts` 报错并使验收失败 |
| `data.db` 落点 | 服务以 `cwd: demo/login-app` 启动后，`demo/login-app/data.db` 存在、仓库根没有 |

## 验收

1. `node --test` 全绿，含登录应用的 10 条断言。
2. `test/login-app.smoke.ts` 校验和与基线一致。
3. 从空目录裸跑一次能交付（允许 agent 内部多轮，不允许人工改代码）。
4. 累计 ≤ 1400 行；`tsc --noEmit` 无错。
5. 失败记录表已填写——**这份表是本课最重要的产出**。

## 不做

多用户权限、JWT、CSRF token、HTTPS、生产部署、前端框架。这些会淹没主线；在课程末尾作为「延伸练习」列出。
