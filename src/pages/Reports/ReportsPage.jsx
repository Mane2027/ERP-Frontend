import { useState } from "react";
import { descargarReporte } from "../../services/reports";

const hoy = new Date().toISOString().slice(0, 10);
const haceUnMes = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

const REPORTES = [
  {
    id: "ventas",
    titulo: "Ventas por rango de fechas",
    descripcion: "Ventas del periodo con total vendido.",
    ruta: "/reportes/ventas/rango",
    nombre: "ventas",
    filtros: ["fechas"],
  },
  {
    id: "compras",
    titulo: "Compras por proveedor",
    descripcion: "Compras agrupadas por proveedor, con subtotales.",
    ruta: "/reportes/compras/proveedor",
    nombre: "compras_proveedor",
    filtros: ["fechas", "provider_id"],
  },
  {
    id: "stock",
    titulo: "Stock bajo o agotado",
    descripcion: "Productos en o por debajo del stock mínimo.",
    ruta: "/reportes/stock/bajo",
    nombre: "stock_bajo",
    filtros: [],
  },
  {
    id: "movimientos",
    titulo: "Movimientos de inventario",
    descripcion: "Entradas y salidas con stock anterior y nuevo.",
    ruta: "/reportes/movimientos",
    nombre: "movimientos",
    filtros: ["fechas", "product_id"],
  },
  {
    id: "vencimientos",
    titulo: "Próximos a vencer",
    descripcion: "Productos que vencen pronto y los ya vencidos.",
    ruta: "/reportes/vencimientos",
    nombre: "vencimientos",
    filtros: ["dias"],
  },
];

const campo =
  "w-full mt-1 border border-slate-200 p-2 rounded-xl outline-none focus:border-violet-400";
const etiqueta = "text-sm text-slate-500";

export default function ReportsPage() {
  const [filtros, setFiltros] = useState({
    fecha_inicio: haceUnMes,
    fecha_fin: hoy,
    provider_id: "",
    product_id: "",
    dias: 30,
  });
  const [cargando, setCargando] = useState(""); // "<id>-<formato>"
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const descargar = async (reporte, formato) => {
    const clave = `${reporte.id}-${formato}`;
    if (cargando) return;

    const params = {};
    if (reporte.filtros.includes("fechas")) {
      params.fecha_inicio = filtros.fecha_inicio;
      params.fecha_fin = filtros.fecha_fin;
    }
    if (reporte.filtros.includes("provider_id")) params.provider_id = filtros.provider_id;
    if (reporte.filtros.includes("product_id")) params.product_id = filtros.product_id;
    if (reporte.filtros.includes("dias")) params.dias = filtros.dias;

    try {
      setError("");
      setCargando(clave);
      await descargarReporte(reporte.ruta, params, formato, `${reporte.nombre}_${hoy}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-sm text-slate-500">Descarga en Excel o PDF</p>
      </div>

      {error && (
        <p className="whitespace-pre-line text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {REPORTES.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
            <div>
              <h2 className="font-semibold text-slate-800">{r.titulo}</h2>
              <p className="text-sm text-slate-500">{r.descripcion}</p>
            </div>

            {r.filtros.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {r.filtros.includes("fechas") && (
                  <>
                    <label className={etiqueta}>
                      Desde
                      <input type="date" name="fecha_inicio" value={filtros.fecha_inicio}
                        onChange={handleChange} className={campo} />
                    </label>
                    <label className={etiqueta}>
                      Hasta
                      <input type="date" name="fecha_fin" value={filtros.fecha_fin}
                        onChange={handleChange} className={campo} />
                    </label>
                  </>
                )}
                {r.filtros.includes("provider_id") && (
                  <label className={`${etiqueta} col-span-2`}>
                    ID del proveedor (opcional)
                    <input type="number" min="1" name="provider_id" value={filtros.provider_id}
                      onChange={handleChange} className={campo} placeholder="Todos" />
                  </label>
                )}
                {r.filtros.includes("product_id") && (
                  <label className={`${etiqueta} col-span-2`}>
                    ID del producto (opcional)
                    <input type="number" min="1" name="product_id" value={filtros.product_id}
                      onChange={handleChange} className={campo} placeholder="Todos" />
                  </label>
                )}
                {r.filtros.includes("dias") && (
                  <label className={`${etiqueta} col-span-2`}>
                    Días hacia adelante
                    <input type="number" min="1" max="730" name="dias" value={filtros.dias}
                      onChange={handleChange} className={campo} />
                  </label>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => descargar(r, "excel")}
                disabled={!!cargando}
                className="bg-violet-100 text-violet-700 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {cargando === `${r.id}-excel` ? "Generando..." : "Excel"}
              </button>
              <button
                onClick={() => descargar(r, "pdf")}
                disabled={!!cargando}
                className="bg-pink-100 text-pink-700 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {cargando === `${r.id}-pdf` ? "Generando..." : "PDF"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}