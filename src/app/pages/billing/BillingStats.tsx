import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { MetricCard } from '../../components/MetricCard';
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Users, Calendar, FileText, Clock } from 'lucide-react';
import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_CLIENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency } from '../../lib/utils';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export default function BillingStats() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();

  const invoices = user?.role === 'super_admin'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(i => i.companyId === user?.companyId);

  const payments = user?.role === 'super_admin'
    ? MOCK_PAYMENTS
    : MOCK_PAYMENTS.filter(p => p.companyId === user?.companyId);

  // Calcular métricas
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalPayments = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  // Datos para gráficas
  const monthlyData = [
    { id: 'jan', mes: 'Ene', facturado: 45000, cobrado: 42000 },
    { id: 'feb', mes: 'Feb', facturado: 52000, cobrado: 48000 },
    { id: 'mar', mes: 'Mar', facturado: 48000, cobrado: 45000 },
    { id: 'apr', mes: 'Abr', facturado: 61000, cobrado: 58000 },
    { id: 'may', mes: 'May', facturado: 55000, cobrado: 52000 },
    { id: 'jun', mes: 'Jun', facturado: 67000, cobrado: 65000 },
  ];

  const statusData = [
    { id: 'paid', name: 'Pagadas', value: invoices.filter(i => i.status === 'paid').length, color: '#10b981' },
    { id: 'pending', name: 'Pendientes', value: invoices.filter(i => i.status === 'pending').length, color: '#f59e0b' },
    { id: 'overdue', name: 'Vencidas', value: invoices.filter(i => i.status === 'overdue').length, color: '#ef4444' },
    { id: 'cancelled', name: 'Canceladas', value: invoices.filter(i => i.status === 'cancelled').length, color: '#6b7280' },
  ].filter(item => item.value > 0);

  const paymentMethodData = [
    { id: 'transfer', method: 'Transferencia', count: payments.filter(p => p.method === 'transfer').length },
    { id: 'card', method: 'Tarjeta', count: payments.filter(p => p.method === 'card').length },
    { id: 'cash', method: 'Efectivo', count: payments.filter(p => p.method === 'cash').length },
    { id: 'online', method: 'En Línea', count: payments.filter(p => p.method === 'online').length },
  ];

  const collectionRate = totalRevenue > 0 ? ((totalPayments / (totalRevenue + totalPending + totalOverdue)) * 100).toFixed(1) : 0;

  // Si es tema Mikrosystem, mostrar diseño diferente
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        {/* Header azul brillante */}
        <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">📊 Estadísticas de Facturación</h1>
          <p className="text-blue-100 text-sm mt-1">Panel de análisis y métricas de cobranza</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Grid de métricas principales - Diseño horizontal compacto */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Métrica 1: Ingresos */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <div className="text-xs bg-white/20 px-2 py-1 rounded">+12%</div>
              </div>
              <div className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs opacity-90">Ingresos Totales</div>
            </div>

            {/* Métrica 2: Vencidas */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <div className="text-xs bg-white/20 px-2 py-1 rounded">{invoices.filter(i => i.status === 'overdue').length}</div>
              </div>
              <div className="text-2xl font-bold mb-1">{formatCurrency(totalOverdue)}</div>
              <div className="text-xs opacity-90">Cartera Vencida</div>
            </div>

            {/* Métrica 3: Por Cobrar */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-8 h-8 opacity-80" />
                <div className="text-xs bg-white/20 px-2 py-1 rounded">{invoices.filter(i => i.status === 'pending').length}</div>
              </div>
              <div className="text-2xl font-bold mb-1">{formatCurrency(totalPending)}</div>
              <div className="text-xs opacity-90">Por Cobrar</div>
            </div>

            {/* Métrica 4: Tasa de Cobro */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <div className="text-xs bg-white/20 px-2 py-1 rounded">+5%</div>
              </div>
              <div className="text-2xl font-bold mb-1">{collectionRate}%</div>
              <div className="text-xs opacity-90">Tasa de Cobro</div>
            </div>
          </div>

          {/* Sección de gráficas - Layout diferente: 1 columna grande + 1 sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal: Gráfica de área */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  📈 Tendencia de Facturación (Últimos 6 Meses)
                </h3>
                <select className="text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1">
                  <option>Últimos 6 meses</option>
                  <option>Últimos 12 meses</option>
                  <option>Este año</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorFacturado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="mes" className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="facturado" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFacturado)" name="Facturado" />
                  <Area type="monotone" dataKey="cobrado" stroke="#10b981" fillOpacity={1} fill="url(#colorCobrado)" name="Cobrado" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sidebar: Estado y métodos de pago en vertical */}
            <div className="space-y-6">
              {/* Distribución por estado */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  Estado de Facturas
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {statusData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de facturas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Resumen del Mes
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total Emitidas</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{invoices.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Pagadas</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{invoices.filter(i => i.status === 'paid').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Pendientes</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">{invoices.filter(i => i.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Último Pago</span>
                    </div>
                    <span className="text-xs font-medium text-blue-600">Hace 2h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección inferior: Tabla de métodos de pago + Promedios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métodos de pago como barras horizontales */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                💳 Pagos por Método
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paymentMethodData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <YAxis dataKey="method" type="category" className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" name="Cantidad de Pagos" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Promedios y actividad */}
            <div className="grid grid-cols-2 gap-4">
              {/* Promedio por factura */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
                <DollarSign className="w-6 h-6 opacity-80 mb-2" />
                <div className="text-xl font-bold mb-1">
                  {formatCurrency(totalRevenue / (invoices.filter(i => i.status === 'paid').length || 1))}
                </div>
                <div className="text-xs opacity-90">Promedio por Factura</div>
              </div>

              {/* Promedio por cliente */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
                <Users className="w-6 h-6 opacity-80 mb-2" />
                <div className="text-xl font-bold mb-1">
                  {formatCurrency(totalRevenue / (MOCK_CLIENTS.length || 1))}
                </div>
                <div className="text-xs opacity-90">Promedio por Cliente</div>
              </div>

              {/* Promedio mensual */}
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white shadow-lg">
                <Calendar className="w-6 h-6 opacity-80 mb-2" />
                <div className="text-xl font-bold mb-1">
                  {formatCurrency(totalRevenue / 6)}
                </div>
                <div className="text-xs opacity-90">Promedio Mensual</div>
              </div>

              {/* Recordatorios */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-lg">
                <Clock className="w-6 h-6 opacity-80 mb-2" />
                <div className="text-xl font-bold mb-1">3</div>
                <div className="text-xs opacity-90">Recordatorios Hoy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si es tema WispHub, mostrar diseño original
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estadísticas de Facturación</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Análisis y métricas de facturación y cobranza</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(totalRevenue)}
          change={12}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Cartera Vencida"
          value={formatCurrency(totalOverdue)}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Por Cobrar"
          value={formatCurrency(totalPending)}
          icon={<CreditCard className="w-6 h-6" />}
          color="yellow"
        />
        <MetricCard
          title="Tasa de Cobro"
          value={`${collectionRate}%`}
          change={5}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Facturado vs Cobrado */}
        <Card>
          <CardHeader>
            <CardTitle>Facturado vs Cobrado (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid key="monthly-grid" strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis key="monthly-xaxis" dataKey="mes" className="text-xs fill-gray-600 dark:fill-gray-400" />
                <YAxis key="monthly-yaxis" className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  key="monthly-tooltip"
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend key="monthly-legend" />
                <Line key="facturado-line" type="monotone" dataKey="facturado" stroke="#3b82f6" strokeWidth={2} name="Facturado" />
                <Line key="cobrado-line" type="monotone" dataKey="cobrado" stroke="#10b981" strokeWidth={2} name="Cobrado" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado de facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métodos de pago */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pagos por Método</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethodData}>
              <CartesianGrid key="payment-grid" strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis key="payment-xaxis" dataKey="method" className="text-xs fill-gray-600 dark:fill-gray-400" />
              <YAxis key="payment-yaxis" className="text-xs fill-gray-600 dark:fill-gray-400" />
              <Tooltip 
                key="payment-tooltip"
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar key="payment-bar" dataKey="count" fill="#8b5cf6" name="Cantidad de Pagos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumen adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Facturas del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Emitidas</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{invoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pagadas</span>
                <span className="text-lg font-bold text-green-600">{invoices.filter(i => i.status === 'paid').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
                <span className="text-lg font-bold text-yellow-600">{invoices.filter(i => i.status === 'pending').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Promedio de Cobro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Por Factura</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue / (invoices.filter(i => i.status === 'paid').length || 1))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Por Cliente</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue / (MOCK_CLIENTS.length || 1))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mensual</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue / 6)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Último Pago</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Hace 2 horas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Última Factura</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Hace 5 horas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Recordatorios</span>
                <span className="text-sm font-medium text-yellow-600">3 enviados hoy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
