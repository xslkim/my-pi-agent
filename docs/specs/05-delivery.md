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

`acceptance/login-app.smoke.ts` **在放 agent 进场之前就写好**（[T20](../tasks/T20-lock-acceptance.md)），agent 不许改。

**为什么放 `acceptance/` 而不是 `test/`**：实测不带参数的 `node --test` 会执行 `test/` 下递归的每一个 `.ts` 文件，以及仓库任意位置的 `*.test.ts`。冒烟测试若放进 `test/`，从写下它那一刻起默认测试集就是红的（应用还不存在），L5 期间所有「全量测试全绿」的检查都会失效。放在 `acceptance/` 且不叫 `*.test.ts` 就不会被自动发现，只能显式运行。

任务 prompt 同样固化成 `acceptance/task-prompt.md` 并一起锁定——它是考卷的另一半，而且两轮运行要求描述逐字相同，交给文件系统保证比靠人摘抄可靠。

```ts
// 流程（node --test acceptance/login-app.smoke.ts 显式运行）
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

1. **L3 的路径约束天然生效**：agent 的 cwd 是 `demo/login-app/`，`resolveInside` 会拒绝任何指向 `acceptance/` 的文件工具调用。
2. **校验和兜底**：`bash` 工具能用绝对路径绕过第一道锁（诚实承认这个缺口）。所以每轮验收前都比对两份考卷的 sha256，不一致则本次交付作废。

   基线值 commit 进 `acceptance/lock.sha256`（覆盖 `login-app.smoke.ts` 与 `task-prompt.md`），比对逻辑写在 `acceptance/verify-lock.ts` 里，都在 agent 的 cwd 之外。**基线必须进版本库**——只写在课件里、靠人肉记忆，等于没有。

这两道锁的对比本身就是教学点：**声明式约束（cwd）挡不住能执行任意命令的工具**。这正是 pi 要做沙箱和权限确认的原因。

## 三、我们要补的能力（≤ 200 行）

先让 agent 裸跑一次（[T21](../tasks/T21-bare-run.md)），记录它卡在哪里，再针对性补。下表是预判的高频缺口与对策，**实际以 `docs/runs/run1.md` 为准**：表里没被 run1 证实的，不做；run1 暴露而表里没有的，补做。

| 缺口 | 表现 | 补什么 | 预算 | 任务 |
|---|---|---|---|---|
| 不知道目录里有什么 | 反复 `read` 猜文件名、覆盖已有文件 | `ls` 工具（递归、忽略 `node_modules`/`.git`、上限 200 项） | 45 | [T22](../tasks/T22-ls-grep.md) |
| 找不到符号 | 用 `bash grep` 但 Windows 上行为不一致 | `grep` 工具（`node:fs` + `RegExp`，返回 `文件:行号:内容`） | 65 | T22 |
| 危险命令 | `rm -rf`、`git reset --hard` | `bash` 加危险模式匹配；REPL 下交互确认，**单发模式直接拒绝**，`--yolo` 可跳过 | 30 | [T23](../tasks/T23-hardening.md) |
| 编辑失败循环 | `edit` 找不到 `old_string` 后原样重试 | 错误信息补一次行级近似匹配，提示最接近的行与行号 | 20 | T23 |
| 一次只干一件事，轮次爆炸 | 步数用光 | `--max-steps` 在 `--cwd` 模式下默认提到 30；prompt 要求「一次调用做完一件完整的事」 | 25 | T23 |
| 不验证自己的产出 | 说「完成了」但没跑过 | prompt 加自验证条款：完成前必须跑一次验证并附上输出 | ↑含在上一行 | T23 |
| 步数快用完时不收敛 | 最后几步还在做枝节 | 剩余 ≤ 3 步时以 `user` 角色注入一次提醒 | 15 | T23 |

合计 200 行，正好用满 L5 预算。**超了就砍功能，不许突破 1400 行总量。**

已经不在表里的两项：`--max-steps` 参数在 [T19](../tasks/T19-cli-args.md) 就加了；`edit` 多处匹配时报行号在 [T12](../tasks/T12-edit.md) 就做了。L5 只补它们没覆盖到的部分。上下文管理由 L4 的 `fitContext` 承担，L5 至多调一下 `--context-budget` 默认值，不写新代码。

## 四、执行流程（课堂上的真实节奏）

1. **裸跑**：`node src/cli.ts --cwd demo/login-app -s l5-run1 --max-steps 30 "$(cat acceptance/task-prompt.md)"`，全程录屏，不干预。（`-s` 收的是会话**名字**不带后缀；用 `-s` 新建会话，不要用 `-c`——`-c` 是续聊，而每轮都要求从零开始。）
2. **记录失败**：把每次卡住的现象、agent 的原话、耗时、token 用量记进 `docs/runs/run1.md`。
3. **回炉**：按上表补能力，每补一项写一个回归测试。
4. **重跑**：清空 `demo/login-app/`，用**同一个 prompt 文件**重新裸跑。
5. **验收**：`node acceptance/verify-lock.ts` + `node --test acceptance/login-app.smoke.ts` 全绿。
6. **复盘**：对照 pi，讲清它为什么需要那些我们省掉的机制。

允许多轮迭代，但**每一轮都必须从空目录重新开始**——否则测的是「人 + agent」而不是 agent。

## 五、测试

| 用例 | 断言 |
|---|---|
| `ls` 越界 | 拒绝 `../` |
| `ls` 忽略规则 | 结果不含 `node_modules` |
| `grep` 基本匹配 | 返回 `file:line:text` 且行号正确 |
| `grep` 无匹配 | 返回明确的「no matches」而非空字符串 |
| 危险命令确认 | `rm -rf /` 在单发模式被直接拒绝且不阻塞；`--yolo` 下放行 |
| 危险命令误伤 | `rm -rf ./build` 不被拦 |
| `edit` 近似提示 | 找不到 `old_string` 时给出最接近的行与行号 |
| **登录应用冒烟** | 上面 10 条断言全绿 |
| 校验和 | 改动冒烟脚本或 task-prompt 一个字节，`verify-lock.ts` 报错并使验收失败 |
| `data.db` 落点 | 服务以 `cwd: demo/login-app` 启动后，`demo/login-app/data.db` 存在、仓库根没有 |

## 验收

1. `node --test` 全绿且断网可跑（默认测试集**不含** `acceptance/`）。
2. `node --test acceptance/login-app.smoke.ts` 全绿，10 条断言。
3. `node acceptance/verify-lock.ts` 通过，两份考卷与基线一致。
4. 从空目录裸跑一次能交付（允许 agent 内部多轮，不允许人工改代码）。
5. 累计 ≤ 1400 行；`tsc --noEmit` 无错。
6. `docs/runs/` 下的失败记录与对比表已填写——**这是本课最重要的产出**。

## 不做

多用户权限、JWT、CSRF token、HTTPS、生产部署、前端框架。这些会淹没主线；在课程末尾作为「延伸练习」列出。
