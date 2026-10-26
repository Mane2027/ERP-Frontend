import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Tags, Package, AlertTriangle } from "lucide-react";
import { getProducts } from "../../services/products";

const dinero = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

export default function Categories() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Agrupa los productos por categoría
  const categorias = useMemo(() => {
    const mapa = {};
    for (const p of products) {
      const nombre = (p.category || "Sin categoría").trim();
      if (!mapa[nombre]) {
        mapa[nombre] = { nombre, productos: 0, stock: 0, valor: 0, bajos: 0 };
      }
      const c = mapa[nombre];
      c.productos += 1;
      c.stock += Number(p.stock) || 0;
      c.valor += (Number(p.price) || 0) * (Number(p.stock) || 0);
      if ((Number(p.stock) || 0) <= (Number(p.min_stock) || 0)) c.bajos += 1;
    }
    return Object.values(mapa).sort((a, b) => b.productos - a.productos);
  }, [products]);

  const total = products.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
          <p className="text-sm text-slate-500">
            Resumen de tu inventario por categoría
          </p>
        </div>

        <Link
          to="/products"
          className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl px-5 py-2 text-sm font-medium shadow-sm"
        >
          Ir a productos
        </Link>
      </div>

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}

      {cargando && <p className="text-slate-400">Cargando...</p>}

      {!cargando && categorias.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
          Aún no hay productos. Crea el primero y su categoría aparecerá aquí.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categorias.map((c) => {
          const porcentaje = total ? Math.round((c.productos / total) * 100) : 0;
          return (
            <div key={c.nombre} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Tags size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-800 truncate capitalize">
                    {c.nombre}
                  </h2>
                  <p className="text-xs text-slate-400">{porcentaje}% de tus productos</p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-pink-500 to-violet-500"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-400">
                    <Package size={12} /> Productos
                  </p>
                  <p className="text-lg font-bold text-slate-800">{c.productos}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Stock</p>
                  <p className="text-lg font-bold text-slate-800">{c.stock}</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-400">
                    <AlertTriangle size={12} /> Bajo
                  </p>
                  <p className={`text-lg font-bold ${c.bajos ? "text-pink-600" : "text-slate-800"}`}>
                    {c.bajos}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Valor del inventario:{" "}
                <span className="font-semibold text-violet-700">{dinero(c.valor)}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}