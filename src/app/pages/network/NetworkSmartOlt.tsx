import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  FileDown,
  FileSpreadsheet,
  Globe,
  List,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  MetricCards,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  SelectField,
  TopTabs,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';

type SmartTab = 'onus' | 'vlans' | 'zonas' | 'profiles' | 'odb' | 'api';

type EmptyRow = Record<string, never>;
type VlanRow = {
  id: string;
  vlanId: number;
  description: string;
  olt: string;
};

type ZoneRow = {
  id: string;
  zoneName: string;
};

type ProfileRow = {
  id: string;
  profileName: string;
  type: string;
};

type OdbRow = {
  id: string;
  odbName: string;
};

type VlanSearchField = {
  key: 'vlanId' | 'description' | 'olt' | 'actions';
  label: string;
  getValue: (row: VlanRow) => string;
};

type ZoneSearchField = {
  key: 'zoneName' | 'actions';
  label: string;
  getValue: (row: ZoneRow) => string;
};

type ProfileSearchField = {
  key: 'profileName' | 'type' | 'actions';
  label: string;
  getValue: (row: ProfileRow) => string;
};

type OdbSearchField = {
  key: 'odbName' | 'actions';
  label: string;
  getValue: (row: OdbRow) => string;
};

const wisphubPageClassName =
  'min-h-full border-t-4 border-[#45bf63] bg-[radial-gradient(circle_at_top_right,rgba(69,191,99,0.08),transparent_28%),#ffffff] pb-8 text-[#17273d] [font-family:Trebuchet_MS,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';
const mikrosystemPageClassName =
  'min-h-full bg-[#d9e7f3] px-[22px] pt-[18px] pb-[26px] text-[#223448] [font-family:Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';

const onusColumns: DataColumn<EmptyRow>[] = [
  { key: 'cliente', header: 'CLIENTE', render: () => '' },
  { key: 'sn', header: 'SN', width: '120px', render: () => '' },
  { key: 'olt', header: 'OLT', width: '120px', render: () => '' },
  { key: 'estado', header: 'ESTADO', width: '170px', render: () => '' },
  { key: 'board', header: 'BOARD', width: '170px', render: () => '' },
  { key: 'port', header: 'PORT', width: '120px', render: () => '' },
  { key: 'signal', header: 'SIGNAL', width: '150px', render: () => '' },
  { key: 'rx', header: 'RX SIGNAL', width: '170px', render: () => '' },
  { key: 'acciones', header: 'ACCIONES', width: '170px', render: () => '' },
];

const VLAN_ROWS: VlanRow[] = [
  { id: 'vlan-125', vlanId: 125, description: 'puentes', olt: 'MA5800-X17' },
  { id: 'vlan-501', vlanId: 501, description: 'Santa Ines', olt: 'MA5800-X17' },
  { id: 'vlan-502', vlanId: 502, description: 'San Jose', olt: 'MA5800-X17' },
  { id: 'vlan-503', vlanId: 503, description: 'La Soledad', olt: 'MA5800-X17' },
  { id: 'vlan-504', vlanId: 504, description: 'Taranda Nopalera', olt: 'MA5800-X17' },
  { id: 'vlan-505', vlanId: 505, description: 'Mora Puente Guay', olt: 'MA5800-X17' },
  { id: 'vlan-506', vlanId: 506, description: 'Taranda Jardin', olt: 'MA5800-X17' },
  { id: 'vlan-507', vlanId: 507, description: 'Taranda Guadalup', olt: 'MA5800-X17' },
  { id: 'vlan-510', vlanId: 510, description: 'Curin Loma Igles', olt: 'MA5800-X17' },
  { id: 'vlan-511', vlanId: 511, description: 'Curin Barrio chi', olt: 'MA5800-X17' },
  { id: 'vlan-512', vlanId: 512, description: 'Puerto', olt: 'MA5800-X17' },
  { id: 'vlan-513', vlanId: 513, description: 'Presa', olt: 'MA5800-X17' },
  { id: 'vlan-514', vlanId: 514, description: 'San Juan Vista', olt: 'MA5800-X17' },
  { id: 'vlan-515', vlanId: 515, description: 'Colorado', olt: 'MA5800-X17' },
  { id: 'vlan-516', vlanId: 516, description: 'La Luna', olt: 'MA5800-X17' },
  { id: 'vlan-517', vlanId: 517, description: 'La Escondida', olt: 'MA5800-X17' },
  { id: 'vlan-518', vlanId: 518, description: 'Los Mangos', olt: 'MA5800-X17' },
  { id: 'vlan-519', vlanId: 519, description: 'Guadalupe Centro', olt: 'MA5800-X17' },
  { id: 'vlan-520', vlanId: 520, description: 'El Mirador', olt: 'MA5800-X17' },
  { id: 'vlan-521', vlanId: 521, description: 'Los Cedros', olt: 'MA5800-X17' },
  { id: 'vlan-522', vlanId: 522, description: 'La Colmena', olt: 'MA5800-X17' },
  { id: 'vlan-523', vlanId: 523, description: 'Potrero Nuevo', olt: 'MA5800-X17' },
  { id: 'vlan-524', vlanId: 524, description: 'Arroyo Blanco', olt: 'MA5800-X17' },
  { id: 'vlan-525', vlanId: 525, description: 'Santa Rosa', olt: 'MA5800-X17' },
  { id: 'vlan-526', vlanId: 526, description: 'El Molino', olt: 'MA5800-X17' },
  { id: 'vlan-527', vlanId: 527, description: 'Las Palmas', olt: 'MA5800-X17' },
  { id: 'vlan-528', vlanId: 528, description: 'Los Sauces', olt: 'MA5800-X17' },
  { id: 'vlan-529', vlanId: 529, description: 'La Loma', olt: 'MA5800-X17' },
  { id: 'vlan-530', vlanId: 530, description: 'Villa Nueva', olt: 'MA5800-X17' },
  { id: 'vlan-531', vlanId: 531, description: 'San Pedro', olt: 'MA5800-X17' },
  { id: 'vlan-532', vlanId: 532, description: 'San Miguel', olt: 'MA5800-X17' },
  { id: 'vlan-533', vlanId: 533, description: 'La Esperanza', olt: 'MA5800-X17' },
  { id: 'vlan-534', vlanId: 534, description: 'Loma Alta', olt: 'MA5800-X17' },
  { id: 'vlan-535', vlanId: 535, description: 'La Hacienda', olt: 'MA5800-X17' },
  { id: 'vlan-536', vlanId: 536, description: 'Ejido Norte', olt: 'MA5800-X17' },
  { id: 'vlan-537', vlanId: 537, description: 'Ejido Sur', olt: 'MA5800-X17' },
  { id: 'vlan-538', vlanId: 538, description: 'Arenal', olt: 'MA5800-X17' },
  { id: 'vlan-539', vlanId: 539, description: 'El Pino', olt: 'MA5800-X17' },
  { id: 'vlan-540', vlanId: 540, description: 'Las Flores', olt: 'MA5800-X17' },
  { id: 'vlan-541', vlanId: 541, description: 'El Rosario', olt: 'MA5800-X17' },
  { id: 'vlan-542', vlanId: 542, description: 'Piedra Azul', olt: 'MA5800-X17' },
  { id: 'vlan-543', vlanId: 543, description: 'Buenavista', olt: 'MA5800-X17' },
  { id: 'vlan-544', vlanId: 544, description: 'La Cumbre', olt: 'MA5800-X17' },
  { id: 'vlan-545', vlanId: 545, description: 'Las Brisas', olt: 'MA5800-X17' },
  { id: 'vlan-546', vlanId: 546, description: 'San Isidro', olt: 'MA5800-X17' },
  { id: 'vlan-547', vlanId: 547, description: 'Monte Verde', olt: 'MA5800-X17' },
  { id: 'vlan-548', vlanId: 548, description: 'La Rivera', olt: 'MA5800-X17' },
  { id: 'vlan-549', vlanId: 549, description: 'El Camino', olt: 'MA5800-X17' },
  { id: 'vlan-550', vlanId: 550, description: 'Vista Hermosa', olt: 'MA5800-X17' },
];

const VLAN_SEARCH_FIELDS: VlanSearchField[] = [
  { key: 'vlanId', label: 'VLAN ID', getValue: (row) => String(row.vlanId) },
  { key: 'description', label: 'Descripción', getValue: (row) => row.description },
  { key: 'olt', label: 'OLT', getValue: (row) => row.olt },
  { key: 'actions', label: 'Acciones', getValue: () => '' },
];

const ZONE_ROWS: ZoneRow[] = [{ id: 'zone-full', zoneName: 'FULL' }];

const ZONE_SEARCH_FIELDS: ZoneSearchField[] = [
  { key: 'zoneName', label: 'Nombre ZONA', getValue: (row) => row.zoneName },
  { key: 'actions', label: 'Acciones', getValue: () => '' },
];

const PROFILE_ROWS: ProfileRow[] = [
  { id: 'profile-1g-up', profileName: '1G', type: 'UP' },
  { id: 'profile-1g-down', profileName: '1G', type: 'DOWN' },
];

const PROFILE_SEARCH_FIELDS: ProfileSearchField[] = [
  { key: 'profileName', label: 'Nombre Profile', getValue: (row) => row.profileName },
  { key: 'type', label: 'Tipo', getValue: (row) => row.type },
  { key: 'actions', label: 'Acciones', getValue: () => '' },
];

const ODB_ROWS: OdbRow[] = [];

const ODB_SEARCH_FIELDS: OdbSearchField[] = [
  { key: 'odbName', label: 'Nombre odb', getValue: (row) => row.odbName },
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

function readStoredValue(key: string, fallback: string) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  return rawValue ?? fallback;
}

export default function NetworkSmartOlt() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const zoneDialog = useNetworkDialog();
  const profileDialog = useNetworkDialog();
  const odbDialog = useNetworkDialog();

  const [activeTab, setActiveTab] = useState<SmartTab>('vlans');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [headerDirection, setHeaderDirection] = useState<'up' | 'down'>('up');
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [zoneRows, setZoneRows] = useState<ZoneRow[]>(() => readStoredRows('smart-olt-zone-rows', ZONE_ROWS));
  const [profileRows, setProfileRows] = useState<ProfileRow[]>(() => readStoredRows('smart-olt-profile-rows', PROFILE_ROWS));
  const [odbRows, setOdbRows] = useState<OdbRow[]>(() => readStoredRows('smart-olt-odb-rows', ODB_ROWS));
  const [zoneFormName, setZoneFormName] = useState('');
  const [profileFormName, setProfileFormName] = useState('');
  const [profileFormType, setProfileFormType] = useState('SUBIDA');
  const [odbFormName, setOdbFormName] = useState('');
  const [zoneNoticeVisible, setZoneNoticeVisible] = useState(true);
  const [profileNoticeVisible, setProfileNoticeVisible] = useState(true);
  const [odbNoticeVisible, setOdbNoticeVisible] = useState(true);
  const [apiDomain, setApiDomain] = useState(() => readStoredValue('smart-olt-api-domain', ''));
  const [apiKeyValue, setApiKeyValue] = useState(() => readStoredValue('smart-olt-api-key', ''));
  const [disableOnusValue, setDisableOnusValue] = useState(() => readStoredValue('smart-olt-disable-onus', 'NO'));
  const [selectedSearchFields, setSelectedSearchFields] = useState<string[]>(
    VLAN_SEARCH_FIELDS.map((field) => field.key),
  );

  const tabs = [
    { id: 'onus', label: 'ONUS CONFIGURADOS' },
    { id: 'vlans', label: 'VLANS' },
    { id: 'zonas', label: 'Zonas' },
    { id: 'profiles', label: 'PROFILES' },
    { id: 'odb', label: 'ODB' },
    { id: 'api', label: 'API' },
  ];

  const filterOptions = [
    { value: 'todos', label: 'TODOS' },
    { value: 'online', label: 'ONLINE' },
    { value: 'offline', label: 'OFFLINE' },
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
    window.localStorage.setItem('smart-olt-zone-rows', JSON.stringify(zoneRows));
  }, [zoneRows]);

  useEffect(() => {
    window.localStorage.setItem('smart-olt-profile-rows', JSON.stringify(profileRows));
  }, [profileRows]);

  useEffect(() => {
    window.localStorage.setItem('smart-olt-odb-rows', JSON.stringify(odbRows));
  }, [odbRows]);

  useEffect(() => {
    window.localStorage.setItem('smart-olt-api-domain', apiDomain);
  }, [apiDomain]);

  useEffect(() => {
    window.localStorage.setItem('smart-olt-api-key', apiKeyValue);
  }, [apiKeyValue]);

  useEffect(() => {
    window.localStorage.setItem('smart-olt-disable-onus', disableOnusValue);
  }, [disableOnusValue]);

  const activeVlanSearchFields = useMemo(() => {
    const filtered = VLAN_SEARCH_FIELDS.filter((field) => selectedSearchFields.includes(field.key));
    return filtered.length > 0 ? filtered : VLAN_SEARCH_FIELDS;
  }, [selectedSearchFields]);

  const activeZoneSearchFields = useMemo(() => {
    const filtered = ZONE_SEARCH_FIELDS.filter((field) => selectedSearchFields.includes(field.key));
    return filtered.length > 0 ? filtered : ZONE_SEARCH_FIELDS;
  }, [selectedSearchFields]);

  const activeProfileSearchFields = useMemo(() => {
    const filtered = PROFILE_SEARCH_FIELDS.filter((field) => selectedSearchFields.includes(field.key));
    return filtered.length > 0 ? filtered : PROFILE_SEARCH_FIELDS;
  }, [selectedSearchFields]);

  const activeOdbSearchFields = useMemo(() => {
    const filtered = ODB_SEARCH_FIELDS.filter((field) => selectedSearchFields.includes(field.key));
    return filtered.length > 0 ? filtered : ODB_SEARCH_FIELDS;
  }, [selectedSearchFields]);

  const filteredVlans = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return VLAN_ROWS;
    }

    return VLAN_ROWS.filter((row) =>
      activeVlanSearchFields.some((field) => field.getValue(row).toLowerCase().includes(query)),
    );
  }, [activeVlanSearchFields, searchTerm]);

  const filteredZones = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return zoneRows;
    }

    return zoneRows.filter((row) =>
      activeZoneSearchFields.some((field) => field.getValue(row).toLowerCase().includes(query)),
    );
  }, [activeZoneSearchFields, searchTerm, zoneRows]);

  const filteredProfiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return profileRows;
    }

    return profileRows.filter((row) =>
      activeProfileSearchFields.some((field) => field.getValue(row).toLowerCase().includes(query)),
    );
  }, [activeProfileSearchFields, profileRows, searchTerm]);

  const filteredOdbs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return odbRows;
    }

    return odbRows.filter((row) =>
      activeOdbSearchFields.some((field) => field.getValue(row).toLowerCase().includes(query)),
    );
  }, [activeOdbSearchFields, odbRows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredVlans.length / pageSize));
  const zoneTotalPages = Math.max(1, Math.ceil(filteredZones.length / pageSize));
  const profileTotalPages = Math.max(1, Math.ceil(filteredProfiles.length / pageSize));
  const odbTotalPages = Math.max(1, Math.ceil(filteredOdbs.length / pageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const safeZoneCurrentPage = Math.min(currentPage, zoneTotalPages);
  const safeProfileCurrentPage = Math.min(currentPage, profileTotalPages);
  const safeOdbCurrentPage = Math.min(currentPage, odbTotalPages);

  const paginatedVlans = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredVlans.slice(startIndex, startIndex + pageSize);
  }, [filteredVlans, pageSize, safeCurrentPage]);

  const paginatedZones = useMemo(() => {
    const startIndex = (safeZoneCurrentPage - 1) * pageSize;
    return filteredZones.slice(startIndex, startIndex + pageSize);
  }, [filteredZones, pageSize, safeZoneCurrentPage]);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (safeProfileCurrentPage - 1) * pageSize;
    return filteredProfiles.slice(startIndex, startIndex + pageSize);
  }, [filteredProfiles, pageSize, safeProfileCurrentPage]);

  const paginatedOdbs = useMemo(() => {
    const startIndex = (safeOdbCurrentPage - 1) * pageSize;
    return filteredOdbs.slice(startIndex, startIndex + pageSize);
  }, [filteredOdbs, pageSize, safeOdbCurrentPage]);

  const vlanColumns: DataColumn<VlanRow>[] = [
    { key: 'vlanId', header: 'VLAN ID', width: '190px', render: (row) => row.vlanId },
    { key: 'description', header: 'DESCRIPCIÓN', render: (row) => row.description },
    { key: 'olt', header: 'OLT', width: '240px', render: (row) => row.olt },
    {
      key: 'actions',
      header: 'ACCIONES',
      width: '220px',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-3 text-[#32475c]">
          <button type="button" aria-label={`Editar VLAN ${row.vlanId}`} className="transition hover:text-[#268df2]">
            <Edit className="h-4.5 w-4.5" />
          </button>
          <button type="button" aria-label={`Eliminar VLAN ${row.vlanId}`} className="transition hover:text-[#dc2626]">
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const zoneColumns: DataColumn<ZoneRow>[] = [
    { key: 'zoneName', header: 'NOMBRE ZONA', render: (row) => row.zoneName },
    {
      key: 'actions',
      header: 'ACCIONES',
      width: '220px',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-3 text-[#32475c]">
          <button type="button" aria-label={`Editar zona ${row.zoneName}`} className="transition hover:text-[#268df2]">
            <Edit className="h-4.5 w-4.5" />
          </button>
          <button type="button" aria-label={`Eliminar zona ${row.zoneName}`} className="transition hover:text-[#dc2626]">
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const profileColumns: DataColumn<ProfileRow>[] = [
    { key: 'profileName', header: 'NOMBRE PROFILE', render: (row) => row.profileName },
    { key: 'type', header: 'TIPO', width: '220px', render: (row) => row.type },
    {
      key: 'actions',
      header: 'ACCIONES',
      width: '220px',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-3 text-[#32475c]">
          <button type="button" aria-label={`Editar profile ${row.profileName} ${row.type}`} className="transition hover:text-[#268df2]">
            <Edit className="h-4.5 w-4.5" />
          </button>
          <button type="button" aria-label={`Eliminar profile ${row.profileName} ${row.type}`} className="transition hover:text-[#dc2626]">
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const odbColumns: DataColumn<OdbRow>[] = [
    { key: 'odbName', header: 'NOMBRE ODB', render: (row) => row.odbName },
    {
      key: 'actions',
      header: 'ACCIONES',
      width: '220px',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-3 text-[#32475c]">
          <button type="button" aria-label={`Editar odb ${row.odbName}`} className="transition hover:text-[#268df2]">
            <Edit className="h-4.5 w-4.5" />
          </button>
          <button type="button" aria-label={`Eliminar odb ${row.odbName}`} className="transition hover:text-[#dc2626]">
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const summary =
    filteredVlans.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeCurrentPage - 1) * pageSize + 1} al ${Math.min(
          safeCurrentPage * pageSize,
          filteredVlans.length,
        )} de un total de ${filteredVlans.length}`;

  const exportRows = filteredVlans.map((row) => ({
    'VLAN ID': String(row.vlanId),
    DESCRIPCIÓN: row.description,
    OLT: row.olt,
  }));

  const zoneSummary =
    filteredZones.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeZoneCurrentPage - 1) * pageSize + 1} al ${Math.min(
          safeZoneCurrentPage * pageSize,
          filteredZones.length,
        )} de un total de ${filteredZones.length}`;

  const zoneExportRows = filteredZones.map((row) => ({
    'Nombre ZONA': row.zoneName,
  }));

  const profileSummary =
    filteredProfiles.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeProfileCurrentPage - 1) * pageSize + 1} al ${Math.min(
          safeProfileCurrentPage * pageSize,
          filteredProfiles.length,
        )} de un total de ${filteredProfiles.length}`;

  const profileExportRows = filteredProfiles.map((row) => ({
    'Nombre Profile': row.profileName,
    Tipo: row.type,
  }));

  const odbSummary =
    filteredOdbs.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeOdbCurrentPage - 1) * pageSize + 1} al ${Math.min(
          safeOdbCurrentPage * pageSize,
          filteredOdbs.length,
        )} de un total de ${filteredOdbs.length}`;

  const odbExportRows = filteredOdbs.map((row) => ({
    'Nombre odb': row.odbName,
  }));

  const toggleSearchField = (fieldKey: string) => {
    setSelectedSearchFields((current) => {
      if (current.includes(fieldKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== fieldKey);
      }

      return [...current, fieldKey];
    });
  };

  const handleTabChange = (value: SmartTab) => {
    setActiveTab(value);
    setSearchTerm('');
    setCurrentPage(1);
    setHeaderDirection('up');
    setColumnMenuOpen(false);
    setExportMenuOpen(false);

    if (value === 'vlans') {
      setSelectedSearchFields(VLAN_SEARCH_FIELDS.map((field) => field.key));
      return;
    }

    if (value === 'zonas') {
      setSelectedSearchFields(ZONE_SEARCH_FIELDS.map((field) => field.key));
      return;
    }

    if (value === 'profiles') {
      setSelectedSearchFields(PROFILE_SEARCH_FIELDS.map((field) => field.key));
      return;
    }

    if (value === 'odb') {
      setSelectedSearchFields(ODB_SEARCH_FIELDS.map((field) => field.key));
    }
  };

  const openZoneDialog = () => {
    setZoneFormName('');
    setZoneNoticeVisible(true);
    zoneDialog.openDialog();
  };

  const closeZoneDialog = () => {
    zoneDialog.closeDialog();
  };

  const handleZoneSubmit = () => {
    const nextZoneName = zoneFormName.trim();

    if (!nextZoneName) {
      toast.error('Ingresa el nombre de la zona');
      return;
    }

    const duplicated = zoneRows.some((row) => row.zoneName.toLowerCase() === nextZoneName.toLowerCase());
    if (duplicated) {
      toast.error('La zona ya existe');
      return;
    }

    setZoneRows((current) => [
      ...current,
      {
        id: `zone-${nextZoneName.toLowerCase().replace(/\s+/g, '-')}-${current.length + 1}`,
        zoneName: nextZoneName,
      },
    ]);
    zoneDialog.closeDialog();
    setCurrentPage(1);
    setSearchTerm('');
    toast.success('Zona registrada correctamente');
  };

  const openProfileDialog = () => {
    setProfileFormName('');
    setProfileFormType('SUBIDA');
    setProfileNoticeVisible(true);
    profileDialog.openDialog();
  };

  const closeProfileDialog = () => {
    profileDialog.closeDialog();
  };

  const handleProfileSubmit = () => {
    const nextProfileName = profileFormName.trim();
    const nextProfileType = profileFormType.trim();

    if (!nextProfileName) {
      toast.error('Ingresa el nombre del perfil');
      return;
    }

    const duplicated = profileRows.some(
      (row) =>
        row.profileName.toLowerCase() === nextProfileName.toLowerCase() &&
        row.type.toLowerCase() === nextProfileType.toLowerCase(),
    );

    if (duplicated) {
      toast.error('El perfil ya existe');
      return;
    }

    setProfileRows((current) => [
      ...current,
      {
        id: `profile-${nextProfileName.toLowerCase().replace(/\s+/g, '-')}-${nextProfileType.toLowerCase()}-${current.length + 1}`,
        profileName: nextProfileName,
        type: nextProfileType,
      },
    ]);
    profileDialog.closeDialog();
    setCurrentPage(1);
    setSearchTerm('');
    toast.success('Profile registrado correctamente');
  };

  const openOdbDialog = () => {
    setOdbFormName('');
    setOdbNoticeVisible(true);
    odbDialog.openDialog();
  };

  const closeOdbDialog = () => {
    odbDialog.closeDialog();
  };

  const handleOdbSubmit = () => {
    const nextOdbName = odbFormName.trim();

    if (!nextOdbName) {
      toast.error('Ingresa el nombre del odb');
      return;
    }

    const duplicated = odbRows.some((row) => row.odbName.toLowerCase() === nextOdbName.toLowerCase());
    if (duplicated) {
      toast.error('El odb ya existe');
      return;
    }

    setOdbRows((current) => [
      ...current,
      {
        id: `odb-${nextOdbName.toLowerCase().replace(/\s+/g, '-')}-${current.length + 1}`,
        odbName: nextOdbName,
      },
    ]);
    odbDialog.closeDialog();
    setCurrentPage(1);
    setSearchTerm('');
    toast.success('ODB registrado correctamente');
  };

  const handleApiSave = () => {
    toast.success('Configuracion API guardada correctamente');
  };

  const toggleHeaderDirection = () => {
    setHeaderDirection((current) => {
      const next = current === 'up' ? 'down' : 'up';
      const targetPages =
        activeTab === 'zonas'
          ? zoneTotalPages
          : activeTab === 'profiles'
            ? profileTotalPages
            : activeTab === 'odb'
              ? odbTotalPages
              : totalPages;
      setCurrentPage(next === 'down' ? targetPages : 1);
      return next;
    });
  };

  const openPrintPreview = (title: string, rows: Record<string, string>[], autoPrint: boolean) => {
    const headers = Object.keys(exportRows[0] ?? { 'VLAN ID': '', DESCRIPCIÓN: '', OLT: '' });
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

  const handlePrint = () => {
    openPrintPreview('VLANS Smart Olt', exportRows, true);
    setExportMenuOpen(false);
  };

  const handleExportCsv = () => {
    const headers = Object.keys(exportRows[0] ?? { 'VLAN ID': '', DESCRIPCIÓN: '', OLT: '' });
    const lines = [
      headers.map(escapeCsvValue).join(','),
      ...exportRows.map((row) => headers.map((header) => escapeCsvValue(row[header as keyof typeof row])).join(',')),
    ];
    downloadBlob('smart-olt-vlans.csv', `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    const headers = Object.keys(exportRows[0] ?? { 'VLAN ID': '', DESCRIPCIÓN: '', OLT: '' });
    const rowsHtml = exportRows
      .map(
        (row) =>
          `<tr>${headers.map((header) => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join('')}</tr>`,
      )
      .join('');
    const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body { font-family: Arial, sans-serif; padding: 24px; color: #223448; } h1 { font-size: 18px; margin: 0 0 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; } th { background: #f3f7fb; }</style></head><body><h1>VLANS Smart Olt</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    downloadBlob('smart-olt-vlans.xls', `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
    setExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    openPrintPreview('VLANS Smart Olt - PDF', exportRows, true);
    setExportMenuOpen(false);
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

  return (
    <div className={isWispHub ? wisphubPageClassName : mikrosystemPageClassName}>
      <NetworkPageShell
        title="Smart Olt"
        breadcrumb="Smart Olt"
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
                helperLeft: 'GPON: 0',
                helperRight: '',
                colorClass: isWispHub ? 'bg-[#3f8fe0]' : 'bg-[#16afb4]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Online',
                value: 0,
                helperLeft: 'Total Autorizados: 0',
                helperRight: '',
                colorClass: 'bg-[#34b32c]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Total Offline',
                value: 0,
                helperLeft: isWispHub ? 'Offline: 0' : 'PwrFail: 0   LoS: 0',
                helperRight: isWispHub ? '' : 'N/A: 0',
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
              onChange={(value) => handleTabChange(value as SmartTab)}
              isWispHub={isWispHub}
            />
          </div>

          {activeTab === 'vlans' ? (
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
                          <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[170px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                            <div className="py-2">
                              {VLAN_SEARCH_FIELDS.map((field) => (
                                <label
                                  key={field.key}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeVlanSearchFields.some((activeField) => activeField.key === field.key)}
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
                            <button type="button" onClick={handlePrint} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </button>
                            <button type="button" onClick={handleExportCsv} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar csv
                            </button>
                            <button type="button" onClick={handleExportExcel} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileSpreadsheet className="h-4 w-4" />
                              Exportar a Excel
                            </button>
                            <button type="button" onClick={handleExportPdf} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar a PDF
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openProfileDialog}
                      className={`inline-flex items-center gap-2 ${
                        isWispHub
                          ? 'h-[42px] rounded-[6px] border border-[#268df2] bg-[#3399f6] px-4 text-[14px]'
                          : 'h-[48px] rounded-[4px] border border-[#268df2] bg-[#3399f6] px-5 text-[14px]'
                      } font-semibold text-white`}
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo
                    </button>
                  </div>

                  <div className="relative w-full xl:max-w-[360px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6b5]" />
                    <input
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setCurrentPage(1);
                      }}
                      className={`${isWispHub ? 'h-[42px] rounded-[6px]' : 'h-[48px] rounded-[4px]'} w-full border border-[#d7dde5] bg-white pl-11 pr-4 text-[14px] text-[#24364b] outline-none`}
                      placeholder="Buscar..."
                      aria-label="Buscar VLAN"
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
                          {vlanColumns.map((column) => (
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
                                    headerDirection === 'down' && column.key === 'vlanId'
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
                        {paginatedVlans.length === 0 ? (
                          <tr>
                            <td colSpan={vlanColumns.length} className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]">
                              Ningun registro disponible
                            </td>
                          </tr>
                        ) : (
                          paginatedVlans.map((row, index) => (
                            <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                              {vlanColumns.map((column) => (
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
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      const active = page === safeCurrentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-[34px] min-w-[34px] items-center justify-center rounded-[4px] border text-[14px] ${
                            active
                              ? isWispHub
                                ? 'border-[#45bf63] bg-[#45bf63] text-white'
                                : 'border-[#3f93e7] bg-[#3f93e7] text-white'
                              : 'border-[#d7dde5] bg-white text-[#637991]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina siguiente">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'zonas' ? (
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
                              {ZONE_SEARCH_FIELDS.map((field) => (
                                <label
                                  key={field.key}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeZoneSearchFields.some((activeField) => activeField.key === field.key)}
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
                            <button type="button" onClick={() => handleDatasetPrint('Zonas Smart Olt', zoneExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </button>
                            <button type="button" onClick={() => handleDatasetExportCsv('smart-olt-zonas.csv', zoneExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar csv
                            </button>
                            <button type="button" onClick={() => handleDatasetExportExcel('Zonas Smart Olt', 'smart-olt-zonas.xls', zoneExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileSpreadsheet className="h-4 w-4" />
                              Exportar a Excel
                            </button>
                            <button type="button" onClick={() => handleDatasetExportPdf('Zonas Smart Olt', zoneExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar a PDF
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openZoneDialog}
                      className={`inline-flex items-center ${
                        isWispHub
                          ? 'h-[42px] rounded-[6px] border border-[#268df2] bg-[#3399f6] px-4 text-[14px]'
                          : 'h-[48px] rounded-[4px] border border-[#268df2] bg-[#3399f6] px-5 text-[14px]'
                      } font-semibold text-white`}
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
                      className={`${isWispHub ? 'h-[42px] rounded-[6px]' : 'h-[48px] rounded-[4px]'} w-full border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none`}
                      placeholder="Buscar..."
                      aria-label="Buscar zona"
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
                          {zoneColumns.map((column) => (
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
                                    headerDirection === 'down' && column.key === 'zoneName'
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
                        {paginatedZones.length === 0 ? (
                          <tr>
                            <td colSpan={zoneColumns.length} className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]">
                              Ningun registro disponible
                            </td>
                          </tr>
                        ) : (
                          paginatedZones.map((row, index) => (
                            <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                              {zoneColumns.map((column) => (
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
                  <div>{zoneSummary}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCurrentPage(Math.max(1, safeZoneCurrentPage - 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina anterior">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: zoneTotalPages }, (_, index) => {
                      const page = index + 1;
                      const active = page === safeZoneCurrentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-[34px] min-w-[34px] items-center justify-center rounded-[4px] border text-[14px] ${
                            active
                              ? isWispHub
                                ? 'border-[#45bf63] bg-[#45bf63] text-white'
                                : 'border-[#3f93e7] bg-[#3f93e7] text-white'
                              : 'border-[#d7dde5] bg-white text-[#637991]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button type="button" onClick={() => setCurrentPage(Math.min(zoneTotalPages, safeZoneCurrentPage + 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina siguiente">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'profiles' ? (
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
                          <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[170px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                            <div className="py-2">
                              {PROFILE_SEARCH_FIELDS.map((field) => (
                                <label
                                  key={field.key}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeProfileSearchFields.some((activeField) => activeField.key === field.key)}
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
                            <button type="button" onClick={() => handleDatasetPrint('Profiles Smart Olt', profileExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </button>
                            <button type="button" onClick={() => handleDatasetExportCsv('smart-olt-profiles.csv', profileExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar csv
                            </button>
                            <button type="button" onClick={() => handleDatasetExportExcel('Profiles Smart Olt', 'smart-olt-profiles.xls', profileExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileSpreadsheet className="h-4 w-4" />
                              Exportar a Excel
                            </button>
                            <button type="button" onClick={() => handleDatasetExportPdf('Profiles Smart Olt', profileExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar a PDF
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openProfileDialog}
                      className={`inline-flex items-center gap-2 ${
                        isWispHub
                          ? 'h-[42px] rounded-[6px] border border-[#268df2] bg-[#3399f6] px-4 text-[14px]'
                          : 'h-[48px] rounded-[4px] border border-[#268df2] bg-[#3399f6] px-5 text-[14px]'
                      } font-semibold text-white`}
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo
                    </button>
                  </div>

                  <div className="relative w-full xl:max-w-[360px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6b5]" />
                    <input
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setCurrentPage(1);
                      }}
                      className={`${isWispHub ? 'h-[42px] rounded-[6px]' : 'h-[48px] rounded-[4px]'} w-full border border-[#d7dde5] bg-white pl-11 pr-4 text-[14px] text-[#24364b] outline-none`}
                      placeholder="Buscar..."
                      aria-label="Buscar Profiles"
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
                          {profileColumns.map((column) => (
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
                                    headerDirection === 'down' && column.key === 'profileName'
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
                        {paginatedProfiles.length === 0 ? (
                          <tr>
                            <td colSpan={profileColumns.length} className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]">
                              Ningun registro disponible
                            </td>
                          </tr>
                        ) : (
                          paginatedProfiles.map((row, index) => (
                            <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                              {profileColumns.map((column) => (
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
                  <div>{profileSummary}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCurrentPage(Math.max(1, safeProfileCurrentPage - 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina anterior">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: profileTotalPages }, (_, index) => {
                      const page = index + 1;
                      const active = page === safeProfileCurrentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-[34px] min-w-[34px] items-center justify-center rounded-[4px] border text-[14px] ${
                            active
                              ? isWispHub
                                ? 'border-[#3f93e7] bg-[#3f93e7] text-white'
                                : 'border-[#3f93e7] bg-[#3f93e7] text-white'
                              : 'border-[#d7dde5] bg-white text-[#637991]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button type="button" onClick={() => setCurrentPage(Math.min(profileTotalPages, safeProfileCurrentPage + 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina siguiente">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'odb' ? (
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
                              {ODB_SEARCH_FIELDS.map((field) => (
                                <label
                                  key={field.key}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeOdbSearchFields.some((activeField) => activeField.key === field.key)}
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
                            <button type="button" onClick={() => handleDatasetPrint('ODB Smart Olt', odbExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </button>
                            <button type="button" onClick={() => handleDatasetExportCsv('smart-olt-odb.csv', odbExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar csv
                            </button>
                            <button type="button" onClick={() => handleDatasetExportExcel('ODB Smart Olt', 'smart-olt-odb.xls', odbExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileSpreadsheet className="h-4 w-4" />
                              Exportar a Excel
                            </button>
                            <button type="button" onClick={() => handleDatasetExportPdf('ODB Smart Olt', odbExportRows)} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                              <FileDown className="h-4 w-4" />
                              Exportar a PDF
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openOdbDialog}
                      className={`inline-flex items-center gap-2 ${
                        isWispHub
                          ? 'h-[42px] rounded-[6px] border border-[#268df2] bg-[#3399f6] px-4 text-[14px]'
                          : 'h-[48px] rounded-[4px] border border-[#268df2] bg-[#3399f6] px-5 text-[14px]'
                      } font-semibold text-white`}
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
                      className={`${isWispHub ? 'h-[42px] rounded-[6px]' : 'h-[48px] rounded-[4px]'} w-full border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none`}
                      placeholder="Buscar..."
                      aria-label="Buscar odb"
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
                          {odbColumns.map((column) => (
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
                                    headerDirection === 'down' && column.key === 'odbName'
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
                        {paginatedOdbs.length === 0 ? (
                          <tr>
                            <td colSpan={odbColumns.length} className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]">
                              Ningún registro disponible
                            </td>
                          </tr>
                        ) : (
                          paginatedOdbs.map((row, index) => (
                            <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f2f4f6]' : 'bg-white'}>
                              {odbColumns.map((column) => (
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
                  <div>{odbSummary}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCurrentPage(Math.max(1, safeOdbCurrentPage - 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina anterior">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: odbTotalPages }, (_, index) => {
                      const page = index + 1;
                      const active = page === safeOdbCurrentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-[34px] min-w-[34px] items-center justify-center rounded-[4px] border text-[14px] ${
                            active
                              ? 'border-[#3f93e7] bg-[#3f93e7] text-white'
                              : 'border-[#d7dde5] bg-white text-[#637991]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button type="button" onClick={() => setCurrentPage(Math.min(odbTotalPages, safeOdbCurrentPage + 1))} className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8091a4]" aria-label="Pagina siguiente">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'api' ? (
            <div className="px-5 py-5">
              <div className="max-w-[780px]">
                <h2 className="mb-6 text-[18px] font-semibold text-[#24364b]">Configuración API</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="smart-olt-api-domain" className="mb-2 block text-[15px] text-[#24364b]">
                      Dominio SmartOLt
                    </label>
                    <input
                      id="smart-olt-api-domain"
                      value={apiDomain}
                      onChange={(event) => setApiDomain(event.target.value)}
                      placeholder="Ejm: miwifi"
                      className="h-[34px] w-full rounded-[4px] border border-[#d7dde5] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#d0d5db]"
                    />
                    <p className="mt-1 text-[12px] text-[#15a8d6]">Ejm: https://miempresa.smartolt.com</p>
                  </div>

                  <div>
                    <label htmlFor="smart-olt-api-key" className="mb-2 block text-[15px] text-[#24364b]">
                      API KEY
                    </label>
                    <input
                      id="smart-olt-api-key"
                      value={apiKeyValue}
                      onChange={(event) => setApiKeyValue(event.target.value)}
                      placeholder="kljsdkljx232klj32"
                      className="h-[34px] w-full rounded-[4px] border border-[#d7dde5] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#d0d5db]"
                    />
                  </div>

                  <div>
                    <label htmlFor="smart-olt-disable-onus" className="mb-2 block text-[15px] uppercase text-[#24364b]">
                      DESACTIVAR ONUs
                    </label>
                    <div className="relative">
                      <select
                        id="smart-olt-disable-onus"
                        value={disableOnusValue}
                        onChange={(event) => setDisableOnusValue(event.target.value)}
                        className="h-[34px] w-full appearance-none rounded-[4px] border border-[#d7dde5] bg-white px-3 pr-10 text-[14px] text-[#24364b] outline-none"
                      >
                        <option value="NO">NO</option>
                        <option value="SI">SI</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#24364b]" />
                    </div>
                    <p className="mt-1 text-[12px] text-[#f28c28]">* ACTIVA/DESACTIVA ONU al suspender/activar al cliente en CoreBN.</p>
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
          ) : (
            <>
              <div className="px-5 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <PageSizeCluster
                      isWispHub={isWispHub}
                      pageSize={pageSize}
                      onChange={setPageSize}
                    />
                    <SelectField
                      isWispHub={isWispHub}
                      value={filterValue}
                      onChange={setFilterValue}
                      options={filterOptions}
                      className="min-w-[260px]"
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
                <NetworkTable columns={onusColumns} rows={[]} emptyMessage="Ningun registro disponible" />
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

      <Dialog open={zoneDialog.open} onOpenChange={zoneDialog.setOpen}>
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto border border-[#989898] bg-white p-0 sm:max-w-[500px]">
          <DialogHeader className="border-b border-[#d7dfe8] bg-[#f5f5f5] px-4 py-3">
            <DialogTitle className="text-[18px] font-semibold text-[#303030]">
              Nueva ZONA
            </DialogTitle>
          </DialogHeader>

          {zoneDialog.loading ? (
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
                {zoneNoticeVisible ? (
                  <div className="flex items-start gap-3 rounded-[4px] border border-[#ffcb05] bg-[#fff6cf] px-4 py-3 text-[14px] text-[#6b5c00]">
                    <div className="flex-1 text-center leading-6">
                      <span className="font-bold">ATENCION!!</span> Debe indicar el nombre tal cual están dado de alta en la plataforma de SMARTOLT.
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoneNoticeVisible(false)}
                      className="mt-0.5 text-[#9a8a2a] transition hover:text-[#6b5c00]"
                      aria-label="Cerrar aviso"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                <div className="grid items-center gap-3 md:grid-cols-[148px_minmax(0,1fr)]">
                  <label htmlFor="smart-olt-zone-name" className="text-[15px] text-[#505b66]">
                    Nombre de la Zona
                  </label>
                  <input
                    id="smart-olt-zone-name"
                    value={zoneFormName}
                    onChange={(event) => setZoneFormName(event.target.value)}
                    placeholder="Zona 1"
                    className="h-[36px] rounded-[4px] border border-[#52c1ef] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#d0d5db]"
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-[#d7dfe8] px-4 py-3 sm:justify-end">
                <button
                  type="button"
                  onClick={closeZoneDialog}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[14px] font-medium text-[#303030] transition hover:bg-[#f5f7fa]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleZoneSubmit}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#268df2] bg-[#2f92f0] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1f82df]"
                >
                  Registrar
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialog.open} onOpenChange={profileDialog.setOpen}>
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto border border-[#989898] bg-white p-0 sm:max-w-[500px]">
          <DialogHeader className="border-b border-[#d7dfe8] bg-[#f5f5f5] px-4 py-3">
            <DialogTitle className="text-[18px] font-semibold text-[#303030]">
              Nuevo Profile
            </DialogTitle>
          </DialogHeader>

          {profileDialog.loading ? (
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
                {profileNoticeVisible ? (
                  <div className="flex items-start gap-3 rounded-[4px] border border-[#ffcb05] bg-[#fff6cf] px-4 py-3 text-[14px] text-[#6b5c00]">
                    <div className="flex-1 text-center leading-6">
                      <span className="font-bold">ATENCION!!</span> Debe indicar el nombre tal cual están dado de alta en la plataforma de SMARTOLT.
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileNoticeVisible(false)}
                      className="mt-0.5 text-[#9a8a2a] transition hover:text-[#6b5c00]"
                      aria-label="Cerrar aviso"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                <div className="grid items-center gap-3 md:grid-cols-[148px_minmax(0,1fr)]">
                  <label htmlFor="smart-olt-profile-name" className="text-[15px] text-[#505b66]">
                    Nombre del Perfil
                  </label>
                  <input
                    id="smart-olt-profile-name"
                    value={profileFormName}
                    onChange={(event) => setProfileFormName(event.target.value)}
                    placeholder="1G"
                    className="h-[36px] rounded-[4px] border border-[#52c1ef] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#d0d5db]"
                  />
                </div>

                <div className="grid items-center gap-3 md:grid-cols-[148px_minmax(0,1fr)]">
                  <label htmlFor="smart-olt-profile-type" className="text-[15px] text-[#505b66]">
                    Tipo de Perfil
                  </label>
                  <div className="relative">
                    <select
                      id="smart-olt-profile-type"
                      value={profileFormType}
                      onChange={(event) => setProfileFormType(event.target.value)}
                      className="h-[36px] w-full appearance-none rounded-[4px] border border-[#d7dfe8] bg-white px-3 pr-10 text-[14px] text-[#24364b] outline-none"
                    >
                      <option value="SUBIDA">SUBIDA</option>
                      <option value="BAJADA">BAJADA</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7a]" />
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-[#d7dfe8] px-4 py-3 sm:justify-end">
                <button
                  type="button"
                  onClick={closeProfileDialog}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[14px] font-medium text-[#303030] transition hover:bg-[#f5f7fa]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleProfileSubmit}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#268df2] bg-[#2f92f0] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1f82df]"
                >
                  Registrar
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={odbDialog.open} onOpenChange={odbDialog.setOpen}>
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto border border-[#989898] bg-white p-0 sm:max-w-[500px]">
          <DialogHeader className="border-b border-[#d7dfe8] bg-[#f5f5f5] px-4 py-3">
            <DialogTitle className="text-[18px] font-semibold text-[#303030]">
              Nuevo ODB
            </DialogTitle>
          </DialogHeader>

          {odbDialog.loading ? (
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
                {odbNoticeVisible ? (
                  <div className="flex items-start gap-3 rounded-[4px] border border-[#ffcb05] bg-[#fff6cf] px-4 py-3 text-[14px] text-[#6b5c00]">
                    <div className="flex-1 text-center leading-6">
                      <span className="font-bold">ATENCION!!</span> Debe indicar el nombre tal cual están dado de alta en la plataforma de SMARTOLT.
                    </div>
                    <button
                      type="button"
                      onClick={() => setOdbNoticeVisible(false)}
                      className="mt-0.5 text-[#9a8a2a] transition hover:text-[#6b5c00]"
                      aria-label="Cerrar aviso"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

                <div className="grid items-center gap-3 md:grid-cols-[148px_minmax(0,1fr)]">
                  <label htmlFor="smart-olt-odb-name" className="text-[15px] text-[#505b66]">
                    Nombre odb
                  </label>
                  <input
                    id="smart-olt-odb-name"
                    value={odbFormName}
                    onChange={(event) => setOdbFormName(event.target.value)}
                    placeholder="ODB 1"
                    className="h-[36px] rounded-[4px] border border-[#52c1ef] bg-white px-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#d0d5db]"
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-[#d7dfe8] px-4 py-3 sm:justify-end">
                <button
                  type="button"
                  onClick={closeOdbDialog}
                  className="inline-flex h-[30px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[14px] font-medium text-[#303030] transition hover:bg-[#f5f7fa]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleOdbSubmit}
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
