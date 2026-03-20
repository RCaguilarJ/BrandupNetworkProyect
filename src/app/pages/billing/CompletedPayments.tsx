import { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Download, Filter, Eye, FileText } from 'lucide-react';
import { MOCK_PAYMENTS, MOCK_CLIENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';

export default function CompletedPayments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const allPayments = user?.role === 'super_admin'
    ? MOCK_PAYMENTS
    : MOCK_PAYMENTS.filter(p => p.companyId === user?.companyId);

  const completedPayments = allPayments.filter(p => p.status === 'completed');
  
  const totalCollected = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const todayPayments = completedPayments.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    const paymentDate = p.createdAt.split('T')[0];
    return today === paymentDate;
  });
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Helper function - definida ANTES de usarse en filteredPayments
  const getClientName = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  const getMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'card': 'Tarjeta',
      'online': 'En Línea',
      'check': 'Cheque',
      'deposit': 'Depósito'
    };
    return methods[method] || method;
  };

  const getMethodBadge = (method: string) => {
    const badges: { [key: string]: string } = {
      'cash': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'card': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'online': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      'check': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'deposit': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    };
    const badgeClass = badges[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badgeClass}`}>
        {getMethodLabel(method)}
      </span>
    );
  };

  const getPaymentStatusBadge = () => {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Completado
      </span>
    );
  };

  // Filtrado de pagos - ahora getClientName ya está definido
  const filteredPayments = useMemo(() => {
    return completedPayments.filter(payment => {
      const matchesSearch = getClientName(payment.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (payment.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [completedPayments, searchTerm, methodFilter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Definición de columnas
  const columns: CompactTableColumn<any>[] = [
    {
      key: 'createdAt',
      header: 'Fecha y Hora',
      sortable: true,
      width: '150px',
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
      align: 'center',
      render: (payment) => getMethodBadge(payment.method),
    },
    {
      key: 'reference',
      header: 'Referencia',
      render: (payment) => (
        <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
          {payment.reference || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: () => getPaymentStatusBadge(),
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
            title="Descargar comprobante"
          >
            <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Ver factura"
          >
            <FileText className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredPayments.length / pageSize);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Cobranzas Realizadas"
        stats={[
          { label: 'Total', value: completedPayments.length },
          { label: 'Total Cobrado', value: formatCurrency(totalCollected), color: 'text-green-600 dark:text-green-400' },
          { label: 'Cobrado Hoy', value: formatCurrency(todayTotal), color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Transacciones Hoy', value: todayPayments.length, color: 'text-purple-600 dark:text-purple-400' },
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
              Exportar Reporte
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Descargar Comprobantes
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar pagos..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los métodos</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="card">Tarjeta</option>
            <option value="online">En Línea</option>
            <option value="check">Cheque</option>
            <option value="deposit">Depósito</option>
          </select>
        }
      />

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredPayments}
          keyExtractor={(payment) => payment.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay pagos completados"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredPayments.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
