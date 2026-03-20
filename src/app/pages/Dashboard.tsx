import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import DashboardWispHub from './DashboardWispHub';
import DashboardMikrosystem from './DashboardMikrosystem';
import { MetricCard } from '../components/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Building2, 
  Users, 
  AlertCircle, 
  Ticket, 
  Activity,
  DollarSign,
  TrendingUp,
  WifiOff,
  Server,
  Wifi,
  Clock
} from 'lucide-react';
import {
  MOCK_COMPANIES,
  MOCK_CLIENTS,
  MOCK_INVOICES,
  MOCK_TICKETS,
  MOCK_NETWORK_DEVICES,
  MOCK_AUDIT_LOGS,
} from '../data/mockData';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();

  // Roles que ven dashboards específicos por tema
  const rolesWithThemeDashboards = ['super_admin', 'isp_admin', 'tecnico'];
  
  if (rolesWithThemeDashboards.includes(user?.role || '')) {
    if (viewTheme === 'wisphub') {
      return <DashboardWispHub />;
    } else {
      return <DashboardMikrosystem />;
    }
  }

  // Datos para gráficas
  const trafficData = [
    { id: 'ene1', fecha: 'Ene 1', trafico: 0.7 },
    { id: 'ene2', fecha: 'Ene 2', trafico: 0.8 },
    { id: 'ene3', fecha: 'Ene 3', trafico: 0.6 },
    { id: 'ene4', fecha: 'Ene 4', trafico: 0.9 },
    { id: 'ene5', fecha: 'Ene 5', trafico: 0.75 },
    { id: 'ene6', fecha: 'Ene 6', trafico: 0.85 },
    { id: 'ene7', fecha: 'Ene 7', trafico: 0.8 },
    { id: 'ene8', fecha: 'Ene 8', trafico: 0.9 },
    { id: 'ene9', fecha: 'Ene 9', trafico: 1.0 },
    { id: 'ene10', fecha: 'Ene 10', trafico: 0.8 },
  ];

  const revenueData = [
    { id: 'jan', mes: 'Ene', ingresos: 45000, egresos: 25000 },
    { id: 'feb', mes: 'Feb', ingresos: 52000, egresos: 28000 },
    { id: 'mar', mes: 'Mar', ingresos: 48000, egresos: 30000 },
    { id: 'apr', mes: 'Abr', ingresos: 61000, egresos: 32000 },
    { id: 'may', mes: 'May', ingresos: 55000, egresos: 29000 },
    { id: 'jun', mes: 'Jun', ingresos: 67000, egresos: 35000 },
    { id: 'jul', mes: 'Jul', ingresos: 72000, egresos: 38000 },
    { id: 'aug', mes: 'Ago', ingresos: 69000, egresos: 36000 },
    { id: 'sep', mes: 'Sep', ingresos: 75000, egresos: 40000 },
    { id: 'oct', mes: 'Oct', ingresos: 78000, egresos: 42000 },
    { id: 'nov', mes: 'Nov', ingresos: 82000, egresos: 45000 },
    { id: 'dec', mes: 'Dic', ingresos: 88000, egresos: 48000 },
  ];

  const lastConnectedUsers = [
    { id: 1, username: 'user001@pppoe', ip: '10.0.1.45', pool: 'Pool Principal', uptime: '2h 15m' },
    { id: 2, username: 'user002@pppoe', ip: '10.0.1.46', pool: 'Pool Secundario', uptime: '1h 45m' },
    { id: 3, username: 'user003@pppoe', ip: '10.0.1.47', pool: 'Pool Principal', uptime: '3h 20m' },
    { id: 4, username: 'user004@pppoe', ip: '10.0.1.48', pool: 'Pool Principal', uptime: '45m' },
    { id: 5, username: 'user005@pppoe', ip: '10.0.1.49', pool: 'Pool VIP', uptime: '5h 10m' },
  ];

  const topServices = [
    { name: 'Plan 50 Mbps', qty: 145, revenue: 145000 },
    { name: 'Plan 100 Mbps', qty: 98, revenue: 196000 },
    { name: 'Plan 200 Mbps', qty: 45, revenue: 135000 },
    { name: 'Plan Empresarial', qty: 23, revenue: 115000 },
  ];

  // Métricas según el rol
  const renderMetrics = () => {
    if (user?.role === 'super_admin') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Empresas Activas"
            value={MOCK_COMPANIES.filter(c => c.status === 'active').length}
            change={12}
            icon={<Building2 className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Clientes Totales"
            value={MOCK_CLIENTS.length}
            change={8}
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Cartera Vencida"
            value={formatCurrency(
              MOCK_INVOICES.filter(i => i.status === 'overdue')
                .reduce((sum, i) => sum + i.amount, 0)
            )}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
          <MetricCard
            title="Tickets Abiertos"
            value={MOCK_TICKETS.filter(t => t.status !== 'closed').length}
            icon={<Ticket className="w-6 h-6" />}
            color="yellow"
          />
        </div>
      );
    }

    if (user?.role === 'cobranza') {
      const overdueInvoices = MOCK_INVOICES.filter(
        i => i.companyId === user.companyId && i.status === 'overdue'
      );
      const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Facturas Vencidas"
            value={overdueInvoices.length}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
          <MetricCard
            title="Total Vencido"
            value={formatCurrency(totalOverdue)}
            icon={<DollarSign className="w-6 h-6" />}
            color="red"
          />
          <MetricCard
            title="Recuperado Hoy"
            value={formatCurrency(899)}
            change={20}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
        </div>
      );
    }

    if (user?.role === 'soporte') {
      const myTickets = MOCK_TICKETS.filter(
        t => t.companyId === user.companyId
      );
      const openTickets = myTickets.filter(t => t.status === 'open').length;
      const inProgressTickets = myTickets.filter(t => t.status === 'in_progress').length;

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Tickets Abiertos"
            value={openTickets}
            icon={<Ticket className="w-6 h-6" />}
            color="red"
          />
          <MetricCard
            title="En Progreso"
            value={inProgressTickets}
            icon={<Activity className="w-6 h-6" />}
            color="yellow"
          />
          <MetricCard
            title="Resueltos Hoy"
            value={1}
            change={25}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
        </div>
      );
    }

    if (user?.role === 'tecnico') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Órdenes Pendientes"
            value={1}
            icon={<Ticket className="w-6 h-6" />}
            color="yellow"
          />
          <MetricCard
            title="Completadas Hoy"
            value={1}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Programadas"
            value={1}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
        </div>
      );
    }

    if (user?.role === 'cliente') {
      const myClient = MOCK_CLIENTS.find(c => c.email === user.email);
      const myInvoices = MOCK_INVOICES.filter(i => i.clientId === myClient?.id);
      const pendingInvoices = myInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Estado del Servicio"
            value={myClient?.status === 'active' ? 'Activo' : 'Suspendido'}
            icon={<Activity className="w-6 h-6" />}
            color={myClient?.status === 'active' ? 'green' : 'red'}
          />
          <MetricCard
            title="Saldo Pendiente"
            value={formatCurrency(myClient?.balance || 0)}
            icon={<DollarSign className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Facturas Pendientes"
            value={pendingInvoices.length}
            icon={<AlertCircle className="w-6 h-6" />}
            color="yellow"
          />
        </div>
      );
    }
  };

  // Actividad reciente
  const renderRecentActivity = () => {
    if (user?.role === 'super_admin' || user?.role === 'isp_admin') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_AUDIT_LOGS.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.userName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDateTime(log.timestamp)}</p>
                  </div>
                  <Badge variant="info" className="flex-shrink-0">{log.module}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (user?.role === 'soporte' || user?.role === 'cobranza') {
      const relevantTickets = MOCK_TICKETS.filter(t => 
        t.companyId === user.companyId && t.status !== 'closed'
      ).slice(0, 5);

      return (
        <Card>
          <CardHeader>
            <CardTitle>Tickets Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relevantTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{ticket.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDateTime(ticket.createdAt)}</p>
                  </div>
                  <Badge 
                    variant={
                      ticket.status === 'open' ? 'error' : 
                      ticket.status === 'in_progress' ? 'warning' : 
                      'success'
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="pt-4 lg:pt-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user?.role === 'super_admin' && 'Panel Global - Super Admin'}
          {user?.role === 'isp_admin' && 'Dashboard - Administrador ISP'}
          {user?.role === 'cobranza' && 'Dashboard - Cobranza'}
          {user?.role === 'soporte' && 'Dashboard - Soporte'}
          {user?.role === 'tecnico' && 'Dashboard - Técnico'}
          {user?.role === 'cliente' && 'Mi Portal'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Bienvenido, {user?.name}
        </p>
      </div>

      {/* Métricas */}
      {renderMetrics()}

      {/* Sección adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {renderRecentActivity()}

        {/* Estado de red (solo para roles técnicos) */}
        {(user?.role === 'super_admin' || user?.role === 'isp_admin' || user?.role === 'tecnico') && (
          <Card>
            <CardHeader>
              <CardTitle>Estado de Routers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_NETWORK_DEVICES.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        device.status === 'up' ? 'bg-green-500' :
                        device.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{device.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{device.uptime}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfica de tráfico de red */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin' || user?.role === 'tecnico') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tráfico desde el Estado del PPPoE</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trafficData}>
                <CartesianGrid key="traffic-grid" strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  key="traffic-xaxis"
                  dataKey="fecha" 
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis key="traffic-yaxis" className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  key="traffic-tooltip"
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  key="trafico-line"
                  type="monotone" 
                  dataKey="trafico" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Últimos conectados PPPoE */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Últimos Conectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Usuario PPPoE</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">IP Asignada</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Pool</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tiempo Conectado</th>
                  </tr>
                </thead>
                <tbody>
                  {lastConnectedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{user.username}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.ip}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.pool}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.uptime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfica de ingresos vs egresos */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin' || user?.role === 'cobranza') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ingresos vs Egresos del Año 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData}>
                <CartesianGrid key="revenue-grid" strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  key="revenue-xaxis"
                  dataKey="mes" 
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis key="revenue-yaxis" className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  key="revenue-tooltip"
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend key="revenue-legend" />
                <Bar key="ingresos-bar" dataKey="ingresos" fill="#f97316" name="Ingresos" />
                <Bar key="egresos-bar" dataKey="egresos" fill="#ec4899" name="Egresos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Servicios más vendidos */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Servicios Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Servicio</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {topServices.map((service, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{service.name}</td>
                      <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-400">{service.qty}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(service.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}