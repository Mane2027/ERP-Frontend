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

function limpiar(data) {
  return {
    name: data.name?.trim(),
    document: data.document?.trim() ?? "",
    email: data.email?.trim() ?? "",
    phone: data.phone?.trim() ?? "",
    address: data.address?.trim() ?? "",
  };
}

// GET /clientes/?q=  (admin y vendedor)
export async function getCustomers(q = "") {
  const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return leer(await apiFetch(`/clientes/${query}`));
}

// POST /clientes/  (admin y vendedor)
export async function createCustomer(data) {
  return leer(
    await apiFetch("/clientes/", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(limpiar(data)),
    })
  );
}

// PUT /clientes/{id}  (admin y vendedor)
export async function updateCustomer(id, data) {
  return leer(
    await apiFetch(`/clientes/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(limpiar(data)),
    })
  );
}

// DELETE /clientes/{id}  (solo admin; da 409 si el cliente tiene facturas)
export async function deleteCustomer(id) {
  return leer(await apiFetch(`/clientes/${id}`, { method: "DELETE" }));
}
