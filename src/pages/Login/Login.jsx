import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/auth";
import logo from "../../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(username, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rosado to-morado p-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4"
      >
        <img src={logo} alt="Divina Essence" className="w-28 mx-auto" />
        <h1 className="text-xl font-bold text-center text-slate-800">Iniciar sesión</h1>

        <label className="text-sm text-slate-500">
          Usuario
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            className="block w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-violet-400"
          />
        </label>

        <label className="text-sm text-slate-500">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {cargando ? "Entrando..." : "Entrar"}
        </button>

        <Link
          to="/olvide-contrasena"
          className="text-sm text-center text-violet-500 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </div>
  );
}