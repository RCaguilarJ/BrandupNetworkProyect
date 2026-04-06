import { useState } from 'react';
import { Button } from '../components/ui/button';
import { FileText, Download, Send, Filter, Eye, Mail } from 'lucide-react';
import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';

export default function Billing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar datos según el usuario
  const invoices = user?.role === 'super_admin'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(i => i.companyId === user?.companyId);

  const payments = user?.role === 'super_admin'
    ? MOCK_PAYMENTS
    : MOCK_PAYMENTS.filter(p => p.companyId === user?.companyId);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = getClientName(payment.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
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
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      completed: { text: 'Completado', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      pending: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      failed: { text: 'Fallido', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
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

  // Columnas de facturas
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
      render: (invoice) => getStatusBadge(invoice.status),
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

  // Columnas de pagos
  const paymentColumns: CompactTableColumn<any>[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      sortable: true,
      width: '140px',
      render: (payment) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDateTime(payment.createdAt)}</span>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
      render: (payment) => (
        <span className="text-gray-700 dark:text-gray-300">{getClientName(payment.clientId)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      align: 'right',
      render: (payment) => (
        <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      key: 'method',
      header: 'Método',
      sortable: true,
      render: (payment) => (
        <span className="text-gray-700 dark:text-gray-300 capitalize">{payment.method}</span>
      ),
    },
    {
      key: 'reference',
      header: 'Referencia',
      render: (payment) => (
        <span className="text-gray-600 dark:text-gray-400">{payment.reference || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (payment) => getPaymentStatusBadge(payment.status),
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
            title="Descargar recibo"
          >
            <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const currentData = activeTab === 'invoices' ? filteredInvoices : filteredPayments;
  const totalPages = Math.ceil(currentData.length / pageSize);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Facturación y Cobranza"
        stats={[
          { label: 'Ingresos', value: formatCurrency(totalRevenue), color: 'text-green-600 dark:text-green-400' },
          { label: 'Vencidas', value: formatCurrency(overdueAmount), color: 'text-red-600 dark:text-red-400' },
          { label: 'Por Cobrar', value: formatCurrency(pendingAmount), color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Pagos', value: payments.length },
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
        searchPlaceholder={activeTab === 'invoices' ? 'Buscar facturas...' : 'Buscar pagos...'}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <>
            {activeTab === 'invoices' && (
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
            )}
          </>
        }
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-0">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Facturas ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Pagos ({payments.length})
          </button>
        </nav>
      </div>

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={activeTab === 'invoices' ? invoiceColumns : paymentColumns}
          data={currentData}
          keyExtractor={(item) => item.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage={activeTab === 'invoices' ? 'No hay facturas para mostrar' : 'No hay pagos para mostrar'}
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={currentData.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
