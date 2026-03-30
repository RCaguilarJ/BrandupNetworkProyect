import React, { ReactNode, useState } from 'react';
import { ChevronUp, ChevronDown, FileDown, FileSpreadsheet, X } from 'lucide-react';
import { useViewTheme } from '../context/ViewThemeContext';

export interface CompactTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  filterable?: boolean;
}

export interface CompactTableProps<T> {
  columns: CompactTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  emptyMessage?: string;
}

export function CompactTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortField,
  sortDirection,
  pageSize,
  emptyMessage = 'No hay datos para mostrar'
}: CompactTableProps<T>) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  
  // Filtros por columna (solo para WispHub)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const handleColumnFilterChange = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  // Aplicar filtros por columna
  const filteredData = isWispHub
    ? data.filter(row => {
        return Object.entries(columnFilters).every(([key, filterValue]) => {
          if (!filterValue) return true;
          const cellValue = row[key];
          // Si la celda no tiene un valor directo (columna renderizada), saltar el filtro
          if (cellValue === null || cellValue === undefined) return true;
          return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
        });
      })
    : data;
  
  const SortIcon = ({ field }: { field: string }) => {
    if (!sortField || sortField !== field) return <ChevronUp className="w-3 h-3 opacity-0" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const displayData = pageSize ? filteredData.slice(0, pageSize) : filteredData;

  // Estilos WispHub
  if (isWispHub) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontSize: '11px' }}>
          <thead>
            {/* Encabezados */}
            <tr className="bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-2 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className={`flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 ${
                        column.align === 'center' ? 'mx-auto' : column.align === 'right' ? 'ml-auto' : ''
                      }`}
                    >
                      {column.header}
                      <SortIcon field={column.key} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
            
            {/* Fila de filtros por columna */}
            <tr className="bg-gray-50 dark:bg-gray-900/30">
              {columns.map((column) => (
                <th
                  key={`filter-${column.key}`}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600"
                >
                  <input
                    type="text"
                    placeholder="..."
                    value={columnFilters[column.key] || ''}
                    onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                    className="w-full h-7 px-2 text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-green-500 dark:focus:border-green-500 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                    style={{ fontSize: '11px' }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => (
                <tr
                  key={keyExtractor(row)}
                  className={`border-b border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/30'
                  }`}
                  style={{ height: '32px' }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-2 py-1 border border-gray-300 dark:border-gray-600 ${
                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Estilos Mikrosystem (original)
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                  column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className={`flex items-center gap-1 hover:text-gray-900 dark:hover:text-white ${
                      column.align === 'center' ? 'mx-auto' : column.align === 'right' ? 'ml-auto' : ''
                    }`}
                  >
                    {column.header}
                    <SortIcon field={column.key} />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            displayData.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/30'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Componente de Toolbar para usar junto con CompactTable
export interface CompactTableToolbarProps {
  title: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string | number; color?: string; icon?: ReactNode }>;
  actions?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export function CompactTableToolbar({
  title,
  subtitle,
  stats,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  pageSize = 25,
  onPageSizeChange
}: CompactTableToolbarProps) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  // Toolbar WispHub
  if (isWispHub) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Título y estadísticas fuera de la barra verde */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {/* Búsqueda general alineada a la derecha */}
            {onSearchChange && (
              <div className="relative" style={{ width: '280px' }}>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <svg
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Estadísticas compactas */}
          {stats && stats.length > 0 && (
            <div className="flex items-center gap-4 mt-2 text-xs">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  {stat.icon && <span className={stat.color || 'text-gray-600 dark:text-gray-400'}>{stat.icon}</span>}
                  <span className="text-gray-600 dark:text-gray-400">
                    {stat.label}:
                  </span>
                  <span className={`font-semibold ${stat.color || 'text-gray-900 dark:text-white'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barra verde con controles técnicos */}
        <div className="bg-green-600 dark:bg-green-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Selector de registros */}
            {onPageSizeChange && (
              <div className="flex items-center gap-2 text-xs text-white">
                <span>Mostrar</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-7 px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 rounded text-xs focus:ring-1 focus:ring-green-300 text-xs"
                  aria-label="Seleccionar cantidad de registros a mostrar"
                  title="Seleccionar cantidad de registros a mostrar"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>registros</span>
              </div>
            )}

            {/* Filtros adicionales */}
            {filters}

            {/* Botón Limpiar Filtros */}
            <button
              className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1.5 transition-colors"
              onClick={() => window.location.reload()}
            >
              <X className="w-3.5 h-3.5" />
              Limpiar Filtros
            </button>
          </div>

          {/* Botones de exportación */}
          <div className="flex items-center gap-2">
            <button
              className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1.5 transition-colors"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1.5 transition-colors"
              title="Exportar a PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </button>
            
            {/* Acciones adicionales */}
            {actions}
          </div>
        </div>
      </div>
    );
  }

  // Toolbar Mikrosystem (original)
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Izquierda: Título y estadísticas */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h1>
            {(subtitle || stats) && (
              <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {subtitle && <span>{subtitle}</span>}
                {stats?.map((stat, index) => (
                  <span key={index} className={stat.color || ''}>
                    {stat.label}: <strong>{stat.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Derecha: Acciones */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Segunda fila: Filtros y búsqueda */}
      {(onPageSizeChange || filters || onSearchChange) && (
        <div className="flex items-center gap-3 mt-2">
          {onPageSizeChange && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Seleccionar cantidad de registros a mostrar"
                title="Seleccionar cantidad de registros a mostrar"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>registros</span>
            </div>
          )}

          {filters}

          {onSearchChange && (
            <div className="relative flex-1 max-w-xs ml-auto">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-7 pl-8 pr-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente de Footer para paginación
export interface CompactTableFooterProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange?: (page: number) => void;
}

export function CompactTableFooter({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange
}: CompactTableFooterProps) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  // Footer WispHub
  if (isWispHub) {
    return (
      <div className="px-3 py-2 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
        <div>
          Mostrando <strong>{startRecord}</strong> a <strong>{endRecord}</strong> de{' '}
          <strong>{totalRecords}</strong> registros
        </div>
        {onPageChange && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium"
              style={{ fontSize: '11px' }}
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 font-medium ${
                    currentPage === page
                      ? 'bg-green-600 dark:bg-green-700 text-white border border-green-600 dark:border-green-700'
                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium"
              style={{ fontSize: '11px' }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    );
  }

  // Footer Mikrosystem (original)
  return (
    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
      <div>
        Mostrando <strong>{startRecord}</strong> a <strong>{endRecord}</strong> de{' '}
        <strong>{totalRecords}</strong> registros
      </div>
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}