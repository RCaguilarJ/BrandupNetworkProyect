import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  FileText, 
  Download, 
  Send, 
  Filter, 
  Eye, 
  Mail,
  Settings,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Info,
  CreditCard
} from 'lucide-react';
import { MOCK_INVOICES, MOCK_CLIENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';

export default function Invoices() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('31/03/2026');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filtrar datos según el usuario
  const invoices = user?.role === 'super_admin'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(i => i.companyId === user?.companyId);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, isMikrosystem: boolean) => {
    if (isMikrosystem) {
      const badges = {
        paid: { text: 'PAGADO', class: 'bg-green-600 text-white' },
        pending: { text: 'PENDIENTE', class: 'bg-orange-500 text-white' },
        overdue: { text: 'VENCIDO', class: 'bg-red-600 text-white' },
        cancelled: { text: 'CANCELADO', class: 'bg-gray-600 text-white' },
      };
      const badge = badges[status as keyof typeof badges] || { text: status.toUpperCase(), class: 'bg-gray-600 text-white' };
      return (
        <Badge className={`${badge.class} border-0 text-xs font-bold px-2 py-0.5 rounded`}>
          {badge.text}
        </Badge>
      );
    } else {
      const badges = {
        paid: { text: 'Pagada', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        pending: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        overdue: { text: 'Vencida', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
        cancelled: { text: 'Cancelada', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calcular métricas
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  // Calcular resumen por estado para Mikrosystem
  const paidInvoices = filteredInvoices.filter(i => i.status === 'paid');
  const pendingInvoices = filteredInvoices.filter(i => i.status === 'pending');
  const overdueInvoices = filteredInvoices.filter(i => i.status === 'overdue');
  const cancelledInvoices = filteredInvoices.filter(i => i.status === 'cancelled');

  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalCancelled = cancelledInvoices.reduce((sum, i) => sum + i.amount, 0);
  const grandTotal = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Impuestos (16%)
  const taxPaid = totalPaid * 0.16;
  const taxPending = totalPending * 0.16;
  const taxOverdue = totalOverdue * 0.16;
  const taxCancelled = totalCancelled * 0.16;
  const taxTotal = grandTotal * 0.16;

  // Si es tema Mikrosystem, mostrar diseño con header azul y tabla con bordes
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        {/* Header azul brillante */}
        <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">Lista de Facturas</h1>
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
            {/* Filtro de fecha */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">Período</label>
              <select className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option>Emisión</option>
                <option>Vencimiento</option>
                <option>Pago</option>
              </select>
            </div>

            {/* Rango de fechas */}
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

            {/* Filtro Estado */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Cualquiera</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
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
            {/* Selector de registros */}
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

            {/* Vista lista/grid */}
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

            {/* Herramientas */}
            <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400">Herramientas</span>
          </div>

          {/* Búsqueda */}
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
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    F. PAGADO
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                    TOTAL
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
                {filteredInvoices.slice(0, pageSize).map((invoice, index) => (
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
                    <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                      {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                    </td>
                    <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-right font-medium text-gray-900 dark:text-white">
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
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Descargar">
                          <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Email">
                          <Mail className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <th className="text-left px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">ESTADO</th>
                <th className="text-center px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">CANTIDAD</th>
                <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">IMPUESTO</th>
                <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {/* Pagadas */}
              <tr className="bg-green-100 dark:bg-green-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Pagadas</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{paidInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxPaid)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalPaid)}</td>
              </tr>

              {/* Pendientes */}
              <tr className="bg-orange-100 dark:bg-orange-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Pendientes</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{pendingInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxPending)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalPending)}</td>
              </tr>

              {/* Vencidas */}
              <tr className="bg-red-100 dark:bg-red-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Vencidas</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{overdueInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxOverdue)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalOverdue)}</td>
              </tr>

              {/* Canceladas */}
              <tr className="bg-gray-100 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">Canceladas</td>
                <td className="px-4 py-2.5 text-center font-medium text-gray-900 dark:text-white">{cancelledInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(taxCancelled)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(totalCancelled)}</td>
              </tr>

              {/* TOTALES */}
              <tr className="bg-blue-100 dark:bg-blue-900/30">
                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white uppercase">TOTALES</td>
                <td className="px-4 py-2.5 text-center font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(taxTotal)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-blue-700 dark:text-blue-400">{formatCurrency(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Si es tema WispHub, mostrar diseño con CompactTable
  const invoiceColumns: CompactTableColumn<any>[] = [
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
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (invoice) => getStatusBadge(invoice.status, false),
    },
    {
      key: 'paidAt',
      header: 'Pagado',
      render: (invoice) => (
        <div>
          <div className="text-gray-600 dark:text-gray-400">
            {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
          </div>
          {invoice.paymentMethod && (
            <div className="text-gray-500 dark:text-gray-500 capitalize text-xs">
              {invoice.paymentMethod}
            </div>
          )}
        </div>
      ),
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
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Descargar PDF"
          >
            <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Enviar por email"
          >
            <Mail className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Lista de Facturas"
        stats={[
          { label: 'Ingresos', value: formatCurrency(totalRevenue), color: 'text-green-600 dark:text-green-400' },
          { label: 'Vencidas', value: formatCurrency(overdueAmount), color: 'text-red-600 dark:text-red-400' },
          { label: 'Por Cobrar', value: formatCurrency(pendingAmount), color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Total', value: invoices.length },
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filtros
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Enviar Recordatorios
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Generar Facturas
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar facturas..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        }
      />

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={invoiceColumns}
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay facturas para mostrar"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredInvoices.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
