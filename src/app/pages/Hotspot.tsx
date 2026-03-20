import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Download, QrCode, Printer, Eye, Wifi } from 'lucide-react';
import { MOCK_VOUCHERS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../lib/utils';
import { CompactTable, CompactTableColumn, CompactTableToolbar, CompactTableFooter } from '../components/CompactTable';
import { ThemedViewPanel, ThemedViewShell } from '../components/ThemedViewShell';

export default function Hotspot() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar vouchers según el usuario
  const vouchers = user?.role === 'super_admin'
    ? MOCK_VOUCHERS
    : MOCK_VOUCHERS.filter(v => v.companyId === user?.companyId);

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter;
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
      available: { text: 'Disponible', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      used: { text: 'Usado', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      expired: { text: 'Expirado', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
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
      key: 'code',
      header: 'Código Voucher',
      sortable: true,
      width: '180px',
      render: (voucher) => (
        <span className="font-mono font-medium text-gray-900 dark:text-white">{voucher.code}</span>
      ),
    },
    {
      key: 'duration',
      header: 'Duración',
      sortable: true,
      render: (voucher) => (
        <span className="text-gray-700 dark:text-gray-300">{voucher.duration}</span>
      ),
    },
    {
      key: 'speed',
      header: 'Velocidad',
      sortable: true,
      render: (voucher) => (
        <span className="text-gray-700 dark:text-gray-300">{voucher.speed}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (voucher) => getStatusBadge(voucher.status),
    },
    {
      key: 'createdAt',
      header: 'Creado',
      sortable: true,
      render: (voucher) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDateTime(voucher.createdAt)}</span>
      ),
    },
    {
      key: 'usedAt',
      header: 'Usado',
      sortable: true,
      render: (voucher) => (
        <span className="text-gray-600 dark:text-gray-400">
          {voucher.usedAt ? formatDateTime(voucher.usedAt) : '-'}
        </span>
      ),
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
            title="QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Imprimir"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredVouchers.length / pageSize);
  const availableCount = vouchers.filter(v => v.status === 'available').length;
  const usedCount = vouchers.filter(v => v.status === 'used').length;
  const expiredCount = vouchers.filter(v => v.status === 'expired').length;

  return (
    <ThemedViewShell
      eyebrow="Acceso temporal"
      title="Hotspot / Vouchers WiFi"
      description="La identidad visual cambia por completo entre Mikrosystem y Wisphub, pero el flujo operativo, las busquedas y el formato de la tabla se mantienen intactos."
      stats={[
        {
          label: 'Totales',
          value: vouchers.length,
          helper: 'Inventario generado',
          icon: <Wifi className="w-5 h-5" />,
          tone: 'primary',
        },
        {
          label: 'Disponibles',
          value: availableCount,
          helper: 'Listos para entregar',
          icon: <Plus className="w-5 h-5" />,
          tone: 'success',
        },
        {
          label: 'Usados',
          value: usedCount,
          helper: 'Sesiones activadas',
          icon: <QrCode className="w-5 h-5" />,
          tone: 'warning',
        },
        {
          label: 'Expirados',
          value: expiredCount,
          helper: 'Pendientes de renovar',
          icon: <Printer className="w-5 h-5" />,
          tone: 'danger',
        },
      ]}
    >
      <ThemedViewPanel className="overflow-hidden">
      {/* Barra de herramientas */}
      <CompactTableToolbar
        title="Hotspot / Vouchers WiFi"
        stats={[
          { 
            label: 'Total', 
            value: vouchers.length,
            icon: <Wifi className="w-4 h-4" />
          },
          { 
            label: 'Disponibles', 
            value: availableCount, 
            color: 'text-green-600 dark:text-green-400' 
          },
          { 
            label: 'Usados', 
            value: usedCount, 
            color: 'text-blue-600 dark:text-blue-400' 
          },
          { 
            label: 'Expirados', 
            value: expiredCount, 
            color: 'text-red-600 dark:text-red-400' 
          },
        ]}
        actions={
          <>
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
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Generar Vouchers
            </Button>
          </>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar vouchers..."
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="available">Disponibles</option>
            <option value="used">Usados</option>
            <option value="expired">Expirados</option>
          </select>
        }
      />

      {/* Tabla compacta */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 m-0">
        <CompactTable
          columns={columns}
          data={filteredVouchers}
          keyExtractor={(voucher) => voucher.id}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          pageSize={pageSize}
          emptyMessage="No hay vouchers generados"
        />

        {/* Footer con paginación */}
        <CompactTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={filteredVouchers.length}
          onPageChange={setCurrentPage}
        />
      </div>
      </ThemedViewPanel>
    </ThemedViewShell>
  );
}
