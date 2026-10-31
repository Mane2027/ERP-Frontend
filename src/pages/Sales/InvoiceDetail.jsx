import { useEffect, useState } from "react";
import { getInvoice } from "../../services/sales";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const fecha = (iso) =>
  iso ? new Date(iso + (iso.endsWith("Z") ? "" : "Z")).toLocaleString() : "";
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export default function InvoiceDetail({ id }) {
  const [f, setF] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInvoice(id).then(setF).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!f) return <p className="text-slate-400">Cargando factura...</p>;

  const conIva = Number(f.impuestos) > 0;
  const c = f.cliente;

  // Abre una ventana solo con la factura para imprimirla (o guardarla como PDF)
  const imprimir = () => {
    const filas = f.detalles
      .map(
        (d) => `<tr>
          <td>${esc(d.producto)}</td>
          <td style="text-align:right">${d.cantidad}</td>
          <td style="text-align:right">${money(d.precio_unitario)}</td>
          ${conIva ? `<td style="text-align:right">${d.iva_porcentaje}%</td>` : ""}
          <td style="text-align:right">${money(d.subtotal)}</td>
        </tr>`
      )
      .join("");

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Factura ${esc(f.numero)}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#222}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left}
        th{background:#f3f0ff}
        .total{text-align:right;margin-top:12px}
      </style></head><body>
      <h2>Divina Essence</h2>
      <h3>Factura N.º ${esc(f.numero)}${f.estado === "anulada" ? " (ANULADA)" : ""}</h3>
      <p>Fecha: ${esc(fecha(f.fecha))}<br>Atendió: ${esc(f.usuario)}</p>
      <p><strong>Cliente:</strong> ${esc(c ? c.nombre : "Consumidor final")}
        ${c?.documento ? `<br>Documento: ${esc(c.documento)}` : ""}
        ${c?.telefono ? `<br>Teléfono: ${esc(c.telefono)}` : ""}
        ${c?.direccion ? `<br>Dirección: ${esc(c.direccion)}` : ""}</p>
      <table><thead><tr>
        <th>Producto</th><th>Cant.</th><th>Precio</th>${conIva ? "<th>IVA</th>" : ""}<th>Subtotal</th>
      </tr></thead><tbody>${filas}</tbody></table>
      <div class="total">
        <p>Subtotal: ${money(f.subtotal)}</p>
        ${conIva ? `<p>IVA: ${money(f.impuestos)}</p>` : ""}
        <p><strong>Total: ${money(f.total)}</strong></p>
      </div>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Factura N.º {f.numero}
          {f.estado === "anulada" && (
            <span className="ml-2 px-2 py-1 rounded-lg text-xs bg-red-100 text-red-700">
              Anulada
            </span>
          )}
        </h2>
        <p className="text-slate-500">
          {fecha(f.fecha)} · Atendió: {f.usuario}
        </p>
      </div>

      <div className="bg-violet-50 rounded-xl p-3">
        <p className="font-medium text-slate-800">{c ? c.nombre : "Consumidor final"}</p>
        {c?.documento && <p className="text-slate-500">Documento: {c.documento}</p>}
        {c?.telefono && <p className="text-slate-500">Teléfono: {c.telefono}</p>}
        {c?.direccion && <p className="text-slate-500">Dirección: {c.direccion}</p>}
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left text-violet-700">
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Precio</th>
            {conIva && <th className="py-1 text-right">IVA</th>}
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {f.detalles.map((d, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-1">{d.producto}</td>
              <td className="py-1 text-right">{d.cantidad}</td>
              <td className="py-1 text-right">{money(d.precio_unitario)}</td>
              {conIva && <td className="py-1 text-right">{d.iva_porcentaje}%</td>}
              <td className="py-1 text-right">{money(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right">
        <p>Subtotal: {money(f.subtotal)}</p>
        {conIva && <p>IVA: {money(f.impuestos)}</p>}
        <p className="font-bold text-slate-800">Total: {money(f.total)}</p>
      </div>

      <button onClick={imprimir} className="bg-morado text-white p-2 rounded">
        Imprimir / guardar PDF
      </button>
    </div>
  );
}