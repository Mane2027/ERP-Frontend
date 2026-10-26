import { useState } from "react";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "inventario", label: "Inventario" },
  { value: "vendedor", label: "Vendedor" },
  { value: "user", label: "Usuario" },
];

export default function UserForm({ initialData = {}, onSubmit, saving = false }) {
  const editando = !!initialData.id;

  const [form, setForm] = useState({
    username: initialData.username ?? "",
    email: initialData.email ?? "",
    password: "",
    role: initialData.role ?? "user",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const datos = {
      email: form.email.trim(),
      role: form.role,
    };

    if (editando) {
      // al editar, la contraseña solo se envía si escribieron una nueva
      if (form.password) datos.password = form.password;
    } else {
      datos.username = form.username.trim();
      datos.password = form.password;
    }

    onSubmit(datos);
  };

  const campo =
    "w-full mt-1 border border-slate-200 p-2 rounded-xl outline-none focus:border-violet-400 disabled:bg-slate-100 disabled:text-slate-400";
  const etiqueta = "text-sm text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className={etiqueta}>
        Usuario *
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={50}
          disabled={editando}
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        Correo *
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        {editando ? "Nueva contraseña (opcional)" : "Contraseña *"}
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required={!editando}
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className={campo}
        />
      </label>

      <label className={etiqueta}>
        Rol *
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
          className={campo}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
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