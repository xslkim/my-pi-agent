# T20 · 锁定验收脚本

> 课：L5 · 规格：[specs/05-delivery.md「验收」](../specs/05-delivery.md) · 预算：0 行（在 `test/`） · 前置：T19

## 目标

**在 agent 动手做登录应用之前，先把验收标准写死并锁上。** 顺序不能反：先有考卷再考试，验收才有意义；否则很容易不知不觉把标准改成「刚好它能过」。

## 要写的文件

- `test/login-app.smoke.ts`（新建，之后**永久只读**）
- `test/login-app.smoke.sha256`（新建，基线校验和）
- `test/verify-lock.ts`（新建）

## 实现要点

### 冒烟测试

用 `node:http` 客户端打真实 HTTP，验证 `demo/login-app` 的行为，**不 import 被测代码**（只从外部黑盒验证，避免实现细节渗进考卷）：

- `spawn` 启动服务，**必须显式 `cwd: "demo/login-app"`**。不设 cwd 的话 `data.db` 会建在仓库根，测试看似通过但产物位置错了。
- 轮询等待端口就绪（最多 10s），别用固定 `sleep`。
- 断言链：
  1. `POST /api/register` 新用户 → 2xx
  2. 重复注册同名 → 4xx
  3. `POST /api/login` 错密码 → 401
  4. `POST /api/login` 对密码 → 2xx，`Set-Cookie` 含 `HttpOnly` 且含 `SameSite=Strict`
  5. 带 cookie `GET /api/me` → 200 且返回用户名
  6. 不带 cookie `GET /api/me` → 401
  7. `GET /` 返回 HTML 且含登录表单
  8. **读 `demo/login-app/data.db` 原始字节，断言其中不含明文密码**
- 无论成败都 kill 进程组并清理 `data.db`。

### 锁

```bash
node test/verify-lock.ts    # 比对 smoke.ts 的 sha256 与基线，不一致则退出码 1
```

把 `test/login-app.smoke.ts` 的 sha256 写进 `.sha256` 文件并提交。`verify-lock.ts` 在 T24 验收时先跑，**任何对考卷的改动都会被发现**。

这条约束是给 agent 的，也是给我们自己的：改考卷比改代码容易得多，必须有机制挡住这个诱惑。

## 验收

```bash
node test/verify-lock.ts
```

- [ ] `verify-lock.ts` 对当前文件通过（退出码 0）
- [ ] 手工改一个字符后 `verify-lock.ts` 退出码 1，改回后恢复
- [ ] `node --test test/login-app.smoke.ts` 此刻**应当失败**（应用还不存在），且失败信息清楚指出连不上服务，而不是抛一个看不懂的堆栈
- [ ] `.gitignore` 已忽略 `*.db`

## 不要做

- **不要写任何 `demo/login-app` 的实现代码**（那是 agent 的活）
- 不要为了让测试现在通过而放宽断言

## 完成动作

`git commit -m "T20: locked acceptance smoke test"`，看板标 `done`。**此后该文件只读。**
