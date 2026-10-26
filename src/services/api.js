import { API_URL } from "./auth";

export async function api(ruta, opciones = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}