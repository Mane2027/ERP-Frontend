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

export async function getProducts() {
  return leer(await apiFetch("/productos/"));
}

export async function createProduct(data) {
  return leer(
    await apiFetch("/productos/", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    })
  );
}

export async function updateProduct(id, data) {
  return leer(
    await apiFetch(`/productos/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    })
  );
}

export async function deleteProduct(id) {
  return leer(await apiFetch(`/productos/${id}`, { method: "DELETE" }));
}
