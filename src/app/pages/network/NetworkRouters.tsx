import { useState } from 'react';
import {
  Edit,
  Plus,
  Router,
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
  PageSizeCluster,
  PaginationBar,
  SearchField,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';

type RouterRow = (typeof NETWORK_ROUTERS)[number];

export default function NetworkRouters() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [routerRows, setRouterRows] = useState(() =>
    filterByCompany(NETWORK_ROUTERS, user?.role, user?.companyId),
  );
  const [form, setForm] = useState({
    folio: String(routerRows.length + 1),
    name: '',
    subtitle: '',
    ip: '',
    model: '',
    version: '',
    status: 'API-ERROR',
  });
  const dialog = useNetworkDialog();

  const filteredRouters = routerRows.filter((router) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      router.name.toLowerCase().includes(query) ||
      router.ip.toLowerCase().includes(query) ||
      router.status.toLowerCase().includes(query)
    );
  });

  const openNewRouterDialog = () => {
    setForm({
      folio: String(routerRows.length + 1),
      name: '',
      subtitle: '',
      ip: '',
      model: '',
      version: '',
      status: 'API-ERROR',
    });
    dialog.openDialog();
  };

  const saveRouter = () => {
    if (!form.name || !form.ip || !form.version) {
      toast.error('Completa los campos requeridos del router');
      return;
    }

    setRouterRows((current) => [
      ...current,
      {
        id: `router-${Date.now()}`,
        companyId: user?.companyId ?? 'comp1',
        folio: Number.parseInt(form.folio, 10) || current.length + 1,
        name: form.name,
        subtitle: form.subtitle,
        ip: form.ip,
        model: form.model,
        version: form.version,
        clients: 0,
        status: form.status,
      },
    ]);
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
      render: () => (
        <div className="flex items-center justify-center gap-2 text-[#32475c]">
          <Edit className="h-5 w-5" />
          <Router className="h-5 w-5" />
          <Users className="h-5 w-5" />
          <UserCog className="h-5 w-5" />
          <Wrench className="h-5 w-5" />
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
                <PageSizeCluster
                  isWispHub={isWispHub}
                  pageSize={pageSize}
                  onChange={setPageSize}
                />
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
          { name: 'folio', label: 'Folio', type: 'number', required: true, min: 1 },
          { name: 'name', label: 'Nombre', required: true },
          { name: 'subtitle', label: 'Detalle API / notas', colSpan: 2 },
          { name: 'ip', label: 'IP', required: true },
          { name: 'model', label: 'Modelo' },
          { name: 'version', label: 'Version', required: true },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'API-ERROR', label: 'API-ERROR' },
              { value: 'ONLINE', label: 'ONLINE' },
              { value: 'OFFLINE', label: 'OFFLINE' },
            ],
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
