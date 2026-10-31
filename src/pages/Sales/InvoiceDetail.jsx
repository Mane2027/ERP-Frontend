import { useEffect, useState } from "react";
import { getInvoice } from "../../services/sales";

// Pon aquí tu número de WhatsApp; si lo dejas vacío, sale la línea para escribirlo a mano
const WHATSAPP = "";

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
];

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const iso = (s) => (s ? new Date(s + (s.endsWith("Z") ? "" : "Z")) : null);
const fechaHora = (s) => (iso(s) ? iso(s).toLocaleString() : "");
const fechaCorta = (s) => (iso(s) ? iso(s).toLocaleDateString("es-CO") : "");
const numero = (n) => String(n ?? "").padStart(4, "0");
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
  const metodoLabel = METODOS_PAGO.find((m) => m.value === f.metodo_pago)?.label;

  // Abre una ventana solo con el comprobante para imprimirlo o guardarlo como PDF
  const imprimir = () => {
    const filas = f.detalles
      .map(
        (d) => `<tr>
          <td>${esc(d.sku || "—")}</td>
          <td>${esc(d.producto)}</td>
          <td class="r">${d.cantidad}</td>
          <td class="r">${money(d.precio_unitario)}</td>
          <td class="r">${money(d.subtotal)}</td>
        </tr>`
      )
      .join("");

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Factura ${numero(f.numero)}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#222;max-width:680px;margin:auto}
        h1{text-align:center;margin:0;letter-spacing:2px}
        h2{text-align:center;margin:4px 0 20px;font-weight:normal}
        h3{margin:20px 0 6px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left}
        th{background:#f3f0ff}
        .r{text-align:right}
        .tot{margin-top:14px;text-align:right}
        .tot p{margin:3px 0}
        .pie{text-align:center;margin-top:28px;font-size:14px}
        .anulada{text-align:center;color:#b91c1c;font-weight:bold;margin-bottom:8px}
      </style></head><body>
      <h1>DIVINA ESSENCE</h1>
      <h2>Comprobante de Venta</h2>
      ${f.estado === "anulada" ? `<p class="anulada">FACTURA ANULADA</p>` : ""}
      <p><strong>Factura N.º:</strong> ${numero(f.numero)}<br>
         <strong>Fecha:</strong> ${esc(fechaCorta(f.fecha))}</p>

      <h3>Datos del Cliente</h3>
      <p>Nombre: ${esc(c ? c.nombre : "Consumidor final")}<br>
         Teléfono: ${esc(c?.telefono || "")}</p>

      <table>
        <thead><tr><th>SKU</th><th>Producto</th><th class="r">Cantidad</th><th class="r">Valor Unitario</th><th class="r">Total</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>

      <div class="tot">
        <p>Subtotal: ${money(f.subtotal)}</p>
        ${conIva ? `<p>IVA: ${money(f.impuestos)}</p>` : ""}
        <p>Descuento: ${money(0)}</p>
        <p><strong>Total a Pagar: ${money(f.total)}</strong></p>
      </div>

      <p style="margin-top:20px"><strong>Método de Pago:</strong><br>
        ${METODOS_PAGO.map((m) => `${f.metodo_pago === m.value ? "☑" : "☐"} ${m.label}`).join(" &nbsp; ")}</p>

      <div class="pie">
        <p>¡Gracias por confiar en Divina Essence! 🌸</p>
        <p>Productos de cuidado personal para resaltar tu belleza natural.</p>
        <p>Instagram: @divinaessence<br>WhatsApp: ${WHATSAPP ? esc(WHATSAPP) : "__________________"}</p>
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
          Factura N.º {numero(f.numero)}
          {f.estado === "anulada" && (
            <span className="ml-2 px-2 py-1 rounded-lg text-xs bg-red-100 text-red-700">
              Anulada
            </span>
          )}
        </h2>
        <p className="text-slate-500">
          {fechaHora(f.fecha)} · Atendió: {f.usuario}
        </p>
      </div>

      <div className="bg-violet-50 rounded-xl p-3">
        <p className="font-medium text-slate-800">{c ? c.nombre : "Consumidor final"}</p>
        {c?.telefono && <p className="text-slate-500">Teléfono: {c.telefono}</p>}
      </div>

      {metodoLabel && (
        <p className="text-slate-500">Método de pago: {metodoLabel}</p>
      )}

      <table className="w-full">
        <thead>
          <tr className="text-left text-violet-700">
            <th className="py-1">SKU</th>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Valor unitario</th>
            <th className="py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {f.detalles.map((d, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-1 text-slate-500">{d.sku || "—"}</td>
              <td className="py-1">{d.producto}</td>
              <td className="py-1 text-right">{d.cantidad}</td>
              <td className="py-1 text-right">{money(d.precio_unitario)}</td>
              <td className="py-1 text-right">{money(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right">
        <p>Subtotal: {money(f.subtotal)}</p>
        {conIva && <p>IVA: {money(f.impuestos)}</p>}
        <p className="font-bold text-slate-800">Total a pagar: {money(f.total)}</p>
      </div>

      <button onClick={imprimir} className="bg-morado text-white p-2 rounded">
        Imprimir / guardar PDF
      </button>
    </div>
  );
}