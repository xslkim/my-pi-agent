# T20 · 锁定验收脚本与任务 prompt

> 课：L5 · 规格：[specs/05-delivery.md「二、验收：锁定的冒烟测试」](../specs/05-delivery.md) · 预算：0 行（不在 `src/`） · 前置：T19

## 目标

**在 agent 动手做登录应用之前，先把考卷写死并锁上。** 顺序不能反：先有考卷再考试，验收才有意义；否则很容易不知不觉把标准改成「刚好它能过」。

考卷有两份，都要锁：冒烟测试（怎么算过）和任务 prompt（考的是什么）。

## 要写的文件

全部放在仓库根的 **`acceptance/`** 目录，**不要放 `test/`**：

- `acceptance/login-app.smoke.ts`（新建，之后永久只读）
- `acceptance/task-prompt.md`（新建，交给 agent 的任务描述，之后永久只读）
- `acceptance/lock.sha256`（新建，上面两份文件的校验和基线）
- `acceptance/verify-lock.ts`（新建，比对脚本）

### 为什么不放 `test/`

本机 v25.2.1 实测：不带参数的 `node --test` 会执行 `test/` 下**递归的每一个 `.ts` 文件**（哪怕它不叫 `*.test.ts`），以及仓库任意位置的 `*.test.ts`。

如果冒烟测试放进 `test/`，从本任务起它就进入默认测试集，而应用要到 T24 才存在——`node --test` 会一直是红的，T21–T23 里所有「全量测试全绿」的验收门槛都变得不可能满足。放在 `acceptance/` 且不叫 `*.test.ts`，就不会被自动发现，只能显式运行。

## 实现要点

### `acceptance/task-prompt.md`

把 [specs/05-delivery.md「一、任务定义」](../specs/05-delivery.md) 那段需求**逐字复制**进来，纯文本，不加标题和说明。

它单独成文件是为了两件事：命令里可以直接 `cat` 进去（不用手工摘抄 markdown），以及 [T24](T24-final-run.md) 要求 run1/run2 任务描述逐字相同——由文件系统保证，比靠人自觉可靠。

### `acceptance/login-app.smoke.ts`

打真实 HTTP 做黑盒验证，**不 import 被测代码**（避免实现细节渗进考卷）。

- `spawn("node", ["server.ts"], { cwd: "demo/login-app", env: { ...process.env, PORT: "3999" } })`。**`cwd` 必须显式指定**，否则 server 用相对路径建的 `data.db` 会落在仓库根，测试看着过了但产物位置是错的。
- 轮询等端口就绪（最多 10s），不要用固定 `sleep`。
- 手工管理 cookie：从 `set-cookie` 取 `sid`，后续请求带上。
- 无论成败都 kill 进程树并删除 `demo/login-app/data.db`。

断言链（与 spec 05 的表**逐条对应，状态码取精确值**）：

| # | 请求 | 期望 |
|---|---|---|
| 1 | `POST /api/register {alice, pw123456}` | 201 |
| 2 | 重复注册 alice | 409 |
| 3 | `POST /api/login {alice, wrong}` | 401，且**不下发 cookie** |
| 4 | `POST /api/login {alice, pw123456}` | 200，`set-cookie` 同时含 `HttpOnly` 和 `SameSite=Strict` |
| 5 | `GET /api/me` 带 cookie | 200，`username === "alice"` |
| 6 | `GET /api/me` 不带 cookie | 401 |
| 7 | `POST /api/logout` 带 cookie | 200 |
| 8 | 登出后 `GET /api/me` 带原 cookie | 401 |
| 9 | `GET /` | 200，HTML 含 `<form` |
| 10 | 读 `demo/login-app/data.db` 原始字节 | **搜不到明文 `pw123456`** |

第 7、8 条不能省：任务 prompt 里要求了 `/api/logout`，漏测等于允许 agent 不实现它照样满分。第 10 条检验的不是「能跑」而是「有没有按要求做对」——模型很爱偷懒存明文。

### `acceptance/verify-lock.ts`

```bash
node acceptance/verify-lock.ts    # 两份考卷的 sha256 与基线不一致则退出码 1
```

`lock.sha256` 每行 `<sha256>  <相对路径>`，覆盖 `login-app.smoke.ts` 和 `task-prompt.md`，进版本库。**基线只写在课件里、靠人肉记忆等于没有。**

## 验收

```bash
node acceptance/verify-lock.ts
node --test
```

- [ ] `verify-lock.ts` 对当前两份文件通过（退出码 0）
- [ ] 任一文件改一个字符后退出码 1，改回后恢复
- [ ] **`node --test` 仍然全绿**——冒烟测试没有被默认发现（这是本任务最容易搞砸的地方，务必确认）
- [ ] `node --test acceptance/login-app.smoke.ts` 此刻**应当失败**，且失败信息清楚指出连不上服务，而不是抛一个看不懂的堆栈
- [ ] `acceptance/task-prompt.md` 与 spec 05 的任务定义逐字一致
- [ ] `.gitignore` 已忽略 `*.db`

## 不要做

- **不要写任何 `demo/login-app` 的实现代码**（那是 agent 的活）
- 不要为了让测试现在通过而放宽断言
- 不要把这四个文件放进 `test/`

## 完成动作

`git commit -m "T20: locked acceptance smoke test + task prompt"`，看板标 `done`。**此后 `acceptance/login-app.smoke.ts` 与 `task-prompt.md` 只读。**
