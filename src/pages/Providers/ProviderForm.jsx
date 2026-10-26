import { useState } from "react";

export default function ProviderForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    contact_name: initialData.contact_name || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    address: initialData.address || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-3"
    >
      <input
        name="name"
        placeholder="Nombre del proveedor"
        value={form.name}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="contact_name"
        placeholder="Persona de contacto"
        value={form.contact_name}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="phone"
        placeholder="Teléfono"
        value={form.phone}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="email"
        placeholder="Correo"
        value={form.email}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="address"
        placeholder="Dirección"
        value={form.address}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <button className="bg-morado text-white p-2 rounded">
        Guardar
      </button>
    </form>
  );
}