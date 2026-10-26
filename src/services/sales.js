import { apiFetch } from "./http";

export async function getSales() {
  const res = await apiFetch(`/ventas`);
  return res.json();
}

export async function createSale(data) {
  const res = await apiFetch(`/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSale(id) {
  const res = await apiFetch(`/ventas/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
