import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { apiFetch } from "../../services/http";
import { getUser } from "../../services/auth";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});
const COLORES = ["#8B5CF6", "#EC4899", "#A78BFA", "#F472B6", "#C4B5FD", "#FBCFE8"];

async function getResumen() {
  const res = await apiFetch("/dashboard/resumen");
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
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getResumen().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>;
  }
  if (!data) {
    return <p className="text-slate-400">Cargando resumen...</p>;
  }

  const t = data.tarjetas;
  const maxTop = Math.max(1, ...data.top_productos.map((p) => p.unidades));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Inicio</h1>
        <p className="text-sm text-slate-500">Hola, {user?.username}. Este es el resumen de tu negocio.</p>
      </div>

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
          <h2 className="font-semibold text-slate-800 mb-3">Ventas y compras (6 meses)</h2>
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
        <h2 className="font-semibold text-slate-800 mb-3">Productos con más salidas (30 días)</h2>
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
