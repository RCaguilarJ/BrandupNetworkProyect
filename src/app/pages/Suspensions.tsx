import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Zap, AlertTriangle, CheckCircle, Clock, Filter, Download } from 'lucide-react';
import { MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';
import { ThemedViewPanel, ThemedViewShell } from '../components/ThemedViewShell';

export default function Suspensions() {
  const { user } = useAuth();
  const [actionType, setActionType] = useState<'suspend' | 'reactivate'>('suspend');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('balance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const clients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const overdueClients = clients.filter(c => c.status === 'overdue');
  const suspendedClients = clients.filter(c => c.status === 'suspended');
  const activeClients = clients.filter(c => c.status === 'active');

  const currentClients = actionType === 'suspend' ? overdueClients : suspendedClients;

  const filteredClients = currentClients.filter(client => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  const toggleSelect = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      overdue: { text: 'Moroso', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      suspended: { text: 'Suspendido', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  // Definición de columnas
  const columns: CompactTableColumn<any>[] = [
    {
      key: 'select',
      header: '',
      width: '40px',
      render: (client) => (
        <input
          type="checkbox"
          checked={selectedClients.includes(client.id)}
          onChange={() => toggleSelect(client.id)}
          className="rounded border-gray-300 dark:border-gray-600"
        />
      ),
    },
    {
      key: 'name',
      header: 'Cliente',
      sortable: true,
      render: (client) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white leading-tight">
            {client.name}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            {client.email}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (client) => (
        <span className="text-gray-700 dark:text-gray-300">{client.phone}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Saldo Pendiente',
      sortable: true,
      align: 'right',
      render: (client) => (
        <span className="font-medium text-red-600 dark:text-red-400">
          {formatCurrency(client.balance)}
        </span>
      ),
    },
    {
      key: 'lastPayment',
      header: 'Último Pago',
      sortable: true,
      render: (client) => (
        <span className="text-gray-600 dark:text-gray-400">
          {client.lastPayment ? formatDate(client.lastPayment) : 'Sin pagos'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (client) => getStatusBadge(client.status),
    },
    {
      key: 'actions',
      header: 'Acción',
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center">
          {actionType === 'suspend' ? (
            <Button 
              size="sm" 
              className="h-7 text-xs px-3 bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-black"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 dark:stroke-black" />
              Suspender
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="h-7 text-xs px-3 bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 dark:text-black"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 dark:stroke-black" />
              Reactivar
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredClients.length / pageSize);

  return (
    <ThemedViewShell
      eyebrow="Automatizacion de cartera"
      title="Cortes y Reactivaciones"
      description="La capa visual de la pantalla cambia por tema, mientras la tabla sigue siendo el nucleo operativo para seleccionar clientes, ejecutar cortes y controlar reactivaciones."
      stats={[
        {
          label: 'Morosos',
          value: overdueClients.length,
          helper: 'Pendientes por cortar',
          icon: <AlertTriangle className="w-5 h-5" />,
          tone: 'danger',
        },
        {
          label: 'Suspendidos',
          value: suspendedClients.length,
          helper: 'Servicios detenidos',
          icon: <Zap className="w-5 h-5" />,
          tone: 'warning',
        },
        {
          label: 'Activos',
          value: activeClients.length,
          helper: 'Base al corriente',
          icon: <CheckCircle className="w-5 h-5" />,
          tone: 'success',
        },
        {
          label: 'Seleccionados',
          value: selectedClients.length,
          helper: actionType === 'suspend' ? 'Listos para suspender' : 'Listos para reactivar',
          icon: <Clock className="w-5 h-5" />,
          tone: 'primary',
        },
      ]}
    >
      <ThemedViewPanel className="overflow-hidden">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Cortes y Reactivaciones"
        stats={[
          { label: 'Morosos', value: overdueClients.length, color: 'text-red-600 dark:text-red-400' },
          { label: 'Suspendidos', value: suspendedClients.length, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Activos', value: activeClients.length, color: 'text-green-600 dark:text-green-400' },
          { label: 'Programados Hoy', value: 0, color: 'text-blue-600 dark:text-blue-400' },
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Políticas
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar
            </Button>
            {actionType === 'suspend' ? (
              <Button 
                size="sm" 
                className="h-8 text-xs px-3 bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-black"
                disabled={selectedClients.length === 0}
              >
                <Zap className="w-3.5 h-3.5 mr-1.5 dark:stroke-black" />
                Suspender Seleccionados ({selectedClients.length})
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 dark:text-black"
                disabled={selectedClients.length === 0}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5 dark:stroke-black" />
                Reactivar Seleccionados ({selectedClients.length})
              </Button>
            )}
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar clientes..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-0">
        <nav className="flex gap-6">
          <button
            onClick={() => setActionType('suspend')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              actionType === 'suspend'
                ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Clientes para Suspender ({overdueClients.length})
          </button>
          <button
            onClick={() => setActionType('reactivate')}
            className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
              actionType === 'reactivate'
                ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Clientes Suspendidos ({suspendedClients.length})
          </button>
        </nav>
      </div>

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 m-0">
        {/* Checkbox selector de todos */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span>Seleccionar todos ({filteredClients.length})</span>
          </label>
        </div>

        <CompactTable
          columns={columns}
          data={filteredClients}
          keyExtractor={(client) => client.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage={actionType === 'suspend' ? 'No hay clientes morosos' : 'No hay clientes suspendidos'}
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredClients.length}
          onPageChange={setCurrentPage}
        />
      </div>
      </ThemedViewPanel>
    </ThemedViewShell>
  );
}
