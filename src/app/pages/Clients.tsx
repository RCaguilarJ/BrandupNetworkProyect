import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Search, Download, Filter, ChevronUp, ChevronDown, MapPin, Phone, Mail, Eye, Edit, Trash2 } from 'lucide-react';
import { MOCK_CLIENTS, MOCK_PLANS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { useNavigate } from 'react-router';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';
import { useViewTheme } from '../context/ViewThemeContext';

export default function Clients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtrar clientes según el rol del usuario
  const userClients = user?.role === 'super_admin' 
    ? MOCK_CLIENTS 
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const filteredClients = userClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtrar planes según el usuario
  const availablePlans = user?.role === 'super_admin'
    ? MOCK_PLANS
    : MOCK_PLANS.filter(p => p.companyId === user?.companyId);

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Activo', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      suspended: { text: 'Suspendido', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      overdue: { text: 'Moroso', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      cancelled: { text: 'Cancelado', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getPlanName = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId);
    return plan ? `${plan.name} - ${plan.speed}` : 'N/A';
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Estadísticas compactas
  const stats = {
    activos: userClients.filter(c => c.status === 'active').length,
    suspendidos: userClients.filter(c => c.status === 'suspended').length,
    morosos: userClients.filter(c => c.status === 'overdue').length,
    total: formatCurrency(userClients.reduce((sum, c) => sum + c.balance, 0))
  };

  // Definir columnas para CompactTable
  const columns: CompactTableColumn<typeof MOCK_CLIENTS[0]>[] = [
    {
      key: 'name',
      header: 'Cliente',
      sortable: true,
      render: (client) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white leading-tight">
            {client.name}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-xs">{client.address}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contacto',
      render: (client) => (
        <div>
          <div className="text-gray-700 dark:text-gray-300 leading-tight flex items-center gap-1">
            <Mail className="w-3 h-3 text-gray-400" />
            {client.email}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5 flex items-center gap-1">
            <Phone className="w-3 h-3 text-gray-400" />
            {client.phone}
          </div>
        </div>
      )
    },
    {
      key: 'planId',
      header: 'Plan',
      sortable: true,
      render: (client) => (
        <span className="text-gray-700 dark:text-gray-300">{getPlanName(client.planId)}</span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      sortable: true,
      render: (client) => getStatusBadge(client.status)
    },
    {
      key: 'balance',
      header: 'Saldo',
      align: 'right',
      sortable: true,
      render: (client) => (
        <span className={`font-medium ${
          client.balance > 0 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-green-600 dark:text-green-400'
        }`}>
          {formatCurrency(client.balance)}
        </span>
      )
    },
    {
      key: 'lastPayment',
      header: 'Último Pago',
      sortable: true,
      render: (client) => (
        <span className="text-gray-600 dark:text-gray-400">
          {client.lastPayment ? formatDate(client.lastPayment) : 'Sin pagos'}
        </span>
      )
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
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(filteredClients.length / pageSize);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <CompactTableToolbar
        title="Gestión de Clientes"
        stats={[
          { label: 'Total', value: filteredClients.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Activos', value: stats.activos, color: 'text-green-600 dark:text-green-400' },
          { label: 'Suspendidos', value: stats.suspendidos, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Morosos', value: stats.morosos, color: 'text-red-600 dark:text-red-400' },
          { label: 'Cartera', value: stats.total }
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar cliente..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`h-7 px-3 rounded text-xs focus:ring-1 ${
              viewTheme === 'wisphub'
                ? 'bg-white/10 hover:bg-white/20 text-white border-0 focus:ring-green-300'
                : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500'
            }`}
            style={viewTheme === 'wisphub' ? { fontSize: '11px' } : undefined}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
            <option value="overdue">Morosos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        }
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-7 text-xs px-3 ${
                viewTheme === 'wisphub'
                  ? 'bg-white/10 hover:bg-white/20 text-white border-0'
                  : ''
              }`}
              onClick={() => navigate('/clients/map')}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              Mapa
            </Button>
            <Button 
              size="sm" 
              className={`h-7 text-xs px-3 ${
                viewTheme === 'wisphub'
                  ? 'bg-white text-green-600 hover:bg-white/90 border-0'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
              }`}
              onClick={() => navigate('/clients/new')}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo Cliente
            </Button>
          </>
        }
      />

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          keyExtractor={(client) => client.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          emptyMessage="No hay clientes para mostrar"
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
    </div>
  );
}