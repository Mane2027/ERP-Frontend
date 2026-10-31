import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import CustomerForm from "./CustomerForm";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customers";
import { getUser } from "../../services/auth";

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const esAdmin = getUser()?.role === "admin";

  const loadCustomers = async (q = search) => {
    try {
      const data = await getCustomers(q);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Espera un momento después de teclear para no llamar a la API en cada letra
  useEffect(() => {
    const t = setTimeout(() => loadCustomers(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const cerrarModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const handleCreate = async (form) => {
    if (saving) return;
    try {
      setSaving(true);
      setError("");
      await createCustomer(form);
      cerrarModal();
      loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    if (saving) return;
    try {
      setSaving(true);
      setError("");
      await updateCustomer(editingCustomer.id, form);
      cerrarModal();
      loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      setError("");
      await deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">Gestiona los clientes de tus facturas</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl px-5 py-2 text-sm font-medium shadow-sm"
        >
          + Crear cliente
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o documento..."
        className="w-full max-w-sm border border-slate-200 p-2 rounded-xl outline-none focus:border-violet-400 bg-white text-sm"
      />

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-violet-50 text-violet-700 text-left">
              <th className="p-3">Nombre</th>
              <th className="p-3">Documento</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  {search ? "Sin resultados" : "No hay clientes todavía"}
                </td>
              </tr>
            )}

            {customers.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-medium text-slate-800">{c.name}</td>
                <td className="p-3">{c.document || "—"}</td>
                <td className="p-3">{c.email || "—"}</td>
                <td className="p-3">{c.phone || "—"}</td>
                <td className="p-3">{c.address || "—"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCustomer(c);
                        setModalOpen(true);
                      }}
                      className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg"
                    >
                      Editar
                    </button>

                    {esAdmin && (
     <button
    onClick={() => handleDelete(c.id)}
    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg"
  >
    Eliminar
  </button>
)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal onClose={cerrarModal}>
          <CustomerForm
            initialData={editingCustomer || {}}
            onSubmit={editingCustomer ? handleEdit : handleCreate}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}
