import { apiFetch } from "./http";
 
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
 
// Resumen: { total_productos, unidades_en_stock, valor_inventario, stock_bajo, agotados }
export async function getInventorySummary() {
  return leer(await apiFetch("/inventario/resumen"));
}
 
// Productos con stock <= stock mínimo
export async function getLowStock() {
  return leer(await apiFetch("/inventario/bajo"));
}
 
// Kardex de un producto: { producto, kardex: [...], total_movimientos, saldo_final }
export async function getKardex(productId) {
  return leer(await apiFetch(`/inventario/kardex/${productId}`));
}
 
// Movimientos de un producto (más recientes primero)
export async function getMovements(productId) {
  return leer(await apiFetch(`/inventario/historial/${productId}`));
}
 
// Entrada de stock. La cantidad va en la URL, no en el cuerpo.
// Roles permitidos: admin e inventario.
export async function addStock(productId, cantidad) {
  return leer(
    await apiFetch(`/inventario/entrada/${productId}?cantidad=${Number(cantidad)}`, {
      method: "POST",
    })
  );
}
 
// Salida manual de stock (ajuste). Roles permitidos: admin e inventario.
export async function removeStock(productId, cantidad) {
  return leer(
    await apiFetch(`/inventario/salida/${productId}?cantidad=${Number(cantidad)}`, {
      method: "POST",
    })
  );
}
 
