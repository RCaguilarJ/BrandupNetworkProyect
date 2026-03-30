import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Activity, AlertTriangle, CheckCircle, Router, Radio, Antenna, Plus, Settings, List, ChevronLeft, ChevronRight, Edit, Trash2, RefreshCw } from 'lucide-react';
import { MOCK_NETWORK_DEVICES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { formatDateTime } from '../lib/utils';

export default function Monitoring() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar dispositivos según el usuario
  const devices = user?.role === 'super_admin'
    ? MOCK_NETWORK_DEVICES
    : MOCK_NETWORK_DEVICES.filter(d => d.companyId === user?.companyId);

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router':
        return <Router className="w-6 h-6" />;
      case 'switch':
        return <Activity className="w-6 h-6" />;
      case 'ap':
        return <Radio className="w-6 h-6" />;
      case 'tower':
        return <Antenna className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const upDevices = devices.filter(d => d.status === 'up').length;
  const warningDevices = devices.filter(d => d.status === 'warning').length;
  const downDevices = devices.filter(d => d.status === 'down').length;
  const avgUptime = devices.reduce((sum, d) => sum + (d.uptime || 0), 0) / devices.length;

  // Vista Mikrosystem - Tabla compacta
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        {/* Header oscuro */}
        <div className="bg-gray-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">Monitoreo de Red</h1>
          <div className="flex items-center gap-2">
            <button type="button" className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full" title="Actualizar" aria-label="Actualizar monitoreo">
              <span className="sr-only">Actualizar monitoreo</span>
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button type="button" className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full" title="Configuración">
              <span className="sr-only">Abrir configuracion de monitoreo</span>
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button type="button" className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full" title="Agregar" aria-label="Agregar dispositivo">
              <span className="sr-only">Agregar dispositivo</span>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Estadísticas compactas */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Operativos</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{upDevices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Alertas</p>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{warningDevices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Caídos</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{downDevices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Uptime Prom.</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{avgUptime.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de herramientas */}
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de registros */}
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Registros por página"
                  className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Vista */}
              <button type="button" className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600" title="Vista de lista">
                <span className="sr-only">Cambiar a vista de lista</span>
                <List className="w-4 h-4" />
              </button>

              {/* Botón Actualizar */}
              <Button 
                size="sm" 
                className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Actualizar
              </Button>

              {/* Búsqueda */}
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar dispositivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-7 w-48 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabla compacta */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-10">
                      ESTADO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      DISPOSITIVO ▼
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      TIPO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      IP
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-24">
                      UPTIME
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-24">
                      PING (ms)
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-40">
                      ÚLTIMO CHEQUEO
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-24">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((device) => (
                      <tr 
                        key={device.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-center">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-white font-medium">{device.name}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{device.type}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{device.ip}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 text-center">
                          <span className={`font-semibold ${
                            (device.uptime || 0) >= 99 ? 'text-green-600 dark:text-green-400' :
                            (device.uptime || 0) >= 95 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {device.uptime?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 text-center">
                          <span className="text-gray-700 dark:text-gray-300">{'N/A'}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">{formatDateTime(device.lastCheck)}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Editar dispositivo" aria-label="Editar dispositivo">
                              <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Eliminar dispositivo" aria-label="Eliminar dispositivo">
                              <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        Ningún dispositivo disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div>
                Mostrando de 1 al {Math.min(pageSize, filteredDevices.length)} de un total de {filteredDevices.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-medium ${
                    currentPage === 1
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  1
                </button>

                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setCurrentPage(p => p + 1)}
                  title="Página siguiente"
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista WispHub original
  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="pt-4 lg:pt-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Red</h1>
        <p className="text-gray-600 mt-1">Estado en tiempo real de dispositivos de red</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Operativos</p>
                <p className="text-2xl font-bold text-green-600">{upDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Con Alertas</p>
                <p className="text-2xl font-bold text-yellow-600">{warningDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Caídos</p>
                <p className="text-2xl font-bold text-red-600">{downDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Uptime Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{avgUptime.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de dispositivos */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dispositivos Monitoreados</CardTitle>
            <Button variant="outline" size="sm">
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {devices.map((device) => (
              <div 
                key={device.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icono del dispositivo */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      device.status === 'up' ? 'bg-green-50 text-green-600' :
                      device.status === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {getDeviceIcon(device.type)}
                    </div>

                    {/* Información del dispositivo */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{device.name}</h3>
                        <Badge variant={
                          device.status === 'up' ? 'success' :
                          device.status === 'warning' ? 'warning' :
                          'error'
                        }>
                          {device.status === 'up' ? 'Operativo' : 
                           device.status === 'warning' ? 'Alerta' : 
                           'Caído'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>IP: <span className="text-gray-900">{device.ip}</span></span>
                        {device.location && (
                          <span>Ubicación: <span className="text-gray-900">{device.location}</span></span>
                        )}
                        <span>Tipo: <span className="text-gray-900 capitalize">{device.type}</span></span>
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
                        <span className="text-lg font-bold text-gray-900">{device.uptime}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Uptime</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="ml-4">
                    Ver Detalles
                  </Button>
                </div>

                {/* Última verificación */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Última verificación: {formatDateTime(device.lastCheck)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfica de rendimiento (simulada) */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de la Red (Últimas 24 horas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = Math.random() * 80 + 20;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{i}h</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Tráfico (Mbps)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
