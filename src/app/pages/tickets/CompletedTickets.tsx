import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Plus, Download, Filter, CheckCircle2, User, Clock, Star, Eye, List, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { useViewTheme } from '../../context/ViewThemeContext';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';

interface Ticket {
  id: string;
  title: string;
  client: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  category: string;
  createdAt: string;
  resolvedAt: string;
  assignedTo: string;
  resolutionTime: string;
  satisfaction?: number;
}

const mockTickets: Ticket[] = [
  {
    id: '201',
    title: 'Instalación completada exitosamente',
    client: 'Ricardo Navarro',
    priority: 'alta',
    category: 'Instalación',
    createdAt: '2026-02-10T08:00:00',
    resolvedAt: '2026-02-11T10:30:00',
    assignedTo: 'Carlos Ramírez',
    resolutionTime: '1d 2h',
    satisfaction: 5
  },
  {
    id: '202',
    title: 'Problema de velocidad resuelto',
    client: 'Daniela Flores',
    priority: 'media',
    category: 'Soporte Técnico',
    createdAt: '2026-02-11T06:15:00',
    resolvedAt: '2026-02-11T09:45:00',
    assignedTo: 'Luis Torres',
    resolutionTime: '3h 30m',
    satisfaction: 4
  },
  {
    id: '203',
    title: 'Factura enviada correctamente',
    client: 'Fernando Castro',
    priority: 'baja',
    category: 'Administrativo',
    createdAt: '2026-02-11T07:00:00',
    resolvedAt: '2026-02-11T07:45:00',
    assignedTo: 'Laura Mendoza',
    resolutionTime: '45m',
    satisfaction: 5
  },
  {
    id: '204',
    title: 'Cambio de plan procesado',
    client: 'Gabriela Soto',
    priority: 'media',
    category: 'Comercial',
    createdAt: '2026-02-10T14:20:00',
    resolvedAt: '2026-02-11T11:00:00',
    assignedTo: 'Ana García',
    resolutionTime: '20h 40m',
    satisfaction: 5
  },
  {
    id: '205',
    title: 'Router reemplazado',
    client: 'Héctor Vega',
    priority: 'alta',
    category: 'Hardware',
    createdAt: '2026-02-10T09:30:00',
    resolvedAt: '2026-02-11T08:15:00',
    assignedTo: 'Pedro Sánchez',
    resolutionTime: '22h 45m',
    satisfaction: 4
  },
  {
    id: '206',
    title: 'Configuración WiFi actualizada',
    client: 'Isabel Romero',
    priority: 'baja',
    category: 'Soporte Técnico',
    createdAt: '2026-02-11T10:00:00',
    resolvedAt: '2026-02-11T10:30:00',
    assignedTo: 'Luis Torres',
    resolutionTime: '30m',
    satisfaction: 5
  },
  {
    id: '207',
    title: 'Consulta técnica respondida',
    client: 'Javier Méndez',
    priority: 'baja',
    category: 'Consulta',
    createdAt: '2026-02-10T16:45:00',
    resolvedAt: '2026-02-11T09:00:00',
    assignedTo: 'Carlos Ramírez',
    resolutionTime: '16h 15m'
  },
  {
    id: '208',
    title: 'Antena reubicada correctamente',
    client: 'Karen Ortiz',
    priority: 'urgente',
    category: 'Instalación',
    createdAt: '2026-02-09T11:00:00',
    resolvedAt: '2026-02-11T10:00:00',
    assignedTo: 'Pedro Sánchez',
    resolutionTime: '1d 23h',
    satisfaction: 3
  }
];

export default function CompletedTickets() {
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('resolvedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(mockTickets.map(t => t.category))), []);
  
  const avgSatisfaction = useMemo(() => {
    const withSatisfaction = mockTickets.filter(t => t.satisfaction);
    return withSatisfaction.length > 0
      ? withSatisfaction.reduce((sum, t) => sum + (t.satisfaction || 0), 0) / withSatisfaction.length
      : 0;
  }, []);

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    return matchesSearch && matchesCategory;
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
      key: 'resolutionTime',
      header: 'Tiempo',
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{ticket.resolutionTime}</span>
        </div>
      ),
    },
    {
      key: 'resolvedAt',
      header: 'Resuelto',
      sortable: true,
      render: (ticket) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDateTime(ticket.resolvedAt)}</span>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Asignado',
      sortable: true,
      render: (ticket) => (
        <span className="text-gray-700 dark:text-gray-300">{ticket.assignedTo}</span>
      ),
    },
    {
      key: 'satisfaction',
      header: 'Satisfacción',
      align: 'center',
      render: (ticket) => (
        ticket.satisfaction ? (
          <div className="flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < ticket.satisfaction!
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (ticket) => (
        <div className="flex items-center justify-center">
          <Link to={`/tickets/${ticket.id}/edit`}>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Ver detalle"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
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
        title="Tickets Finalizados"
        stats={[
          { 
            label: 'Total', 
            value: mockTickets.length,
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: 'text-green-600 dark:text-green-400' 
          },
          { 
            label: 'Hoy', 
            value: mockTickets.filter(t => new Date(t.resolvedAt).toDateString() === new Date().toDateString()).length,
            color: 'text-blue-600 dark:text-blue-400' 
          },
          { 
            label: 'Satisfacción', 
            value: avgSatisfaction.toFixed(1),
            icon: <Star className="w-4 h-4" />,
            color: 'text-yellow-600 dark:text-yellow-400' 
          },
          { 
            label: 'Con Valoración', 
            value: mockTickets.filter(t => t.satisfaction).length,
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
          emptyMessage="No hay tickets finalizados"
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
