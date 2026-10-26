import { useState } from "react";

// Formulario para registrar una entrada o una salida de stock de un producto.
// onSubmit recibe la cantidad (número entero > 0).
export default function InventoryForm({ tipo, producto, onSubmit }) {
  const [cantidad, setCantidad] = useState("1");
  const [error, setError] = useState("");

  const esSalida = tipo === "salida";

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(cantidad, 10);

    if (!Number.isInteger(n) || n <= 0)
      return setError("La cantidad debe ser un número mayor a 0");
    if (esSalida && n > producto.stock)
      return setError(`Stock insuficiente (disponible: ${producto.stock})`);

    setError("");
    onSubmit(n);
  };

  const nuevoStock =
    (producto.stock || 0) + (esSalida ? -1 : 1) * (parseInt(cantidad, 10) || 0);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-slate-800">
        {esSalida ? "Registrar salida" : "Registrar entrada"}
      </h2>

      <p className="text-sm text-slate-600">
        <strong>{producto.name}</strong> · Stock actual: {producto.stock}
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Cantidad
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="border p-2 rounded"
          autoFocus
        />
      </label>

      <p className="text-sm text-slate-500">Stock resultante: {nuevoStock}</p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="bg-morado text-white p-2 rounded">
        {esSalida ? "Registrar salida" : "Registrar entrada"}
      </button>
    </form>
  );
}