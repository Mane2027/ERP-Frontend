export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const LOGIN_PATH = "/usuarios/login";
const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();
export const logout = () => localStorage.removeItem(TOKEN_KEY);

export async function login(username, password) {
  const res = await fetch(`${API_URL}${LOGIN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Usuario o contrase\u00f1a incorrectos");

  const data = await res.json();

  // Acepta los nombres de campo m\u00e1s comunes
  const token = data.access_token ?? data.token;
  if (!token) throw new Error("La API no devolvi\u00f3 un token");

  localStorage.setItem(TOKEN_KEY, token);
  return data;
}

// Lee usuario y rol desde el token (JWT) guardado al iniciar sesi\u00f3n
export function getUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json);
    return {
      username: payload.sub ?? payload.username ?? "Usuario",
      role: payload.role ?? "",
    };
  } catch {
    return null;
  }
}