import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import logo from "../../assets/logo.png";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiar = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      });
      navigate("/login", { replace: true });
    } catch {
      setError("El enlace es inválido o expiró. Solicita uno nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rosado to-morado p-4">
      <form
        onSubmit={cambiar}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4"
      >
        <img src={logo} alt="Divina Essence" className="w-28 mx-auto" />
        <h1 className="text-xl font-bold text-center text-slate-800">Nueva contraseña</h1>

        {!token ? (
          <p className="text-sm text-center text-slate-500">
            Enlace inválido.{" "}
            <Link to="/olvide-contrasena" className="text-violet-500 hover:underline">
              Solicitar uno nuevo
            </Link>
          </p>
        ) : (
          <>
            <label className="text-sm text-slate-500">
              Nueva contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
                autoFocus
                required
                className="block w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-violet-400"
              />
            </label>

            <label className="text-sm text-slate-500">
              Repite la contraseña
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                className="block w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-violet-400"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl py-2 font-medium disabled:opacity-60"
            >
              {cargando ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}