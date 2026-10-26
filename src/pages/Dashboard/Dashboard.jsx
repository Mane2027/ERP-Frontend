import { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { DollarSign, Star, Truck, AlertTriangle, Download } from "lucide-react";
import StatCard from "../../components/StatCard";
import { apiFetch } from "../../services/http";
import { API_URL } from "../../services/auth";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);



const PALETA = ["#7c3aed", "#ec4899", "#a78bfa", "#f9a8d4", "#c4b5fd", "#d1d5db"];

const dinero = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

async function getJson(path) {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`Error ${res.status} al consultar ${path}`);
  return res.json();
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    Promise.all([getJson("/dashboard"), getJson("/dashboard/stats")])
      .then(([d, s]) => {
        setData(d);
        setStats(s);
      })
      .catch((err) => setError(err.message));
  }, []);

  const filtrar = async () => {
    if (!start || !end) return alert("Selecciona ambas fechas");
    try {
      setError("");
      setData(await getJson(`/dashboard/filtrado?start=${start}&end=${end}`));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!data || !stats) {
    return <p className="text-slate-500">{error || "Cargando dashboard..."}</p>;
  }

  const ventasMes = data.sales_per_month ?? [];
  const compras = data.purchases_by_provider ?? [];
  const topProductos = (data.top_products ?? []).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* ENCABEZADO + FILTROS */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Resumen general de tu inventario</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-slate-500">
            Fecha inicio
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="block mt-1 bg-white rounded-xl shadow-sm px-3 py-2 text-sm text-slate-700 outline-none"
            />
          </label>

          <label className="text-xs text-slate-500">
            Fecha fin
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="block mt-1 bg-white rounded-xl shadow-sm px-3 py-2 text-sm text-slate-700 outline-none"
            />
          </label>

          <button
            onClick={filtrar}
            className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl px-5 py-2 text-sm font-medium shadow-sm"
          >
            Filtrar
          </button>

          <button
            onClick={() => window.open(`${API_URL}/export/ventas`)}
            className="flex items-center gap-2 bg-white text-violet-600 rounded-xl px-4 py-2 text-sm font-medium shadow-sm"
          >
            <Download size={16} />
            Exportar ventas
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Promedio diario"
          value={dinero(stats.promedio_diario)}
          note="Ventas por día"
          icon={DollarSign}
        />
        <StatCard
          title="Producto más rentable"
          value={stats.producto_rentable?.name ?? "—"}
          note="Mayor ganancia"
          icon={Star}
          tone="pink"
        />
        <StatCard
          title="Proveedor top"
          value={stats.proveedor_top?.name ?? "—"}
          note="Mayor volumen de compras"
          icon={Truck}
        />
        <StatCard
          title="Stock bajo"
          value={data.low_stock?.length ?? 0}
          note="Productos por reponer"
          icon={AlertTriangle}
          tone="pink"
        />
      </div>

      {/* GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Ventas por mes</h2>
          <Bar
            data={{
              labels: ventasMes.map((s) => s.month),
              datasets: [
                {
                  label: "Ventas",
                  data: ventasMes.map((s) => s.total),
                  backgroundColor: "#8b5cf6",
                  borderRadius: 6,
                },
              ],
            }}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Productos más vendidos</h2>
          <ul className="flex flex-col gap-3">
            {topProductos.length === 0 && (
              <li className="text-sm text-slate-400">Sin datos</li>
            )}
            {topProductos.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <span className="flex-1 text-slate-700">{p.name}</span>
                <span className="px-2 py-1 rounded-lg bg-violet-100 text-violet-600 font-semibold">
                  {p.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Compras por proveedor</h2>
          <Doughnut
            data={{
              labels: compras.map((p) => p.provider),
              datasets: [
                {
                  data: compras.map((p) => p.total),
                  backgroundColor: PALETA,
                  borderWidth: 0,
                },
              ],
            }}
            options={{ cutout: "55%", plugins: { legend: { position: "bottom" } } }}
          />
        </div>
      </div>

      {/* TENDENCIA */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Tendencia de ventas</h2>
        <Line
          data={{
            labels: ventasMes.map((s) => s.month),
            datasets: [
              {
                label: "Tendencia",
                data: ventasMes.map((s) => s.total),
                borderColor: "#ec4899",
                backgroundColor: "rgba(236,72,153,0.15)",
                fill: true,
                tension: 0.4,
              },
            ],
          }}
          options={{ plugins: { legend: { display: false } } }}
        />
      </div>
    </div>
  );
}