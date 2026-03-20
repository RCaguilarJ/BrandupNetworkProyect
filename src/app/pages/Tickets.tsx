import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Download, Filter, Eye, Edit, List, ChevronLeft, ChevronRight, Settings, Search as SearchIcon } from 'lucide-react';
import { MOCK_TICKETS, MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { formatDateTime } from '../lib/utils';
import { useNavigate } from 'react-router';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';

export default function Tickets() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'closed'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('all');

  // Filtrar tickets según el rol
  let tickets = MOCK_TICKETS;
  if (user?.role === 'cliente') {
    const myClient = MOCK_CLIENTS.find(c => c.email === user.email);
    tickets = MOCK_TICKETS.filter(t => t.clientId === myClient?.id);
  } else if (user?.role !== 'super_admin') {
    tickets = MOCK_TICKETS.filter(t => t.companyId === user?.companyId);
  }

  // Obtener la fecha de hoy
  const today = new Date('2026-03-19').toDateString();

  const getTicketsByTab = () => {
    if (activeTab === 'today') {
      // Tickets abiertos de hoy
      return tickets.filter(t => 
        t.status === 'open' && 
        new Date(t.createdAt).toDateString() === today
      );
    } else if (activeTab === 'overdue') {
      // Tickets vencidos (en progreso hace más de 2 días)
      return tickets.filter(t => t.status === 'in_progress');
    } else {
      // Tickets finalizados (resueltos o cerrados)
      return tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    }
  };

  const filteredTickets = getTicketsByTab().filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(ticket.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { text: 'Abierto', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      in_progress: { text: 'En Progreso', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
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

  const getPriorityBadge = (priority: string) => {
    const badges = {
      urgent: { text: 'Urgente', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      high: { text: 'Alta', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
      medium: { text: 'Media', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      low: { text: 'Baja', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    };
    const badge = badges[priority as keyof typeof badges] || { text: priority, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      no_service: 'Sin Servicio',
      intermittent: 'Intermitente',
      billing: 'Facturación',
      installation: 'Instalación',
      other: 'Otro',
    };
    return types[type] || type;
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

  // Estadísticas
  const stats = {
    abiertos: tickets.filter(t => t.status === 'open').length,
    enProgreso: tickets.filter(t => t.status === 'in_progress').length,
    resueltos: tickets.filter(t => t.status === 'resolved').length,
    cerrados: tickets.filter(t => t.status === 'closed').length,
  };

  // Si es tema Mikrosystem, mostrar diseño de imágenes
  if (viewTheme === 'mikrosystem') {
    // Para la vista principal de tickets, NO mostrar tabs, solo la tabla estándar con header azul
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        {/* Header azul brillante */}
        <div className="bg-blue-600 dark:bg-blue-700 px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">Todos los Tickets</h1>
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
              {/* Selector de registros */}
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

              {/* Botón Vista */}
              <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                <List className="w-4 h-4" />
              </button>

              {/* Botón + Nuevo */}
              <Button 
                size="sm" 
                className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/tickets/new')}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nuevo
              </Button>

              {/* Dropdowns */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos estados</option>
                <option value="open">Abiertos</option>
                <option value="in_progress">En Progreso</option>
                <option value="resolved">Resueltos</option>
                <option value="closed">Cerrados</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos departamento</option>
                <option value="ventas">Ventas</option>
                <option value="soporte">Soporte Técnico</option>
              </select>

              {/* Búsqueda */}
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

  // Si es tema WispHub, mostrar diseño original con CompactTable
  const columns: CompactTableColumn<any>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      render: (ticket) => (
        <span className="font-mono text-gray-600 dark:text-gray-400">#{ticket.id.slice(0, 6)}</span>
      ),
    },
    {
      key: 'subject',
      header: 'Asunto',
      sortable: true,
      render: (ticket) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white leading-tight">
            {ticket.subject}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5 truncate max-w-md">
            {ticket.description}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
      render: (ticket) => (
        <span className="text-gray-700 dark:text-gray-300">{getClientName(ticket.clientId)}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      render: (ticket) => (
        <span className="text-gray-700 dark:text-gray-300">{getTypeName(ticket.type)}</span>
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
        <span className="text-gray-600 dark:text-gray-400">{formatDateTime(ticket.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (ticket) => (
        <div className="flex items-center justify-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Ver detalle"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          {user?.role !== 'cliente' && (
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
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
        title="Tickets de Soporte"
        stats={[
          { label: 'Total', value: filteredTickets.length },
          { label: 'Abiertos', value: stats.abiertos, color: 'text-red-600 dark:text-red-400' },
          { label: 'En Progreso', value: stats.enProgreso, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Resueltos', value: stats.resueltos, color: 'text-green-600 dark:text-green-400' },
          { label: 'Cerrados', value: stats.cerrados, color: 'text-gray-600 dark:text-gray-400' },
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
              size="sm" 
              className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={() => navigate('/tickets/new')}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo Ticket
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar tickets..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="open">Abiertos</option>
            <option value="in_progress">En Progreso</option>
            <option value="resolved">Resueltos</option>
            <option value="closed">Cerrados</option>
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
          emptyMessage="No hay tickets para mostrar"
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
