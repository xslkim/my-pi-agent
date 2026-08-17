# 最小登录应用(零 npm 依赖)

仅使用 Node 内置模块:`node:http`、`node:sqlite`、`node:crypto`、`node:fs`。

## 运行

需要 Node.js >= 22.5(内置 `node:sqlite`);推荐 Node 24+,可直接执行 TypeScript:

```sh
node server.ts        # 或 npm start
```

默认监听 `http://localhost:3000`,可用 `PORT` 环境变量覆盖。

## 接口

| 方法 | 路径            | 说明                                                        |
| ---- | --------------- | ----------------------------------------------------------- |
| POST | /api/register   | `{username, password}` → `201 {ok:true}`;用户名已存在 `409` |
| POST | /api/login      | 成功 `200 {ok:true}` 并下发 `sid` cookie;密码错 `401`        |
| GET  | /api/me         | 有效 cookie → `200 {username}`;否则 `401`                    |
| POST | /api/logout     | `200 {ok:true}`,并使当前 `sid` 失效                          |
| GET  | / 及其他        | 提供 `public/` 下静态文件(`/` → `login.html`)                |

## 实现要点

- **存储**:`node:sqlite`,文件 `data.db`,表 `users(id, username UNIQUE, salt, hash)`。
- **密码**:`node:crypto` scrypt + 16 字节随机盐,只存 hex 哈希,不存明文;校验用 `timingSafeEqual`。
- **会话**:`randomUUID` token 存内存 `Map`;cookie 名 `sid`,`HttpOnly`、`SameSite=Strict`、`Path=/`。
- 重启进程后内存会话清空,需要重新登录。
