import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { 
  Plus, 
  Download, 
  Filter, 
  AlertTriangle, 
  Clock, 
  User, 
  Eye, 
  Edit, 
  Settings, 
  List, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { useViewTheme } from '../../context/ViewThemeContext';
import { MOCK_TICKETS, MOCK_CLIENTS } from '../../data/mockData';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../../components/CompactTable';

interface Ticket {
  id: string;
  title: string;
  client: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'abierto' | 'en_proceso' | 'pendiente';
  category: string;
  createdAt: string;
  dueDate: string;
  assignedTo?: string;
  daysOverdue: number;
}

const mockTickets: Ticket[] = [
  {
    id: '101',
    title: 'Instalación pendiente hace 5 días',
    client: 'Sofía Ramírez',
    priority: 'urgente',
    status: 'pendiente',
    category: 'Instalación',
    createdAt: '2026-02-06T10:00:00',
    dueDate: '2026-02-08T18:00:00',
    assignedTo: 'Carlos Ramírez',
    daysOverdue: 3
  },
  {
    id: '102',
    title: 'Problema de conexión sin resolver',
    client: 'Miguel Ángel Torres',
    priority: 'alta',
    status: 'en_proceso',
    category: 'Soporte Técnico',
    createdAt: '2026-02-07T14:30:00',
    dueDate: '2026-02-09T18:00:00',
    assignedTo: 'Luis Torres',
    daysOverdue: 2
  },
  {
    id: '103',
    title: 'Actualización de equipo solicitada',
    client: 'Carmen Ruiz',
    priority: 'media',
    status: 'abierto',
    category: 'Hardware',
    createdAt: '2026-02-08T09:15:00',
    dueDate: '2026-02-10T18:00:00',
    assignedTo: 'Pedro Sánchez',
    daysOverdue: 1
  },
  {
    id: '104',
    title: 'Cambio de plan no procesado',
    client: 'Laura Hernández',
    priority: 'alta',
    status: 'pendiente',
    category: 'Comercial',
    createdAt: '2026-02-05T16:45:00',
    dueDate: '2026-02-07T18:00:00',
    assignedTo: 'Ana García',
    daysOverdue: 4
  },
  {
    id: '105',
    title: 'Reubicación de antena atrasada',
    client: 'José Luis Morales',
    priority: 'urgente',
    status: 'en_proceso',
    category: 'Instalación',
    createdAt: '2026-02-04T11:20:00',
    dueDate: '2026-02-06T18:00:00',
    assignedTo: 'Carlos Ramírez',
    daysOverdue: 5
  },
  {
    id: '106',
    title: 'Intermitencia en señal',
    client: 'Patricia Moreno',
    priority: 'media',
    status: 'abierto',
    category: 'Soporte Técnico',
    createdAt: '2026-02-09T08:00:00',
    dueDate: '2026-02-10T18:00:00',
    assignedTo: 'Luis Torres',
    daysOverdue: 1
  }
];

export default function OverdueTickets() {
  const { viewTheme } = useViewTheme();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'closed'>('overdue');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<string>('daysOverdue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(mockTickets.map(t => t.category))), []);

  // Obtener tickets reales de MOCK_TICKETS
  const realOverdueTickets = MOCK_TICKETS.filter(t => t.status === 'in_progress');

  const getTicketsByTab = () => {
    if (activeTab === 'today') {
      const today = new Date('2026-03-19').toDateString();
      return MOCK_TICKETS.filter(t => 
        t.status === 'open' && 
        new Date(t.createdAt).toDateString() === today
      );
    } else if (activeTab === 'overdue') {
      return realOverdueTickets;
    } else {
      return MOCK_TICKETS.filter(t => t.status === 'resolved' || t.status === 'closed');
    }
  };

  const filteredTickets = getTicketsByTab().filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getClientName = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  const getDepartmentBadge = (type: string) => {
    const types = {
      no_service: { text: 'VENTAS', class: 'bg-emerald-100 text-emerald-700 border border-emerald-300' },
      intermittent: { text: 'SOPORTE TÉCNICO', class: 'bg-blue-100 text-blue-700 border border-blue-300' },
      billing: { text: 'VENTAS', class: 'bg-emerald-100 text-emerald-700 border border-emerald-300' },
      installation: { text: 'SOPORTE TÉCNICO', class: 'bg-blue-100 text-blue-700 border border-blue-300' },
      other: { text: 'SOPORTE TÉCNICO', class: 'bg-blue-100 text-blue-700 border border-blue-300' },
    };
    const badge = types[type as keyof typeof types] || { text: 'SOPORTE TÉCNICO', class: 'bg-blue-100 text-blue-700' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      baja: { text: 'Baja', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      media: { text: 'Media', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      alta: { text: 'Alta', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      urgente: { text: 'Urgente', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      low: { text: 'Baja', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      medium: { text: 'Media', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      high: { text: 'Alta', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      urgent: { text: 'Urgente', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
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
      open: { text: 'Abierto', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      in_progress: { text: 'En Proceso', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      resolved: { text: 'Resuelto', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      closed: { text: 'Cerrado', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  // Si es tema Mikrosystem, mostrar diseño de imágenes con tabs
  if (viewTheme === 'mikrosystem') {
    const getHeaderColor = () => {
      if (activeTab === 'today') return 'bg-teal-600 dark:bg-teal-700';
      if (activeTab === 'overdue') return 'bg-orange-500 dark:bg-orange-600';
      return 'bg-red-500 dark:bg-red-600';
    };

    const getHeaderTitle = () => {
      if (activeTab === 'today') return 'Lista de Ticket Abiertos';
      if (activeTab === 'overdue') return 'Lista de Ticket respondidos';
      return 'Lista de Ticket Cerrados';
    };

    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-0">
          <nav className="flex gap-4">
            <Link to="/tickets/today">
              <button
                className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
                  activeTab === 'today'
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Tickets de hoy
              </button>
            </Link>
            <button
              className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
                activeTab === 'overdue'
                  ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tickets vencidos
            </button>
            <Link to="/tickets/completed">
              <button
                className={`pb-2 px-1 border-b-2 text-xs font-medium transition-colors ${
                  activeTab === 'closed'
                    ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Tickets finalizados
              </button>
            </Link>
          </nav>
        </div>

        {/* Header colorido */}
        <div className={`${getHeaderColor()} px-6 py-3 flex items-center justify-between`}>
          <h1 className="text-base font-bold text-white">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Barra de herramientas */}
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                <List className="w-4 h-4" />
              </button>

              <Link to="/tickets/new">
                <Button size="sm" className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nuevo
                </Button>
              </Link>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos Ticket</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option value="all">Todos departamento</option>
                <option value="ventas">Ventas</option>
                <option value="soporte">Soporte Técnico</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-7 w-48 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-20">
                      N° ▲
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-40">
                      DEPARTAMENTO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-48">
                      REMITENTE
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      ASUNTO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-36">
                      TÉCNICO
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-40">
                      FECHA
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-32">
                      UBICACIÓN
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.slice(0, pageSize).map((ticket) => (
                      <tr 
                        key={ticket.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <button className="w-5 h-5 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full">
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                            <span className="font-mono text-gray-900 dark:text-white text-xs">
                              {ticket.id.replace('tck', '00000')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          {getDepartmentBadge(ticket.type)}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-white">{getClientName(ticket.clientId)}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-white">{ticket.subject}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-700 dark:text-gray-400">
                            {ticket.assignedTo ? 'Luis Martínez' : 'No asignado'}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                          <span className="text-gray-700 dark:text-gray-400">{formatDateTime(ticket.createdAt)}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-gray-700 dark:text-gray-400">ppp</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        Ningún registro disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div>
                Mostrando de 1 al {Math.min(pageSize, filteredTickets.length)} de un total de {filteredTickets.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-medium ${
                      currentPage === page
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Diseño WispHub con CompactTable
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
      key: 'daysOverdue',
      header: 'Días Vencido',
      sortable: true,
      align: 'center',
      render: (ticket) => (
        <div className="flex items-center justify-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span className="font-medium text-red-600 dark:text-red-400">{ticket.daysOverdue}d</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      sortable: true,
      render: (ticket) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDateTime(ticket.dueDate)}</span>
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

  const totalPages = Math.ceil(mockTickets.length / pageSize);

  return (
    <div className={`themed-view-shell themed-view-shell--${viewTheme} h-full`}>
      <div className="themed-view-shell__orb themed-view-shell__orb--one" />
      <div className="themed-view-shell__orb themed-view-shell__orb--two" />
      <CompactTableToolbar
        title="Tickets Vencidos"
        stats={[
          { 
            label: 'Total', 
            value: mockTickets.length,
            icon: <AlertTriangle className="w-4 h-4" />,
            color: 'text-red-600 dark:text-red-400' 
          },
          { 
            label: 'Urgentes', 
            value: mockTickets.filter(t => t.priority === 'urgente').length,
            color: 'text-red-600 dark:text-red-400' 
          },
          { 
            label: 'Pendientes', 
            value: mockTickets.filter(t => t.status === 'pendiente').length,
            color: 'text-yellow-600 dark:text-yellow-400' 
          },
          { 
            label: 'En Proceso', 
            value: mockTickets.filter(t => t.status === 'en_proceso').length,
            color: 'text-blue-600 dark:text-blue-400' 
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
        searchPlaceholder="Buscar tickets vencidos..."
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

      <div className="themed-view-panel bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0 overflow-hidden">
        <CompactTable
          columns={columns}
          data={mockTickets}
          keyExtractor={(ticket) => ticket.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay tickets vencidos"
        />

        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={mockTickets.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
