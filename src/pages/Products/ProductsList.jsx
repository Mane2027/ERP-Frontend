import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import ProductForm from "./ProductForm";
import { getUser } from "../../services/auth";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/products";

// Convierte lo que escribe el formulario al formato que exige la API
const armarProducto = (form) => ({
  sku: form.sku.trim(),
  name: form.name.trim(),
  brand: form.brand.trim(),
  description: form.description?.trim() || null,
  category: form.category?.trim() || "otro",
  price: Number(form.price),
  cost: form.cost === "" || form.cost == null ? null : Number(form.cost),
  stock: parseInt(form.stock, 10) || 0,
  min_stock: parseInt(form.min_stock, 10) || 0,
  expiration_date: form.expiration_date || null,
  is_active: form.is_active ?? true,
});

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");

  // El vendedor solo consulta: crear, editar y eliminar son de admin e inventario
  const user = getUser();
  const puedeEditar = ["admin", "inventario"].includes(user?.role);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const cerrarModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleCreate = async (form) => {
    try {
      setError("");
      await createProduct(armarProducto(form));
      cerrarModal();
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (form) => {
    try {
      setError("");
      await updateProduct(editingProduct.id, armarProducto(form));
      cerrarModal();
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      setError("");
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-sm text-slate-500">Gestiona tu catálogo</p>
        </div>

        {puedeEditar && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl px-5 py-2 text-sm font-medium shadow-sm"
          >
            + Crear producto
          </button>
        )}
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
              <th className="p-3">SKU</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              {puedeEditar && <th className="p-3">Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={puedeEditar ? 7 : 6}
                  className="p-6 text-center text-slate-400"
                >
                  No hay productos todavía
                </td>
              </tr>
            )}

            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 text-slate-500">{p.sku}</td>
                <td className="p-3 font-medium text-slate-800">{p.name}</td>
                <td className="p-3">{p.brand}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">${p.price}</td>
                <td className="p-3">{p.stock}</td>
                {puedeEditar && (
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setModalOpen(true);
                        }}
                        className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && puedeEditar && (
        <Modal onClose={cerrarModal}>
          <ProductForm
            initialData={editingProduct || {}}
            onSubmit={editingProduct ? handleEdit : handleCreate}
          />
        </Modal>
      )}
    </div>
  );
}
