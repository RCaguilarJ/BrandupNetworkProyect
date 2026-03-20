import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Download, FileText, Filter, Eye, Calendar } from 'lucide-react';
import { MOCK_INVOICES, MOCK_CLIENTS, MOCK_TICKETS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';
import { ThemedViewPanel, ThemedViewShell } from '../components/ThemedViewShell';

export default function Reports() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('generatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState<string>('all');

  const invoices = user?.role === 'super_admin'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(i => i.companyId === user?.companyId);

  const clients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const tickets = user?.role === 'super_admin'
    ? MOCK_TICKETS
    : MOCK_TICKETS.filter(t => t.companyId === user?.companyId);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  // Datos mock de reportes generados
  const mockReports = [
    {
      id: '1',
      name: 'Ingresos Mensuales - Diciembre 2024',
      type: 'financial',
      generatedAt: '2024-12-31T23:59:00',
      generatedBy: 'Admin Sistema',
      format: 'PDF',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Cartera Vencida - Q4 2024',
      type: 'financial',
      generatedAt: '2024-12-28T15:30:00',
      generatedBy: 'Admin Sistema',
      format: 'XLSX',
      size: '1.2 MB',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Tickets de Soporte - Diciembre 2024',
      type: 'operational',
      generatedAt: '2024-12-27T10:15:00',
      generatedBy: 'Admin Sistema',
      format: 'PDF',
      size: '3.1 MB',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Análisis de Clientes Nuevos',
      type: 'operational',
      generatedAt: '2024-12-26T14:20:00',
      generatedBy: 'Admin Sistema',
      format: 'PDF',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: '5',
      name: 'Uptime de Red - Noviembre 2024',
      type: 'network',
      generatedAt: '2024-12-25T09:00:00',
      generatedBy: 'Admin Sistema',
      format: 'PDF',
      size: '4.2 MB',
      status: 'completed'
    },
    {
      id: '6',
      name: 'Consumo de Ancho de Banda',
      type: 'network',
      generatedAt: '2024-12-24T16:45:00',
      generatedBy: 'Admin Sistema',
      format: 'XLSX',
      size: '5.8 MB',
      status: 'completed'
    },
  ];

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportType === 'all' || report.type === reportType;
    return matchesSearch && matchesType;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      financial: { text: 'Financiero', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      operational: { text: 'Operativo', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      network: { text: 'Red', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    };
    const badge = badges[type as keyof typeof badges] || { text: type, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { text: 'Completado', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      processing: { text: 'Procesando', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      failed: { text: 'Error', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
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
      key: 'name',
      header: 'Nombre del Reporte',
      sortable: true,
      render: (report) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white leading-tight">
            {report.name}
          </div>
          <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            Generado por: {report.generatedBy}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      align: 'center',
      render: (report) => getTypeBadge(report.type),
    },
    {
      key: 'generatedAt',
      header: 'Fecha de Generación',
      sortable: true,
      render: (report) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDateTime(report.generatedAt)}</span>
      ),
    },
    {
      key: 'format',
      header: 'Formato',
      sortable: true,
      align: 'center',
      render: (report) => (
        <span className="font-mono text-gray-700 dark:text-gray-300">{report.format}</span>
      ),
    },
    {
      key: 'size',
      header: 'Tamaño',
      sortable: true,
      align: 'right',
      render: (report) => (
        <span className="text-gray-600 dark:text-gray-400">{report.size}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (report) => getStatusBadge(report.status),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Ver reporte"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Descargar"
          >
            <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  return (
    <ThemedViewShell
      eyebrow="Analisis ejecutivo"
      title="Reportes y Analisis"
      description="Las metricas conservan su lectura operativa, pero ahora cada tema muestra una narrativa visual distinta para que la presentacion no repita el mismo layout base."
      stats={[
        {
          label: 'Ingresos',
          value: formatCurrency(totalRevenue),
          helper: 'Facturacion cobrada',
          icon: <FileText className="w-5 h-5" />,
          tone: 'success',
        },
        {
          label: 'Cartera vencida',
          value: formatCurrency(overdueAmount),
          helper: 'Monto por recuperar',
          icon: <Download className="w-5 h-5" />,
          tone: 'danger',
        },
        {
          label: 'Clientes activos',
          value: activeClients,
          helper: 'Base operativa',
          icon: <Calendar className="w-5 h-5" />,
          tone: 'primary',
        },
        {
          label: 'Tickets resueltos',
          value: resolvedTickets,
          helper: 'Indicador de soporte',
          icon: <Eye className="w-5 h-5" />,
          tone: 'neutral',
        },
      ]}
    >
      <ThemedViewPanel className="overflow-hidden">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Reportes y Análisis"
        stats={[
          { label: 'Ingresos', value: formatCurrency(totalRevenue), color: 'text-green-600 dark:text-green-400' },
          { label: 'Cartera Vencida', value: formatCurrency(overdueAmount), color: 'text-red-600 dark:text-red-400' },
          { label: 'Clientes Activos', value: activeClients, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Tickets Resueltos', value: resolvedTickets, color: 'text-purple-600 dark:text-purple-400' },
        ]}
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filtros Avanzados
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Programar Reporte
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Generar Reporte
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar reportes..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="financial">Financieros</option>
            <option value="operational">Operativos</option>
            <option value="network">Red</option>
          </select>
        }
      />

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredReports}
          keyExtractor={(report) => report.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay reportes para mostrar"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredReports.length}
          onPageChange={setCurrentPage}
        />
      </div>
      </ThemedViewPanel>
    </ThemedViewShell>
  );
}
