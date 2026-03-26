import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Copy,
  DollarSign,
  Send, 
  CreditCard, 
  Download, 
  Filter, 
  Eye, 
  Mail,
  Play,
  Settings,
  Grid3x3,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  AlertTriangle,
  HandshakeIcon,
  FileText,
  Power,
  Table2,
  Wrench
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_INVOICES, MOCK_CLIENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import type {
  WispHubListaPagosPendientesBoton,
  WispHubListaPagosPendientesDatos,
} from '../../types';

const fuenteWispHubClasica =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, sans-serif';

const estilosWispHub = {
  pagina: {
    minHeight: '100%',
    backgroundColor: '#ffffff',
    borderTop: '4px solid #45bf63',
    color: '#17273d',
    fontFamily: fuenteWispHubClasica,
    paddingBottom: '28px',
  } satisfies CSSProperties,
  encabezado: {
    borderBottom: '1px solid #d7dde5',
    padding: '22px 12px 24px',
    marginBottom: '28px',
  } satisfies CSSProperties,
  panel: {
    margin: '0 12px 20px',
  } satisfies CSSProperties,
  input: {
    height: '34px',
    border: '1px solid #cfd6df',
    backgroundColor: '#ffffff',
    padding: '0 12px',
    color: '#20324a',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
  } satisfies CSSProperties,
  botonAzul: {
    height: '34px',
    border: '1px solid #1399da',
    backgroundColor: '#1fa9e6',
    color: '#ffffff',
    padding: '0 16px',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
  } satisfies CSSProperties,
} as const;

function obtenerIconoBotonWispHub(
  icono: WispHubListaPagosPendientesBoton['icono'],
) {
  switch (icono) {
    case 'copiar':
      return <Copy className="h-3.5 w-3.5" />;
    case 'documento':
      return <FileText className="h-3.5 w-3.5" />;
    case 'tabla':
      return <Table2 className="h-3.5 w-3.5" />;
    case 'filtro':
      return <Filter className="h-3.5 w-3.5" />;
    case 'dinero':
      return <DollarSign className="h-3.5 w-3.5" />;
    case 'correo':
      return <Mail className="h-3.5 w-3.5" />;
    case 'encendido':
      return <Power className="h-3.5 w-3.5" />;
    default:
      return <Wrench className="h-3.5 w-3.5" />;
  }
}

function obtenerClasesBotonWispHub(
  color: WispHubListaPagosPendientesBoton['color'],
) {
  const mapa = {
    verde: 'border-[#42b960] bg-[#45bf63] text-white',
    azul: 'border-[#189edb] bg-[#1fa9e6] text-white',
    cian: 'border-[#18a4d6] bg-[#1bb1df] text-white',
    naranja: 'border-[#f0a22f] bg-[#f2a62d] text-white',
  } satisfies Record<WispHubListaPagosPendientesBoton['color'], string>;

  return mapa[color];
}

export default function PendingInvoices() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(
    viewTheme === 'wisphub' ? 10 : 25,
  );
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('31/03/2026');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [registerAction, setRegisterAction] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const allInvoices = user?.role === 'super_admin'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(i => i.companyId === user?.companyId);

  const pendingInvoices = allInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const overdueInvoices = allInvoices.filter(i => i.status === 'overdue');
  
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);

  const filteredInvoices = pendingInvoices.filter(invoice => {
    const matchesSearch = invoice.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, isMikrosystem: boolean) => {
    if (isMikrosystem) {
      const badges = {
        pending: { text: 'PENDIENTE', class: 'bg-orange-500 text-white' },
        overdue: { text: 'VENCIDO', class: 'bg-red-600 text-white' },
      };
      const badge = badges[status as keyof typeof badges] || { text: status.toUpperCase(), class: 'bg-gray-600 text-white' };
      return (
        <Badge className={`${badge.class} border-0 text-xs font-bold px-2 py-0.5 rounded`}>
          {badge.text}
        </Badge>
      );
    } else {
      const badges = {
        pending: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        overdue: { text: 'Vencida', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      };
      const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
          {badge.text}
        </span>
      );
    }
  };

  const getClientName = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calcular resumen por categorías para Mikrosystem
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const currentMonthInvoices = filteredInvoices.filter(i => {
    const dueDate = new Date(i.dueDate);
    return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
  });

  const previousMonthsInvoices = filteredInvoices.filter(i => {
    const dueDate = new Date(i.dueDate);
    return dueDate < new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const soonToDueInvoices = filteredInvoices.filter(i => {
    const dueDate = new Date(i.dueDate);
    return dueDate >= today && dueDate <= sevenDaysFromNow && i.status === 'pending';
  });

  const highlyOverdueInvoices = filteredInvoices.filter(i => {
    const dueDate = new Date(i.dueDate);
    return dueDate < thirtyDaysAgo && i.status === 'overdue';
  });

  const actualOverdueInvoices = filteredInvoices.filter(i => i.status === 'overdue');
  const promiseInvoices = actualOverdueInvoices.slice(0, Math.floor(actualOverdueInvoices.length * 0.3));

  const pieData = [
    {
      name: 'Por Vencer',
      value: soonToDueInvoices.length,
      amount: soonToDueInvoices.reduce((sum, i) => sum + i.amount, 0),
      color: '#F59E0B',
    },
    {
      name: 'Con Promesa',
      value: promiseInvoices.length,
      amount: promiseInvoices.reduce((sum, i) => sum + i.amount, 0),
      color: '#10B981',
    },
    {
      name: 'Vencidas',
      value: actualOverdueInvoices.length - promiseInvoices.length,
      amount: actualOverdueInvoices.reduce((sum, i) => sum + i.amount, 0) - promiseInvoices.reduce((sum, i) => sum + i.amount, 0),
      color: '#EF4444',
    },
  ];

  const totalCurrentMonth = currentMonthInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPreviousMonths = previousMonthsInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalSoonToDue = soonToDueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalHighlyOverdue = highlyOverdueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const grandTotal = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);

  const taxCurrentMonth = totalCurrentMonth * 0.16;
  const taxPreviousMonths = totalPreviousMonths * 0.16;
  const taxSoonToDue = totalSoonToDue * 0.16;
  const taxHighlyOverdue = totalHighlyOverdue * 0.16;
  const taxTotal = grandTotal * 0.16;

  const datosWispHub: WispHubListaPagosPendientesDatos = {
    tituloPagina: 'Lista de Pagos Pendientes',
    pestanas: [
      {
        id: 'pagos-pendientes',
        etiqueta: 'Pagos Pendientes',
        activa: true,
      },
      {
        id: 'pagos-pendientes-clientes',
        etiqueta: 'Pagos Pendientes por Clientes',
        activa: false,
        resalto: 'Nuevo',
      },
    ],
    formularioPago: {
      accionPlaceholder: '-----------',
      formaPagoPlaceholder: '---------',
      botonTexto: 'Ejecutar',
    },
    tabla: {
      selectorRegistrosLabel: 'Mostrar',
      placeholderBusquedaGeneral: 'Buscar',
      botonesExportacion: [
        { id: 'copiar', etiqueta: '', icono: 'copiar', color: 'verde', variante: 'icono' },
        { id: 'documento', etiqueta: '', icono: 'documento', color: 'verde', variante: 'icono' },
        { id: 'tabla', etiqueta: 'Tabla', icono: 'tabla', color: 'verde', variante: 'selector' },
      ],
      botonesAccion: [
        { id: 'filtros', etiqueta: 'Filtros', icono: 'filtro', color: 'verde', variante: 'boton' },
        { id: 'documento-accion', etiqueta: '', icono: 'documento', color: 'verde', variante: 'icono' },
        { id: 'dinero', etiqueta: '', icono: 'dinero', color: 'verde', variante: 'icono' },
        { id: 'correo', etiqueta: '', icono: 'correo', color: 'azul', variante: 'icono' },
        { id: 'encendido', etiqueta: '', icono: 'encendido', color: 'verde', variante: 'icono' },
        { id: 'alerta', etiqueta: '', icono: 'encendido', color: 'naranja', variante: 'icono' },
        { id: 'herramientas', etiqueta: '', icono: 'herramientas', color: 'azul', variante: 'menu' },
      ],
      columnas: [
        { clave: 'numeroFactura', titulo: '#Factura', placeholderFiltro: 'Buscar #Factura' },
        { clave: 'cliente', titulo: 'Cliente', placeholderFiltro: 'Buscar Cliente' },
        { clave: 'idServicio', titulo: 'ID Servicio', placeholderFiltro: 'Buscar ID Servicio' },
        { clave: 'estadoServicio', titulo: 'Estado Servicio', placeholderFiltro: 'Buscar Estado Servicio' },
        { clave: 'ipServicio', titulo: 'IP Servicio', placeholderFiltro: 'Buscar IP Servicio' },
        { clave: 'estadoFactura', titulo: 'Estado Factura', placeholderFiltro: 'Buscar Estado Factura' },
        { clave: 'zona', titulo: 'Zona', placeholderFiltro: 'Buscar Zona' },
        { clave: 'total', titulo: 'Total', placeholderFiltro: 'Buscar Total' },
        { clave: 'accion', titulo: 'Acción', placeholderFiltro: 'Buscar Acción' },
      ],
      filas: [],
      totalSeleccionados: 0,
    },
  };

  // Si es tema Mikrosystem, mostrar diseño con dashboard y header azul
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        {/* Header azul brillante */}
        <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">Facturas Pendientes</h1>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de filtros superior */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">Vencimiento</label>
              <select className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option>Vencimiento</option>
                <option>Emisión</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-7 w-24 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
              <button className="w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                📅
              </button>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-7 w-24 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">Router</label>
              <select className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option value="all">Cualquiera</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Cualquiera</option>
                <option value="pending">Pendiente</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>

            <Button size="sm" className="h-7 text-xs px-3 ml-auto">
              Buscar
            </Button>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 border-l border-gray-300 dark:border-gray-600 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400">Herramientas</span>
          </div>

          <div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 w-64 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dashboard con gráfica de pastel */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfica de pastel */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">
                  Distribución de Facturas Pendientes
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} facturas (${formatCurrency(props.payload.amount)})`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Por Vencer */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="w-8 h-8 opacity-80" />
                    <div className="bg-white/20 rounded-full p-2">
                      <span className="text-2xl font-bold">{soonToDueInvoices.length}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold mb-1 opacity-90">Por Vencer</h4>
                  <p className="text-xs opacity-80 mb-2">Próximos 7 días</p>
                  <div className="bg-white/20 rounded px-3 py-1.5 text-center">
                    <p className="text-lg font-bold">{formatCurrency(totalSoonToDue)}</p>
                    <p className="text-xs opacity-90">Monto total</p>
                  </div>
                </div>

                {/* Con Promesa */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <HandshakeIcon className="w-8 h-8 opacity-80" />
                    <div className="bg-white/20 rounded-full p-2">
                      <span className="text-2xl font-bold">{promiseInvoices.length}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold mb-1 opacity-90">Con Promesa</h4>
                  <p className="text-xs opacity-80 mb-2">Compromiso de pago</p>
                  <div className="bg-white/20 rounded px-3 py-1.5 text-center">
                    <p className="text-lg font-bold">{formatCurrency(pieData[1].amount)}</p>
                    <p className="text-xs opacity-90">Monto total</p>
                  </div>
                </div>

                {/* Vencidas */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <AlertTriangle className="w-8 h-8 opacity-80" />
                    <div className="bg-white/20 rounded-full p-2">
                      <span className="text-2xl font-bold">{actualOverdueInvoices.length - promiseInvoices.length}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold mb-1 opacity-90">Vencidas</h4>
                  <p className="text-xs opacity-80 mb-2">Sin promesa de pago</p>
                  <div className="bg-white/20 rounded px-3 py-1.5 text-center">
                    <p className="text-lg font-bold">{formatCurrency(pieData[2].amount)}</p>
                    <p className="text-xs opacity-90">Monto total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen general */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Facturas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monto Total</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Impuestos (16%)</p>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{formatCurrency(taxTotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tasa de Compromiso</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {actualOverdueInvoices.length > 0 ? Math.round((promiseInvoices.length / actualOverdueInvoices.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla con bordes completos */}
        <div className="bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-10"></th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    Nº FACTURA ▲
                  </th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    Nº LEGAL
                  </th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    CLIENTE
                  </th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    F. EMITIDO
                  </th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    F. VENCIMIENTO
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    DÍAS VENCIDO
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    TOTAL
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    SALDO
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    ESTADO
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.slice(0, pageSize).map((invoice, index) => {
                  const daysOverdue = getDaysOverdue(invoice.dueDate);
                  return (
                    <tr
                      key={invoice.id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/30'
                      }`}
                    >
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700">
                        <button className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700">
                          <Info className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        {invoice.folio}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        {Math.floor(Math.random() * 9000) + 1000}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        {getClientName(invoice.clientId)}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-center">
                        {daysOverdue > 0 ? (
                          <span className="font-bold text-red-600 dark:text-red-400">{daysOverdue}</span>
                        ) : daysOverdue === 0 ? (
                          <span className="font-bold text-orange-500">HOY</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-500">{Math.abs(daysOverdue)}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-right font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-center">
                        {getStatusBadge(invoice.status, true)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Ver">
                            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Registrar Pago">
                            <CreditCard className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Email">
                            <Mail className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Descargar">
                            <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer con información */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div>
              Mostrando de 1 a {Math.min(pageSize, filteredInvoices.length)} de un total de {filteredInvoices.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-medium">
                {currentPage}
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                disabled={currentPage >= Math.ceil(filteredInvoices.length / pageSize)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de resumen inferior */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-4 mx-4 mb-4 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">DETALLE</th>
                <th className="text-center px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">CANTIDAD</th>
                <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">IMPUESTO</th>
                <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">TOTAL</th>
                <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">COBRADO</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-100 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Mes Actual (Marzo 2026)</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{currentMonthInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxCurrentMonth)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalCurrentMonth)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</td>
              </tr>

              <tr className="bg-purple-100 dark:bg-purple-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Meses Anteriores</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{previousMonthsInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxPreviousMonths)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalPreviousMonths)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</td>
              </tr>

              <tr className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Próximas a Vencer (7 días)</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{soonToDueInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxSoonToDue)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalSoonToDue)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</td>
              </tr>

              <tr className="bg-red-100 dark:bg-red-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Muy Vencidas (+30 días)</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{highlyOverdueInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxHighlyOverdue)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalHighlyOverdue)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</td>
              </tr>

              <tr className="bg-cyan-100 dark:bg-cyan-900/30">
                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white uppercase">TOTALES</td>
                <td className="px-4 py-2.5 text-center font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(taxTotal)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-blue-700 dark:text-blue-400">{formatCurrency(grandTotal)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Si es tema WispHub, mostrar diseño con CompactTable
  /* const columns: CompactTableColumn<any>[] = [
    {
      key: 'folio',
      header: 'Folio',
      sortable: true,
      width: '120px',
      render: (invoice) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">{invoice.folio}</span>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
      render: (invoice) => (
        <span className="text-gray-700 dark:text-gray-300">{getClientName(invoice.clientId)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      align: 'right',
      render: (invoice) => (
        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</span>
      ),
    },
    {
      key: 'issueDate',
      header: 'Emisión',
      sortable: true,
      render: (invoice) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDate(invoice.issueDate)}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      sortable: true,
      render: (invoice) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDate(invoice.dueDate)}</span>
      ),
    },
    {
      key: 'daysOverdue',
      header: 'Días Vencido',
      align: 'center',
      render: (invoice) => {
        const days = getDaysOverdue(invoice.dueDate);
        return days > 0 ? (
          <span className="font-medium text-red-600 dark:text-red-400">{days} días</span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (invoice) => getStatusBadge(invoice.status, false),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Ver detalle"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
            title="Registrar pago"
          >
            <CreditCard className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Enviar recordatorio"
          >
            <Mail className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  ]; */

  return (
    <div style={estilosWispHub.pagina}>
      <header style={estilosWispHub.encabezado}>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#45bf63]" strokeWidth={2} />
          <h1 className="text-[2.05rem] font-semibold leading-none text-[#0f1f35]">
            {datosWispHub.tituloPagina}
          </h1>
        </div>
      </header>

      <section style={estilosWispHub.panel}>
        <div className="mb-4 flex border-b border-[#dde2e8]">
          {datosWispHub.pestanas.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`inline-flex items-center gap-2 border border-b-0 px-4 py-3 text-[13px] ${
                tab.activa
                  ? 'border-[#cfd6df] border-t-[4px] border-t-[#45bf63] bg-white text-[#24364b]'
                  : 'border-[#cfd6df] bg-[#fbfcfd] text-[#24364b]'
              }`}
            >
              <span>{tab.etiqueta}</span>
              {tab.resalto && (
                <span className="rounded bg-[#45bf63] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {tab.resalto}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-7">
          <div className="min-w-[420px] flex-1">
            <label className="mb-2 block text-[12px] font-semibold">
              Acción al Registrar pagos:
            </label>
            <select
              value={registerAction}
              onChange={(event) =>
                setRegisterAction(event.target.value)
              }
              style={estilosWispHub.input}
              className="w-full"
            >
              <option value="">
                {datosWispHub.formularioPago.accionPlaceholder}
              </option>
            </select>
          </div>

          <div className="min-w-[420px] flex-1">
            <label className="mb-2 block text-[12px] font-semibold">
              Forma de pago:
            </label>
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value)
              }
              style={estilosWispHub.input}
              className="w-full"
            >
              <option value="">
                {datosWispHub.formularioPago.formaPagoPlaceholder}
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              style={estilosWispHub.botonAzul}
              className="inline-flex items-center gap-1.5"
            >
              <Play className="h-4 w-4" />
              {datosWispHub.formularioPago.botonTexto}
            </button>
            <span className="text-[12px]">
              {datosWispHub.tabla.totalSeleccionados} seleccionados/as
            </span>
          </div>
        </div>
      </section>

      <section className="mx-[12px]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className="inline-flex h-[33px] items-center gap-2 border border-[#42b960] bg-[#45bf63] px-3 text-[12px] font-medium text-white"
            >
              {datosWispHub.tabla.selectorRegistrosLabel} {pageSize}{' '}
              registros
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {datosWispHub.tabla.botonesExportacion.map((button) => (
              <button
                key={button.id}
                type="button"
                className={`inline-flex h-[33px] items-center justify-center gap-1.5 border px-3 text-[12px] ${obtenerClasesBotonWispHub(
                  button.color,
                )}`}
              >
                {obtenerIconoBotonWispHub(button.icono)}
                {button.etiqueta && <span>{button.etiqueta}</span>}
                {button.variante === 'selector' && (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            ))}

            <span className="ml-1 text-[12px] text-[#20324a]">
              Botones de Acción:
            </span>

            {datosWispHub.tabla.botonesAccion.map((button) => (
              <button
                key={button.id}
                type="button"
                className={`inline-flex ${
                  button.variante === 'boton'
                    ? 'h-[33px] items-center gap-1.5 px-3'
                    : 'h-[33px] w-[36px] items-center justify-center'
                } border text-[12px] ${obtenerClasesBotonWispHub(
                  button.color,
                )}`}
              >
                {obtenerIconoBotonWispHub(button.icono)}
                {button.etiqueta && <span>{button.etiqueta}</span>}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-[13px] font-semibold text-[#17273d]">
            Buscar:
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-[30px] w-[160px] border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none"
            />
          </label>
        </div>

        <div className="border border-[#d7dde5] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-white">
                  <th className="w-[42px] border border-[#d7dde5] px-2 py-2 text-center">
                    <input type="checkbox" disabled className="h-4 w-4" />
                  </th>
                  {datosWispHub.tabla.columnas.map((column) => (
                    <th
                      key={column.clave}
                      className="border border-[#d7dde5] px-3 py-2 text-left font-bold text-[#1b2b41]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.titulo}</span>
                        <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-[#c2cad4]" />
                      </div>
                    </th>
                  ))}
                </tr>
                <tr className="bg-[#fbfcfd]">
                  <th className="border border-[#d7dde5] px-2 py-2 text-center">
                    <button
                      type="button"
                      className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#cfd6df] bg-white text-[12px] text-[#6c7a8d]"
                    >
                      B
                    </button>
                  </th>
                  {datosWispHub.tabla.columnas.map((column) => (
                    <th
                      key={`${column.clave}-filter`}
                      className="border border-[#d7dde5] px-2 py-2"
                    >
                      <input
                        type="text"
                        placeholder={column.placeholderFiltro}
                        className="h-[30px] w-full border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={
                      datosWispHub.tabla.columnas.length + 1
                    }
                    className="border border-[#d7dde5] px-4 py-8 text-center text-[14px] text-[#37485f]"
                  >
                    Ningún dato disponible en esta tabla
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#20324a]">
          <div>
            Mostrando registros del 0 al 0 de un total de 0
            registros
          </div>
          <div className="flex items-center">
            <button
              type="button"
              disabled
              className="h-[34px] border border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] opacity-60"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled
              className="h-[34px] border border-l-0 border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] opacity-60"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
