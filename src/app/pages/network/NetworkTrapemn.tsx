import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  List,
  Printer,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  TRAPEMN_DEVICES,
  TRAPEMN_PLANS,
  wisphubPageStyle,
} from './networkManagementData';
import {
  NetworkPanel,
  TopTabs,
} from './networkManagementShared';

type TrapemnTab = 'devices' | 'plans' | 'api';
type TrapemnDeviceRow = (typeof TRAPEMN_DEVICES)[number];
type TrapemnPlanRow = (typeof TRAPEMN_PLANS)[number];

type DeviceColumnKey =
  | 'client'
  | 'rut'
  | 'crmId'
  | 'user'
  | 'macs'
  | 'devices'
  | 'plan'
  | 'status';

type PlanColumnKey = 'planId' | 'name' | 'categories';

type DeviceColumn = {
  key: DeviceColumnKey;
  header: string;
  label: string;
  width?: string;
  getValue: (row: TrapemnDeviceRow) => string;
};

type PlanColumn = {
  key: PlanColumnKey;
  header: string;
  label: string;
  width?: string;
  getValue: (row: TrapemnPlanRow) => string;
};

const DEVICE_COLUMNS: DeviceColumn[] = [
  { key: 'client', header: 'CLIENTE', label: 'Cliente', width: '270px', getValue: (row) => row.client },
  { key: 'rut', header: 'RUT', label: 'RUT', width: '110px', getValue: (row) => row.rut },
  { key: 'crmId', header: 'ID CRM', label: 'ID CRM', width: '120px', getValue: (row) => row.crmId },
  { key: 'user', header: 'USUARIO', label: 'Usuario', width: '170px', getValue: (row) => row.user },
  { key: 'macs', header: 'MACS ASOCIADOS', label: 'MACs Asociados', width: '180px', getValue: (row) => String(row.macs) },
  { key: 'devices', header: 'DISP.', label: 'Disp.', width: '90px', getValue: (row) => String(row.devices) },
  { key: 'plan', header: 'PLAN', label: 'Plan', width: '130px', getValue: (row) => row.plan },
  { key: 'status', header: 'ESTADO', label: 'Estado', width: '110px', getValue: (row) => row.status },
];

const PLAN_COLUMNS: PlanColumn[] = [
  { key: 'planId', header: 'PLAN ID', label: 'Plan ID', width: '170px', getValue: (row) => row.planId },
  { key: 'name', header: 'NOMBRE', label: 'Nombre', width: '360px', getValue: (row) => row.name },
  { key: 'categories', header: 'CATEGORIAS', label: 'Categorias', width: '320px', getValue: (row) => row.categories },
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

function readStoredValue(key: string, fallback: string) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}

export default function NetworkTrapemn() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<TrapemnTab>('devices');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [visibleDeviceColumnKeys, setVisibleDeviceColumnKeys] = useState<DeviceColumnKey[]>(
    DEVICE_COLUMNS.map((column) => column.key),
  );
  const [visiblePlanColumnKeys, setVisiblePlanColumnKeys] = useState<PlanColumnKey[]>(
    PLAN_COLUMNS.map((column) => column.key),
  );
  const [domain, setDomain] = useState(() => readStoredValue('trapemn-api-domain', ''));
  const [token, setToken] = useState(() => readStoredValue('trapemn-api-token', ''));
  const [disableTv, setDisableTv] = useState(() => readStoredValue('trapemn-api-disable-tv', 'no'));

  const tabs = [
    { id: 'devices', label: 'EQUIPOS CONFIGURADOS' },
    { id: 'plans', label: 'PLANES TRAPEMN' },
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
    window.localStorage.setItem('trapemn-api-domain', domain);
  }, [domain]);

  useEffect(() => {
    window.localStorage.setItem('trapemn-api-token', token);
  }, [token]);

  useEffect(() => {
    window.localStorage.setItem('trapemn-api-disable-tv', disableTv);
  }, [disableTv]);

  const deviceRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return TRAPEMN_DEVICES;
    }

    return TRAPEMN_DEVICES.filter((row) =>
      DEVICE_COLUMNS.some((column) => column.getValue(row).toLowerCase().includes(query)),
    );
  }, [searchTerm]);

  const planRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return TRAPEMN_PLANS;
    }

    return TRAPEMN_PLANS.filter((row) =>
      PLAN_COLUMNS.some((column) => column.getValue(row).toLowerCase().includes(query)),
    );
  }, [searchTerm]);

  const visibleDeviceColumns = useMemo(() => {
    const filtered = DEVICE_COLUMNS.filter((column) => visibleDeviceColumnKeys.includes(column.key));
    return filtered.length > 0 ? filtered : DEVICE_COLUMNS;
  }, [visibleDeviceColumnKeys]);

  const visiblePlanColumns = useMemo(() => {
    const filtered = PLAN_COLUMNS.filter((column) => visiblePlanColumnKeys.includes(column.key));
    return filtered.length > 0 ? filtered : PLAN_COLUMNS;
  }, [visiblePlanColumnKeys]);

  const activeRows = activeTab === 'plans' ? planRows : deviceRows;

  const deviceExportHeaders = visibleDeviceColumns.map((column) => column.header);
  const deviceExportRows = deviceRows.map((row) =>
    Object.fromEntries(visibleDeviceColumns.map((column) => [column.header, column.getValue(row)])),
  );

  const planExportHeaders = visiblePlanColumns.map((column) => column.header);
  const planExportRows = planRows.map((row) =>
    Object.fromEntries(visiblePlanColumns.map((column) => [column.header, column.getValue(row)])),
  );

  const handleTabChange = (value: TrapemnTab) => {
    setActiveTab(value);
    setSearchTerm('');
    setColumnMenuOpen(false);
    setExportMenuOpen(false);
  };

  const toggleDeviceColumn = (columnKey: DeviceColumnKey) => {
    setVisibleDeviceColumnKeys((current) => {
      if (current.includes(columnKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const togglePlanColumn = (columnKey: PlanColumnKey) => {
    setVisiblePlanColumnKeys((current) => {
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
    if (activeTab === 'plans') {
      openDatasetPrintPreview('Planes Trapemn', planExportRows, true, planExportHeaders);
    } else {
      openDatasetPrintPreview('Equipos Configurados Trapemn', deviceExportRows, true, deviceExportHeaders);
    }
    setExportMenuOpen(false);
  };

  const handleDatasetExportCsv = () => {
    const headers = getDatasetHeaders(
      activeTab === 'plans' ? planExportRows : deviceExportRows,
      activeTab === 'plans' ? planExportHeaders : deviceExportHeaders,
    );
    const rows = activeTab === 'plans' ? planExportRows : deviceExportRows;
    const lines = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header] ?? '')).join(',')),
    ];
    downloadBlob(
      activeTab === 'plans' ? 'trapemn-planes.csv' : 'trapemn-equipos.csv',
      `\uFEFF${lines.join('\n')}`,
      'text/csv;charset=utf-8;',
    );
    setExportMenuOpen(false);
  };

  const handleDatasetExportExcel = () => {
    const title = activeTab === 'plans' ? 'Planes Trapemn' : 'Equipos Configurados Trapemn';
    const headers = getDatasetHeaders(
      activeTab === 'plans' ? planExportRows : deviceExportRows,
      activeTab === 'plans' ? planExportHeaders : deviceExportHeaders,
    );
    const rows = activeTab === 'plans' ? planExportRows : deviceExportRows;
    const rowsHtml = rows
      .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 18px; margin: 0 0 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f3f7fb; }</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    downloadBlob(
      activeTab === 'plans' ? 'trapemn-planes.xls' : 'trapemn-equipos.xls',
      `\uFEFF${documentHtml}`,
      'application/vnd.ms-excel;charset=utf-8;',
    );
    setExportMenuOpen(false);
  };

  const handleDatasetExportPdf = () => {
    if (activeTab === 'plans') {
      openDatasetPrintPreview('Planes Trapemn - PDF', planExportRows, true, planExportHeaders);
    } else {
      openDatasetPrintPreview('Equipos Configurados Trapemn - PDF', deviceExportRows, true, deviceExportHeaders);
    }
    setExportMenuOpen(false);
  };

  const handleApiSave = () => {
    toast.success('Configuracion API guardada correctamente');
  };

  const inputClass =
    'h-[34px] rounded-[4px] border border-[#d7dde5] bg-white px-3 text-[14px] text-[#24364b] outline-none';

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPanel isWispHub={isWispHub}>
        <div className="px-5 pt-5">
          <TopTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(value) => handleTabChange(value as TrapemnTab)}
            isWispHub={isWispHub}
          />
        </div>

        {activeTab === 'devices' || activeTab === 'plans' ? (
          <>
            <div className="px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative inline-flex items-stretch overflow-visible rounded-[4px] border border-[#d7dde5] bg-white align-middle">
                    <select
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
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
                        <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[210px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                          <div className="max-h-[260px] overflow-y-auto py-2">
                            {activeTab === 'plans'
                              ? PLAN_COLUMNS.map((column) => (
                                  <label
                                    key={column.key}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={visiblePlanColumns.some((visibleColumn) => visibleColumn.key === column.key)}
                                      onChange={() => togglePlanColumn(column.key)}
                                      className="h-[13px] w-[13px] accent-[#2f3033]"
                                    />
                                    <span>{column.label}</span>
                                  </label>
                                ))
                              : DEVICE_COLUMNS.map((column) => (
                                  <label
                                    key={column.key}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={visibleDeviceColumns.some((visibleColumn) => visibleColumn.key === column.key)}
                                      onChange={() => toggleDeviceColumn(column.key)}
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
                </div>

                <div className="w-full xl:max-w-[260px]">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-[34px] w-full rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none placeholder:text-[#c6ced8]"
                    placeholder="Buscar..."
                    aria-label="Buscar trapemn"
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
                        {(activeTab === 'plans' ? visiblePlanColumns : visibleDeviceColumns).map((column) => (
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
                      {activeRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={(activeTab === 'plans' ? visiblePlanColumns : visibleDeviceColumns).length}
                            className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]"
                          >
                            Cargando...
                          </td>
                        </tr>
                      ) : (
                        (activeTab === 'plans' ? planRows : deviceRows).slice(0, pageSize).map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                            {(activeTab === 'plans' ? visiblePlanColumns : visibleDeviceColumns).map((column) => (
                              <td
                                key={column.key}
                                className="border-b border-r border-[#d7dde5] px-3 py-3 last:border-r-0"
                              >
                                {column.getValue(row as never)}
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
                <div>Mostrando 0 registros</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]"
                    aria-label="Pagina anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]"
                    aria-label="Pagina siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-6">
            <div className="max-w-[780px]">
              <h2 className="mb-6 text-[18px] font-semibold text-[#24364b]">Configuración Conexión API</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[15px] text-[#24364b]">Dominio Trapemn</label>
                  <input
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="Ejm: miwifi"
                    className={`${inputClass} w-full max-w-[776px]`}
                  />
                  <p className="mt-1 text-[12px] text-[#15a8d6]">Ejm: https://miempresa.trapemn.tv</p>
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-[#24364b]">Token de Seguridad</label>
                  <input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="kljsdkljx232klj32"
                    className={`${inputClass} w-full max-w-[776px]`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-[#24364b]">Desactivar TV</label>
                  <div className="relative max-w-[776px]">
                    <select
                      value={disableTv}
                      onChange={(event) => setDisableTv(event.target.value)}
                      className={`${inputClass} w-full appearance-none pr-10`}
                    >
                      <option value="no">NO</option>
                      <option value="si">SI</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#24364b]">▾</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#f28c28]">
                    * ACTIVA/DESACTIVA TV al suspender/activar al cliente en la plataforma.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApiSave}
                  className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#268df2] bg-[#2f92f0] px-6 text-[15px] font-semibold text-white transition hover:bg-[#1f82df]"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </NetworkPanel>
    </div>
  );
}
