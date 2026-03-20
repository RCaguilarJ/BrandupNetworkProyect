import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Building2, Loader2, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    setEmail(email);
    setPassword('demo');
    setError('');
    setLoading(true);

    try {
      await login(email, 'demo');
      navigate('/');
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BRANDUP NETWORK</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Plataforma de Gestión ISP Multi-Tenant</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Accesos rápidos de demostración */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">Accesos rápidos de demostración:</p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('superadmin@brandup.com')}
                className="w-full px-4 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="font-medium text-gray-900 dark:text-white">Super Admin</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">· Administración Global</span>
              </button>
              <button
                onClick={() => quickLogin('admin@isp1.com')}
                className="w-full px-4 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="font-medium text-gray-900 dark:text-white">ISP Admin</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">· FibraNet México</span>
              </button>
              <button
                onClick={() => quickLogin('cobranza@isp1.com')}
                className="w-full px-4 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="font-medium text-gray-900 dark:text-white">Cobranza</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">· Gestión de pagos</span>
              </button>
              <button
                onClick={() => quickLogin('soporte@isp1.com')}
                className="w-full px-4 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="font-medium text-gray-900 dark:text-white">Soporte</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">· Atención al cliente</span>
              </button>
              <button
                onClick={() => quickLogin('tecnico@isp1.com')}
                className="w-full px-4 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="font-medium text-gray-900 dark:text-white">Técnico</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">· Órdenes de campo</span>
              </button>
              <button
                onClick={() => quickLogin('cliente@ejemplo.com')}
                className="w-full px-4 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="font-medium text-gray-900 dark:text-white">Cliente</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">· Portal del cliente</span>
              </button>
            </div>
          </div>

          {/* Botón para cambiar el tema */}
          <div className="mt-8 text-center">
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}