import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import SaleForm from "./SaleForm";
import InvoiceDetail from "./InvoiceDetail";
import { getSales, createInvoice, anularFactura } from "../../services/sales";
import { getUser } from "../../services/auth";

const formatearFecha = (iso) =>
  iso ? new Date(iso + (iso.endsWith("Z") ? "" : "Z")).toLocaleString() : "";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [verId, setVerId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  // Inventario solo consulta; facturar es de admin y vendedor; anular, solo admin
  const user = getUser();
  const puedeVender = ["admin", "vendedor"].includes(user?.role);
  const esAdmin = user?.role === "admin";

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

  // La API espera { items: [{ product_id, quantity }], customer_id? }.
  // El precio lo toma el servidor de la base de datos, no se envía.
  const handleCreate = async (form) => {
    if (saving) return;
    try {
      setSaving(true);
      setError("");
      setOk("");
      const res = await createInvoice(form);
      setModalOpen(false);
      setOk(`Factura ${res.numero} emitida correctamente`);
      loadSales();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAnular = async (s) => {
    if (!confirm(`¿Anular la factura ${s.invoice_number}? Se devolverá el stock.`)) return;
    try {
      setError("");
      setOk("");
      await anularFactura(s.id);
      setOk(`Factura ${s.invoice_number} anulada y stock devuelto`);
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
          + Nueva factura
        </button>
      )}

      {ok && (
        <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3 mb-4">{ok}</p>
      )}

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-morado text-white">
              <th className="p-2">Factura</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Productos</th>
              <th className="p-2">Total</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No hay ventas todavía
                </td>
              </tr>
            )}

            {sales.map((s) => {
              const anulada = s.status === "anulada";
              return (
                <tr key={s.id} className={`border-b ${anulada ? "text-slate-400" : ""}`}>
                  <td className="p-2">{s.invoice_number ?? "—"}</td>
                  <td className="p-2">{formatearFecha(s.date)}</td>
                  <td className="p-2">
                    {(s.items || []).map((item, i) => (
                      <div key={i}>
                        {item.product} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className={`p-2 ${anulada ? "line-through" : ""}`}>
                    ${Number(s.total).toFixed(2)}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        anulada ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {anulada ? "Anulada" : "Emitida"}
                    </span>
                  </td>
                  <td className="p-2">
                    {/* Las ventas simples (sin número de factura) no tienen detalle de factura */}
                    <div className="flex gap-2">
                      {s.invoice_number != null && (
                        <button
                          onClick={() => setVerId(s.id)}
                          className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg"
                        >
                          Ver
                        </button>
                      )}
                      {esAdmin && !anulada && s.invoice_number != null && (
                        <button
                          onClick={() => handleAnular(s)}
                          className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg"
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && puedeVender && (
        <Modal onClose={() => setModalOpen(false)}>
          <SaleForm onSubmit={handleCreate} saving={saving} />
        </Modal>
      )}

      {verId && (
        <Modal onClose={() => setVerId(null)}>
          <InvoiceDetail id={verId} />
        </Modal>
      )}
    </div>
  );
}
