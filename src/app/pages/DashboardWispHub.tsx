import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { 
  DollarSign,
  Users,
  Ticket,
  Download,
  Upload,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  MOCK_CLIENTS,
  MOCK_INVOICES,
  MOCK_TICKETS,
} from '../data/mockData';
import { formatCurrency } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMemo } from 'react';

export default function DashboardWispHub() {
  const { user } = useAuth();

  // Filtrar datos según el usuario
  const userClients = user?.role === 'super_admin' 
    ? MOCK_CLIENTS 
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const userInvoices = user?.role === 'super_admin'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(i => i.companyId === user?.companyId);

  const userTickets = user?.role === 'super_admin'
    ? MOCK_TICKETS
    : MOCK_TICKETS.filter(t => t.companyId === user?.companyId);

  // Calcular métricas de pagos
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const paymentsToday = userInvoices.filter(i => {
    const paymentDate = new Date(i.dueDate);
    return i.status === 'paid' && 
           paymentDate.getDate() === today.getDate() &&
           paymentDate.getMonth() === currentMonth &&
           paymentDate.getFullYear() === currentYear;
  }).reduce((sum, i) => sum + i.amount, 0);

  const pendingPayments = userInvoices.filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);

  const paymentsThisMonth = userInvoices.filter(i => {
    const paymentDate = new Date(i.dueDate);
    return i.status === 'paid' &&
           paymentDate.getMonth() === currentMonth &&
           paymentDate.getFullYear() === currentYear;
  }).reduce((sum, i) => sum + i.amount, 0);

  // Calcular métricas de clientes
  const clientsToday = userClients.filter(c => {
    const createdDate = new Date(c.address); // Mock: usar campo disponible
    return createdDate.getDate() === today.getDate();
  }).length;

  const clientsThisMonth = userClients.filter(c => {
    const createdDate = new Date(c.address); // Mock: usar campo disponible
    return createdDate.getMonth() === currentMonth;
  }).length;

  const totalClients = userClients.length;

  // Calcular métricas de tickets
  const ticketsToday = userTickets.filter(t => {
    const ticketDate = new Date(t.createdAt);
    return ticketDate.getDate() === today.getDate() &&
           ticketDate.getMonth() === currentMonth &&
           ticketDate.getFullYear() === currentYear;
  }).length;

  const pendingTickets = userTickets.filter(t => 
    t.status === 'open' || t.status === 'in_progress'
  ).length;

  const ticketsThisMonth = userTickets.filter(t => {
    const ticketDate = new Date(t.createdAt);
    return ticketDate.getMonth() === currentMonth &&
           ticketDate.getFullYear() === currentYear;
  }).length;

  // Datos para gráfico de finanzas (últimos 12 meses) - Memoizados para evitar regeneración
  const financialData = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return [
      { id: 'wh-finance-0-Ene', mes: 'Ene', 'Ingresos Internet': 42000, 'Otros Ingresos': 15000, 'Gastos': 22000 },
      { id: 'wh-finance-1-Feb', mes: 'Feb', 'Ingresos Internet': 48000, 'Otros Ingresos': 18000, 'Gastos': 25000 },
      { id: 'wh-finance-2-Mar', mes: 'Mar', 'Ingresos Internet': 55000, 'Otros Ingresos': 20000, 'Gastos': 28000 },
      { id: 'wh-finance-3-Abr', mes: 'Abr', 'Ingresos Internet': 52000, 'Otros Ingresos': 17000, 'Gastos': 26000 },
      { id: 'wh-finance-4-May', mes: 'May', 'Ingresos Internet': 60000, 'Otros Ingresos': 22000, 'Gastos': 30000 },
      { id: 'wh-finance-5-Jun', mes: 'Jun', 'Ingresos Internet': 65000, 'Otros Ingresos': 25000, 'Gastos': 32000 },
      { id: 'wh-finance-6-Jul', mes: 'Jul', 'Ingresos Internet': 70000, 'Otros Ingresos': 28000, 'Gastos': 35000 },
      { id: 'wh-finance-7-Ago', mes: 'Ago', 'Ingresos Internet': 68000, 'Otros Ingresos': 26000, 'Gastos': 33000 },
      { id: 'wh-finance-8-Sep', mes: 'Sep', 'Ingresos Internet': 72000, 'Otros Ingresos': 29000, 'Gastos': 36000 },
      { id: 'wh-finance-9-Oct', mes: 'Oct', 'Ingresos Internet': 75000, 'Otros Ingresos': 30000, 'Gastos': 38000 },
      { id: 'wh-finance-10-Nov', mes: 'Nov', 'Ingresos Internet': 78000, 'Otros Ingresos': 32000, 'Gastos': 40000 },
      { id: 'wh-finance-11-Dic', mes: 'Dic', 'Ingresos Internet': 82000, 'Otros Ingresos': 35000, 'Gastos': 42000 },
    ];
  }, []);

  // Métricas de tráfico
  const trafficDownload = '0 GiB';
  const trafficUpload = '0 GiB';

  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="pt-4 lg:pt-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Panel de Control
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Vista general del sistema
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pagos Internet */}
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pagos Internet</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(paymentsToday)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">HOY - 0 PAGOS</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(pendingPayments)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PENDIENTE - 0 PAGOS</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(paymentsThisMonth)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">MARZO - 0 PAGOS</div>
            </div>
          </div>
        </Card>

        {/* Clientes */}
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Clientes</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{clientsToday}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">HOY</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{clientsThisMonth}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">MARZO</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalClients}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">TOTAL</div>
            </div>
          </div>
        </Card>

        {/* Tickets */}
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tickets</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Ticket className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{ticketsToday}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">HOY</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{pendingTickets}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PENDIENTES</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{ticketsThisMonth}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">MARZO</div>
            </div>
          </div>
        </Card>

        {/* Tráfico */}
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tráfico</h2>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Última actualización: {new Date().toLocaleString('es-ES')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{trafficDownload}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">TOTAL DESCARGA</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{trafficUpload}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">TOTAL SUBIDA</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Historial de Finanzas */}
      <Card className="p-4 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Historial de Finanzas
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Últimos 12 meses
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={financialData}>
            <CartesianGrid key="finance-grid" strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              key="finance-xaxis"
              dataKey="mes" 
              className="text-xs fill-gray-600 dark:fill-gray-400"
            />
            <YAxis 
              key="finance-yaxis"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              key="finance-tooltip"
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem'
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend key="finance-legend" />
            <Line 
              key="ingresos-internet-line"
              type="monotone" 
              dataKey="Ingresos Internet" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
            />
            <Line 
              key="otros-ingresos-line"
              type="monotone" 
              dataKey="Otros Ingresos" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
            />
            <Line 
              key="gastos-line"
              type="monotone" 
              dataKey="Gastos" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}