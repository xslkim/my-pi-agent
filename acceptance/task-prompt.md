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
