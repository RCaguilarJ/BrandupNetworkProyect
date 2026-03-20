import { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Calendar, Download, Filter, Eye, Edit, CheckCircle, List, ChevronLeft, ChevronRight, Settings, Trash2, AlertCircle } from 'lucide-react';
import { MOCK_CLIENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';
import { ThemedViewPanel, ThemedViewShell } from '../../components/ThemedViewShell';

interface PaymentPromise {
  id: string;
  clientId: string;
  amount: number;
  promiseDate: string;
  createdAt: string;
  status: 'pending' | 'fulfilled' | 'broken';
  notes?: string;
  invoiceId?: string;
}

const MOCK_PROMISES: PaymentPromise[] = [
  {
    id: '1',
    clientId: '1',
    amount: 999,
    promiseDate: '2026-03-20',
    createdAt: '2026-03-15',
    status: 'pending',
    notes: 'Cliente confirma pago por transferencia el día 20',
    invoiceId: 'INV-2026-001'
  },
  {
    id: '2',
    clientId: '3',
    amount: 1500,
    promiseDate: '2026-03-18',
    createdAt: '2026-03-10',
    status: 'fulfilled',
    notes: 'Pago realizado según lo acordado',
    invoiceId: 'INV-2026-003'
  },
  {
    id: '3',
    clientId: '5',
    amount: 799,
    promiseDate: '2026-03-15',
    createdAt: '2026-03-08',
    status: 'broken',
    notes: 'Cliente no cumplió con la promesa',
    invoiceId: 'INV-2026-005'
  },
  {
    id: '4',
    clientId: '7',
    amount: 2500,
    promiseDate: '2026-03-22',
    createdAt: '2026-03-14',
    status: 'pending',
    notes: 'Promesa de pago por efectivo',
    invoiceId: 'INV-2026-007'
  },
  {
    id: '5',
    clientId: '9',
    amount: 1200,
    promiseDate: '2026-03-19',
    createdAt: '2026-03-12',
    status: 'pending',
    notes: 'Cliente esperando depósito de su empresa',
    invoiceId: 'INV-2026-009'
  },
];

export default function Promises() {
  const { user } = useAuth();
  const { theme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('promiseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Helper functions - declaradas ANTES de usar
  const getClientName = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  const getDaysUntil = (date: string) => {
    const promise = new Date(date);
    const today = new Date();
    const diff = Math.floor((promise.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      fulfilled: { text: 'Cumplida', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      broken: { text: 'Incumplida', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtros y datos calculados usando useMemo para garantizar el orden correcto
  const filteredPromises = useMemo(() => {
    return MOCK_PROMISES.filter(promise => {
      const matchesSearch = getClientName(promise.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (promise.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (promise.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || promise.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const { pendingPromises, fulfilledPromises, brokenPromises, fulfillmentRate } = useMemo(() => {
    const pending = MOCK_PROMISES.filter(p => p.status === 'pending');
    const fulfilled = MOCK_PROMISES.filter(p => p.status === 'fulfilled');
    const broken = MOCK_PROMISES.filter(p => p.status === 'broken');
    
    const rate = MOCK_PROMISES.length > 0 
      ? ((fulfilled.length / (fulfilled.length + broken.length)) * 100).toFixed(0)
      : '0';
    
    return {
      pendingPromises: pending,
      fulfilledPromises: fulfilled,
      brokenPromises: broken,
      fulfillmentRate: rate
    };
  }, []);

  // Definición de columnas
  const columns: CompactTableColumn<PaymentPromise>[] = [
    {
      key: 'invoiceId',
      header: 'Factura',
      sortable: true,
      width: '120px',
      render: (promise) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">{promise.invoiceId}</span>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
      render: (promise) => (
        <span className="text-gray-700 dark:text-gray-300">{getClientName(promise.clientId)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      align: 'right',
      render: (promise) => (
        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(promise.amount)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creada',
      sortable: true,
      render: (promise) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDate(promise.createdAt)}</span>
      ),
    },
    {
      key: 'promiseDate',
      header: 'Fecha Promesa',
      sortable: true,
      render: (promise) => {
        const days = getDaysUntil(promise.promiseDate);
        return (
          <div>
            <div className="text-gray-700 dark:text-gray-300">{formatDate(promise.promiseDate)}</div>
            {promise.status === 'pending' && (
              <div className={`text-xs mt-0.5 ${days < 0 ? 'text-red-600 dark:text-red-400' : days <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {days < 0 ? `${Math.abs(days)} días atrasado` : days === 0 ? 'Hoy' : `${days} días`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'notes',
      header: 'Notas',
      render: (promise) => (
        <span className="text-gray-600 dark:text-gray-400 text-xs truncate max-w-xs block">
          {promise.notes || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (promise) => getStatusBadge(promise.status),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (promise) => (
        <div className="flex items-center justify-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Ver detalle"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          {promise.status === 'pending' && (
            <>
              <button 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Editar"
              >
                <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                title="Marcar como cumplida"
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredPromises.length / pageSize);

  return (
    <ThemedViewShell
      eyebrow="Cobranza inteligente"
      title="Promesas de Pago"
      description="El mismo concentrado operativo ahora se presenta con dos lenguajes visuales distintos: Mikrosystem mas ejecutivo y Wisphub mas contemporaneo, sin tocar la estructura de la tabla."
      stats={[
        {
          label: 'Pendientes',
          value: pendingPromises.length,
          helper: 'Seguimiento activo',
          icon: <Calendar className="w-5 h-5" />,
          tone: 'warning',
        },
        {
          label: 'Cumplidas',
          value: fulfilledPromises.length,
          helper: 'Compromisos cerrados',
          icon: <CheckCircle className="w-5 h-5" />,
          tone: 'success',
        },
        {
          label: 'Incumplidas',
          value: brokenPromises.length,
          helper: 'Casos por revisar',
          icon: <AlertCircle className="w-5 h-5" />,
          tone: 'danger',
        },
        {
          label: 'Cumplimiento',
          value: `${fulfillmentRate}%`,
          helper: 'Indice global',
          icon: <List className="w-5 h-5" />,
          tone: 'primary',
        },
      ]}
    >
      <ThemedViewPanel className="overflow-hidden">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Promesas de Pago"
        stats={[
          { label: 'Total', value: MOCK_PROMISES.length },
          { label: 'Pendientes', value: pendingPromises.length, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Cumplidas', value: fulfilledPromises.length, color: 'text-green-600 dark:text-green-400' },
          { label: 'Tasa Cumplimiento', value: `${fulfillmentRate}%`, color: 'text-blue-600 dark:text-blue-400' },
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
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Ver Calendario
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nueva Promesa
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar promesas..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="fulfilled">Cumplidas</option>
            <option value="broken">Incumplidas</option>
          </select>
        }
      />

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredPromises}
          keyExtractor={(promise) => promise.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay promesas de pago registradas"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredPromises.length}
          onPageChange={setCurrentPage}
        />
      </div>
      </ThemedViewPanel>
    </ThemedViewShell>
  );
}
