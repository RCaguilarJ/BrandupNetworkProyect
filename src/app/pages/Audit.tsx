import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, Download, Filter, List, ChevronLeft, ChevronRight, Settings, Plus, Eye, Activity } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { formatDateTime } from '../lib/utils';

export default function Audit() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  // Filtrar logs según el usuario
  const logs = user?.role === 'super_admin'
    ? MOCK_AUDIT_LOGS
    : MOCK_AUDIT_LOGS.filter(log => log.companyId === user?.companyId);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getModuleBadge = (module: string) => {
    const colors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
      'Facturación': 'success',
      'Órdenes': 'info',
      'Clientes': 'warning',
      'Configuración': 'error',
    };
    return <Badge variant={colors[module] || 'info'}>{module}</Badge>;
  };

  const todayLogs = logs.filter(log => {
    const today = new Date().toISOString().split('T')[0];
    return log.timestamp.split('T')[0] === today;
  });

  // Vista Mikrosystem - Tabla compacta
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        {/* Header oscuro */}
        <div className="bg-gray-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">Auditoría del Sistema</h1>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Filter className="w-4 h-4 text-white" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Estadísticas compactas */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Acciones Hoy</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{todayLogs.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Usuarios Activos</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{new Set(logs.map(log => log.userId)).size}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Módulos</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{new Set(logs.map(log => log.module)).size}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Eventos</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{logs.length}</p>
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
                  className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Filtro de módulo */}
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos los módulos</option>
                <option value="Facturación">Facturación</option>
                <option value="Clientes">Clientes</option>
                <option value="Órdenes">Órdenes</option>
                <option value="Configuración">Configuración</option>
              </select>

              {/* Botón Exportar */}
              <Button 
                size="sm" 
                className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Exportar
              </Button>

              {/* Búsqueda */}
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar eventos..."
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
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-40">
                      FECHA/HORA ▼
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      USUARIO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-28">
                      MÓDULO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      ACCIÓN
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      IP
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-20">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.slice(0, pageSize).map((log) => (
                      <tr 
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-700 dark:text-gray-300">{formatDateTime(log.timestamp)}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-white font-medium">{log.userName}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <div>
                            <div className="text-gray-900 dark:text-white font-medium">{log.action}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">{log.details}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{log.ipAddress}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Ver detalle">
                            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron registros de auditoría
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div>
                Mostrando de 1 al {Math.min(pageSize, filteredLogs.length)} de un total de {filteredLogs.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
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
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setCurrentPage(p => p + 1)}
                >
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
        <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
        <p className="text-gray-600 mt-1">Registro completo de acciones y cambios</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Acciones Hoy</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {logs.filter(log => {
                const today = new Date().toISOString().split('T')[0];
                return log.timestamp.split('T')[0] === today;
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Usuarios Activos</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {new Set(logs.map(log => log.userId)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Módulos Accedidos</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {new Set(logs.map(log => log.module)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total de Eventos</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{logs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en auditoría..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos los módulos</option>
              <option value="facturacion">Facturación</option>
              <option value="clientes">Clientes</option>
              <option value="ordenes">Órdenes</option>
              <option value="configuracion">Configuración</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avanzados
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de auditoría */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={log.id} className="relative">
                {/* Línea de tiempo */}
                {index !== logs.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200" />
                )}

                {/* Evento */}
                <div className="flex gap-4">
                  {/* Avatar/Icon */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 relative z-10">
                    <span className="text-sm font-medium text-blue-600">
                      {log.userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 pb-8">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{log.userName}</span>
                            {getModuleBadge(log.module)}
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{log.action}</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{log.details}</p>

                      {/* Metadata adicional */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          ID Usuario: <span className="text-gray-700">{log.userId}</span>
                        </span>
                        {log.companyId && (
                          <span className="text-xs text-gray-500">
                            Empresa: <span className="text-gray-700">{log.companyId}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {logs.length} de {logs.length} eventos
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}