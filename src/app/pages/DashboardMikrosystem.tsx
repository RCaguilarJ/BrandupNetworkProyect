import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users,
  DollarSign,
  FileText,
  Ticket,
  TrendingUp,
  Circle,
  Server,
  Cpu,
  HardDrive,
  Clock,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react';
import {
  MOCK_CLIENTS,
  MOCK_INVOICES,
  MOCK_TICKETS,
  MOCK_PAYMENTS
} from '../data/mockData';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardMikrosystem() {
  const { user } = useAuth();

  // Datos de tráfico de clientes (últimos 7 días)
  const trafficData = [
    { fecha: '13/03/2026', trafico: 0.3 },
    { fecha: '14/03/2026', trafico: 0.5 },
    { fecha: '15/03/2026', trafico: 0.4 },
    { fecha: '16/03/2026', trafico: 0.7 },
    { fecha: '17/03/2026', trafico: 0.6 },
    { fecha: '18/03/2026', trafico: 0.5 },
    { fecha: '19/03/2026', trafico: 0.2 }
  ];

  // Datos de uso de descarga (Gráfico de dona)
  const downloadData = [
    { name: 'Descarga', value: 0, color: '#3b82f6' },
    { name: 'Subida', value: 0, color: '#1e293b' }
  ];

  // Resumen del sistema
  const systemSummary = [
    { id: 1, label: 'Routers Activos', value: 3, color: 'bg-blue-500', icon: <Wifi className="w-3 h-3" /> },
    { id: 2, label: 'Routers desconectados', value: 0, color: 'bg-red-500', icon: <WifiOff className="w-3 h-3" /> },
    { id: 3, label: 'Clientes Activos', value: 67, color: 'bg-green-500', icon: <Users className="w-3 h-3" /> },
    { id: 4, label: 'Clientes suspendidos', value: 12, color: 'bg-pink-500', icon: <AlertTriangle className="w-3 h-3" /> },
    { id: 5, label: 'Servicios Activos', value: 8, color: 'bg-cyan-500', icon: <CheckCircle className="w-3 h-3" /> },
    { id: 6, label: 'Moratorios Activos', value: 2, color: 'bg-lime-500', icon: <DollarSign className="w-3 h-3" /> },
    { id: 7, label: 'Moratorios Caídos', value: 1, color: 'bg-purple-500', icon: <TrendingUp className="w-3 h-3" /> }
  ];

  // Últimos pagos registrados
  const lastPayments = [
    { id: 1, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Horas' },
    { id: 2, cliente: 'z5c5', cobrado: 700.00, operador: 'admin', tiempo: 'Hace 21 Horas' },
    { id: 3, cliente: 'z5c6', cobrado: 300.00, operador: 'admin', tiempo: 'Mesa 21 Horas' },
    { id: 4, cliente: 'z5c7', cobrado: 300.00, operador: 'admin', tiempo: 'Mesa 21 Horas' },
    { id: 5, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' },
    { id: 6, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' },
    { id: 7, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' },
    { id: 8, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' },
    { id: 9, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' },
    { id: 10, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' }
  ];

  // Últimos conectados
  const lastConnected = [
    { id: 1, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Horas' },
    { id: 2, cliente: 'z5c5', cobrado: 700.00, operador: 'admin', tiempo: 'Hace 21 Horas' },
    { id: 3, cliente: 'z5c6', cobrado: 300.00, operador: 'admin', tiempo: 'Mesa 21 Horas' },
    { id: 4, cliente: 'z5c7', cobrado: 300.00, operador: 'admin', tiempo: 'Mesa 21 Horas' },
    { id: 5, cliente: 'Cliente prueba', cobrado: 0.20, operador: 'api', tiempo: 'Hace 2 Días' }
  ];

  // Datos del servidor (barras de progreso)
  const serverStats = [
    { id: 1, label: 'CPU Core', value: 'Intel(R) Xeon(R) CPU E3-1230 v3 @ 3.30GHz (4 cores)', percent: 0, icon: <Cpu className="w-5 h-5" /> },
    { id: 2, label: 'Carga promedio', value: '0.13/0.08/0.57 | 0.15/0.09/0.57 | 0.09/2.07/1.56/3', percent: 15, icon: <Activity className="w-5 h-5" /> },
    { id: 3, label: 'Uso de CPU', value: '', percent: 5, icon: <Cpu className="w-5 h-5" /> },
    { id: 4, label: 'Mem. 1 GB (Libre 41.4%)', value: '', percent: 58.6, icon: <Server className="w-5 h-5" /> },
    { id: 5, label: 'Disco 31 GB (Libre 64.41%)', value: '', percent: 35.59, icon: <HardDrive className="w-5 h-5" /> },
    { id: 6, label: 'Último copie de seguridad', value: 'Hace 8 días (5 Mб)', percent: 0, icon: <Clock className="w-5 h-5" /> }
  ];

  // Resumen de facturación
  const billingData = {
    monthly: {
      label: 'Mensual',
      pagos: 1,
      pagosMonto: 27904.11,
      facturasPagadas: 1,
      facturasNoPagadas: 0,
      monto: 800.00
    },
    lastMonth: {
      label: 'El mes pasado',
      pagos: 0,
      pagosMonto: 1622.00,
      facturasPagadas: 3,
      facturasNoPagadas: 1,
      monto: 250.00
    }
  };

  // Equipos (pequeña lista)
  const equipments = [
    { id: 1, nombre: 'AP OUIN CONEJO', equipo: 'ROCKET AC-LITE', ip: '10.0.0.10', estado: 'FUNCIONANDO' },
    { id: 2, nombre: 'Test', equipo: '', ip: '1.1.1.1', estado: 'PRUEBA' },
    { id: 3, nombre: 'AAA', equipo: '', ip: '8.8.4.4', estado: 'EN LINEA' }
  ];

  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6 bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="pt-4 lg:pt-6 mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Bienvenido <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Administrador principal</span>
        </h1>
      </div>

      {/* Tarjetas superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* CLIENTES ONLINE */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-cyan-500" />
          <div className="absolute top-0 right-0 opacity-10">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative p-5 text-white">
            <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
              CLIENTES ONLINE
            </div>
            <div className="text-4xl font-bold mb-3">0</div>
            <div className="flex items-center justify-between text-xs border-t border-white/30 pt-2">
              <span>Total Registrados: 67</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* TRANSACCIONES HOY */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600" />
          <div className="absolute top-0 right-0 opacity-10">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="relative p-5 text-white">
            <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
              TRANSACCIONES HOY
            </div>
            <div className="text-4xl font-bold mb-3">$ 0.20</div>
            <div className="flex items-center justify-between text-xs border-t border-white/30 pt-2">
              <span>Cobrado este mes: $ 27,944.11</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* FACTURAS NO PAGADAS */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600" />
          <div className="absolute top-0 right-0 opacity-10">
            <FileText className="w-24 h-24" />
          </div>
          <div className="relative p-5 text-white">
            <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
              FACTURAS NO PAGADAS
            </div>
            <div className="text-4xl font-bold mb-3">6</div>
            <div className="flex items-center justify-between text-xs border-t border-white/30 pt-2">
              <span>Total vencidas: 5</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* TICKET SOPORTE */}
        <Card className="relative overflow-hidden border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800" />
          <div className="absolute top-0 right-0 opacity-10">
            <Ticket className="w-24 h-24" />
          </div>
          <div className="relative p-5 text-white">
            <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
              TICKET SOPORTE
            </div>
            <div className="text-4xl font-bold mb-3">65</div>
            <div className="flex items-center justify-between text-xs border-t border-white/30 pt-2">
              <span>Total histórico: 65</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos: Tráfico Clientes + Gráfico Circular + Resumen del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Tráfico Clientes */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
              Tráfico Clientes
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">Últimos 7 días</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorTrafico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  key="traffic-grid" 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  className="dark:stroke-gray-700" 
                />
                <XAxis 
                  key="traffic-xaxis"
                  dataKey="fecha" 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  key="traffic-yaxis"
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  tickFormatter={(value) => `${value} GB`}
                />
                <Tooltip 
                  key="traffic-tooltip"
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                  formatter={(value: number) => `${value} GB`}
                />
                <Area 
                  key="trafico-area"
                  type="monotone" 
                  dataKey="trafico" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorTrafico)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Circular + Resumen del Sistema */}
        <Card className="border-0 shadow-md bg-gray-800 text-white">
          <CardContent className="p-4">
            {/* Gráfico de dona */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <PieChart width={140} height={140}>
                  <Pie
                    key="download-pie"
                    data={downloadData}
                    cx={60}
                    cy={60}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {downloadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-xs text-gray-400">DE DESCARGA</div>
                </div>
              </div>
              <div className="text-lg font-bold mt-2">0 GB</div>
              <div className="text-xs text-gray-400">Total tráfico</div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                  <span>0 GB Descarga</span>
                </div>
                <div className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-gray-700 text-gray-700" />
                  <span>0 GB Subida</span>
                </div>
              </div>
            </div>

            {/* Resumen del sistema */}
            <div className="border-t border-gray-700 pt-3">
              <h3 className="text-xs font-bold mb-2 flex items-center justify-between">
                Resumen del sistema
                <button className="text-gray-400 hover:text-white">✕</button>
              </h3>
              <div className="space-y-2">
                {systemSummary.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className={`${item.color} w-5 h-5 rounded flex items-center justify-center p-0 text-white border-0`}>
                        {item.icon}
                      </Badge>
                      <span className="text-gray-300">{item.label}</span>
                    </div>
                    <Badge className={`${item.color} text-white border-0 h-5 px-2 text-xs rounded`}>
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tablas: Últimos Pagos + Últimos Conectados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Últimos pagos registrados */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
            <CardTitle className="text-sm font-bold">Últimos pagos registrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Cobrado</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Operador</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {lastPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{payment.cliente}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white font-medium">$ {payment.cobrado.toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{payment.operador}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{payment.tiempo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Ver todos →
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Últimos conectados */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
            <CardTitle className="text-sm font-bold">Últimos conectados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Cobrado</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Operador</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {lastConnected.map((connected) => (
                    <tr key={connected.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{connected.cliente}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white font-medium">$ {connected.cobrado.toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{connected.operador}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{connected.tiempo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Ver todos →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Datos del Servidor */}
      <Card className="mb-4 border-0 shadow-md">
        <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
          <CardTitle className="text-sm font-bold">DATOS DEL SERVIDOR</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {serverStats.map((stat) => (
              <div key={stat.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                    {stat.percent > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{stat.percent}%</span>
                    )}
                  </div>
                  {stat.value && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.value}</p>
                  )}
                  {stat.percent > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stat.percent}%`,
                          background: stat.percent > 70 ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 
                                     stat.percent > 40 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 
                                     'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen Facturación */}
      <Card className="mb-4 border-0 shadow-md">
        <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
          <CardTitle className="text-sm font-bold">Resumen Facturación</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold"></th>
                  <th className="text-center px-3 py-2 font-semibold bg-blue-700">Mensual</th>
                  <th className="text-center px-3 py-2 font-semibold bg-cyan-600">El mes pasado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Pagos</td>
                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-bold">
                    {billingData.monthly.pagos} ($ {billingData.monthly.pagosMonto.toLocaleString()})
                  </td>
                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white bg-cyan-50 dark:bg-cyan-900/20">
                    {billingData.lastMonth.pagos} ($ {billingData.lastMonth.pagosMonto.toLocaleString()})
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Facturas pagadas</td>
                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white">
                    ? ({billingData.monthly.facturasPagadas})
                  </td>
                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white bg-cyan-50 dark:bg-cyan-900/20">
                    ? ({billingData.lastMonth.facturasPagadas})
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Facturas sin Pagar</td>
                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white">
                    | ($ {billingData.monthly.monto.toFixed(2)})
                  </td>
                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white bg-cyan-50 dark:bg-cyan-900/20">
                    | ($ {billingData.lastMonth.monto.toFixed(2)})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Equipos */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Equipos</CardTitle>
            <div className="flex items-center gap-2">
              <select className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white">
                <option>15</option>
                <option>25</option>
                <option>50</option>
              </select>
              <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">⚙️</button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">NOMBRE</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">EQUIPO</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">IP</th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((equipment, index) => (
                  <tr 
                    key={equipment.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
                  >
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{equipment.nombre}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{equipment.equipo}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{equipment.ip}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge 
                        variant={
                          equipment.estado === 'FUNCIONANDO' ? 'success' : 
                          equipment.estado === 'PRUEBA' ? 'info' : 
                          'success'
                        }
                        className="text-xs"
                      >
                        {equipment.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Mostrando del 1 al 3 de un total de 3 registros
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 bg-blue-600 text-white">
                1
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}