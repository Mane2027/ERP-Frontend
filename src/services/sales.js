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

// GET /ventas/  (admin, vendedor, inventario)
// -> [{ id, date, total, user, invoice_number, status, items: [...] }]
export async function getSales() {
  return leer(await apiFetch("/ventas/"));
}

// GET /facturas/{id}  (admin, vendedor, inventario)
export async function getInvoice(id) {
  return leer(await apiFetch(`/facturas/${id}`));
}

// POST /ventas/  (admin, vendedor): venta simple, sin número de factura
// Cuerpo: { items: [{ product_id, quantity }] }
export async function createSale(data) {
  return leer(
    await apiFetch("/ventas/", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    })
  );
}

// POST /facturas/  (admin, vendedor)
// Cuerpo: { items: [{ product_id, quantity }], customer_id? }
// Sin customer_id = consumidor final
export async function createInvoice(data) {
  return leer(
    await apiFetch("/facturas/", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        items: data.items,
        customer_id: data.customer_id ? Number(data.customer_id) : null,
        payment_method: data.payment_method || null,

      }),
    })
  );
}

// POST /facturas/{id}/anular  (solo admin): devuelve el stock
export async function anularFactura(id) {
  return leer(await apiFetch(`/facturas/${id}/anular`, { method: "POST" }));

}
  