import { API_URL, getToken, logout } from "./auth";
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Token vencido o inválido: volver al login
  if (res.status === 401) {
    logout();
    window.location.href = "/login";
  }

  return res;
}