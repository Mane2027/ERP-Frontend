import { useState } from "react";

export default function CustomerForm({ initialData = {}, onSubmit, saving = false }) {
  const [form, setForm] = useState({
    name: initialData.name ?? "",
    document: initialData.document ?? "",
    email: initialData.email ?? "",
    phone: initialData.phone ?? "",
    address: initialData.address ?? "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // La API guarda los textos vacíos como NULL, así que se envía todo recortado
    onSubmit({
      name: form.name.trim(),
      document: form.document.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    });
  };

  const campo =
    "w-full mt-1 border border-slate-200 p-2 rounded-xl outline-none focus:border-violet-400";
  const etiqueta = "text-sm text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className={etiqueta}>
        Nombre *
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={150}
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        Documento (NIT o cédula)
        <input
          name="document"
          value={form.document}
          onChange={handleChange}
          maxLength={30}
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        Correo
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          maxLength={100}
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        Teléfono
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          maxLength={50}
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        Dirección
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          maxLength={200}
          className={campo}
        />
      </label>

      <button
        disabled={saving}
        className="mt-2 text-white p-2 rounded-xl bg-linear-to-r from-pink-500 to-violet-500 disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
