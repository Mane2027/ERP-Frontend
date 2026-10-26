import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import UserForm from "./UserForm";
import { getUsers, createUser, updateUser, deleteUser } from "../../services/users";

const ETIQUETAS_ROL = {
  admin: "Administrador",
  inventario: "Inventario",
  vendedor: "Vendedor",
  user: "Usuario",
};

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const cerrarModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleCreate = async (form) => {
    if (saving) return;
    try {
      setSaving(true);
      setError("");
      await createUser(form);
      cerrarModal();
      loadUsers();
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
      await updateUser(editingUser.id, form);
      cerrarModal();
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      setError("");
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">Gestiona quién accede al sistema</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl px-5 py-2 text-sm font-medium shadow-sm"
        >
          + Crear usuario
        </button>
      </div>

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-violet-50 text-violet-700 text-left">
              <th className="p-3">Usuario</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  No hay usuarios todavía
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3 font-medium text-slate-800">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{ETIQUETAS_ROL[u.role] ?? u.role}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setModalOpen(true);
                      }}
                      className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal onClose={cerrarModal}>
          <UserForm
            initialData={editingUser || {}}
            onSubmit={editingUser ? handleEdit : handleCreate}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}