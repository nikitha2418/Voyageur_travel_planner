// Auth client + token storage for the FastAPI/MySQL auth backend.
const TOKEN_KEY = "tp_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch (_) {
      /* ignore non-JSON error bodies */
    }
    throw new Error(detail);
  }
  return res.json();
}

const json = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const auth = {
  signup: (email, password) =>
    fetch("/api/auth/signup", json({ email, password })).then(handle),

  login: (email, password) =>
    fetch("/api/auth/login", json({ email, password })).then(handle),

  me: () =>
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(handle),
};
