import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Calendar, MapPin, User, CheckCircle, Clock, List, ChevronLeft, ChevronRight, Settings, Edit, Trash2 } from 'lucide-react';
import { MOCK_SERVICE_ORDERS, MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { formatDateTime } from '../lib/utils';
import { useNavigate } from 'react-router';

export default function ServiceOrders() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper functions with useCallback
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'scheduled':
        return <Badge variant="info">Programada</Badge>;
      case 'in_progress':
        return <Badge variant="warning">En Progreso</Badge>;
      case 'completed':
        return <Badge variant="success">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }, []);

  const getTypeName = useCallback((type: string) => {
    const types: Record<string, string> = {
      installation: 'Instalación',
      maintenance: 'Mantenimiento',
      removal: 'Retiro',
      equipment_change: 'Cambio de Equipo',
    };
    return types[type] || type;
  }, []);

  const getClientName = useCallback((clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.name || 'N/A';
  }, []);

  const getClientAddress = useCallback((clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.address || 'N/A';
  }, []);

  // Filtrar órdenes según el rol
  const orders = useMemo(() => {
    let filteredOrders = MOCK_SERVICE_ORDERS;
    if (user?.role === 'tecnico') {
      filteredOrders = MOCK_SERVICE_ORDERS.filter(o => o.assignedTo === user.id);
    } else if (user?.role !== 'super_admin') {
      filteredOrders = MOCK_SERVICE_ORDERS.filter(o => o.companyId === user?.companyId);
    }
    return filteredOrders;
  }, [user]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = getTypeName(order.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getClientName(order.clientId).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm, getTypeName, getClientName]);

  // Si es tema Mikrosystem, mostrar diseño de tabla compacta
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        {/* Header oscuro */}
        <div className="bg-gray-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">Servicios Personalizados</h1>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
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
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Vista */}
              <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                <List className="w-4 h-4" />
              </button>

              {/* Botón + Nuevo */}
              {user?.role !== 'tecnico' && (
                <Button 
                  size="sm" 
                  className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/service-orders/new')}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nuevo
                </Button>
              )}

              {/* Búsqueda */}
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-7 w-48 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      NOMBRE ▼
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      PRECIO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      IMPUESTO %
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-28">
                      ACTIVOS
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                      SUSPENDIDOS
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-28">
                      RETIRADOS
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-24">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.slice(0, pageSize).map((order) => {
                      // Contador de estados
                      const activeCount = order.status === 'completed' || order.status === 'in_progress' ? 1 : 0;
                      const suspendedCount = order.status === 'pending' ? 1 : 0;
                      const removedCount = order.status === 'cancelled' ? 1 : 0;

                      return (
                        <tr 
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                            <span className="text-gray-900 dark:text-white">{getTypeName(order.type)}</span>
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                            <span className="text-gray-900 dark:text-white">$ {Math.floor(Math.random() * 50) + 10}.00</span>
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                            <span className="text-gray-900 dark:text-white">{Math.random() > 0.5 ? '18.00' : '0.00'}</span>
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-cyan-500 text-white rounded-full text-xs font-medium">
                              {activeCount}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-medium">
                              {suspendedCount}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-medium">
                              {removedCount}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Agregar">
                                <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Editar">
                                <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        Ningún registro disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div>
                Mostrando de 1 al {Math.min(pageSize, filteredOrders.length)} de un total de {filteredOrders.length}
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

  // Diseño WispHub original
  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="pt-4 lg:pt-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Órdenes de Servicio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona instalaciones, mantenimientos y trabajos de campo
          </p>
        </div>
        {user?.role !== 'tecnico' && (
          <Button onClick={() => navigate('/service-orders/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="scheduled">Programadas</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de órdenes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{getTypeName(order.type)}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-600">{getClientName(order.clientId)}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{getClientAddress(order.clientId)}</p>
                </div>

                {order.scheduledDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Programada: {formatDateTime(order.scheduledDate)}
                    </p>
                  </div>
                )}

                {order.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Asignado a: Técnico de campo
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalles
                </Button>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <>
                    {user?.role === 'tecnico' && order.status === 'scheduled' && (
                      <Button size="sm" className="flex-1">
                        Iniciar
                      </Button>
                    )}
                    {user?.role === 'tecnico' && order.status === 'in_progress' && (
                      <Button size="sm" className="flex-1">
                        Completar
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}