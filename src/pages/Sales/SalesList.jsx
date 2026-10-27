import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import SaleForm from "./SaleForm";
import { getSales, createSale } from "../../services/sales";
import { getUser } from "../../services/auth";

const formatearFecha = (iso) =>
  iso ? new Date(iso + (iso.endsWith("Z") ? "" : "Z")).toLocaleString() : "";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Inventario solo consulta las ventas; registrar es de admin y vendedor
  const user = getUser();
  const puedeVender = ["admin", "vendedor"].includes(user?.role);

  const loadSales = async () => {
    try {
      const data = await getSales();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // La API espera { items: [{ product_id, quantity }] }.
  // El precio lo toma el servidor de la base de datos, no se envía.
  const handleCreate = async (form) => {
    try {
      setError("");
      await createSale({
        items: [
          {
            product_id: Number(form.product_id),
            quantity: Number(form.quantity),
          },
        ],
      });
      setModalOpen(false);
      loadSales();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 bg-beige min-h-screen">
      <h1 className="text-3xl font-bold text-morado mb-4">Ventas</h1>

      {puedeVender && (
        <button
          onClick={() => setModalOpen(true)}
          className="bg-rosa p-2 rounded mb-4"
        >
          + Registrar Venta
        </button>
      )}

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4">
          {error}
        </p>
      )}

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-morado text-white">
            <th className="p-2">Fecha</th>
            <th className="p-2">Producto</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio</th>
          </tr>
        </thead>

        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-slate-400">
                No hay ventas todavía
              </td>
            </tr>
          )}

          {sales.map((s) =>
            (s.items || []).map((item, i) => (
              <tr key={`${s.id}-${i}`} className="border-b">
                <td className="p-2">{formatearFecha(s.date)}</td>
                <td className="p-2">{item.product}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">${Number(item.price).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalOpen && puedeVender && (
        <Modal onClose={() => setModalOpen(false)}>
          <SaleForm onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  );
}
