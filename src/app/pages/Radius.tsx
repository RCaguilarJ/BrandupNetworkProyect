import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Shield, User, Key, Activity, Eye, Edit, Plus } from 'lucide-react';
import { MOCK_CLIENTS, MOCK_PLANS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';
import { ThemedViewPanel, ThemedViewShell } from '../components/ThemedViewShell';

export default function Radius() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const clients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const getPlanSpeed = (planId: string) => {
    const plan = MOCK_PLANS.find(p => p.id === planId);
    return plan?.speed || 'N/A';
  };

  const filteredClients = clients.filter(client => {
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

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Activo', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      suspended: { text: 'Bloqueado', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      overdue: { text: 'Moroso', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
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
      key: 'username',
      header: 'Usuario RADIUS',
      sortable: true,
      width: '200px',
      render: (client) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">
          {client.email.split('@')[0]}
        </span>
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
      key: 'plan',
      header: 'Perfil/Velocidad',
      sortable: true,
      render: (client) => (
        <span className="text-gray-700 dark:text-gray-300">{getPlanSpeed(client.planId)}</span>
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
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const activeSessions = clients.filter(c => c.status === 'active').length;
  const blockedClients = clients.filter(c => c.status === 'suspended').length;

  return (
    <ThemedViewShell
      eyebrow="Autenticacion y acceso"
      title="Autenticacion RADIUS"
      description="El modulo conserva su lectura operativa, pero cada tema ahora proyecta una personalidad distinta para que la presentacion no repita el mismo patron visual."
      stats={[
        {
          label: 'Usuarios',
          value: clients.length,
          helper: 'Credenciales activas',
          icon: <User className="w-5 h-5" />,
          tone: 'primary',
        },
        {
          label: 'Sesiones',
          value: activeSessions,
          helper: 'Acceso permitido',
          icon: <Activity className="w-5 h-5" />,
          tone: 'success',
        },
        {
          label: 'Bloqueados',
          value: blockedClients,
          helper: 'Accion requerida',
          icon: <Shield className="w-5 h-5" />,
          tone: 'danger',
        },
        {
          label: 'Perfiles',
          value: MOCK_PLANS.length,
          helper: 'Planes configurados',
          icon: <Key className="w-5 h-5" />,
          tone: 'neutral',
        },
      ]}
    >
      <ThemedViewPanel className="overflow-hidden">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Autenticación RADIUS"
        stats={[
          { 
            label: 'Usuarios', 
            value: clients.length, 
            icon: <User className="w-4 h-4" />,
            color: 'text-blue-600 dark:text-blue-400' 
          },
          { 
            label: 'Sesiones Activas', 
            value: activeSessions, 
            icon: <Activity className="w-4 h-4" />,
            color: 'text-green-600 dark:text-green-400' 
          },
          { 
            label: 'Bloqueados', 
            value: blockedClients, 
            icon: <Shield className="w-4 h-4" />,
            color: 'text-red-600 dark:text-red-400' 
          },
          { 
            label: 'Perfiles', 
            value: MOCK_PLANS.length, 
            icon: <Key className="w-4 h-4" />,
            color: 'text-purple-600 dark:text-purple-400' 
          },
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Key className="w-3.5 h-3.5 mr-1.5" />
              Configurar Servidor
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Agregar Perfil
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar usuarios..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredClients}
          keyExtractor={(client) => client.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay usuarios RADIUS registrados"
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
