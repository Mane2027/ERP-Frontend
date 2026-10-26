import { useState } from "react";

export default function ProductForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    sku: initialData.sku ?? "",
    name: initialData.name ?? "",
    brand: initialData.brand ?? "",
    description: initialData.description ?? "",
    category: initialData.category ?? "otro",
    price: initialData.price ?? "",
    cost: initialData.cost ?? "",
    stock: initialData.stock ?? "",
    min_stock: initialData.min_stock ?? 5,
    expiration_date: initialData.expiration_date?.slice(0, 10) ?? "",
    is_active: initialData.is_active ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const campo = "w-full mt-1 border border-slate-200 p-2 rounded-xl outline-none focus:border-violet-400";
  const etiqueta = "text-sm text-slate-500";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid grid-cols-2 gap-3"
    >
      <label className={etiqueta}>
        SKU *
        <input name="sku" value={form.sku} onChange={handleChange} required maxLength={50} className={campo} />
      </label>

      <label className={etiqueta}>
        Nombre *
        <input name="name" value={form.name} onChange={handleChange} required maxLength={150} className={campo} />
      </label>

      <label className={etiqueta}>
        Marca *
        <input name="brand" value={form.brand} onChange={handleChange} required maxLength={100} className={campo} />
      </label>

      <label className={etiqueta}>
        Categoría
        <input name="category" value={form.category} onChange={handleChange} maxLength={30} className={campo} />
      </label>

      <label className={`${etiqueta} col-span-2`}>
        Descripción
        <input name="description" value={form.description} onChange={handleChange} className={campo} />
      </label>

      <label className={etiqueta}>
        Precio *
        <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange} required className={campo} />
      </label>

      <label className={etiqueta}>
        Costo
        <input type="number" step="0.01" min="0" name="cost" value={form.cost} onChange={handleChange} className={campo} />
      </label>

      <label className={etiqueta}>
        Stock
        <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} className={campo} />
      </label>

      <label className={etiqueta}>
        Stock mínimo
        <input type="number" min="0" name="min_stock" value={form.min_stock} onChange={handleChange} className={campo} />
      </label>

      <label className={etiqueta}>
        Vence
        <input type="date" name="expiration_date" value={form.expiration_date} onChange={handleChange} className={campo} />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-500 mt-6">
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        Activo
      </label>

      <button className="col-span-2 mt-2 text-white p-2 rounded-xl bg-linear-to-r from-pink-500 to-violet-500">
        Guardar
      </button>
    </form>
  );
}