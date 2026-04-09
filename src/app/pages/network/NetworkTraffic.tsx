import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Info,
  List,
  Printer,
  Save,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './networkManagementData';
import { NetworkPanel } from './networkManagementShared';

type TrafficTab = 'list' | 'chart';
type TrafficRow = {
  id: string;
  cliente: string;
  ip: string;
  descarga: string;
  subida: string;
  user: string;
  fecha: string;
  tiempo: string;
  mac: string;
  router: string;
};

type TrafficColumnKey =
  | 'num'
  | 'cliente'
  | 'ip'
  | 'descarga'
  | 'subida'
  | 'user'
  | 'fecha'
  | 'tiempo'
  | 'mac'
  | 'router';

type TrafficColumn = {
  key: TrafficColumnKey;
  header: string;
  label: string;
  width?: string;
  getValue: (row: TrafficRow, index: number) => string;
};

const TRAFFIC_COLUMNS: TrafficColumn[] = [
  { key: 'num', header: '#', label: '#', width: '48px', getValue: (_row, index) => String(index + 1) },
  { key: 'cliente', header: 'CLIENTE', label: 'Cliente', width: '180px', getValue: (row) => row.cliente },
  { key: 'ip', header: 'IP', label: 'IP', width: '95px', getValue: (row) => row.ip },
  { key: 'descarga', header: 'DESCARGA', label: 'Descarga', width: '190px', getValue: (row) => row.descarga },
  { key: 'subida', header: 'SUBIDA', label: 'Subida', width: '170px', getValue: (row) => row.subida },
  { key: 'user', header: 'USER PPP/HS', label: 'User PPP/HS', width: '230px', getValue: (row) => row.user },
  { key: 'fecha', header: 'FECHA', label: 'Fecha', width: '140px', getValue: (row) => row.fecha },
  { key: 'tiempo', header: 'TIEMPO', label: 'Tiempo', width: '150px', getValue: (row) => row.tiempo },
  { key: 'mac', header: 'MAC', label: 'MAC', width: '130px', getValue: (row) => row.mac },
  { key: 'router', header: 'ROUTER', label: 'Router', width: '170px', getValue: (row) => row.router },
];

const tabs = [
  { id: 'list', label: 'LISTA TRAFICO', icon: <List className="h-4 w-4" /> },
  { id: 'chart', label: 'GRAFICOS', icon: <BarChart3 className="h-4 w-4" /> },
];

const sharedOptions = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'norte', label: 'Zona Norte' },
  { value: 'sur', label: 'Zona Sur' },
];

const yearOptions = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
];

const monthlyTraffic = [
  { month: 'Enero', descarga: 0, subida: 0 },
  { month: 'Febrero', descarga: 0, subida: 0 },
  { month: 'Marzo', descarga: 0, subida: 0 },
  { month: 'Abril', descarga: 0, subida: 0 },
  { month: 'Mayo', descarga: 0, subida: 0 },
  { month: 'Junio', descarga: 0, subida: 0 },
  { month: 'Julio', descarga: 0, subida: 0 },
  { month: 'Agosto', descarga: 0, subida: 0 },
  { month: 'Septiembre', descarga: 0, subida: 0 },
  { month: 'Octubre', descarga: 0, subida: 0 },
  { month: 'Noviembre', descarga: 0, subida: 0 },
  { month: 'Diciembre', descarga: 0, subida: 0 },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`;
}

function getDatasetHeaders(rows: Record<string, string>[], fallbackHeaders?: string[]) {
  if (rows.length > 0) {
    return Object.keys(rows[0]);
  }

  if (fallbackHeaders && fallbackHeaders.length > 0) {
    return fallbackHeaders;
  }

  return ['Registro'];
}

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  widthClass = 'w-[150px]',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  widthClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] text-[#24364b]">{label}:</span>
      <div className={`relative ${widthClass}`}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[34px] w-full appearance-none rounded-[4px] border border-[#cfd8e3] bg-white px-3 pr-10 text-[14px] text-[#24364b] outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6e83]" />
      </div>
    </div>
  );
}

function TrafficSummary({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="mx-auto mt-10 w-full max-w-[780px] overflow-hidden rounded-[4px] border border-[#d7dde5] bg-white">
      <div className="flex items-center gap-2 border-b border-[#d7dde5] bg-[#f3f6f9] px-4 py-3 text-[13px] font-semibold text-[#425b74]">
        <Info className="h-4 w-4" />
        {title}
      </div>
      <div className="px-4 py-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border border-[#e0e6ec] border-b-0 px-3 py-3 text-[14px] text-[#334b63] last:border-b"
          >
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey?: string; color?: string }>;
  label?: string;
}) {
  if (!active) {
    return null;
  }

  const downloadValue = payload?.find((item) => item.dataKey === 'descarga')?.value ?? 0;
  const uploadValue = payload?.find((item) => item.dataKey === 'subida')?.value ?? 0;

  return (
    <div className="rounded-[14px] border-2 border-[#eef2f6] bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-[13px] text-[#5a6470]">{label}</div>
      <div className="mt-1 text-[12px] text-[#3b82f6]">Descarga: {downloadValue} MiB</div>
      <div className="text-[12px] text-[#14b8a6]">Subida: {uploadValue} MiB</div>
    </div>
  );
}

export default function NetworkTraffic() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<TrafficTab>('list');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [routerFilter, setRouterFilter] = useState('any');
  const [locationFilter, setLocationFilter] = useState('any');
  const [issuerFilter, setIssuerFilter] = useState('any');
  const [planFilter, setPlanFilter] = useState('any');
  const [year, setYear] = useState('2026');
  const [startDate, setStartDate] = useState('01/04/2026');
  const [endDate, setEndDate] = useState('30/04/2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<TrafficColumnKey[]>(
    TRAFFIC_COLUMNS.map((column) => column.key),
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (columnMenuRef.current && !columnMenuRef.current.contains(target)) {
        setColumnMenuOpen(false);
      }

      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setExportMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const visibleColumns = useMemo(() => {
    const filtered = TRAFFIC_COLUMNS.filter((column) => visibleColumnKeys.includes(column.key));
    return filtered.length > 0 ? filtered : TRAFFIC_COLUMNS;
  }, [visibleColumnKeys]);

  const rows = useMemo<TrafficRow[]>(() => [], []);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      TRAFFIC_COLUMNS.some((column) => column.getValue(row, 0).toLowerCase().includes(query)),
    );
  }, [rows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, pageSize, safeCurrentPage]);

  const summary =
    filteredRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeCurrentPage - 1) * pageSize + 1} al ${Math.min(
          safeCurrentPage * pageSize,
          filteredRows.length,
        )} de un total de ${filteredRows.length}`;

  const exportHeaders = visibleColumns.map((column) => column.header);
  const exportRows = filteredRows.map((row, index) =>
    Object.fromEntries(visibleColumns.map((column) => [column.header, column.getValue(row, index)])),
  );

  const toggleColumn = (columnKey: TrafficColumnKey) => {
    setVisibleColumnKeys((current) => {
      if (current.includes(columnKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const openDatasetPrintPreview = (
    title: string,
    datasetRows: Record<string, string>[],
    autoPrint: boolean,
    fallbackHeaders?: string[],
  ) => {
    const headers = getDatasetHeaders(datasetRows, fallbackHeaders);
    const bodyRows = datasetRows.length
      ? datasetRows
          .map(
            (row) =>
              `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`,
          )
          .join('')
      : `<tr><td colspan="${headers.length}">No hay datos para mostrar</td></tr>`;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 20px; margin: 0 0 16px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #d7dde5; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f5f7fb; }</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();

    if (autoPrint) {
      printWindow.print();
    }
  };

  const handleDatasetPrint = () => {
    openDatasetPrintPreview('Lista Trafico', exportRows, true, exportHeaders);
    setExportMenuOpen(false);
  };

  const handleDatasetExportCsv = () => {
    const headers = getDatasetHeaders(exportRows, exportHeaders);
    const lines = [
      headers.map(escapeCsvValue).join(','),
      ...exportRows.map((row) => headers.map((header) => escapeCsvValue(row[header] ?? '')).join(',')),
    ];
    downloadBlob('lista-trafico.csv', `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleDatasetExportExcel = () => {
    const headers = getDatasetHeaders(exportRows, exportHeaders);
    const rowsHtml = exportRows
      .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 18px; margin: 0 0 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f3f7fb; }</style></head><body><h1>Lista Trafico</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    downloadBlob('lista-trafico.xls', `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleDatasetExportPdf = () => {
    openDatasetPrintPreview('Lista Trafico - PDF', exportRows, true, exportHeaders);
    setExportMenuOpen(false);
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPanel isWispHub={isWispHub}>
        <div className="px-5 pt-5">
          <div className="mb-2 flex flex-wrap items-end gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TrafficTab)}
                  className={`inline-flex h-[38px] items-center gap-2 rounded-[4px] px-4 text-[14px] font-semibold ${
                    active
                      ? 'bg-[#3f93e7] text-white'
                      : 'bg-transparent text-[#7089a4]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-2">
          <div className="flex flex-wrap items-center gap-4">
            {activeTab === 'chart' ? (
              <FilterSelect
                label="Año"
                value={year}
                onChange={setYear}
                options={yearOptions}
                widthClass="w-[100px]"
              />
            ) : null}
            <FilterSelect label="Router" value={routerFilter} onChange={setRouterFilter} options={sharedOptions} />
            <FilterSelect label="Ubicación" value={locationFilter} onChange={setLocationFilter} options={sharedOptions} />
            <FilterSelect label="Emisor" value={issuerFilter} onChange={setIssuerFilter} options={sharedOptions} />
            <FilterSelect label="Plan" value={planFilter} onChange={setPlanFilter} options={sharedOptions} />
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative inline-flex items-stretch overflow-visible rounded-[4px] border border-[#d7dde5] bg-white align-middle">
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-[34px] min-w-[58px] appearance-none border-0 border-r border-[#d7dde5] bg-white px-4 text-[14px] leading-none text-[#24364b] outline-none"
                      aria-label="Cantidad de registros por pagina"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>

                    <div className="relative" ref={columnMenuRef}>
                      <button
                        type="button"
                        className="inline-flex h-[34px] w-[38px] items-center justify-center border-0 border-r border-[#d7dde5] bg-white text-[#394b60]"
                        aria-label="Vista de lista"
                        onClick={() => {
                          setColumnMenuOpen((current) => !current);
                          setExportMenuOpen(false);
                        }}
                      >
                        <List className="h-4 w-4" />
                      </button>

                      {columnMenuOpen ? (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[190px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                          <div className="max-h-[260px] overflow-y-auto py-2">
                            {TRAFFIC_COLUMNS.map((column) => (
                              <label
                                key={column.key}
                                className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                              >
                                <input
                                  type="checkbox"
                                  checked={visibleColumns.some((visibleColumn) => visibleColumn.key === column.key)}
                                  onChange={() => toggleColumn(column.key)}
                                  className="h-[13px] w-[13px] accent-[#2f3033]"
                                />
                                <span>{column.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="relative" ref={exportMenuRef}>
                      <button
                        type="button"
                        className="inline-flex h-[34px] w-[38px] items-center justify-center border-0 bg-white text-[#394b60]"
                        aria-label="Guardar configuracion"
                        onClick={() => {
                          setExportMenuOpen((current) => !current);
                          setColumnMenuOpen(false);
                        }}
                      >
                        <Save className="h-4 w-4" />
                      </button>

                      {exportMenuOpen ? (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[180px] border border-[#d7dde5] bg-white py-2 shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                          <button
                            type="button"
                            onClick={handleDatasetPrint}
                            className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                          >
                            <Printer className="h-4 w-4" />
                            Imprimir
                          </button>
                          <button
                            type="button"
                            onClick={handleDatasetExportCsv}
                            className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                          >
                            <FileDown className="h-4 w-4" />
                            Exportar csv
                          </button>
                          <button
                            type="button"
                            onClick={handleDatasetExportExcel}
                            className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            Exportar a Excel
                          </button>
                          <button
                            type="button"
                            onClick={handleDatasetExportPdf}
                            className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                          >
                            <FileDown className="h-4 w-4" />
                            Exportar a PDF
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center overflow-hidden rounded-[4px] border border-[#d7dde5] bg-white">
                    <input
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="h-[34px] w-[96px] border-0 bg-white px-3 text-[14px] text-[#24364b] outline-none"
                      aria-label="Fecha inicial"
                    />
                    <span className="flex h-[34px] items-center border-l border-r border-[#d7dde5] bg-[#e8edf3] px-3 text-[13px] text-[#4b5f75]">
                      al
                    </span>
                    <input
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="h-[34px] w-[96px] border-0 bg-white px-3 text-[14px] text-[#24364b] outline-none"
                      aria-label="Fecha final"
                    />
                  </div>
                </div>

                <div className="w-full xl:max-w-[260px]">
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[34px] w-full rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none placeholder:text-[#c6ced8]"
                    placeholder="Buscar..."
                    aria-label="Buscar tráfico"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="overflow-hidden border border-[#d7dde5] bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
                    <thead>
                      <tr className="bg-white">
                        {visibleColumns.map((column) => (
                          <th
                            key={column.key}
                            className="border-b border-r border-[#d7dde5] px-3 py-3 text-left text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0"
                            style={column.width ? { width: column.width } : undefined}
                          >
                            {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={visibleColumns.length}
                            className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]"
                          >
                            Ningún registro disponible
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row, index) => (
                          <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                            {visibleColumns.map((column) => (
                              <td
                                key={column.key}
                                className="border-b border-r border-[#d7dde5] px-3 py-3 last:border-r-0"
                              >
                                {column.getValue(row, (safeCurrentPage - 1) * pageSize + index)}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[16px] text-[#667b92]">
                <div>{summary}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage === 1}
                    className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Pagina anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage >= totalPages || filteredRows.length === 0}
                    className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Pagina siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <TrafficSummary
                title="Resumen"
                rows={[
                  { label: 'Tiempo', value: '00:00:00' },
                  { label: 'Descarga', value: 0 },
                  { label: 'Subida', value: 0 },
                ]}
              />
            </div>
          </>
        ) : (
          <div className="px-5 pb-5 pt-4">
            <div className="overflow-hidden rounded-[4px] border border-[#d7dde5] bg-white">
              <div className="flex items-center gap-2 border-b border-[#d7dde5] bg-[#f3f6f9] px-4 py-3 text-[13px] font-semibold text-[#425b74]">
                <BarChart3 className="h-4 w-4" />
                Resumen Tráfico
              </div>
              <div className="h-[300px] px-4 py-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTraffic} margin={{ top: 12, right: 24, left: 10, bottom: 28 }}>
                    <CartesianGrid stroke="#d5dde7" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#7f8fa0', fontSize: 12 }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 1]}
                      ticks={[0, 0.25, 0.5, 0.75, 1]}
                      tickFormatter={(value) => `${value} MiB`}
                      tick={{ fill: '#7f8fa0', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<TrafficTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#5b6e83' }} />
                    <Line type="monotone" dataKey="descarga" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Descarga" />
                    <Line type="monotone" dataKey="subida" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} name="Subida" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <TrafficSummary
              title="Resumen"
              rows={[
                { label: 'Sesiones', value: 0 },
                { label: 'Tiempo', value: '00:00:00' },
                { label: 'Descarga', value: 0 },
                { label: 'Subida', value: 0 },
              ]}
            />
          </div>
        )}
      </NetworkPanel>
    </div>
  );
}
