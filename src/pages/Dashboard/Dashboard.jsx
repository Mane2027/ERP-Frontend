import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { apiFetch } from "../../services/http";
import { getUser } from "../../services/auth";
import { puedeVer } from "../../config/permisos.js";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});
const COLORES = ["#8B5CF6", "#EC4899", "#A78BFA", "#F472B6", "#C4B5FD", "#FBCFE8"];

const PERIODOS = [
  { value: 1, label: "Este mes" },
  { value: 3, label: "Últimos 3 meses" },
  { value: 6, label: "Últimos 6 meses" },
  { value: 12, label: "Último año" },
];

// Los botones se muestran solo si el rol del usuario tiene permiso
// sobre esa ruta (config/permisos.js).
const ACCIONES = [
  { label: "Nuevo producto", to: "/products" },
  { label: "Registrar entrada", to: "/purchases" },
  { label: "Registrar salida", to: "/sales" },
  { label: "Ver reportes", to: "/reports" },
];

async function getResumen(meses) {
  const res = await apiFetch(`/dashboard/resumen?meses=${meses}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.detail || `Error ${res.status}`);
  return body;
}

function Tarjeta({ titulo, valor, alerta = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`text-2xl font-bold mt-1 ${alerta ? "text-pink-600" : "text-slate-800"}`}>
        {valor}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const user = getUser();
  const [meses, setMeses] = useState(6);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");
    getResumen(meses)
      .then((d) => { if (!cancelado) setData(d); })
      .catch((e) => { if (!cancelado) setError(e.message); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, [meses]);

  if (error && !data) {
    return <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>;
  }
  if (!data) {
    return <p className="text-slate-400">Cargando resumen...</p>;
  }

  const t = data.tarjetas;
  const maxTop = Math.max(1, ...data.top_productos.map((p) => p.unidades));
  const etiquetaPeriodo = meses === 1 ? "este mes" : `${meses} meses`;
  const accionesVisibles = ACCIONES.filter((a) => puedeVer(user?.role, a.to));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inicio</h1>
          <p className="text-sm text-slate-500">
            Hola, {user?.username}. Este es el resumen de tu negocio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {cargando && <span className="text-xs text-slate-400">Actualizando...</span>}
          <select
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value))}
            aria-label="Periodo del resumen"
            className="bg-white rounded-xl border border-violet-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
      )}

      {accionesVisibles.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {accionesVisibles.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-linear-to-r from-pink-400 to-violet-500 shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Tarjeta titulo="Productos activos" valor={t.productos} />
        <Tarjeta titulo="Unidades en stock" valor={t.unidades.toLocaleString("es-CO")} />
        <Tarjeta titulo="Valor del inventario (costo)" valor={COP.format(t.valor_inventario)} />
        <Tarjeta titulo="Ventas del mes" valor={COP.format(t.ventas_mes)} />
        <Tarjeta titulo="Compras del mes" valor={COP.format(t.compras_mes)} />
        <Tarjeta titulo="Stock bajo o agotado" valor={t.stock_bajo} alerta={t.stock_bajo > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-3">
            Ventas y compras ({etiquetaPeriodo})
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mensual}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => COP.format(v)} />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="compras" name="Compras" fill="#EC4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Stock por categoría</h2>
          {data.por_categoria.length === 0 ? (
            <p className="text-sm text-slate-400">Sin stock registrado</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.por_categoria} dataKey="unidades" nameKey="categoria"
                    innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {data.por_categoria.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} unidades`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-3">
          Productos con más salidas ({etiquetaPeriodo})
        </h2>
        {data.top_productos.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay ventas en este periodo</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.top_productos.map((p) => (
              <li key={p.producto}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">{p.producto}</span>
                  <span className="text-slate-500">{p.unidades} uds</span>
                </div>
                <div className="h-2 bg-violet-50 rounded-full mt-1">
                  <div className="h-2 rounded-full bg-linear-to-r from-pink-400 to-violet-500"
                    style={{ width: `${(p.unidades / maxTop) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
