import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import logo from "../../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch {
      /* se muestra el mismo mensaje */
    }
    setMensaje("Si el correo existe, recibirás un enlace para restablecer tu contraseña.");
    setCargando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rosado to-morado p-4">
      <form
        onSubmit={enviar}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4"
      >
        <img src={logo} alt="Divina Essence" className="w-28 mx-auto" />
        <h1 className="text-xl font-bold text-center text-slate-800">Recuperar contraseña</h1>
        <p className="text-sm text-slate-500 text-center">
          Escribe el correo de tu cuenta y te enviaremos un enlace.
        </p>

        <label className="text-sm text-slate-500">
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
            className="block w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-violet-400"
          />
        </label>

        {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl py-2 font-medium disabled:opacity-60"
        >
          {cargando ? "Enviando..." : "Enviar enlace"}
        </button>

        <Link to="/login" className="text-sm text-center text-violet-500 hover:underline">
          Volver al inicio de sesión
        </Link>
      </form>
    </div>
  );
}