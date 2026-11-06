import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      {/* Fondo oscuro que cierra el menú al tocarlo (solo en celular) */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <div className="flex-1 min-w-0 md:ml-64">
        {/* Barra superior con el botón del menú (solo en celular) */}
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-3 shadow-sm">
          <button
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="p-1 rounded-lg text-purple-900"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-purple-900">Divina Essence</span>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}