import { useEffect, useState } from "react";
import { getProducts } from "../../services/products";
import { getCustomers } from "../../services/customers";

const filaVacia = () => ({ product_id: "", quantity: "1" });

export default function SaleForm({ onSubmit, saving = false }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(""); // "" = consumidor final
  const [rows, setRows] = useState([filaVacia()]);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) =>
        setProducts(Array.isArray(data) ? data.filter((p) => p.is_active) : [])
      )
      .catch((err) => setError(err.message));

    getCustomers()
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message));
  }, []);

  const cambiarFila = (i, campo, valor) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)));

  const agregarFila = () => setRows([...rows, filaVacia()]);

  const quitarFila = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const productoDe = (id) => products.find((p) => String(p.id) === String(id));

  const total = rows.reduce((suma, r) => {
    const p = productoDe(r.product_id);
    return suma + (p ? p.price * (Number(r.quantity) || 0) : 0);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;

    // Si un producto se repite en varias líneas, se suman sus cantidades
    const porProducto = {};
    for (const r of rows) {
      if (!r.product_id) return setError("Selecciona un producto en cada línea");
      const q = Number(r.quantity);
      if (!Number.isInteger(q) || q <= 0)
        return setError("La cantidad debe ser un número entero mayor a 0");
      porProducto[r.product_id] = (porProducto[r.product_id] || 0) + q;
    }

    for (const [pid, q] of Object.entries(porProducto)) {
      const p = productoDe(pid);
      if (p && q > p.stock)
        return setError(`Stock insuficiente de "${p.name}" (disponible: ${p.stock})`);
    }

    setError("");
    onSubmit({
      customer_id: customerId,
      items: Object.entries(porProducto).map(([pid, q]) => ({
        product_id: Number(pid),
        quantity: q,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Cliente
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Consumidor final</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.document ? ` (${c.document})` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm">Productos</span>

        {rows.map((r, i) => {
          const p = productoDe(r.product_id);
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex gap-2">
                <select
                  value={r.product_id}
                  onChange={(e) => cambiarFila(i, "product_id", e.target.value)}
                  className="border p-2 rounded flex-1 min-w-0"
                >
                  <option value="">Selecciona un producto…</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (stock: {prod.stock})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={r.quantity}
                  onChange={(e) => cambiarFila(i, "quantity", e.target.value)}
                  className="border p-2 rounded w-20"
                />

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => quitarFila(i)}
                    className="px-2 text-red-600"
                    aria-label="Quitar producto"
                  >
                    ✕
                  </button>
                )}
              </div>

              {p && (
                <span className="text-xs text-slate-500">
                  ${Number(p.price).toFixed(2)} c/u · $
                  {(p.price * (Number(r.quantity) || 0)).toFixed(2)}
                </span>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={agregarFila}
          className="self-start text-sm text-violet-700"
        >
          + Agregar producto
        </button>
      </div>

      <p className="text-sm text-slate-600">
        Total: <strong>${total.toFixed(2)}</strong>
      </p>

      {error && <p className="whitespace-pre-line text-sm text-red-600">{error}</p>}

      <button disabled={saving} className="bg-morado text-white p-2 rounded disabled:opacity-50">
        {saving ? "Emitiendo..." : "Emitir factura"}
      </button>
    </form>
  );
}
