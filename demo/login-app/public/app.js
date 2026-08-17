// 原生 JS + fetch,无框架
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const authArea = document.querySelector("#auth-area");
const userArea = document.querySelector("#user-area");
const greeting = document.querySelector("#greeting");
const msgEl = document.querySelector("#msg");

const tabButtons = {
  login: document.querySelector("#tab-login"),
  register: document.querySelector("#tab-register"),
};

function showMsg(text, kind = "error") {
  msgEl.textContent = text; // textContent 赋值,无 XSS 风险
  msgEl.className = kind;
  msgEl.hidden = !text;
}

function switchTab(name) {
  const isLogin = name === "login";
  tabButtons.login.classList.toggle("active", isLogin);
  tabButtons.register.classList.toggle("active", !isLogin);
  loginForm.hidden = !isLogin;
  registerForm.hidden = isLogin;
  showMsg("");
}

tabButtons.login.addEventListener("click", () => switchTab("login"));
tabButtons.register.addEventListener("click", () => switchTab("register"));

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* 非 JSON 响应 */
  }
  return { ok: res.ok, status: res.status, body };
}

function formPayload(form) {
  const fd = new FormData(form);
  return {
    username: String(fd.get("username") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  };
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMsg("");
  const { ok, status, body } = await postJson("/api/login", formPayload(loginForm));
  if (ok) {
    loginForm.reset();
    await refreshSession();
  } else {
    showMsg(status === 401 ? "用户名或密码错误" : body?.error ?? "登录失败,请稍后再试");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMsg("");
  const payload = formPayload(registerForm);
  const { ok, status, body } = await postJson("/api/register", payload);
  if (ok) {
    // 切回登录页并预填用户名
    loginForm.elements.username.value = payload.username;
    switchTab("login");
    showMsg("注册成功,请登录", "success");
  } else {
    showMsg(status === 409 ? "用户名已存在" : body?.error ?? "注册失败,请稍后再试");
  }
});

document.querySelector("#logout-btn").addEventListener("click", async () => {
  await postJson("/api/logout", {});
  await refreshSession();
});

// 拉取当前会话:成功则显示 Hello, <username>
async function refreshSession() {
  let res;
  try {
    res = await fetch("/api/me");
  } catch {
    res = null;
  }
  if (res && res.ok) {
    const { username } = await res.json();
    greeting.textContent = `Hello, ${username}`;
    authArea.hidden = true;
    userArea.hidden = false;
  } else {
    userArea.hidden = true;
    authArea.hidden = false;
  }
}

refreshSession();
