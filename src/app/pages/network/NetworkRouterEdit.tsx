import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  Check,
  Ban,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileUp,
  Info,
  List,
  Monitor,
  Plus,
  Printer,
  Router,
  Search,
  Shield,
  RefreshCw,
  ArrowLeft,
  MapPin,
  Eye,
  EyeOff,
  Save,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  getNetworkRouterById,
  mikrosystemPageStyle,
  type NetworkRouterRecord,
  wisphubPageStyle,
} from './networkManagementData';

type RouterEditTab = 'data' | 'vpn' | 'blocking' | 'mikrotik' | 'graphs' | 'log';

type RouterEditFormState = {
  name: string;
  routerType: string;
  location: string;
  ipHost: string;
  security: string;
  alternateSecurity: string;
  apiUser: string;
  apiPassword: string;
  trafficLog: string;
  speedControl: string;
  saveVisitedIps: boolean;
  backupMikrotik: boolean;
  radiusSecret: string;
  radiusNasIp: string;
  connectedSubnets: string;
  vpnNoticeAccepted: boolean;
};

type RouterLocationState = {
  router?: NetworkRouterRecord;
};

type BlockingColumnKey =
  | 'index'
  | 'nameHost'
  | 'type'
  | 'ipRegexp'
  | 'status'
  | 'actions';

type BlockingRow = {
  id: string;
  nameHost: string;
  type: string;
  ipRegexp: string;
  status: string;
};

type BlockingRuleFormState = {
  nameHost: string;
  blockType: string;
  ipRegexp: string;
};

const routerTypeOptions = ['MikroTik', 'Cisco', 'Ubiquiti', 'Huawei'];
const securityOptions = [
  'Ninguno / Accounting API',
  'PPP / Accounting API',
  'Hotspot / Accounting API',
  'PPP / Accounting Radius',
  'Hotspot / Accounting Radius',
];
const alternateSecurityOptions = [
  'Ninguno',
  'Amarre de IP y Mac',
  'DHCP Leases',
  'IP Binding',
  'Amarre de IP y Mac + DHCP Leases',
];
const trafficLogOptions = [
  'Traffic Flow (RouterOS V6x,V7.x)',
  'NetFlow',
  'sFlow',
  'Ninguno',
];
const speedControlOptions = [
  'Colas Simples (Estaticas)',
  'Queues dinamicas',
  'Burst control',
  'Sin control',
];
const mikrotikInterfaceOptions = ['ether1', 'ether2', 'wlan1', 'bridge-lan'];

const tabs: Array<{ id: RouterEditTab; label: string; icon: LucideIcon }> = [
  { id: 'data', label: 'Datos & Configuracion', icon: Monitor },
  { id: 'vpn', label: 'VPN', icon: Shield },
  { id: 'blocking', label: 'Bloqueo de Paginas', icon: Ban },
  { id: 'mikrotik', label: 'Mikrotik', icon: Router },
  { id: 'graphs', label: 'Graficos', icon: BarChart3 },
  { id: 'log', label: 'Log', icon: FileText },
];

const blockingColumns: Array<{
  key: BlockingColumnKey;
  header: string;
  label: string;
  widthClassName?: string;
  getValue: (row: BlockingRow, index: number) => string;
}> = [
  {
    key: 'index',
    header: '#',
    label: '#',
    widthClassName: 'w-[46px]',
    getValue: (_row, index) => String(index + 1),
  },
  {
    key: 'nameHost',
    header: 'NOMBRE/HOST',
    label: 'Nombre/Host',
    widthClassName: 'w-[360px]',
    getValue: (row) => row.nameHost,
  },
  {
    key: 'type',
    header: 'TIPO',
    label: 'Tipo',
    widthClassName: 'w-[160px]',
    getValue: (row) => row.type,
  },
  {
    key: 'ipRegexp',
    header: 'IP/REGEXP',
    label: 'IP/Regexp',
    widthClassName: 'w-[260px]',
    getValue: (row) => row.ipRegexp,
  },
  {
    key: 'status',
    header: 'ESTADO',
    label: 'Estado',
    widthClassName: 'w-[180px]',
    getValue: (row) => row.status,
  },
  {
    key: 'actions',
    header: 'ACCIONES',
    label: 'Acciones',
    widthClassName: 'w-[180px]',
    getValue: () => '',
  },
];

function controlA11yProps(label: string) {
  return {
    'aria-label': label,
    title: label,
  } as const;
}

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

function buildRouterFormState(router?: NetworkRouterRecord): RouterEditFormState {
  return {
    name: router?.name ?? '',
    routerType: 'MikroTik',
    location: '',
    ipHost: router?.ip ?? '',
    security: router?.security ?? securityOptions[0],
    alternateSecurity: alternateSecurityOptions[0],
    apiUser: router?.username ?? '',
    apiPassword: router?.password ?? '',
    trafficLog: trafficLogOptions[0],
    speedControl: speedControlOptions[0],
    saveVisitedIps: false,
    backupMikrotik: true,
    radiusSecret: '',
    radiusNasIp: '192.168.1.1',
    connectedSubnets: '',
    vpnNoticeAccepted: false,
  };
}

function inputClassName(extraClassName = '') {
  return `h-[50px] w-full rounded-[6px] border border-[#cfd8e3] bg-white px-5 text-[15px] text-[#24364b] outline-none placeholder:text-[#c3ccd6] ${extraClassName}`;
}

function labelClassName() {
  return 'text-[15px] font-medium text-[#3a4c60]';
}

function sanitizeCoordinateValue(value: string) {
  return value.replace(/[^0-9,.\-\s]/g, '');
}

function sanitizeIpValue(value: string) {
  return value.replace(/[^0-9.]/g, '');
}

function FormRow({
  label,
  children,
  action,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
      <div className="flex items-center gap-2 md:justify-end">
        <label className={labelClassName()}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName()} appearance-none pr-10`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6e82]" />
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  sanitize,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
  inputMode?: 'text' | 'numeric' | 'decimal';
  sanitize?: (value: string) => string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(sanitize ? sanitize(event.target.value) : event.target.value)
      }
      inputMode={inputMode}
      placeholder={placeholder}
      className={inputClassName()}
    />
  );
}

function PlaceholderTabCard({ label }: { label: string }) {
  return (
    <div className="rounded-[4px] border border-dashed border-[#cfd8e3] bg-[#f8fbff] px-6 py-10 text-center text-[#58708a]">
      <p className="text-[18px] font-semibold">{label}</p>
      <p className="mt-2 text-[14px]">
        Esta seccion queda lista como base visual para configurarla en el siguiente paso.
      </p>
    </div>
  );
}

function TextAreaField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-[88px] w-full rounded-[6px] border border-[#cfd8e3] bg-white px-5 py-3 text-[15px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
    />
  );
}

function BlockingRuleDialog({
  loading,
  values,
  onFieldChange,
  onClose,
  onSubmit,
}: {
  loading: boolean;
  values: BlockingRuleFormState;
  onFieldChange: <K extends keyof BlockingRuleFormState>(
    field: K,
    value: BlockingRuleFormState[K],
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-[6px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-[#d7dde5] bg-[#f3f5f7] px-4 py-3">
          <h2 className="text-[16px] font-semibold text-[#36485c]">Nueva regla firewall</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-[#6c7d90]"
            {...controlA11yProps('Cerrar nueva regla firewall')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 text-[14px] text-[#45627e]">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Cargando formulario...
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 px-4 py-4">
              <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)] md:items-center">
                <label className="text-right text-[15px] text-[#3a4c60]">Nombre/Host</label>
                <div className="flex">
                  <input
                    value={values.nameHost}
                    onChange={(event) => onFieldChange('nameHost', event.target.value)}
                    placeholder="porno.com"
                    className="h-[40px] flex-1 rounded-l-[4px] border border-r-0 border-[#cfd8e3] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
                    {...controlA11yProps('Nombre o host del bloqueo')}
                  />
                  <button
                    type="button"
                    className="inline-flex h-[40px] w-[42px] items-center justify-center rounded-r-[4px] border border-[#cfd8e3] bg-[#f5f7fa] text-[#2f4e6b]"
                    {...controlA11yProps('Buscar dominio a bloquear')}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)] md:items-center">
                <label className="text-right text-[15px] text-[#3a4c60]">Tipo de Bloqueo</label>
                <div className="relative">
                  <select
                    value={values.blockType}
                    onChange={(event) => onFieldChange('blockType', event.target.value)}
                    className="h-[40px] w-full appearance-none rounded-[4px] border border-[#cfd8e3] bg-white px-3 pr-10 text-[14px] text-[#24364b] outline-none"
                    {...controlA11yProps('Tipo de bloqueo firewall')}
                  >
                    <option>Filter + Address Lists</option>
                    <option>Filter</option>
                    <option>Address Lists</option>
                    <option>Layer7</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6e82]" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)] md:items-start">
                <label className="pt-3 text-right text-[15px] text-[#3a4c60]">IP/Layer 7</label>
                <div className="space-y-2">
                  <input
                    value={values.ipRegexp}
                    onChange={(event) => onFieldChange('ipRegexp', event.target.value)}
                    placeholder="190.100.2.55"
                    className="h-[40px] w-full rounded-[4px] border border-[#cfd8e3] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
                    {...controlA11yProps('IP o expresion regular del bloqueo')}
                  />
                  <p className="text-[12px] text-[#475d73]">
                    Ejm: 190.10.10.90 - 190.10.10.0/24 - ^.+(redtube.com).*$?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#d7dde5] bg-[#f3f5f7] px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[34px] items-center rounded-[4px] border border-[#cfd8e3] bg-white px-4 text-[14px] text-[#334b63]"
                {...controlA11yProps('Cerrar nueva regla firewall')}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-[34px] items-center rounded-[4px] bg-[#2f93e4] px-4 text-[14px] font-semibold text-white"
                {...controlA11yProps('Registrar nueva regla firewall')}
              >
                Registrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlockingImportDialog({
  loading,
  selectedFileName,
  onFileSelected,
  onClose,
  onSubmit,
}: {
  loading: boolean;
  selectedFileName: string;
  onFileSelected: (event: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-[6px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx,.csv"
          className="hidden"
          onChange={onFileSelected}
          {...controlA11yProps('Seleccionar archivo de importacion firewall')}
        />

        <div className="flex items-center justify-between border-b border-[#d7dde5] bg-[#f3f5f7] px-4 py-3">
          <h2 className="text-[16px] font-semibold text-[#36485c]">Importar firewall</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-[#6c7d90]"
            {...controlA11yProps('Cerrar importar firewall')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 text-[14px] text-[#45627e]">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Cargando importador...
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-4 px-6 py-5">
              <div className="relative flex flex-col items-center py-3">
                <div className="absolute bottom-0 top-8 w-px bg-[#29a8ef]" />
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className="relative z-10 mb-6 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 border-[#29a8ef] bg-white text-[18px] font-semibold text-[#29a8ef]"
                  >
                    {step}
                  </div>
                ))}
              </div>

              <div className="space-y-6 py-2 text-[14px] text-[#3d4d5d]">
                <p>
                  Descargue el <button type="button" className="font-semibold text-[#2f93e4]" {...controlA11yProps('Descargar formato XLSX de muestra')}>Formato XLSX</button> de muestra
                </p>

                <div>
                  <p className="text-[28px] leading-none">Prepare sus datos</p>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#5f6f7f]">
                    Asegúrese de incluir los campos obligatorios (<span className="text-[#ff5b5b]">*</span>). si incluye alguna IP o host repetido será excluido de la importación.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex h-[34px] items-center gap-2 rounded-[4px] bg-[#42b9dd] px-5 text-[14px] font-semibold text-white"
                    {...controlA11yProps('Elegir archivo para importar firewall')}
                  >
                    <FileUp className="h-4 w-4" />
                    Elija el archivo de productos para cargar
                  </button>
                  {selectedFileName ? (
                    <p className="text-[12px] text-[#4d6780]">{selectedFileName}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#d7dde5] bg-[#f3f5f7] px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[36px] items-center rounded-full border border-[#2f93e4] bg-white px-5 text-[14px] text-[#2f93e4]"
                {...controlA11yProps('Cancelar importacion firewall')}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-[36px] items-center rounded-full border border-[#2f93e4] bg-white px-5 text-[14px] text-[#2f93e4]"
                {...controlA11yProps('Importar reglas firewall')}
              >
                Importar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function NetworkRouterEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const routerFromState = (location.state as RouterLocationState | null)?.router;
  const blockingColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const blockingExportMenuRef = useRef<HTMLDivElement | null>(null);
  const blockingDialogTimerRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<RouterEditTab>('data');
  const [showApiPassword, setShowApiPassword] = useState(false);
  const [showRadiusSecret, setShowRadiusSecret] = useState(false);
  const [blockingRows, setBlockingRows] = useState<BlockingRow[]>([]);
  const [blockingPageSize, setBlockingPageSize] = useState(15);
  const [blockingCurrentPage, setBlockingCurrentPage] = useState(1);
  const [blockingSearchTerm, setBlockingSearchTerm] = useState('');
  const [blockingColumnMenuOpen, setBlockingColumnMenuOpen] = useState(false);
  const [blockingExportMenuOpen, setBlockingExportMenuOpen] = useState(false);
  const [blockingDialogOpen, setBlockingDialogOpen] = useState<'new' | 'import' | null>(null);
  const [blockingDialogLoading, setBlockingDialogLoading] = useState(false);
  const [blockingRuleForm, setBlockingRuleForm] = useState<BlockingRuleFormState>({
    nameHost: '',
    blockType: 'Filter + Address Lists',
    ipRegexp: '',
  });
  const [blockingImportFileName, setBlockingImportFileName] = useState('');
  const [blockingVisibleColumnKeys, setBlockingVisibleColumnKeys] = useState<BlockingColumnKey[]>(
    blockingColumns.map((column) => column.key),
  );
  const [mikrotikInterface, setMikrotikInterface] = useState(mikrotikInterfaceOptions[0]);

  const routerRecord = useMemo(
    () =>
      routerFromState ??
      (id ? getNetworkRouterById(id, user?.role, user?.companyId) : undefined),
    [id, routerFromState, user?.companyId, user?.role],
  );

  const [form, setForm] = useState<RouterEditFormState>(() =>
    buildRouterFormState(routerRecord),
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        blockingColumnMenuRef.current &&
        !blockingColumnMenuRef.current.contains(target)
      ) {
        setBlockingColumnMenuOpen(false);
      }

      if (
        blockingExportMenuRef.current &&
        !blockingExportMenuRef.current.contains(target)
      ) {
        setBlockingExportMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    return () => {
      if (blockingDialogTimerRef.current) {
        window.clearTimeout(blockingDialogTimerRef.current);
      }
    };
  }, []);

  const updateField = <K extends keyof RouterEditFormState>(
    field: K,
    value: RouterEditFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.ipHost.trim() || !form.apiUser.trim()) {
      toast.error('Completa nombre del router, IP/Host y usuario API');
      return;
    }

    toast.success('Vista base del router lista para seguir configurandose');
  };

  const handleSaveVpn = () => {
    toast.success('Connected subnets guardado correctamente');
  };

  const handleAcceptVpnNotice = () => {
    updateField('vpnNoticeAccepted', true);
    toast.success('Indicacion de VPN confirmada');
  };

  const toggleBlockingColumn = (columnKey: BlockingColumnKey) => {
    setBlockingVisibleColumnKeys((current) => {
      if (current.includes(columnKey)) {
        return current.length === 1
          ? current
          : current.filter((key) => key !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const filteredBlockingRows = useMemo(() => {
    const query = blockingSearchTerm.trim().toLowerCase();

    if (!query) {
      return blockingRows;
    }

    return blockingRows.filter((row) =>
      blockingColumns.some((column) => {
        if (column.key === 'actions') {
          return false;
        }

        return column.getValue(row, 0).toLowerCase().includes(query);
      }),
    );
  }, [blockingRows, blockingSearchTerm]);

  const visibleBlockingColumns = useMemo(() => {
    const filtered = blockingColumns.filter((column) =>
      blockingVisibleColumnKeys.includes(column.key),
    );

    return filtered.length > 0 ? filtered : blockingColumns;
  }, [blockingVisibleColumnKeys]);

  const blockingTotalPages = Math.max(
    1,
    Math.ceil(filteredBlockingRows.length / blockingPageSize),
  );
  const safeBlockingCurrentPage = Math.min(blockingCurrentPage, blockingTotalPages);
  const paginatedBlockingRows = useMemo(() => {
    const startIndex = (safeBlockingCurrentPage - 1) * blockingPageSize;
    return filteredBlockingRows.slice(startIndex, startIndex + blockingPageSize);
  }, [blockingPageSize, filteredBlockingRows, safeBlockingCurrentPage]);

  const blockingSummary =
    filteredBlockingRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeBlockingCurrentPage - 1) * blockingPageSize + 1} al ${Math.min(
          safeBlockingCurrentPage * blockingPageSize,
          filteredBlockingRows.length,
        )} de un total de ${filteredBlockingRows.length}`;

  const blockingExportHeaders = visibleBlockingColumns.map((column) => column.header);
  const blockingExportRows = filteredBlockingRows.map((row, index) =>
    Object.fromEntries(
      visibleBlockingColumns.map((column) => [column.header, column.getValue(row, index)]),
    ),
  );

  const handlePrintBlocking = () => {
    const rowsHtml = blockingExportRows
      .map((row) => `<tr>${blockingExportHeaders.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=980,height=720');

    if (!printWindow) {
      toast.error('No fue posible abrir la vista de impresion');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Bloqueo de paginas</title><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 20px; margin: 0 0 16px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #d7dde5; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f5f7fb; }</style></head><body><h1>Bloqueo de Paginas</h1><table><thead><tr>${blockingExportHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    setBlockingExportMenuOpen(false);
  };

  const handleExportBlockingCsv = () => {
    const lines = [
      blockingExportHeaders.map((header) => escapeCsvValue(header)).join(','),
      ...blockingExportRows.map((row) =>
        blockingExportHeaders.map((header) => escapeCsvValue(row[header] ?? '')).join(','),
      ),
    ];
    downloadBlob('router-blocking.csv', `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
    setBlockingExportMenuOpen(false);
  };

  const handleExportBlockingExcel = () => {
    const rowsHtml = blockingExportRows
      .map((row) => `<tr>${blockingExportHeaders.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 18px; margin: 0 0 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f3f7fb; }</style></head><body><h1>Bloqueo de Paginas</h1><table><thead><tr>${blockingExportHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    downloadBlob('router-blocking.xls', `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
    setBlockingExportMenuOpen(false);
  };

  const handleExportBlockingPdf = () => {
    handlePrintBlocking();
  };

  const openBlockingDialogWithReload = (dialog: 'new' | 'import') => {
    if (blockingDialogTimerRef.current) {
      window.clearTimeout(blockingDialogTimerRef.current);
      blockingDialogTimerRef.current = null;
    }

    setBlockingDialogOpen(dialog);
    setBlockingDialogLoading(true);
    blockingDialogTimerRef.current = window.setTimeout(() => {
      setBlockingDialogLoading(false);
      blockingDialogTimerRef.current = null;
    }, 450);
  };

  const closeBlockingDialog = () => {
    if (blockingDialogTimerRef.current) {
      window.clearTimeout(blockingDialogTimerRef.current);
      blockingDialogTimerRef.current = null;
    }

    setBlockingDialogLoading(false);
    setBlockingDialogOpen(null);
  };

  const handleCreateBlockingRule = () => {
    setBlockingRuleForm({
      nameHost: '',
      blockType: 'Filter + Address Lists',
      ipRegexp: '',
    });
    openBlockingDialogWithReload('new');
  };

  const handleImportBlocking = () => {
    setBlockingImportFileName('');
    openBlockingDialogWithReload('import');
  };

  const updateBlockingRuleField = <K extends keyof BlockingRuleFormState>(
    field: K,
    value: BlockingRuleFormState[K],
  ) => {
    setBlockingRuleForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmitBlockingRule = () => {
    if (!blockingRuleForm.nameHost.trim()) {
      toast.error('Completa Nombre/Host para registrar la regla');
      return;
    }

    setBlockingRows((current) => [
      {
        id: `blocking-${Date.now()}`,
        nameHost: blockingRuleForm.nameHost.trim(),
        type: blockingRuleForm.blockType,
        ipRegexp: blockingRuleForm.ipRegexp.trim(),
        status: 'ACTIVO',
      },
      ...current,
    ]);
    setBlockingCurrentPage(1);
    closeBlockingDialog();
    toast.success('Regla firewall registrada');
  };

  const handleBlockingFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const fileName = event.target.files?.[0]?.name;
    if (fileName) {
      setBlockingImportFileName(fileName);
    }
    event.target.value = '';
  };

  const handleSubmitBlockingImport = () => {
    if (!blockingImportFileName) {
      toast.error('Seleccione un archivo antes de importar');
      return;
    }

    setBlockingRows((current) => [
      {
        id: `blocking-import-${Date.now()}`,
        nameHost: blockingImportFileName.replace(/\.[^.]+$/, ''),
        type: 'IMPORTADO',
        ipRegexp: 'Archivo XLSX/CSV',
        status: 'PENDIENTE',
      },
      ...current,
    ]);
    setBlockingCurrentPage(1);
    closeBlockingDialog();
    toast.success(`Archivo ${blockingImportFileName} importado correctamente`);
  };

  if (!routerRecord) {
    return (
      <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
        <div className="mx-auto max-w-[920px] rounded-[4px] border border-[#d5dde7] bg-white p-8 text-center">
          <h1 className="text-[28px] font-semibold text-[#223448]">Router no encontrado</h1>
          <p className="mt-3 text-[15px] text-[#607286]">
            No se encontro el registro que intentaste editar.
          </p>
          <button
            type="button"
            onClick={() => navigate('/network-management/routers')}
            className="mt-6 inline-flex h-[42px] items-center gap-2 rounded-[4px] bg-[#268df2] px-5 text-[14px] font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#24364b] lg:text-[22px]">
            Configuracion de Router
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#6d8093]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="transition hover:text-[#268df2]"
          >
            Inicio
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => navigate('/network-management/routers')}
            className="transition hover:text-[#268df2]"
          >
            Lista Routers
          </button>
          <span>/</span>
          <span className="font-semibold text-[#268df2]">Editar router</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[4px] border border-[#d5dde7] bg-white">
        <div className="flex flex-wrap items-center gap-1 bg-[#1f2429] px-3 py-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-[40px] items-center gap-2 border-t-[3px] px-4 text-[14px] font-semibold transition ${
                  isActive
                    ? 'border-[#268df2] bg-white text-[#233549]'
                    : 'border-transparent text-[#f5f7fa] hover:bg-[#2a3037]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-8 lg:px-8">
          {activeTab === 'data' ? (
            <div className="grid gap-12 xl:grid-cols-[1.12fr_0.88fr]">
              <div className="space-y-10">
                <div className="space-y-5">
                  <FormRow label="Nombre Router">
                    <TextInput
                      value={form.name}
                      onChange={(value) => updateField('name', value)}
                    />
                  </FormRow>

                  <FormRow label="Tipo Router">
                    <SelectField
                      value={form.routerType}
                      onChange={(value) => updateField('routerType', value)}
                      options={routerTypeOptions}
                      ariaLabel="Tipo Router"
                    />
                  </FormRow>

                  <FormRow
                    label="Ubicacion"
                    action={
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#cfd8e3] bg-[#f8fafc] text-[#334155]">
                        <MapPin className="h-4 w-4" />
                      </span>
                    }
                  >
                    <TextInput
                      value={form.location}
                      onChange={(value) => updateField('location', value)}
                      placeholder="Coordenadas Latitud,Longitud"
                      inputMode="decimal"
                      sanitize={sanitizeCoordinateValue}
                    />
                  </FormRow>

                  <FormRow label="IP / Host">
                    <TextInput
                      value={form.ipHost}
                      onChange={(value) => updateField('ipHost', value)}
                      inputMode="decimal"
                      sanitize={sanitizeIpValue}
                    />
                  </FormRow>

                  <FormRow label="Seguridad">
                    <SelectField
                      value={form.security}
                      onChange={(value) => updateField('security', value)}
                      options={securityOptions}
                      ariaLabel="Seguridad"
                    />
                  </FormRow>

                  <FormRow label="Seguridad alterna">
                    <SelectField
                      value={form.alternateSecurity}
                      onChange={(value) => updateField('alternateSecurity', value)}
                      options={alternateSecurityOptions}
                      ariaLabel="Seguridad alterna"
                    />
                  </FormRow>
                </div>

                <div className="border-t border-[#e2e8f0] pt-7">
                  <h2 className="mb-5 text-center text-[20px] font-semibold text-[#24364b] lg:text-[22px]">
                    Configuracion Radius
                  </h2>

                  <div className="space-y-5">
                    <FormRow label="Radius Secret">
                      <div className="relative">
                        <TextInput
                          value={form.radiusSecret}
                          onChange={(value) => updateField('radiusSecret', value)}
                          placeholder="Contrasena Radius"
                          type={showRadiusSecret ? 'text' : 'password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRadiusSecret((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#607286] hover:text-[#24364b]"
                          aria-label={showRadiusSecret ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                        >
                          {showRadiusSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormRow>

                    <FormRow label="Radius NAS IP">
                      <TextInput
                        value={form.radiusNasIp}
                        onChange={(value) => updateField('radiusNasIp', value)}
                        placeholder="192.168.1.1"
                        inputMode="decimal"
                        sanitize={sanitizeIpValue}
                      />
                    </FormRow>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h2 className="text-center text-[30px] font-bold tracking-[0.04em] text-[#24364b]">
                  MIKROTIK
                </h2>

                <FormRow label="Usuario (API)">
                  <TextInput
                    value={form.apiUser}
                    onChange={(value) => updateField('apiUser', value)}
                  />
                </FormRow>

                <FormRow label="Contrasena (API)">
                  <div className="relative">
                    <TextInput
                      value={form.apiPassword}
                      onChange={(value) => updateField('apiPassword', value)}
                      type={showApiPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#607286] hover:text-[#24364b]"
                      aria-label={showApiPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showApiPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormRow>

                <FormRow label="Registro de trafico">
                  <SelectField
                    value={form.trafficLog}
                    onChange={(value) => updateField('trafficLog', value)}
                    options={trafficLogOptions}
                    ariaLabel="Registro de trafico"
                  />
                </FormRow>

                <FormRow label="Control Velocidad">
                  <SelectField
                    value={form.speedControl}
                    onChange={(value) => updateField('speedControl', value)}
                    options={speedControlOptions}
                    ariaLabel="Control Velocidad"
                  />
                </FormRow>

                <div className="space-y-5 pt-2">
                  <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                    <span className={`${labelClassName()} md:text-right`}>Guardar IP Visitadas</span>
                    <div className="flex items-center">
                      <Switch
                        checked={form.saveVisitedIps}
                        onCheckedChange={(value) => updateField('saveVisitedIps', value)}
                        className="h-8 w-14 data-[state=checked]:bg-[#17b6cf] data-[state=unchecked]:bg-[#d9e2ec]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                    <span className={`${labelClassName()} md:text-right`}>Backup Mikrotik</span>
                    <div className="flex items-center">
                      <Switch
                        checked={form.backupMikrotik}
                        onCheckedChange={(value) => updateField('backupMikrotik', value)}
                        className="h-8 w-14 data-[state=checked]:bg-[#14b8a6] data-[state=unchecked]:bg-[#d9e2ec]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex h-[42px] items-center gap-2 rounded-[6px] bg-[#268df2] px-5 text-[15px] font-semibold text-white"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'vpn' ? (
            <div className="mx-auto max-w-[1340px] rounded-[4px] border border-[#d5dde7] bg-white px-4 py-4 lg:px-4">
              <div className="rounded-[6px] border border-[#43b0e6] bg-[#d6f1ff] px-5 py-3 text-center text-[15px] text-[#174867]">
                <span className="font-semibold">Connected subnets:</span>{' '}
                defina aqui las redes locales que existen detras de este router para poder alcanzar OLT, ONU, antenas u otros equipos por el VPN.
              </div>

              <div className="mx-auto mt-4 max-w-[1100px] space-y-2">
                <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-start">
                  <label className={`${labelClassName()} pt-3 md:text-right`}>Connected subnets</label>
                  <div className="space-y-2">
                    <TextAreaField
                      value={form.connectedSubnets}
                      onChange={(value) => updateField('connectedSubnets', value)}
                      placeholder={'Una red por linea, por ejemplo\n10.168.0.0/24\n192.168.1.0/24'}
                    />
                    <p className="text-[12px] text-[#4d6780]">
                      Ejemplo: si el router esta en 10.214.2.2 y la antena/OLT esta en 10.168.0.22, aqui debe ir 10.168.0.0/24.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleSaveVpn}
                    className="inline-flex h-[36px] items-center gap-2 rounded-[4px] bg-[#2f93e4] px-4 text-[14px] font-semibold text-white"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Connected subnets
                  </button>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-[885px] rounded-[6px] border border-[#f09b9b] bg-[#ffd1d1] px-6 py-5 text-center text-[15px] leading-8 text-[#d22a1f]">
                <div className="mb-4 flex items-center justify-center gap-2 font-semibold">
                  <Info className="h-4 w-4" />
                  <span>
                    Importante: Si este Router se usara para manejar una fecha de corte diferente o controlar el ancho de banda diferente (queues, pcq, hotspot, pppoe)
                    de otro Router que ya se haya agregado a la plataforma BrandUP, no es necesario generar otro script para este nuevo router, basta con el script del
                    primer router, puede seguir estos pasos.
                  </span>
                </div>
                <p><span className="font-semibold">Paso 1:</span> Copiar la IP, Usuario, Contraseña de la pestaña Datos & Configuración del primer Router.</p>
                <p><span className="font-semibold">Paso 2:</span> Pegar los accesos antes copiados en la pestaña Datos & Configuración.</p>
                <p><span className="font-semibold">Paso 3:</span> Verificar la conexión.</p>
                <p><span className="font-semibold">Nota:</span> Es importante que tenga esto en cuenta por que de lo contrario tendra conflictos con la conexión de su Router.</p>
                <p>Si este acceso es para un Router que no se ha registrado en la plataforma BrandUP y no tiene un acceso de conexión, debe configurarlo para poder conectarlo.</p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleAcceptVpnNotice}
                    className="inline-flex h-[34px] items-center gap-2 rounded-[4px] bg-[#2f93e4] px-4 text-[14px] font-semibold text-white"
                  >
                    <Check className="h-4 w-4" />
                    {form.vpnNoticeAccepted ? 'Entendido' : 'Entendido'}
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'blocking' ? (
            <div className="rounded-[4px] border border-[#d5dde7] bg-white">
              <div className="px-4 py-4">
                <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={blockingPageSize}
                      onChange={(event) => {
                        setBlockingPageSize(Number(event.target.value));
                        setBlockingCurrentPage(1);
                      }}
                      className="h-8 rounded-[4px] border border-[#cfd8e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                      {...controlA11yProps('Cantidad de registros en bloqueo de paginas')}
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>

                    <div className="relative" ref={blockingColumnMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockingColumnMenuOpen((current) => !current);
                          setBlockingExportMenuOpen(false);
                        }}
                        className="inline-flex h-8 w-10 items-center justify-center rounded-[4px] border border-[#cfd8e2] bg-white text-[#24364b]"
                        {...controlA11yProps('Seleccionar columnas visibles de bloqueo de paginas')}
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>

                      {blockingColumnMenuOpen ? (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[210px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                          <div className="max-h-[260px] overflow-y-auto py-2">
                            {blockingColumns.map((column) => (
                              <label
                                key={column.key}
                                className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                              >
                                <input
                                  type="checkbox"
                                  checked={blockingVisibleColumnKeys.includes(column.key)}
                                  onChange={() => toggleBlockingColumn(column.key)}
                                  className="h-[13px] w-[13px] accent-[#2f3033]"
                                />
                                <span>{column.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="relative" ref={blockingExportMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockingExportMenuOpen((current) => !current);
                          setBlockingColumnMenuOpen(false);
                        }}
                        className="inline-flex h-8 w-10 items-center justify-center rounded-[4px] border border-[#cfd8e2] bg-white text-[#24364b]"
                        {...controlA11yProps('Guardar y exportar bloqueo de paginas')}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>

                      {blockingExportMenuOpen ? (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[190px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                          <div className="py-2">
                            <button
                              type="button"
                              onClick={handlePrintBlocking}
                              className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                            >
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </button>
                            <button
                              type="button"
                              onClick={handleExportBlockingCsv}
                              className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                            >
                              <FileText className="h-4 w-4" />
                              Exportar CSV
                            </button>
                            <button
                              type="button"
                              onClick={handleExportBlockingExcel}
                              className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                              Exportar a Excel
                            </button>
                            <button
                              type="button"
                              onClick={handleExportBlockingPdf}
                              className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                            >
                              <FileText className="h-4 w-4" />
                              Exportar a PDF
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateBlockingRule}
                      className="inline-flex h-8 items-center gap-2 rounded-[4px] border border-[#cfd8e2] bg-white px-3 text-[12px] font-semibold text-[#24364b]"
                      {...controlA11yProps('Nueva regla de bloqueo')}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nuevo
                    </button>

                    <button
                      type="button"
                      onClick={handleImportBlocking}
                      className="inline-flex h-8 items-center gap-2 rounded-[4px] border border-[#cfd8e2] bg-white px-3 text-[12px] font-semibold text-[#24364b]"
                      {...controlA11yProps('Importar reglas de bloqueo')}
                    >
                      <FileUp className="h-3.5 w-3.5" />
                      Importar
                    </button>
                  </div>

                  <div className="relative w-full xl:w-[280px]">
                    <input
                      type="text"
                      value={blockingSearchTerm}
                      onChange={(event) => {
                        setBlockingSearchTerm(event.target.value);
                        setBlockingCurrentPage(1);
                      }}
                      placeholder="Buscar..."
                      className="h-8 w-full rounded-[4px] border border-[#cfd8e2] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
                      {...controlA11yProps('Buscar en bloqueo de paginas')}
                    />
                    <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa8b7]" />
                  </div>
                </div>

                <div className="overflow-hidden border border-[#d7dde5] bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
                      <thead>
                        <tr className="bg-white">
                          {visibleBlockingColumns.map((column) => (
                            <th
                              key={column.key}
                              className={`border-b border-r border-[#d7dde5] px-3 py-3 text-left text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0 ${column.widthClassName ?? ''}`}
                            >
                              {column.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBlockingRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={visibleBlockingColumns.length}
                              className="border-t border-[#d7dde5] px-4 py-10 text-center text-[14px] text-[#6e8197]"
                            >
                              Ningún registro disponible
                            </td>
                          </tr>
                        ) : (
                          paginatedBlockingRows.map((row, index) => (
                            <tr key={row.id} className={index % 2 === 0 ? 'bg-[#fbfcfd]' : 'bg-white'}>
                              {visibleBlockingColumns.map((column) => (
                                <td
                                  key={column.key}
                                  className="border-r border-t border-[#d7dde5] px-3 py-3 text-[13px] text-[#24364b] last:border-r-0"
                                >
                                  {column.key === 'actions'
                                    ? '-'
                                    : column.getValue(
                                        row,
                                        (safeBlockingCurrentPage - 1) * blockingPageSize + index,
                                      )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#51657d]">
                  <div>{blockingSummary}</div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBlockingCurrentPage((current) => Math.max(1, current - 1))}
                      disabled={safeBlockingCurrentPage <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7] disabled:cursor-not-allowed disabled:opacity-60"
                      {...controlA11yProps('Pagina anterior de bloqueo de paginas')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBlockingCurrentPage((current) =>
                          Math.min(blockingTotalPages, current + 1),
                        )
                      }
                      disabled={safeBlockingCurrentPage >= blockingTotalPages}
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7] disabled:cursor-not-allowed disabled:opacity-60"
                      {...controlA11yProps('Pagina siguiente de bloqueo de paginas')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'mikrotik' ? (
            <div className="grid gap-5 xl:grid-cols-[0.42fr_0.58fr]">
              <section className="overflow-hidden rounded-[4px] border border-[#d5dde7] bg-white">
                <header className="border-b border-[#d5dde7] bg-[#f3f5f7] px-4 py-3 text-[14px] font-semibold text-[#334b63]">
                  Informacion del Router
                </header>
                <div className="px-4 py-3 text-center text-[14px] text-[#334b63]">
                  No hay conexion API.
                </div>
              </section>

              <section className="overflow-hidden rounded-[4px] border border-[#d5dde7] bg-white">
                <header className="border-b border-[#d5dde7] bg-[#f3f5f7] px-4 py-3 text-[14px] font-semibold text-[#334b63]">
                  Trafico Actual
                </header>

                <div className="space-y-4 px-4 py-4">
                  <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                    <label className={`${labelClassName()} md:text-right`}>
                      Seleccionar Interface
                    </label>
                    <SelectField
                      value={mikrotikInterface}
                      onChange={setMikrotikInterface}
                      options={mikrotikInterfaceOptions}
                      ariaLabel="Seleccionar interface Mikrotik"
                    />
                  </div>

                  <div className="relative overflow-hidden rounded-[2px] border-2 border-[#444b53] bg-white">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.35)_1px,transparent_1px)] bg-[size:28px_56px]" />

                    <div className="relative grid min-h-[280px] grid-cols-[84px_minmax(0,1fr)]">
                      <div className="flex flex-col justify-between border-r border-[#444b53] bg-white px-2 py-3 text-right text-[12px] text-[#24364b]">
                        <span>1.00 Mbps</span>
                        <span>0.80 Mbps</span>
                        <span>0.60 Mbps</span>
                        <span>0.40 Mbps</span>
                        <span>0.20 Mbps</span>
                        <span>0.00 Mbps</span>
                      </div>

                      <div className="relative">
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff2a1a]" />

                        <div className="absolute bottom-2 left-2 rounded-[4px] bg-[rgba(31,41,55,0.8)] px-2 py-1 text-[12px] text-white shadow-[0_8px_16px_rgba(15,23,42,0.18)]">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#0f84c5]" />
                            <span>TX: 0 Mbps</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff2a1a]" />
                            <span>RX: 0 Mbps</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : activeTab === 'log' ? (
            <div className="overflow-hidden rounded-[4px] border border-[#d5dde7] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
                  <thead>
                    <tr className="bg-white">
                      <th className="w-[120px] border-b border-r border-[#d7dde5] px-3 py-3 text-left text-[13px] font-medium text-[#24364b]">
                        ID
                      </th>
                      <th className="w-[220px] border-b border-r border-[#d7dde5] px-3 py-3 text-left text-[13px] font-medium text-[#24364b]">
                        Fecha
                      </th>
                      <th className="w-[180px] border-b border-r border-[#d7dde5] px-3 py-3 text-left text-[13px] font-medium text-[#24364b]">
                        Tipo
                      </th>
                      <th className="border-b border-[#d7dde5] px-3 py-3 text-left text-[13px] font-medium text-[#24364b]">
                        Log
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td
                        colSpan={4}
                        className="border-t border-[#d7dde5] px-3 py-3 text-[14px] text-[#334b63]"
                      >
                        No hay conexion API.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
              <PlaceholderTabCard
              label={tabs.find((tab) => tab.id === activeTab)?.label ?? 'Configuracion'}
              />
          )}
        </div>
      </section>

      {blockingDialogOpen === 'new' ? (
        <BlockingRuleDialog
          loading={blockingDialogLoading}
          values={blockingRuleForm}
          onFieldChange={updateBlockingRuleField}
          onClose={closeBlockingDialog}
          onSubmit={handleSubmitBlockingRule}
        />
      ) : null}

      {blockingDialogOpen === 'import' ? (
        <BlockingImportDialog
          loading={blockingDialogLoading}
          selectedFileName={blockingImportFileName}
          onFileSelected={handleBlockingFileSelected}
          onClose={closeBlockingDialog}
          onSubmit={handleSubmitBlockingImport}
        />
      ) : null}
    </div>
  );
}
