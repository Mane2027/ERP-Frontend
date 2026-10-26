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

// Normaliza cualquier respuesta del backend
function normalizarCompras(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.compras)) return res.compras;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export async function getPurchases() {
  const res = await leer(await apiFetch("/compras/"));
  return normalizarCompras(res);
}

export async function getPurchase(id) {
  return leer(await apiFetch(`/compras/${id}`));
}

export async function createPurchase(data) {
  return leer(
    await apiFetch("/compras/", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    })
  );
}

export async function deletePurchase(id) {
  return leer(
    await apiFetch(`/compras/${id}`, {
      method: "DELETE",
    })
  );
}