import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import PurchaseForm from "./PurchaseForm";
import { getPurchases, createPurchase, deletePurchase } from "../../services/purchases";
import { getProviders } from "../../services/providers"; // ajusta ruta y nombre
import { getProducts } from "../../services/products";   // ajusta ruta y nombre

export default function PurchasesList() {
  const [purchases, setPurchases] = useState([]);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  const loadPurchases = async () => {
    try {
      setPurchases(await getPurchases());
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadPurchases();

    // Listas para los <select> del formulario
    Promise.all([getProviders(), getProducts()])
      .then(([prov, prod]) => {
        setProviders(prov);
        setProducts(prod);
      })
      .catch((err) => alert(err.message));
  }, []);

  const handleCreate = async (form) => {
    if (guardando) return; // evita doble envío
    setGuardando(true);
    try {
      await createPurchase({
        provider_id: Number(form.provider_id),
        items: [
          {
            product_id: Number(form.product_id),
            quantity: Number(form.quantity),
            price: Number(form.price),
          },
        ],
      });
      setModalOpen(false);
      await loadPurchases();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id) => {
    if (eliminando) return; // evita doble clic
    if (!window.confirm("¿Eliminar esta compra? Se revertirá el stock.")) return;
    setEliminando(id);
    try {
      await deletePurchase(id);
      await loadPurchases();
    } catch (err) {
      alert(err.message); // muestra el detalle que manda el backend
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="p-6 bg-beige min-h-screen">
      <h1 className="text-3xl font-bold text-morado mb-4">Compras a Proveedores</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-rosa p-2 rounded mb-4"
      >
        + Registrar Compra
      </button>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-morado text-white">
            <th className="p-2">Proveedor</th>
            <th className="p-2">Producto</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {purchases.map((p) =>
            p.items.map((item, i) => (
              <tr key={`${p.id}-${i}`} className="border-b">
                <td className="p-2">{p.provider}</td>
                <td className="p-2">{item.product}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">${item.price}</td>
                <td className="p-2">
                  {i === 0 && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={eliminando === p.id}
                      className="bg-red-500 text-white px-2 rounded disabled:opacity-50"
                    >
                      {eliminando === p.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <PurchaseForm
            onSubmit={handleCreate}
            guardando={guardando}
            providers={providers}
            products={products}
          />
        </Modal>
      )}
    </div>
  );
}