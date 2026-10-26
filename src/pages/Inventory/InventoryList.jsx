import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import InventoryForm from "./InventoryForm";
import { getProducts } from "../../services/products";
import {
  getInventorySummary,
  getKardex,
  addStock,
  removeStock,
} from "../../services/inventory";

const formatearFecha = (iso) =>
  iso ? new Date(iso + (iso.endsWith("Z") ? "" : "Z")).toLocaleString() : "";

function estadoDe(p) {
  if (p.stock === 0) return { texto: "Agotado", clase: "bg-red-100 text-red-700" };
  if (p.stock <= p.min_stock)
    return { texto: "Stock bajo", clase: "bg-amber-100 text-amber-700" };
  return { texto: "Disponible", clase: "bg-green-100 text-green-700" };
}

export default function InventoryList() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // modal: { tipo: "entrada" | "salida" | "kardex", producto, kardex? }
  const [modal, setModal] = useState(null);

  const cargar = async () => {
    try {
      setError("");
      const [prods, resumen] = await Promise.all([
        getProducts(),
        getInventorySummary(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setSummary(resumen);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirMovimiento = (tipo, producto) => setModal({ tipo, producto });

  const abrirKardex = async (producto) => {
    try {
      setError("");
      const data = await getKardex(producto.id);
      setModal({ tipo: "kardex", producto, kardex: data });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMovimiento = async (cantidad) => {
    try {
      setError("");
      const { tipo, producto } = modal;
      if (tipo === "entrada") await addStock(producto.id, cantidad);
      else await removeStock(producto.id, cantidad);
      setModal(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const tarjetas = summary
    ? [
        ["Productos", summary.total_productos],
        ["Unidades en stock", summary.unidades_en_stock],
        ["Valor del inventario", `$${Number(summary.valor_inventario).toLocaleString()}`],
        ["Stock bajo", summary.stock_bajo],
        ["Agotados", summary.agotados],
      ]
    : [];

  return (
    <div className="p-6 bg-beige min-h-screen">
      <h1 className="text-3xl font-bold text-morado mb-4">Inventario</h1>

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4">
          {error}
        </p>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {tarjetas.map(([titulo, valor]) => (
            <div key={titulo} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-slate-500">{titulo}</p>
              <p className="text-xl font-bold text-slate-800">{valor}</p>
            </div>
          ))}
        </div>
      )}

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-morado text-white">
            <th className="p-2">Producto</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Mínimo</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-400">
                No hay productos todavía
              </td>
            </tr>
          )}

          {products.map((p) => {
            const estado = estadoDe(p);
            return (
              <tr key={p.id} className="border-b">
                <td className="p-2">
                  <span className="font-medium">{p.name}</span>
                  <span className="block text-xs text-slate-400">{p.sku}</span>
                </td>
                <td className="p-2 text-center">{p.stock}</td>
                <td className="p-2 text-center">{p.min_stock}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${estado.clase}`}>
                    {estado.texto}
                  </span>
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => abrirMovimiento("entrada", p)}
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    Entrada
                  </button>
                  <button
                    onClick={() => abrirMovimiento("salida", p)}
                    className="bg-rosa px-2 rounded"
                  >
                    Salida
                  </button>
                  <button
                    onClick={() => abrirKardex(p)}
                    className="bg-morado text-white px-2 rounded"
                  >
                    Kardex
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modal && modal.tipo !== "kardex" && (
        <Modal onClose={() => setModal(null)}>
          <InventoryForm
            tipo={modal.tipo}
            producto={modal.producto}
            onSubmit={handleMovimiento}
          />
        </Modal>
      )}

      {modal && modal.tipo === "kardex" && (
        <Modal onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              Kardex · {modal.kardex.producto}
            </h2>
            <p className="text-sm text-slate-500">
              {modal.kardex.total_movimientos} movimientos · saldo final:{" "}
              {modal.kardex.saldo_final}
            </p>

            <div className="max-h-80 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-1">Fecha</th>
                    <th className="py-1">Tipo</th>
                    <th className="py-1">Cant.</th>
                    <th className="py-1">Antes</th>
                    <th className="py-1">Después</th>
                    <th className="py-1">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {modal.kardex.kardex.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        Sin movimientos
                      </td>
                    </tr>
                  )}
                  {modal.kardex.kardex.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{formatearFecha(m.fecha)}</td>
                      <td className="py-1">{m.tipo}</td>
                      <td className="py-1">{m.cantidad}</td>
                      <td className="py-1">{m.stock_anterior}</td>
                      <td className="py-1">{m.stock_nuevo}</td>
                      <td className="py-1">{m.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}