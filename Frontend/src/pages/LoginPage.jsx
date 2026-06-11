import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.data.token, res.data.usuario);
      navigate('/album');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#041E42] via-[#C8102E] to-[#009739]">

    {/* Fondo decorativo */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:30px_30px]" />
    </div>

    <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full blur-3xl opacity-20" />
    <div className="absolute bottom-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10" />

    <div className="relative w-full max-w-md">

      {/* Tarjeta */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.35)] border-[6px] border-yellow-400">

        {/* Brillo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
              animate-shine
              absolute
              top-0
              left-0
              h-[200%]
              w-20
              bg-white/30
              blur-md
            "
          />
        </div>

        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#C8102E] via-[#041E42] to-[#009739] px-8 py-8 text-center">

          <div className="text-6xl mb-3">
            🏆⚽
          </div>

          <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm text-white font-semibold mb-3">
            FIFA WORLD CUP 26
          </span>

          <h1 className="text-3xl font-extrabold text-white">
            Álbum Virtual
          </h1>

          <p className="text-white/90 mt-2">
            Inicia sesión para continuar tu colección
          </p>

        </div>

        {/* Formulario */}
        <div className="p-8">

          {error && (
            <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Correo electrónico
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="ejemplo@correo.com"
                className="
                  w-full
                  rounded-2xl
                  border-2
                  border-gray-200
                  px-5
                  py-4
                  outline-none
                  transition
                  focus:border-[#041E42]
                  focus:ring-4
                  focus:ring-blue-200
                "
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Contraseña
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="••••••••"
                className="
                  w-full
                  rounded-2xl
                  border-2
                  border-gray-200
                  px-5
                  py-4
                  outline-none
                  transition
                  focus:border-[#009739]
                  focus:ring-4
                  focus:ring-green-200
                "
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-2xl
                py-4
                font-bold
                text-lg
                text-white
                bg-gradient-to-r
                from-[#C8102E]
                via-[#041E42]
                to-[#009739]
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
                disabled:opacity-60
                disabled:hover:translate-y-0
              "
            >
              {loading
                ? "Ingresando..."
                : "⚽ Entrar al Álbum"}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center">

            <div className="flex justify-center gap-4 text-2xl mb-4">
              ⚽ 🏟️ 🌎 🏆
            </div>

            <p className="text-gray-600">
              ¿Aún no tienes cuenta?
            </p>

            <Link
              to="/register"
              className="
                mt-2
                inline-block
                font-bold
                text-[#041E42]
                transition
                hover:text-[#C8102E]
              "
            >
              Crear mi colección →
            </Link>

          </div>

        </div>
      </div>

      {/* Texto inferior */}
      <p className="mt-6 text-center text-sm text-white/80">
        Colecciona, intercambia y completa tu álbum del Mundial 2026.
      </p>

    </div>
  </div>
  );
}
