const $ = (id) => document.getElementById(id);

const authView = $('auth-view');
const meView = $('me-view');
const helloEl = $('hello');
const loginForm = $('login-form');
const registerForm = $('register-form');
const loginMsg = $('login-msg');
const registerMsg = $('register-msg');
const logoutBtn = $('logout-btn');

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* 非 JSON 响应 */
  }
  return { ok: res.ok, status: res.status, data };
}

function setMsg(el, text, isError) {
  el.textContent = text ?? '';
  el.className = 'msg' + (text ? (isError ? ' error' : ' success') : '');
}

function showMe(username) {
  helloEl.textContent = `Hello, ${username}`;
  authView.hidden = true;
  meView.hidden = false;
}

function showAuth() {
  meView.hidden = true;
  authView.hidden = false;
  setMsg(loginMsg, '', false);
  setMsg(registerMsg, '', false);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fd = new FormData(loginForm);
  const username = fd.get('username');
  const password = fd.get('password');
  setMsg(loginMsg, '登录中…', false);
  const { ok, data } = await api('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (ok) showMe(username);
  else setMsg(loginMsg, (data && data.error) || '登录失败', true);
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fd = new FormData(registerForm);
  const username = fd.get('username');
  const password = fd.get('password');
  setMsg(registerMsg, '注册中…', false);
  const { ok, status, data } = await api('/api/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (ok) {
    setMsg(registerMsg, '注册成功，请登录', false);
    registerForm.reset();
    loginForm.username.value = username;
    loginForm.password.focus();
  } else if (status === 409) {
    setMsg(registerMsg, (data && data.error) || '用户名已存在', true);
  } else {
    setMsg(registerMsg, (data && data.error) || '注册失败', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' });
  showAuth();
});

// 页面加载时恢复会话状态
(async () => {
  const { ok, data } = await api('/api/me');
  if (ok && data && data.username) showMe(data.username);
  else showAuth();
})();
