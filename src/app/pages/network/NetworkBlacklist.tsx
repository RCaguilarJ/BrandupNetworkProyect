import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  List,
  Plus,
  Printer,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  NetworkFormDialog,
  NetworkPageShell,
  NetworkPanel,
  useNetworkDialog,
} from './networkManagementShared';

type BlacklistRow = {
  id: string;
  nombre: string;
  ip: string;
  estado: string;
  listado: string;
  actualizado: string;
};

type BlacklistColumnKey = 'id' | 'nombre' | 'ip' | 'estado' | 'listado' | 'actualizado';

type BlacklistColumn = {
  key: BlacklistColumnKey;
  header: string;
  label: string;
  widthClassName?: string;
  getValue: (row: BlacklistRow) => string;
};

const BLACKLIST_COLUMNS: BlacklistColumn[] = [
  { key: 'id', header: 'ID', label: 'ID', widthClassName: 'w-[60px]', getValue: (row) => row.id },
  { key: 'nombre', header: 'NOMBRE', label: 'Nombre', widthClassName: 'w-[230px]', getValue: (row) => row.nombre },
  { key: 'ip', header: 'IP', label: 'IP', widthClassName: 'w-[120px]', getValue: (row) => row.ip },
  { key: 'estado', header: 'ESTADO', label: 'Estado', widthClassName: 'w-[190px]', getValue: (row) => row.estado },
  { key: 'listado', header: 'LISTADO EN', label: 'Listado en', widthClassName: 'w-[300px]', getValue: (row) => row.listado },
  {
    key: 'actualizado',
    header: 'ACTUALIZADO',
    label: 'Actualizado',
    widthClassName: 'w-[280px]',
    getValue: (row) => row.actualizado,
  },
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

export default function NetworkBlacklist() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const dialog = useNetworkDialog();
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<BlacklistColumnKey[]>(
    BLACKLIST_COLUMNS.map((column) => column.key),
  );
  const [rows, setRows] = useState<BlacklistRow[]>(() => readStoredRows('network-blacklist-rows', []));
  const [form, setForm] = useState<BlacklistRow>({
    id: '1',
    nombre: '',
    ip: '',
    estado: 'LISTADO',
    listado: 'Firewall',
    actualizado: new Date().toISOString().slice(0, 10),
  });

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
    window.localStorage.setItem('network-blacklist-rows', JSON.stringify(rows));
  }, [rows]);

  const visibleColumns = useMemo(() => {
    const filtered = BLACKLIST_COLUMNS.filter((column) => visibleColumnKeys.includes(column.key));
    return filtered.length > 0 ? filtered : BLACKLIST_COLUMNS;
  }, [visibleColumnKeys]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      BLACKLIST_COLUMNS.some((column) => column.getValue(row).toLowerCase().includes(query)),
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
  const exportRows = filteredRows.map((row) =>
    Object.fromEntries(visibleColumns.map((column) => [column.header, column.getValue(row)])),
  );

  const toggleColumn = (columnKey: BlacklistColumnKey) => {
    setVisibleColumnKeys((current) => {
      if (current.includes(columnKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const openDialog = () => {
    setForm({
      id: String(rows.length + 1),
      nombre: '',
      ip: '',
      estado: 'LISTADO',
      listado: 'Firewall',
      actualizado: new Date().toISOString().slice(0, 10),
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.nombre.trim() || !form.ip.trim()) {
      toast.error('Completa los campos requeridos de la lista negra');
      return;
    }

    setRows((current) => [
      ...current,
      {
        id: form.id.trim(),
        nombre: form.nombre.trim(),
        ip: form.ip.trim(),
        estado: form.estado.trim(),
        listado: form.listado.trim(),
        actualizado: form.actualizado.trim(),
      },
    ]);
    dialog.closeDialog();
    setCurrentPage(1);
    setSearchTerm('');
    toast.success('IP agregada a la lista negra');
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
    openDatasetPrintPreview('Monitor IPs Lista Negra', exportRows, true, exportHeaders);
    setExportMenuOpen(false);
  };

  const handleDatasetExportCsv = () => {
    const headers = getDatasetHeaders(exportRows, exportHeaders);
    const lines = [
      headers.map(escapeCsvValue).join(','),
      ...exportRows.map((row) => headers.map((header) => escapeCsvValue(row[header] ?? '')).join(',')),
    ];
    downloadBlob('monitor-blacklist.csv', `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleDatasetExportExcel = () => {
    const headers = getDatasetHeaders(exportRows, exportHeaders);
    const rowsHtml = exportRows
      .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 18px; margin: 0 0 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f3f7fb; }</style></head><body><h1>Monitor IPs Lista Negra</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    downloadBlob('monitor-blacklist.xls', `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleDatasetExportPdf = () => {
    openDatasetPrintPreview('Monitor IPs Lista Negra - PDF', exportRows, true, exportHeaders);
    setExportMenuOpen(false);
  };

  return (
    <div
      className={
        isWispHub
          ? 'min-h-full border-t-4 border-[#45bf63] bg-[radial-gradient(circle_at_top_right,rgba(69,191,99,0.08),transparent_28%),#ffffff] pb-8 font-["Trebuchet_MS","Segoe_UI",Tahoma,Geneva,Verdana,sans-serif] text-[#17273d]'
          : 'min-h-full bg-[#d9e7f3] px-[22px] pb-[26px] pt-[18px] font-["Segoe_UI",Tahoma,Geneva,Verdana,sans-serif] text-[#223448]'
      }
    >
      <NetworkPageShell
        title="Monitor IPs Lista Negra"
        breadcrumb="Monitor BlackList"
        isWispHub={isWispHub}
      >
        <NetworkPanel isWispHub={isWispHub}>
          <div className="px-5 py-5">
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
                          {BLACKLIST_COLUMNS.map((column) => (
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

                <button
                  type="button"
                  onClick={openDialog}
                  className="inline-flex h-[34px] items-center gap-2 rounded-[4px] border border-[#268df2] bg-[#3399f6] px-4 text-[14px] font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo
                </button>
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
                  aria-label="Buscar lista negra"
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
                          className={`border-b border-r border-[#d7dde5] px-3 py-3 text-left text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0 ${column.widthClassName ?? ''}`}
                        >
                          {column.header}
                        </th>
                      ))}
                      <th className="border-b border-[#d7dde5] px-3 py-3 text-center text-[13px] font-semibold uppercase text-[#24364b]" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={visibleColumns.length + 1}
                          className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]"
                        >
                          Ningún registro disponible
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row, index) => (
                        <tr key={`${row.id}-${index}`} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                          {visibleColumns.map((column) => (
                            <td
                              key={column.key}
                              className="border-b border-r border-[#d7dde5] px-3 py-3 last:border-r-0"
                            >
                              {column.getValue(row)}
                            </td>
                          ))}
                          <td className="border-b border-[#d7dde5] px-3 py-3" />
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
          </div>
        </NetworkPanel>
      </NetworkPageShell>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo Registro de BlackList"
        submitLabel="Guardar Registro"
        values={form}
        fields={[
          { name: 'id', label: 'ID', type: 'number', required: true, min: 1 },
          { name: 'nombre', label: 'Nombre', required: true },
          { name: 'ip', label: 'IP', required: true },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'LISTADO', label: 'LISTADO' },
              { value: 'PENDIENTE', label: 'PENDIENTE' },
            ],
          },
          { name: 'listado', label: 'Listado en', required: true },
          { name: 'actualizado', label: 'Actualizado', type: 'date', required: true },
        ]}
        onOpenChange={dialog.setOpen}
        onFieldChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
        onSubmit={saveRow}
      />
    </div>
  );
}
