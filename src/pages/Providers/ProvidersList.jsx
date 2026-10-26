import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import ProviderForm from "./ProviderForm";
import { getProviders, createProvider, updateProvider, deleteProvider } from "../../services/providers";

export default function ProvidersList() {
  const [providers, setProviders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  const loadProviders = async () => {
    const data = await getProviders();
    setProviders(data);
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleCreate = async (form) => {
    await createProvider(form);
    setModalOpen(false);
    loadProviders();
  };

  const handleEdit = async (form) => {
    await updateProvider(editingProvider.id, form);
    setEditingProvider(null);
    setModalOpen(false);
    loadProviders();
  };

  const handleDelete = async (id) => {
    await deleteProvider(id);
    loadProviders();
  };

  return (
    <div className="p-6 bg-beige min-h-screen">
      <h1 className="text-3xl font-bold text-morado mb-4">Proveedores</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-rosa p-2 rounded mb-4"
      >
        + Crear Proveedor
      </button>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-morado text-white">
            <th className="p-2">Nombre</th>
            <th className="p-2">Contacto</th>
            <th className="p-2">Teléfono</th>
            <th className="p-2">Correo</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {providers.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.contact_name}</td>
              <td className="p-2">{p.phone}</td>
              <td className="p-2">{p.email}</td>
              <td className="p-2">{p.address}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditingProvider(p);
                    setModalOpen(true);
                  }}
                  className="bg-morado text-white px-2 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setEditingProvider(null); }}>
          <ProviderForm
            initialData={editingProvider || {}}
            onSubmit={editingProvider ? handleEdit : handleCreate}
          />
        </Modal>
      )}
    </div>
  );
}