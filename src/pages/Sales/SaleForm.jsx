import { useEffect, useState } from "react";
import { getProducts } from "../../services/products";

export default function SaleForm({ onSubmit }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", quantity: "1" });
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) =>
        setProducts(Array.isArray(data) ? data.filter((p) => p.is_active) : [])
      )
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const producto = products.find((p) => String(p.id) === String(form.product_id));
  const cantidad = Number(form.quantity) || 0;
  const total = producto ? producto.price * cantidad : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!producto) return setError("Selecciona un producto");
    if (cantidad <= 0) return setError("La cantidad debe ser mayor a 0");
    if (cantidad > producto.stock)
      return setError(`Stock insuficiente (disponible: ${producto.stock})`);

    setError("");
    onSubmit({ product_id: form.product_id, quantity: form.quantity });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Producto
        <select
          name="product_id"
          value={form.product_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Selecciona un producto…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (stock: {p.stock})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cantidad
        <input
          type="number"
          min="1"
          name="quantity"
          placeholder="Cantidad"
          value={form.quantity}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </label>

      {producto && (
        <p className="text-sm text-slate-600">
          Precio unitario: <strong>${Number(producto.price).toFixed(2)}</strong>
          {" · "}
          Total: <strong>${total.toFixed(2)}</strong>
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="bg-morado text-white p-2 rounded">
        Registrar Venta
      </button>
    </form>
  );
}