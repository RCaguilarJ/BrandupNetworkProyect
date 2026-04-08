import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Edit,
  FileDown,
  FileSpreadsheet,
  List,
  Plus,
  Printer,
  Router,
  Save,
  Trash2,
  Users,
  UserCog,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { toast } from 'sonner';
import {
  filterByCompany,
  mikrosystemPageStyle,
  NETWORK_ROUTERS,
  wisphubPageStyle,
} from './networkManagementData';
import {
  ActionButton,
  HorizontalScrollRail,
  NetworkPageShell,
  NetworkPanel,
  NetworkFormDialog,
  NetworkTable,
  PaginationBar,
  SearchField,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';

type RouterRow = (typeof NETWORK_ROUTERS)[number];

type RouterSearchField = {
  key:
    | 'folio'
    | 'name'
    | 'ip'
    | 'webPort'
    | 'model'
    | 'version'
    | 'clients'
    | 'status'
    | 'actions';
  label: string;
  getValue: (row: RouterRow) => string;
};

const ROUTER_SEARCH_FIELDS: RouterSearchField[] = [
  { key: 'folio', label: 'Folio', getValue: (row) => String(row.folio) },
  { key: 'name', label: 'Nombre', getValue: (row) => `${row.name} ${row.subtitle}`.trim() },
  { key: 'ip', label: 'IP', getValue: (row) => row.ip },
  { key: 'webPort', label: 'Puerto web', getValue: () => '' },
  { key: 'model', label: 'Modelo', getValue: (row) => row.model || '-' },
  { key: 'version', label: 'Versión', getValue: (row) => row.version },
  { key: 'clients', label: 'Clientes', getValue: (row) => String(row.clients) },
  { key: 'status', label: 'Estado', getValue: (row) => row.status },
  { key: 'actions', label: 'Acciones', getValue: () => '' },
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

function buildRouterExportRows(rows: RouterRow[]) {
  return rows.map((row) => ({
    FOLIO: String(row.folio),
    NOMBRE: row.name,
    IP: row.ip,
    MODELO: row.model || '-',
    VERSION: row.version,
    CLIENTES: String(row.clients),
    ESTADO: row.status,
  }));
}

const securityOptions = [
  'Ninguno / Accounting API',
  'PPP / Accounting API',
  'Hotspot / Accounting API',
  'PPP / Accounting Radius',
  'Hotspot / Accounting Radius',
] as const;

export default function NetworkRouters() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const navigate = useNavigate();
  const isWispHub = viewTheme === 'wisphub';
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [routerRows, setRouterRows] = useState(() =>
    filterByCompany(NETWORK_ROUTERS, user?.role, user?.companyId),
  );
  const [selectedSearchFields, setSelectedSearchFields] = useState<string[]>(
    ROUTER_SEARCH_FIELDS.map((field) => field.key),
  );
  const [form, setForm] = useState({
    folio: String(routerRows.length + 1),
    name: '',
    username: '',
    password: '',
    security: securityOptions[0],
    ip: '',
  });
  const dialog = useNetworkDialog();

  const activeSearchFields = useMemo(() => {
    const filtered = ROUTER_SEARCH_FIELDS.filter((field) => selectedSearchFields.includes(field.key));
    return filtered.length > 0 ? filtered : ROUTER_SEARCH_FIELDS;
  }, [selectedSearchFields]);

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

  const filteredRouters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return routerRows;
    }

    return routerRows.filter((router) =>
      activeSearchFields.some((field) => field.getValue(router).toLowerCase().includes(query)),
    );
  }, [activeSearchFields, routerRows, searchTerm]);

  const openNewRouterDialog = () => {
    setForm({
      folio: String(routerRows.length + 1),
      name: '',
      username: '',
      password: '',
      security: securityOptions[0],
      ip: '',
    });
    dialog.openDialog();
  };

  const toggleSearchField = (fieldKey: string) => {
    setSelectedSearchFields((current) => {
      if (current.includes(fieldKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== fieldKey);
      }

      return [...current, fieldKey];
    });
  };

  const exportRows = buildRouterExportRows(filteredRouters);

  const openPrintPreview = (title: string, autoPrint: boolean) => {
    const headers = Object.keys(exportRows[0] ?? {
      FOLIO: '',
      NOMBRE: '',
      IP: '',
      MODELO: '',
      VERSION: '',
      CLIENTES: '',
      ESTADO: '',
    });
    const bodyRows = exportRows.length
      ? exportRows
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

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #223448; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d7dde5; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background: #f5f7fb; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();

    if (autoPrint) {
      printWindow.print();
    }
  };

  const handlePrint = () => {
    openPrintPreview('Lista de Router', true);
    setExportMenuOpen(false);
  };

  const handleExportCsv = () => {
    const headers = Object.keys(exportRows[0] ?? {
      FOLIO: '',
      NOMBRE: '',
      IP: '',
      MODELO: '',
      VERSION: '',
      CLIENTES: '',
      ESTADO: '',
    });
    const lines = [
      headers.map(escapeCsvValue).join(','),
      ...exportRows.map((row) => headers.map((header) => escapeCsvValue(row[header as keyof typeof row])).join(',')),
    ];
    downloadBlob('routers.csv', `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    const headers = Object.keys(exportRows[0] ?? {
      FOLIO: '',
      NOMBRE: '',
      IP: '',
      MODELO: '',
      VERSION: '',
      CLIENTES: '',
      ESTADO: '',
    });
    const tableRows = exportRows
      .map(
        (row) =>
          `<tr>${headers.map((header) => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join('')}</tr>`,
      )
      .join('');

    const documentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #223448; }
    h1 { font-size: 18px; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background: #f3f7fb; }
  </style>
</head>
<body>
  <h1>Lista de Router</h1>
  <table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

    downloadBlob('routers.xls', `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    openPrintPreview('Lista de Router - PDF', true);
    setExportMenuOpen(false);
  };

  const handleEditRouter = (router: RouterRow) => {
    navigate(`/network-management/routers/${router.id}/edit`, {
      state: { router },
    });
  };

  const handleDeleteRouter = (router: RouterRow) => {
    const confirmed = window.confirm(`¿Deseas eliminar el router ${router.name}?`);

    if (!confirmed) {
      return;
    }

    setRouterRows((current) => current.filter((item) => item.id !== router.id));
    toast.success(`Router ${router.name} eliminado correctamente`);
  };

  const handleRouterAction = (
    action: 'api' | 'clients' | 'credentials' | 'tools',
    router: RouterRow,
  ) => {
    const messages = {
      api: `Conexion API del router ${router.name}: ${router.status}`,
      clients: `${router.name} tiene ${router.clients} clientes asociados`,
      credentials: `Usuario API de ${router.name}: ${router.username}`,
      tools: `Herramientas del router ${router.name} listas para integrarse`,
    } satisfies Record<typeof action, string>;

    toast.info(messages[action]);
  };

  const saveRouter = () => {
    if (!form.name || !form.username || !form.password || !form.ip) {
      toast.error('Completa nombre, usuario, contraseña e IP del router');
      return;
    }

    setRouterRows((current) => {
      const nextRouter: RouterRow = {
        id: `router-${Date.now()}`,
        companyId: user?.companyId ?? 'comp1',
        folio: Number.parseInt(form.folio, 10) || current.length + 1,
        name: form.name,
        subtitle: form.security,
        username: form.username,
        password: form.password,
        security: form.security,
        ip: form.ip,
        model: '',
        version: '-',
        clients: 0,
        status: 'API-ERROR',
      };

      return [...current, nextRouter];
    });

    dialog.closeDialog();
    toast.success('Router agregado correctamente');
  };

  const columns: DataColumn<RouterRow>[] = [
    {
      key: 'folio',
      header: 'FOLIO',
      width: '90px',
      render: (row) => row.folio,
    },
    {
      key: 'name',
      header: 'NOMBRE',
      render: (row) => (
        <div>
          <div className="text-[20px] text-[#596777]">{row.name}</div>
          <div className="text-[14px] text-[#f6a531]">{row.subtitle}</div>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      width: '170px',
      render: (row) => row.ip,
    },
    {
      key: 'model',
      header: 'MODELO',
      width: '170px',
      render: (row) => row.model || '-',
    },
    {
      key: 'version',
      header: 'VERSION',
      width: '170px',
      render: (row) => row.version,
    },
    {
      key: 'clients',
      header: 'CLIENTES',
      width: '160px',
      align: 'center',
      render: (row) => (
        <span className="inline-flex min-w-[34px] justify-center rounded-full bg-[#11b5bb] px-3 py-1 text-[14px] font-semibold text-white">
          {row.clients}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'ESTADO',
      width: '180px',
      align: 'center',
      render: (row) => (
        <span className="inline-flex rounded-[6px] bg-[#f5a623] px-3 py-1 text-[14px] font-semibold text-white">
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'ACCIONES',
      width: '200px',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2 text-[#32475c]">
          <button
            type="button"
            onClick={() => handleEditRouter(row)}
            className="transition hover:text-[#268df2]"
            aria-label={`Editar router ${row.name}`}
            title={`Editar ${row.name}`}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRouter(row)}
            className="transition hover:text-[#dc2626]"
            aria-label={`Eliminar router ${row.name}`}
            title={`Eliminar ${row.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleRouterAction('api', row)}
            className="transition hover:text-[#0f766e]"
            aria-label={`Ver estado API del router ${row.name}`}
            title={`Estado API de ${row.name}`}
          >
            <Router className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleRouterAction('clients', row)}
            className="transition hover:text-[#0f766e]"
            aria-label={`Ver clientes del router ${row.name}`}
            title={`Clientes de ${row.name}`}
          >
            <Users className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleRouterAction('credentials', row)}
            className="transition hover:text-[#0f766e]"
            aria-label={`Configurar credenciales del router ${row.name}`}
            title={`Credenciales de ${row.name}`}
          >
            <UserCog className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleRouterAction('tools', row)}
            className="transition hover:text-[#0f766e]"
            aria-label={`Abrir herramientas del router ${row.name}`}
            title={`Herramientas de ${row.name}`}
          >
            <Wrench className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="Lista de Router"
        breadcrumb="Routers"
        isWispHub={isWispHub}
      >
        <NetworkPanel isWispHub={isWispHub}>
          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex overflow-visible rounded-[6px] border border-[#d7dde5] bg-white">
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className={`min-w-[58px] border-0 border-r border-[#d7dde5] bg-white px-4 text-[14px] outline-none ${
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
                      className={`inline-flex items-center justify-center border-0 border-r border-[#d7dde5] bg-white text-[#394b60] ${
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
                      <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[170px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                        <div className="max-h-[260px] overflow-y-auto py-2">
                          {ROUTER_SEARCH_FIELDS.map((field) => (
                            <label
                              key={field.key}
                              className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                            >
                              <input
                                type="checkbox"
                                checked={activeSearchFields.some((activeField) => activeField.key === field.key)}
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
                      className={`inline-flex items-center justify-center border-0 bg-white text-[#394b60] ${
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
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                        >
                          <Printer className="h-4 w-4" />
                          Imprimir
                        </button>
                        <button
                          type="button"
                          onClick={handleExportCsv}
                          className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                        >
                          <FileDown className="h-4 w-4" />
                          Exportar csv
                        </button>
                        <button
                          type="button"
                          onClick={handleExportExcel}
                          className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          Exportar a Excel
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                        >
                          <FileDown className="h-4 w-4" />
                          Exportar a PDF
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <ActionButton
                  isWispHub={isWispHub}
                  icon={<Plus className="h-5 w-5" />}
                  label="Nuevo"
                  primary
                  wide
                  onClick={openNewRouterDialog}
                />
              </div>

              <SearchField
                isWispHub={isWispHub}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
          </div>

          <div className="px-5 pb-5">
            <NetworkTable
              columns={columns}
              rows={filteredRouters.slice(0, pageSize)}
              emptyMessage="Ningun registro disponible"
            />
            <PaginationBar
              isWispHub={isWispHub}
              summary={
                filteredRouters.length === 0
                  ? 'Mostrando 0 registros'
                  : `Mostrando de 1 a ${Math.min(pageSize, filteredRouters.length)} de un total de ${filteredRouters.length}`
              }
              showCurrentPage={filteredRouters.length > 0}
            />
            {!isWispHub ? <HorizontalScrollRail /> : null}
          </div>
        </NetworkPanel>
      </NetworkPageShell>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo Router"
        submitLabel="Guardar Router"
        values={form}
        fields={[
          { name: 'name', label: 'Nombre', required: true, placeholder: 'Nombre del router' },
          { name: 'username', label: 'Usuario', required: true, placeholder: 'Usuario API' },
          {
            name: 'password',
            label: 'Contraseña',
            type: 'password',
            required: true,
            placeholder: 'Contraseña API',
          },
          { name: 'ip', label: 'IP', required: true, placeholder: 'IP o host de conexión' },
          {
            name: 'security',
            label: 'Seguridad',
            type: 'select',
            options: securityOptions.map((option) => ({ value: option, label: option })),
            colSpan: 2,
          },
        ]}
        onOpenChange={dialog.setOpen}
        onFieldChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
        onSubmit={saveRouter}
      />
    </div>
  );
}
