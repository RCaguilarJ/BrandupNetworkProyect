import { useState } from 'react';
import {
  CirclePlus,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Unplug,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './networkManagementData';
import {
  ActionButton,
  NetworkFormDialog,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';

type CoreBnOltRow = {
  id: string;
  companyId: string;
  gestion: string;
  acceso: string;
  router: string;
  scope: string;
  lastCheck: string;
};

const initialRows: CoreBnOltRow[] = [];

const summaryCards = [
  {
    key: 'new',
    label: 'Waiting auth',
    value: 0,
    helperLeft: 'New: 0',
    helperRight: '',
    colorClass: '#337ab7',
    icon: <CirclePlus className="h-12 w-12" />,
  },
  {
    key: 'online',
    label: 'Online',
    value: 0,
    helperLeft: 'Total authorized: 0',
    helperRight: '',
    colorClass: '#5cb85c',
    icon: <ShieldCheck className="h-12 w-12" />,
  },
  {
    key: 'offline',
    label: 'Total offline',
    value: 0,
    helperLeft: 'PowerFail: 0',
    helperRight: 'LoS: 0',
    colorClass: '#d9534f',
    icon: <Unplug className="h-12 w-12" />,
  },
  {
    key: 'inventory',
    label: 'Registered OLTs',
    value: 0,
    helperLeft: 'Inventory: 0',
    helperRight: '',
    colorClass: '#f0ad4e',
    icon: <Server className="h-12 w-12" />,
  },
];

export default function NetworkCoreBnOlt() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const dialog = useNetworkDialog();

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(() => initialRows);
  const [form, setForm] = useState({
    gestion: '',
    acceso: '',
    router: '',
    scope: '',
    lastCheck: 'Sin validar',
  });

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [row.gestion, row.acceso, row.router, row.scope, row.lastCheck]
      .some((value) => value.toLowerCase().includes(query));
  });

  const columns: DataColumn<CoreBnOltRow>[] = [
    {
      key: 'gestion',
      header: 'GESTION',
      render: (row) => row.gestion,
    },
    {
      key: 'acceso',
      header: 'ACCESO',
      render: (row) => row.acceso,
    },
    {
      key: 'router',
      header: 'ROUTER',
      render: (row) => row.router,
    },
    {
      key: 'scope',
      header: 'SCOPE',
      render: (row) => row.scope,
    },
    {
      key: 'lastCheck',
      header: 'ULTIMA REVISION',
      render: (row) => row.lastCheck,
    },
    {
      key: 'actions',
      header: 'ACCIONES',
      align: 'center',
      width: '150px',
      render: () => (
        <div className="flex items-center justify-center gap-2 text-[#42566f]">
          <RefreshCw className="h-4 w-4" />
          <Network className="h-4 w-4" />
        </div>
      ),
    },
  ];

  const openDialog = () => {
    setForm({
      gestion: '',
      acceso: '',
      router: '',
      scope: '',
      lastCheck: 'Sin validar',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.gestion || !form.acceso || !form.router) {
      toast.error('Completa gestion, acceso y router para registrar la OLT');
      return;
    }

    setRows((current) => [
      {
        id: `corebn-olt-${Date.now()}`,
        companyId: user?.companyId ?? 'comp1',
        gestion: form.gestion,
        acceso: form.acceso,
        router: form.router,
        scope: form.scope || 'General',
        lastCheck: form.lastCheck,
      },
      ...current,
    ]);
    dialog.closeDialog();
    toast.success('OLT agregada en el frontend');
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="CoreBN_OLT"
        breadcrumb="CoreBN_OLT"
        isWispHub={isWispHub}
        showHeaderActions={false}
        showMikrosystemHeader={false}
      >
        <div className="mb-5 grid gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.key}
              className="overflow-hidden rounded-[4px] border border-[#d8dde6] bg-white"
            >
              <div
                className="flex items-center justify-between gap-4 px-[18px] py-[18px] text-white"
                style={{ backgroundColor: card.colorClass }}
              >
                <div className="opacity-95">{card.icon}</div>
                <div className="text-right">
                  <div className="text-[38px] font-bold leading-none">
                    {card.value}
                  </div>
                  <div className="mt-2 text-[15px] font-semibold">
                    {card.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 bg-[#f5f5f5] px-4 py-[10px] text-[12px] text-[#4b5d73]">
                <span>{card.helperLeft}</span>
                <span>{card.helperRight}</span>
              </div>
            </article>
          ))}
        </div>

        <NetworkPanel isWispHub={isWispHub}>
          <div className="border-b border-[#d7dde5] bg-[#4d4a48] px-4 py-3 text-[14px] font-bold text-white">
            Inventario de OLTs
          </div>

          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <PageSizeCluster
                  isWispHub={isWispHub}
                  pageSize={pageSize}
                  onChange={setPageSize}
                />
                <ActionButton
                  isWispHub={isWispHub}
                  icon={<CirclePlus className="h-4 w-4" />}
                  label="Nueva OLT"
                  onClick={openDialog}
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
              rows={filteredRows.slice(0, pageSize)}
              emptyMessage="Ningun registro disponible"
            />
            <PaginationBar
              isWispHub={isWispHub}
              summary={`Mostrando ${Math.min(filteredRows.length, pageSize)} registro(s)`}
              showCurrentPage={false}
            />
          </div>
        </NetworkPanel>

        <NetworkFormDialog
          open={dialog.open}
          loading={dialog.loading}
          title="Nueva OLT CoreBN"
          submitLabel="Guardar OLT"
          values={form}
          fields={[
            {
              name: 'gestion',
              label: 'Gestion',
              required: true,
              placeholder: 'Administracion principal',
            },
            {
              name: 'acceso',
              label: 'Acceso',
              required: true,
              placeholder: 'Acceso remoto / local',
            },
            {
              name: 'router',
              label: 'Router',
              required: true,
              placeholder: 'Router asignado',
            },
            {
              name: 'scope',
              label: 'Scope',
              placeholder: 'General',
            },
            {
              name: 'lastCheck',
              label: 'Ultima revision',
              placeholder: 'Sin validar',
            },
          ]}
          onOpenChange={dialog.setOpen}
          onFieldChange={(field, value) =>
            setForm((current) => ({ ...current, [field]: value }))
          }
          onSubmit={saveRow}
        />
      </NetworkPageShell>
    </div>
  );
}
