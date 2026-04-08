import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileDown,
  FileSpreadsheet,
  Globe,
  List,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './networkManagementData';
import {
  MetricCards,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PaginationBar,
  SearchField,
  TopTabs,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';

type AdminTab = 'onus' | 'vlans' | 'zonas' | 'profiles' | 'naps' | 'api';
type EmptyRow = Record<string, never>;
type NapRow = {
  id: string;
  nap: string;
};

type NapSearchField = {
  key: 'id' | 'nap';
  label: string;
  getValue: (row: NapRow) => string;
};

const columns: DataColumn<EmptyRow>[] = [
  { key: 'cliente', header: 'CLIENTE', render: () => '' },
  { key: 'idCliente', header: 'ID CLIENTE', width: '190px', render: () => '' },
  { key: 'sn', header: 'SN', width: '120px', render: () => '' },
  { key: 'olt', header: 'OLT', width: '120px', render: () => '' },
  { key: 'estado', header: 'ESTADO', width: '170px', render: () => '' },
  { key: 'board', header: 'BOARD', width: '170px', render: () => '' },
  { key: 'port', header: 'PORT', width: '120px', render: () => '' },
  { key: 'signal', header: 'SIGNAL', width: '150px', render: () => '' },
  { key: 'rx', header: 'RX SIGNAL', width: '170px', render: () => '' },
  { key: 'acciones', header: 'ACCIONES', width: '170px', render: () => '' },
];

const NAP_SEARCH_FIELDS: NapSearchField[] = [
  { key: 'id', label: 'ID', getValue: (row) => row.id },
  { key: 'nap', label: 'NAP', getValue: (row) => row.nap },
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

function readStoredRows<T>(key: string, fallback: T[]) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export default function NetworkAdminOlt() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const napDialog = useNetworkDialog();

  const [activeTab, setActiveTab] = useState<AdminTab>('onus');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [headerDirection, setHeaderDirection] = useState<'up' | 'down'>('up');
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedSearchFields, setSelectedSearchFields] = useState<string[]>(
    NAP_SEARCH_FIELDS.map((field) => field.key),
  );
  const [napRows, setNapRows] = useState<NapRow[]>(() => readStoredRows('admin-olt-nap-rows', []));
  const [napFormName, setNapFormName] = useState('');
  const [napNoticeVisible, setNapNoticeVisible] = useState(true);

  const tabs = [
    { id: 'onus', label: 'ONUS AUTORIZADAS' },
    { id: 'vlans', label: 'VLANS' },
    { id: 'zonas', label: 'ZONAS' },
    { id: 'profiles', label: 'PROFILES' },
    { id: 'naps', label: 'NAPS' },
    { id: 'api', label: 'API' },
  ];

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

  useEffect(() => {
    window.localStorage.setItem('admin-olt-nap-rows', JSON.stringify(napRows));
  }, [napRows]);

  const activeNapSearchFields = useMemo(() => {
    const filtered = NAP_SEARCH_FIELDS.filter((field) => selectedSearchFields.includes(field.key));
    return filtered.length > 0 ? filtered : NAP_SEARCH_FIELDS;
  }, [selectedSearchFields]);

  const filteredNaps = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return napRows;
    }

    return napRows.filter((row) =>
      activeNapSearchFields.some((field) => field.getValue(row).toLowerCase().includes(query)),
    );
  }, [activeNapSearchFields, napRows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredNaps.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedNaps = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredNaps.slice(startIndex, startIndex + pageSize);
  }, [filteredNaps, pageSize, safeCurrentPage]);

  const napColumns: DataColumn<NapRow>[] = [
    { key: 'id', header: 'ID', width: '180px', render: (row) => row.id },
    { key: 'nap', header: 'NAP', render: (row) => row.nap },
  ];

  const summary =
    filteredNaps.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeCurrentPage - 1) * pageSize + 1} al ${Math.min(
          safeCurrentPage * pageSize,
          filteredNaps.length,
        )} de un total de ${filteredNaps.length}`;

  const exportRows = filteredNaps.map((row) => ({
    ID: row.id,
    NAP: row.nap,
  }));

  const handleTabChange = (value: AdminTab) => {
    setActiveTab(value);
    setSearchTerm('');
    setCurrentPage(1);
    setHeaderDirection('up');
    setColumnMenuOpen(false);
    setExportMenuOpen(false);

    if (value === 'naps') {
      setSelectedSearchFields(NAP_SEARCH_FIELDS.map((field) => field.key));
    }
  };

  const toggleSearchField = (fieldKey: string) => {
    setSelectedSearchFields((current) => {
      if (current.includes(fieldKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== fieldKey);
      }

      return [...current, fieldKey];
    });
  };

  const toggleHeaderDirection = () => {
    setHeaderDirection((current) => {
      const next = current === 'up' ? 'down' : 'up';
      setCurrentPage(next === 'down' ? totalPages : 1);
      return next;
    });
  };

  const openDatasetPrintPreview = (title: string, rows: Record<string, string>[], autoPrint: boolean) => {
    const headers = Object.keys(rows[0] ?? { Registro: '' });
    const bodyRows = rows.length
      ? rows
          .map(
            (row) =>
              `<tr>${headers.map((header) => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join('')}</tr>`,
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

  const handleDatasetPrint = (title: string, rows: Record<string, string>[]) => {
    openDatasetPrintPreview(title, rows, true);
    setExportMenuOpen(false);
  };

  const handleDatasetExportCsv = (filename: string, rows: Record<string, string>[]) => {
    const headers = Object.keys(rows[0] ?? { Registro: '' });
    const lines = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header as keyof typeof row])).join(',')),
    ];
    downloadBlob(filename, `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleDatasetExportExcel = (title: string, filename: string, rows: Record<string, string>[]) => {
    const headers = Object.keys(rows[0] ?? { Registro: '' });
    const rowsHtml = rows
      .map(
        (row) =>
          `<tr>${headers.map((header) => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join('')}</tr>`,
      )
      .join('');
    const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 18px; margin: 0 0 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f3f7fb; }</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    downloadBlob(filename, `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleDatasetExportPdf = (title: string, rows: Record<string, string>[]) => {
    openDatasetPrintPreview(`${title} - PDF`, rows, true);
    setExportMenuOpen(false);
  };

  const openNapDialog = () => {
    setNapFormName('');
    setNapNoticeVisible(true);
    napDialog.openDialog();
  };

  const closeNapDialog = () => {
    napDialog.closeDialog();
  };

  const handleNapSubmit = () => {
    const nextNapName = napFormName.trim();

    if (!nextNapName) {
      toast.error('Ingresa el nombre de la NAP');
      return;
    }

    const duplicated = napRows.some((row) => row.nap.toLowerCase() === nextNapName.toLowerCase());
    if (duplicated) {
      toast.error('La NAP ya existe');
      return;
    }

    setNapRows((current) => [...current, { id: String(current.length + 1), nap: nextNapName }]);
    napDialog.closeDialog();
    setCurrentPage(1);
    setSearchTerm('');
    toast.success('NAP registrada correctamente');
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="AdminOLT"
        breadcrumb="AdminOLT"
        isWispHub={isWispHub}
        showHeaderActions={false}
        showMikrosystemHeader={false}
      >
        <div className={isWispHub ? 'px-3 pt-6' : ''}>
          <MetricCards
            isWispHub={isWispHub}
            cards={[
              {
                label: 'Esperando autorizacion',
                value: 0,
                helperLeft: 'NO AUTORIZADAS: 0',
                helperRight: '',
                colorClass: 'bg-[#3f8fe0]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Online',
                value: 0,
                helperLeft: 'Total autorizadas: 0',
                helperRight: '',
                colorClass: 'bg-[#34b32c]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Total Offline',
                value: 0,
                helperLeft: 'Offline: 0',
                helperRight: '',
                colorClass: 'bg-[#323b44]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Low Signals',
                value: 0,
                helperLeft: 'Warning: 0',
                helperRight: 'Critical: 0',
                colorClass: 'bg-[#ffa514]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
            ]}
          />
        </div>

        <NetworkPanel isWispHub={isWispHub}>
          <div className="px-5 pt-5">
            <TopTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(value) => handleTabChange(value as AdminTab)}
              isWispHub={isWispHub}
            />
          </div>

          {activeTab === 'naps' ? (
            <>
              <div className="px-5 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative inline-flex items-stretch overflow-visible rounded-[6px] border border-[#d7dde5] bg-white align-middle">
                      <select
                        value={pageSize}
                        onChange={(event) => {
                          setPageSize(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                        className={`min-w-[58px] appearance-none border-0 border-r border-[#d7dde5] bg-white px-4 text-[14px] leading-none outline-none ${
                          isWispHub ? 'h-[42px] rounded-none text-[#20324a]' : 'h-[48px] rounded-none text-[#24364b]'
                        }`}
                        aria-label="Cantidad de registros por pagina"
                      >
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>

                      <div className="relative" ref={columnMenuRef}>
                        <button
                          type="button"
                          className={`inline-flex shrink-0 items-center justify-center border-0 border-r border-[#d7dde5] bg-white text-[#394b60] ${
                            isWispHub ? 'h-[42px] w-[42px]' : 'h-[48px] w-[48px]'
                          }`}
                          aria-label="Vista de lista"
                          onClick={() => {
                            setColumnMenuOpen((current) => !current);
                            setExportMenuOpen(false);
                          }}
                        >
                          <List className="h-4 w-4" />
                        </button>

                        {columnMenuOpen ? (
                          <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[160px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                            <div className="py-2">
                              {NAP_SEARCH_FIELDS.map((field) => (
                                <label
                                  key={field.key}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeNapSearchFields.some((activeField) => activeField.key === field.key)}
                                    onChange={() => toggleSearchField(field.key)}
                                    className="h-[13px] w-[13px] accent-[#2f3033]"
                                  />
                                  <span>{field.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="relative" ref={exportMenuRef}>
                        <button
                          type="button"
                          className={`inline-flex shrink-0 items-center justify-center border-0 bg-white text-[#394b60] ${
                            isWispHub ? 'h-[42px] w-[42px]' : 'h-[48px] w-[48px]'
                          }`}
                          aria-label="Guardar configuracion"
                          onClick={() => {
                            setExportMenuOpen((current) => !current);
                            setColumnMenuOpen(false);
                          }}
                        >
                          <Save className="h-4 w-4" />
                        </button>

                        {exportMenuOpen ? (
                          <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[170px] border border-[#d7dde5] bg-white py-2 shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                            <button type="button" onClick={() => handleDatasetPrint('NAPS AdminOLT', exportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </button>
                            <button type="button" onClick={() => handleDatasetExportCsv('adminolt-naps.csv', exportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar csv
                            </button>
                            <button type="button" onClick={() => handleDatasetExportExcel('NAPS AdminOLT', 'adminolt-naps.xls', exportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileSpreadsheet className="h-4 w-4" />
                              Exportar a Excel
                            </button>
                            <button type="button" onClick={() => handleDatasetExportPdf('NAPS AdminOLT', exportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar a PDF
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openNapDialog}
                      className={`inline-flex items-center gap-2 ${
                        isWispHub
                          ? 'h-[42px] rounded-[6px] border border-[#42b960] bg-[#45bf63] px-4 text-[14px]'
                          : 'h-[48px] rounded-[4px] border border-[#268df2] bg-[#3399f6] px-5 text-[14px]'
                      } font-semibold text-white`}
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo
                    </button>
                  </div>

                  <div className="relative w-full xl:max-w-[260px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6b5]" />
                    <input
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setCurrentPage(1);
                      }}
                      className={`${isWispHub ? 'h-[42px] rounded-[6px]' : 'h-[48px] rounded-[4px]'} w-full border border-[#d7dde5] bg-white pl-11 pr-4 text-[14px] text-[#24364b] outline-none`}
                      placeholder="Buscar..."
                      aria-label="Buscar NAP"
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
                          {napColumns.map((column) => (
                            <th
                              key={column.key}
                              className={`border-b border-r border-[#d7dde5] px-4 py-3 text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0 ${
                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                              } ${column.width ? `[width:${column.width}]` : ''}`}
                            >
                              <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-between'}`}>
                                <span>{column.header}</span>
                                <button
                                  type="button"
                                  onClick={toggleHeaderDirection}
                                  className={`transition ${
                                    headerDirection === 'down' && column.key === 'id'
                                      ? 'text-[#3f93e7]'
                                      : 'text-[#c3ccd6] hover:text-[#3f93e7]'
                                  }`}
                                  aria-label={headerDirection === 'up' ? 'Ir a los ultimos registros' : 'Ir a los primeros registros'}
                                >
                                  {headerDirection === 'up' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedNaps.length === 0 ? (
                          <tr>
                            <td colSpan={napColumns.length} className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]">
                              Ningún registro disponible
                            </td>
                          </tr>
                        ) : (
                          paginatedNaps.map((row, index) => (
                            <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                              {napColumns.map((column) => (
                                <td
                                  key={column.key}
                                  className={`border-b border-r border-[#d7dde5] px-4 py-3 last:border-r-0 ${
                                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                  }`}
                                >
                                  {column.render(row)}
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
                    <button type="button" onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina anterior">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={`flex h-[34px] min-w-[34px] items-center justify-center rounded-[4px] border text-[14px] ${
                        isWispHub
                          ? 'border-[#45bf63] bg-[#45bf63] text-white'
                          : 'border-[#3f93e7] bg-[#3f93e7] text-white'
                      }`}
                    >
                      {filteredNaps.length === 0 ? 0 : safeCurrentPage}
                    </button>
                    <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina siguiente">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-5 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="w-full xl:max-w-[78px]">
                    <select
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                      className={`${isWispHub ? 'h-[42px] rounded-[6px]' : 'h-[48px] rounded-[4px]'} w-full border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none`}
                      aria-label="Cantidad de registros por pagina"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <SearchField
                    isWispHub={isWispHub}
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>
              </div>

              <div className="px-5 pb-5">
                <NetworkTable columns={columns} rows={[]} emptyMessage="Ningun registro disponible" />
                <PaginationBar
                  isWispHub={isWispHub}
                  summary="Mostrando 0 registros"
                  showCurrentPage={false}
                />
              </div>
            </>
          )}
        </NetworkPanel>
      </NetworkPageShell>

      <Dialog open={napDialog.open} onOpenChange={napDialog.setOpen}>
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto border border-[#989898] bg-white p-0 sm:max-w-[500px]">
          <DialogHeader className="border-b border-[#d7dfe8] bg-[#f5f5f5] px-4 py-3">
            <DialogTitle className="text-[18px] font-semibold text-[#303030]">
              Nueva NAP
            </DialogTitle>
          </DialogHeader>

          {napDialog.loading ? (
            <div className="px-6 py-10">
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d7dfe8] bg-[#fbfcfe]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ff] text-[#2f7ee8]">
                  <RefreshCw className="h-10 w-10 animate-spin" />
                </div>
                <p className="mt-6 text-[16px] font-semibold text-[#24364b]">
                  Cargando formulario...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 px-4 py-4">
                {napNoticeVisible ? (
                  <div className="flex items-start gap-3 rounded-[4px] border border-[#ffcb05] bg-[#fff6cf] px-4 py-3 text-[14px] text-[#6b5c00]">
                    <div className="flex-1 text-center leading-6">
                      <span className="font-bold">ATENCION!!</span> Debe registrar el nombre de la NAP tal como se dará de alta en el sistema.
                    </div>
                    <button
                      type="button"
                      onClick={() => setNapNoticeVisible(false)}
                      className="mt-0.5 text-[#9a8a2a] transition hover:text-[#6b5c00]"
                      aria-label="Cerrar aviso"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                <div className="grid items-center gap-3 md:grid-cols-[148px_minmax(0,1fr)]">
                  <label htmlFor="adminolt-nap-name" className="text-[15px] text-[#505b66]">
                    Nombre de la NAP
                  </label>
                  <input
                    id="adminolt-nap-name"
                    value={napFormName}
                    onChange={(event) => setNapFormName(event.target.value)}
                    placeholder="NAP 1"
                    className="h-[36px] rounded-[4px] border border-[#52c1ef] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#d0d5db]"
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-[#d7dfe8] px-4 py-3 sm:justify-end">
                <button
                  type="button"
                  onClick={closeNapDialog}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[14px] font-medium text-[#303030] transition hover:bg-[#f5f7fa]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleNapSubmit}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#268df2] bg-[#2f92f0] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1f82df]"
                >
                  Registrar
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
