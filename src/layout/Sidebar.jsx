import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout, getUser } from "../services/auth";
import { puedeVer } from "../config/permisos";
import {
  Home, Package, Tags, ArrowDownToLine,
  ArrowUpFromLine, Truck, Users, BarChart3, LogOut, Contact,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/categories", label: "Categorías", icon: Tags },
  { to: "/purchases", label: "Entradas", icon: ArrowDownToLine },
  { to: "/sales", label: "Salidas", icon: ArrowUpFromLine },
  { to: "/customers", label: "Clientes", icon: Contact },
  { to: "/providers", label: "Proveedores", icon: Truck },
  { to: "/users", label: "Usuarios", icon: Users },
  { to: "/reports", label: "Reportes", icon: BarChart3 },
];

const ROLES = {
  admin: "Administrador",
  inventario: "Inventario",
  vendedor: "Vendedor",
  user: "Usuario",
};

export default function Sidebar({ abierto = false, onCerrar = () => {} }) {
  const navigate = useNavigate();
  const user = getUser();

  const salir = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Solo los enlaces que el rol del usuario puede abrir
  const linksVisibles = links.filter((l) => puedeVer(user?.role, l.to));
  const puedeIrAUsuarios = puedeVer(user?.role, "/users");

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto flex flex-col gap-6 p-4 text-purple-900 bg-linear-to-b from-rosado to-morado shadow-lg transition-transform duration-200 md:translate-x-0 ${
        abierto ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <img
        src={logo}
        alt="Divina Essence"
        width="96"
        height="96"
        className="w-24 h-24 rounded-xl bg-white object-contain p-1 shadow-sm"
      />

      <nav className="flex flex-col gap-2">
        {linksVisibles.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCerrar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-linear-to-r from-pink-400 to-violet-400 text-white shadow-md"
                  : "hover:bg-white/50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {user && (
          <button
            onClick={() => {
              if (puedeIrAUsuarios) navigate("/users");
              onCerrar();
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-white/50 text-left transition ${
              puedeIrAUsuarios ? "hover:bg-white/70" : "cursor-default"
            }`}
          >
            <span
              translate="no"
              className="w-9 h-9 shrink-0 rounded-full bg-linear-to-r from-pink-500 to-violet-500 text-white flex items-center justify-center font-semibold uppercase"
            >
              {user.username.charAt(0)}
            </span>
            <span className="min-w-0">
              <span translate="no" className="block font-medium truncate">
                {user.username}
              </span>
              <span className="block text-xs text-purple-700">
                {ROLES[user.role] ?? user.role}
              </span>
            </span>
          </button>
        )}

        <button
          onClick={salir}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/50 transition"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
