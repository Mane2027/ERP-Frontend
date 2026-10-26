import { apiFetch } from "./http";

// Descarga un reporte (excel o pdf) con el token y lo guarda en el navegador
export async function descargarReporte(ruta, params, formato, nombreArchivo) {
  const query = new URLSearchParams();
  Object.entries({ ...params, formato }).forEach(([k, v]) => {
    if (v !== "" && v != null) query.append(k, v);
  });

  const res = await apiFetch(`${ruta}?${query.toString()}`);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detalle = Array.isArray(body?.detail)
      ? body.detail.map((d) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join("\n")
      : body?.detail;
    throw new Error(detalle || `Error ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombreArchivo}.${formato === "excel" ? "xlsx" : "pdf"}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}