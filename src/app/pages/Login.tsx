import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useConfiguredLoginBackground } from '../lib/login-background';
import logo from '../../assets/logo_admin.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const loginBackgroundUrl = useConfiguredLoginBackground();

  const hasCustomBackground = Boolean(loginBackgroundUrl);
  const backgroundStyle = loginBackgroundUrl
    ? {
        backgroundImage: `url(${loginBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales invalidas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (nextEmail: string) => {
    setEmail(nextEmail);
    setPassword('demo');
    setError('');
    setLoading(true);

    try {
      await login(nextEmail, 'demo');
      navigate('/dashboard');
    } catch {
      setError('Error al iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  const quickAccesses = [
    ['superadmin@brandup.com', 'Super Admin', 'Administracion global'],
    ['admin@isp1.com', 'ISP Admin', 'FibraNet Mexico'],
    ['cobranza@isp1.com', 'Cobranza', 'Gestion de pagos'],
    ['soporte@isp1.com', 'Soporte', 'Atencion al cliente'],
    ['tecnico@isp1.com', 'Tecnico', 'Ordenes de campo'],
    ['cliente@ejemplo.com', 'Cliente', 'Portal del cliente'],
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      {hasCustomBackground && (
        <div
          className="login-background-media absolute inset-0"
          style={backgroundStyle}
        />
      )}
      <div
        className={`absolute inset-0 ${
          hasCustomBackground
            ? 'bg-[linear-gradient(rgba(3,12,20,0.68),rgba(3,12,20,0.78))]'
            : 'bg-slate-950/20'
        }`}
      />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <button
          onClick={toggleTheme}
          className={`absolute right-4 top-4 rounded-full p-2 transition-colors ${
            hasCustomBackground
              ? 'text-white/75 hover:bg-white/10 hover:text-white'
              : 'text-gray-500 hover:bg-white/70 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-200'
          }`}
          aria-label="Cambiar tema"
          title="Cambiar tema"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-md">
          <div
            className={`rounded-3xl p-8 shadow-2xl ${
              hasCustomBackground
                ? 'border border-white/10 bg-slate-950/45 text-white backdrop-blur-sm'
                : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
            }`}
          >
            <div className="mb-8 text-center">
              <img
                src={logo}
                alt="BRANDUP Network"
                className="mx-auto h-16 w-auto object-contain md:h-20"
              />
              <p className={`mt-4 text-sm ${hasCustomBackground ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                Plataforma de gestion ISP multi-tenant
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`mb-1 block text-sm font-medium ${
                    hasCustomBackground ? 'text-white/85' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Correo electronico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    hasCustomBackground
                      ? 'border-white/10 bg-white/90 text-slate-900 placeholder:text-slate-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
                  }`}
                  placeholder="usuario@ejemplo.com"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={`absolute right-3 top-[38px] rounded-md p-1 transition-colors ${
                    hasCustomBackground
                      ? 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white'
                  }`}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`mb-1 block text-sm font-medium ${
                    hasCustomBackground ? 'text-white/85' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Contrasena
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 pr-12 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    hasCustomBackground
                      ? 'border-white/10 bg-white/90 text-slate-900 placeholder:text-slate-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    hasCustomBackground
                      ? 'bg-red-500/15 text-red-100'
                      : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#2397ed] text-base font-semibold hover:bg-[#1c86d7]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesion...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>

            <div
              className={`mt-8 border-t pt-8 ${
                hasCustomBackground ? 'border-white/10' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className={`mb-4 text-center text-sm ${hasCustomBackground ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'}`}>
                Accesos rapidos de demostracion:
              </p>
              <div className="space-y-2">
                {quickAccesses.map(([nextEmail, label, detail]) => (
                  <button
                    key={nextEmail}
                    onClick={() => quickLogin(nextEmail)}
                    className={`w-full rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                      hasCustomBackground
                        ? 'border-white/10 bg-white/6 text-white hover:bg-white/10'
                        : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                    disabled={loading}
                  >
                    <span className={`font-medium ${hasCustomBackground ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {label}
                    </span>
                    <span className={`ml-2 ${hasCustomBackground ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
                      · {detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
