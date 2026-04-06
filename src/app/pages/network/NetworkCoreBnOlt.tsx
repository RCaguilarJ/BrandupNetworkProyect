import { useState, type ReactNode } from 'react';
import {
  ChevronDown,
  CircleAlert,
  CircleEllipsis,
  CirclePlus,
  Info,
  ListChecks,
  RefreshCw,
  Route,
  ServerCog,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  NetworkFormDialog,
  NetworkTable,
  PaginationBar,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';
import './NetworkCoreBnOlt.css';

type CoreBnOltRow = {
  id: string;
  companyId: string;
  olt: string;
  method: string;
  mikrotik: string;
  vpnRoute: string;
  lastCheck: string;
};

type SummaryCard = {
  key: string;
  label: string;
  value: string | number;
  tone: 'blue' | 'green' | 'red' | 'amber';
  footer: string[];
  icon: ReactNode;
};

const initialRows: CoreBnOltRow[] = [];

const summaryCards: SummaryCard[] = [
  {
    key: 'waiting',
    label: 'Waiting authorization',
    value: 0,
    tone: 'blue',
    footer: ['D: 0', 'Resync: 0', 'New: 0'],
    icon: <Tag className="h-11 w-11" />,
  },
  {
    key: 'online',
    label: 'Online',
    value: '...',
    tone: 'green',
    footer: ['Total authorized: ...'],
    icon: <ListChecks className="h-11 w-11" />,
  },
  {
    key: 'offline',
    label: 'Total offline',
    value: '...',
    tone: 'red',
    footer: ['PwrFail: ...', 'LoS: ...', 'N/A: ...'],
    icon: <CircleEllipsis className="h-11 w-11" />,
  },
  {
    key: 'signals',
    label: 'Low signals',
    value: '...',
    tone: 'amber',
    footer: ['Warning: ...', 'Critical: ...'],
    icon: <CircleAlert className="h-11 w-11" />,
  },
];

const graphLegend = [
  { label: 'Online ONUs', tone: 'green' },
  { label: 'Power fail', tone: 'blue' },
  { label: 'Signal loss', tone: 'amber' },
  { label: 'N/A', tone: 'gray' },
  { label: 'Maximum', tone: 'navy' },
] as const;

const oltFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'linked', label: 'Linked' },
  { value: 'pending', label: 'Pending' },
] as const;

function SummaryMetricCard({
  card,
}: {
  card: SummaryCard;
}) {
  return (
    <article
      className={`corebn-olt__metric-card corebn-olt__metric-card--${card.tone}`}
    >
      <div className="corebn-olt__metric-top">
        <div className="corebn-olt__metric-icon">{card.icon}</div>
        <div className="corebn-olt__metric-copy">
          <div className="corebn-olt__metric-value">{card.value}</div>
          <div className="corebn-olt__metric-label">{card.label}</div>
        </div>
      </div>
      <div
        className={`corebn-olt__metric-footer corebn-olt__metric-footer--${Math.max(card.footer.length, 1)}`}
      >
        {card.footer.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </article>
  );
}

function PanelFrame({
  title,
  actions,
  children,
  icon,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="corebn-olt__panel">
      <div className="corebn-olt__panel-header">
        <div className="corebn-olt__panel-title">
          {icon}
          <span>{title}</span>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`corebn-olt__empty-chart${compact ? ' corebn-olt__empty-chart--compact' : ''}`}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function NetworkCoreBnOlt() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const dialog = useNetworkDialog();

  const [pageSize, setPageSize] = useState('15');
  const [searchTerm, setSearchTerm] = useState('');
  const [oltFilter, setOltFilter] = useState<string>(oltFilterOptions[0].value);
  const [rows, setRows] = useState<CoreBnOltRow[]>(() => initialRows);
  const [form, setForm] = useState({
    olt: '',
    method: '',
    mikrotik: '',
    vpnRoute: '',
    lastCheck: 'Sin validar',
  });

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [row.olt, row.method, row.mikrotik, row.vpnRoute, row.lastCheck].some(
      (value) => value.toLowerCase().includes(query),
    );
  });

  const columns: DataColumn<CoreBnOltRow>[] = [
    {
      key: 'olt',
      header: 'OLT',
      render: (row) => row.olt,
    },
    {
      key: 'method',
      header: 'MÉTODO',
      render: (row) => row.method,
    },
    {
      key: 'mikrotik',
      header: 'MIKROTIK',
      render: (row) => row.mikrotik,
    },
    {
      key: 'vpnRoute',
      header: 'RUTA VPN',
      render: (row) => row.vpnRoute,
    },
    {
      key: 'lastCheck',
      header: 'ÚLTIMA PRUEBA',
      render: (row) => row.lastCheck,
    },
    {
      key: 'actions',
      header: 'ACCIONES',
      align: 'center',
      width: '120px',
      render: () => (
        <div className="flex items-center justify-center gap-3 text-[#51657c]">
          <RefreshCw className="h-4 w-4" />
          <Route className="h-4 w-4" />
        </div>
      ),
    },
  ];

  const openDialog = () => {
    setForm({
      olt: '',
      method: '',
      mikrotik: '',
      vpnRoute: '',
      lastCheck: 'Sin validar',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.olt || !form.method || !form.mikrotik) {
      toast.error('Completa OLT, método y Mikrotik para registrar la OLT');
      return;
    }

    setRows((current) => [
      {
        id: `corebn-olt-${Date.now()}`,
        companyId: user?.companyId ?? 'comp1',
        olt: form.olt,
        method: form.method,
        mikrotik: form.mikrotik,
        vpnRoute: form.vpnRoute || 'Sin ruta',
        lastCheck: form.lastCheck || 'Sin validar',
      },
      ...current,
    ]);

    dialog.closeDialog();
    toast.success('OLT agregada en el frontend');
  };

  return (
    <div
      className={`corebn-olt${isWispHub ? ' corebn-olt--wisphub' : ' corebn-olt--mikrosystem'}`}
    >
      <div className="corebn-olt__metrics-grid">
        {summaryCards.map((card) => (
          <SummaryMetricCard key={card.key} card={card} />
        ))}
      </div>

      <div className="corebn-olt__status-note">Information valid at updating...</div>

      <div className="corebn-olt__overview-grid">
        <PanelFrame
          title="Network status"
          actions={
            <button type="button" className="corebn-olt__ghost-button">
              <span>Daily graph</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          }
        >
          <div className="corebn-olt__panel-body corebn-olt__panel-body--spacious">
            <EmptyChart
              title="Sin histórico ONU todavía"
              description="CoreBN_OLT empezará a dibujar esta gráfica cuando existan snapshots válidos del estado de ONUs."
            />
          </div>

          <div className="corebn-olt__legend-bar">
            <div className="corebn-olt__legend-items">
              {graphLegend.map((item) => (
                <span key={item.label} className="corebn-olt__legend-item">
                  <i className={`corebn-olt__legend-dot corebn-olt__legend-dot--${item.tone}`} />
                  {item.label}: <strong>...</strong>
                </span>
              ))}
            </div>
            <div className="corebn-olt__snapshot-copy">
              Snapshot: Sin snapshot | Sin snapshot disponible todavía.
            </div>
          </div>
        </PanelFrame>

        <div className="corebn-olt__stack">
          <PanelFrame
            title="OLTs"
            actions={
              <div className="corebn-olt__select-wrap">
                <select
                  value={oltFilter}
                  onChange={(event) => setOltFilter(event.target.value)}
                  className="corebn-olt__select"
                  aria-label="Filtrar OLTs"
                >
                  {oltFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="corebn-olt__select-icon h-4 w-4" />
              </div>
            }
          >
            <div className="corebn-olt__panel-body">
              <EmptyChart
                compact
                title="Aún no hay OLTs vinculadas en esta subcuenta."
                description=""
              />
            </div>
          </PanelFrame>

          <PanelFrame title="Info" icon={<Info className="h-4 w-4" />}>
            <div className="corebn-olt__panel-body corebn-olt__panel-body--tight">
              <EmptyChart
                compact
                title="Aún no hay actividad registrada para mostrar."
                description=""
              />
              <button type="button" className="corebn-olt__secondary-button">
                View All Info
              </button>
            </div>
          </PanelFrame>
        </div>
      </div>

      <PanelFrame title="Connection checks per day">
        <div className="corebn-olt__panel-body corebn-olt__panel-body--spacious">
          <EmptyChart
            title="Aún no hay chequeos de conexión"
            description="Esta gráfica se activará cuando CoreBN_OLT registre validaciones reales de conexión OLT por fecha."
          />
        </div>
      </PanelFrame>

      <PanelFrame
        title="OLTs vinculadas"
        icon={<ServerCog className="h-4 w-4" />}
        actions={
          <button type="button" className="corebn-olt__header-pill" onClick={openDialog}>
            Nueva OLT
          </button>
        }
      >
        <div className="corebn-olt__table-toolbar">
          <div className="corebn-olt__toolbar-group">
            <div className="corebn-olt__compact-cluster">
              <select
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
                className="corebn-olt__compact-select"
                aria-label="Cantidad de registros por página"
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <button type="button" className="corebn-olt__compact-icon-button" aria-label="Vista de lista">
                <ListChecks className="h-4 w-4" />
              </button>
              <button type="button" className="corebn-olt__compact-icon-button" aria-label="Actualizar registros">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <button type="button" className="corebn-olt__toolbar-add-button" onClick={openDialog}>
              <CirclePlus className="h-4 w-4" />
              Nueva OLT
            </button>
          </div>

          <div className="corebn-olt__search-wrap">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="corebn-olt__search-input"
              placeholder="Buscar..."
              aria-label="Buscar OLT vinculada"
            />
          </div>
        </div>

        <div className="corebn-olt__table-wrap">
          <NetworkTable
            columns={columns}
            rows={filteredRows.slice(0, Number(pageSize))}
            emptyMessage="Ningún registro disponible"
          />

          <PaginationBar
            isWispHub={isWispHub}
            summary={`Mostrando ${Math.min(filteredRows.length, Number(pageSize))} registros`}
            showCurrentPage={false}
          />
        </div>
      </PanelFrame>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nueva OLT CoreBN"
        submitLabel="Guardar OLT"
        values={form}
        fields={[
          {
            name: 'olt',
            label: 'OLT',
            required: true,
            placeholder: 'CoreBN_OLT_01',
          },
          {
            name: 'method',
            label: 'Método',
            required: true,
            placeholder: 'API / SSH',
          },
          {
            name: 'mikrotik',
            label: 'Mikrotik',
            required: true,
            placeholder: 'MK Principal',
          },
          {
            name: 'vpnRoute',
            label: 'Ruta VPN',
            placeholder: 'vpn/corebn',
          },
          {
            name: 'lastCheck',
            label: 'Última prueba',
            placeholder: 'Sin validar',
          },
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
