import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Plus, Download, Filter, Clock, User, Eye, Edit, Calendar } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';
import { useViewTheme } from '../../context/ViewThemeContext';

interface Ticket {
  id: string;
  title: string;
  client: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'abierto' | 'en_proceso' | 'pendiente' | 'resuelto';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Sin conexión a internet desde ayer',
    client: 'Juan Pérez',
    priority: 'alta',
    status: 'abierto',
    category: 'Soporte Técnico',
    createdAt: '2026-03-18T08:30:00',
    updatedAt: '2026-03-18T08:30:00',
    assignedTo: 'Carlos Ramírez'
  },
  {
    id: '2',
    title: 'Velocidad lenta en las mañanas',
    client: 'María González',
    priority: 'media',
    status: 'en_proceso',
    category: 'Soporte Técnico',
    createdAt: '2026-03-18T09:15:00',
    updatedAt: '2026-03-18T10:20:00',
    assignedTo: 'Luis Torres'
  },
  {
    id: '3',
    title: 'Consulta sobre cambio de plan',
    client: 'Pedro Martínez',
    priority: 'baja',
    status: 'pendiente',
    category: 'Comercial',
    createdAt: '2026-03-18T10:45:00',
    updatedAt: '2026-03-18T10:45:00'
  },
  {
    id: '4',
    title: 'Instalación programada para hoy',
    client: 'Ana López',
    priority: 'urgente',
    status: 'abierto',
    category: 'Instalación',
    createdAt: '2026-03-18T07:00:00',
    updatedAt: '2026-03-18T07:00:00',
    assignedTo: 'Pedro Sánchez'
  },
  {
    id: '5',
    title: 'Router no enciende',
    client: 'Roberto García',
    priority: 'alta',
    status: 'en_proceso',
    category: 'Hardware',
    createdAt: '2026-03-18T11:30:00',
    updatedAt: '2026-03-18T12:00:00',
    assignedTo: 'Carlos Ramírez'
  },
  {
    id: '6',
    title: 'Factura duplicada',
    client: 'Diana Fernández',
    priority: 'media',
    status: 'resuelto',
    category: 'Administrativo',
    createdAt: '2026-03-18T08:00:00',
    updatedAt: '2026-03-18T09:30:00',
    assignedTo: 'Laura Mendoza'
  }
];

export default function TodayTickets() {
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(mockTickets.map(t => t.category))), []);

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      baja: { text: 'Baja', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      media: { text: 'Media', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      alta: { text: 'Alta', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      urgente: { text: 'Urgente', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    const badge = badges[priority as keyof typeof badges] || { text: priority, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      abierto: { text: 'Abierto', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      en_proceso: { text: 'En Proceso', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      pendiente: { text: 'Pendiente', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      resuelto: { text: 'Resuelto', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  // Definición de columnas
  const columns: CompactTableColumn<Ticket>[] = [
    {
      key: 'id',
      header: 'Ticket',
      sortable: true,
      width: '100px',
      render: (ticket) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">#{ticket.id}</span>
      ),
    },
    {
      key: 'title',
      header: 'Título',
      sortable: true,
      render: (ticket) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white leading-tight">
            {ticket.title}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            {ticket.category}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{ticket.client}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Prioridad',
      sortable: true,
      align: 'center',
      render: (ticket) => getPriorityBadge(ticket.priority),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (ticket) => getStatusBadge(ticket.status),
    },
    {
      key: 'createdAt',
      header: 'Creado',
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">{formatDateTime(ticket.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Asignado',
      sortable: true,
      render: (ticket) => (
        <span className="text-gray-700 dark:text-gray-300">{ticket.assignedTo || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (ticket) => (
        <div className="flex items-center justify-center gap-1">
          <Link to={`/tickets/${ticket.id}`}>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Ver detalle"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
          <Link to={`/tickets/${ticket.id}/edit`}>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredTickets.length / pageSize);

  return (
    <div className={`themed-view-shell themed-view-shell--${viewTheme} h-full`}>
      <div className="themed-view-shell__orb themed-view-shell__orb--one" />
      <div className="themed-view-shell__orb themed-view-shell__orb--two" />
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Tickets de Hoy"
        stats={[
          { 
            label: 'Total', 
            value: mockTickets.length,
            icon: <Calendar className="w-4 h-4" />,
            color: 'text-blue-600 dark:text-blue-400' 
          },
          { 
            label: 'Abiertos', 
            value: mockTickets.filter(t => t.status === 'abierto').length,
            color: 'text-blue-600 dark:text-blue-400' 
          },
          { 
            label: 'En Proceso', 
            value: mockTickets.filter(t => t.status === 'en_proceso').length,
            color: 'text-yellow-600 dark:text-yellow-400' 
          },
          { 
            label: 'Resueltos', 
            value: mockTickets.filter(t => t.status === 'resuelto').length,
            color: 'text-green-600 dark:text-green-400' 
          },
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
            <Link to="/tickets/new">
              <Button 
                size="sm" 
                className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Nuevo Ticket
              </Button>
            </Link>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar tickets..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="abierto">Abiertos</option>
              <option value="en_proceso">En Proceso</option>
              <option value="pendiente">Pendientes</option>
              <option value="resuelto">Resueltos</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </>
        }
      />

      {/* Tabla compacta */}
      <div className="themed-view-panel bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0 overflow-hidden">
        <CompactTable
          columns={columns}
          data={filteredTickets}
          keyExtractor={(ticket) => ticket.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay tickets para hoy"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredTickets.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
