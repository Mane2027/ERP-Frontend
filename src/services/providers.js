import { apiFetch } from "./http";

export async function getProviders() {
  const res = await apiFetch(`/proveedores`);
  return res.json();
}

export async function createProvider(data) {
  const res = await apiFetch(`/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateProvider(id, data) {
  const res = await apiFetch(`/proveedores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProvider(id) {
  const res = await apiFetch(`/proveedores/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
