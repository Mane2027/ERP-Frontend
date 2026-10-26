import { useState } from "react";

export default function PurchaseForm({
  initialData = {},
  onSubmit,
  guardando = false,
  providers = [],
  products = [],
}) {
  const [form, setForm] = useState({
    provider_id: initialData.provider_id || "",
    product_id: initialData.product_id || "",
    quantity: initialData.quantity || "",
    price: initialData.price || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (guardando) return;
        onSubmit(form);
      }}
      className="flex flex-col gap-3"
    >
      <select
        name="provider_id"
        value={form.provider_id}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      >
        <option value="">Selecciona un proveedor</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        name="product_id"
        value={form.product_id}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      >
        <option value="">Selecciona un producto</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <input
        type="number"
        name="quantity"
        placeholder="Cantidad"
        min="1"
        step="1"
        required
        value={form.quantity}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="price"
        placeholder="Precio unitario"
        min="0"
        step="any"
        required
        value={form.price}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        disabled={guardando}
        className="bg-morado text-white p-2 rounded disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Registrar Compra"}
      </button>
    </form>
  );
}