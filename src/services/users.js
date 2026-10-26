import { apiFetch } from "./http";
 
const JSON_HEADERS = { "Content-Type": "application/json" };
 
async function leer(res) {
  if (res.status === 204) return true;
 
  const body = await res.json().catch(() => null);
 
  if (!res.ok) {
    const detalle = Array.isArray(body?.detail)
      ? body.detail.map((d) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join("\n")
      : body?.detail;
    throw new Error(detalle || `Error ${res.status}`);
  }
  return body;
}
 
// GET /usuarios/  (solo admin) -> [{ id, username, email, role }]
export async function getUsers() {
  return leer(await apiFetch("/usuarios/"));
}
 
// POST /usuarios/registro  (solo admin)
// Cuerpo: { username (3-50), email, password (8-72), role: "admin" | "user" }
export async function createUser(data) {
  return leer(
    await apiFetch("/usuarios/registro", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        username: data.username?.trim(),
        email: data.email?.trim(),
        password: data.password,
        role: data.role || "user",
      }),
    })
  );
}
 
// PUT /usuarios/{id}  (solo admin)
// La API solo permite cambiar email, password y role (no el username).
// Si la contraseña viene vacía no se envía, para no cambiarla.
export async function updateUser(id, data) {
  const cuerpo = {};
  if (data.email) cuerpo.email = data.email.trim();
  if (data.password) cuerpo.password = data.password;
  if (data.role) cuerpo.role = data.role;
 
  return leer(
    await apiFetch(`/usuarios/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(cuerpo),
    })
  );
}
 
// DELETE /usuarios/{id}  (solo admin; no puedes eliminar tu propio usuario)
export async function deleteUser(id) {
  return leer(await apiFetch(`/usuarios/${id}`, { method: "DELETE" }));
}
 
