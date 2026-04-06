import { useState } from 'react';
import {
  Edit,
  Plus,
  Router,
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
  PageSizeCluster,
  PaginationBar,
  SearchField,
  type DataColumn,
  useNetworkDialog,
} from './networkManagementShared';

type RouterRow = (typeof NETWORK_ROUTERS)[number];

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
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [routerRows, setRouterRows] = useState(() =>
    filterByCompany(NETWORK_ROUTERS, user?.role, user?.companyId),
  );
  const [editingRouterId, setEditingRouterId] = useState<string | null>(null);
  const [form, setForm] = useState({
    folio: String(routerRows.length + 1),
    name: '',
    username: '',
    password: '',
    security: securityOptions[0],
    ip: '',
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
    setEditingRouterId(null);
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

  const handleEditRouter = (router: RouterRow) => {
    setEditingRouterId(router.id);
    setForm({
      folio: String(router.folio),
      name: router.name,
      username: router.username,
      password: router.password,
      security: router.security,
      ip: router.ip,
    });
    dialog.openDialog();
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

      if (editingRouterId) {
        return current.map((router) =>
          router.id === editingRouterId
            ? {
                ...router,
                folio: Number.parseInt(form.folio, 10) || router.folio,
                name: form.name,
                subtitle: form.security,
                username: form.username,
                password: form.password,
                security: form.security,
                ip: form.ip,
              }
            : router,
        );
      }

      return [...current, nextRouter];
    });

    setEditingRouterId(null);
    dialog.closeDialog();
    toast.success(editingRouterId ? 'Router actualizado correctamente' : 'Router agregado correctamente');
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
        title={editingRouterId ? 'Editar Router' : 'Nuevo Router'}
        submitLabel={editingRouterId ? 'Actualizar Router' : 'Guardar Router'}
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
