import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { toast } from 'sonner';
import {
  filterByCompany,
  mikrosystemPageStyle,
  NETWORK_NAP_BOXES,
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

type NapRow = (typeof NETWORK_NAP_BOXES)[number];

export default function NetworkNapBoxes() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(() =>
    filterByCompany(NETWORK_NAP_BOXES, user?.role, user?.companyId),
  );
  const [form, setForm] = useState({
    name: '',
    location: '',
    coordinates: '',
    ports: '16',
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.name.toLowerCase().includes(query) ||
      row.location.toLowerCase().includes(query) ||
      row.coordinates.toLowerCase().includes(query)
    );
  });

  const openDialog = () => {
    setForm({
      name: '',
      location: '',
      coordinates: '',
      ports: '16',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.name || !form.location || !form.coordinates) {
      toast.error('Completa los campos requeridos de la caja NAP');
      return;
    }

    const totalPorts = Number.parseInt(form.ports, 10) || 16;

    setRows((current) => [
      ...current,
      {
        id: `nap-${current.length + 1}`,
        companyId: user?.companyId ?? 'comp1',
        name: form.name,
        location: form.location,
        coordinates: form.coordinates,
        ports: totalPorts,
        details: Array.from({ length: totalPorts }, (_, index) => index + 1),
      },
    ]);
    dialog.closeDialog();
    toast.success('Caja NAP agregada correctamente');
  };

  const columns: DataColumn<NapRow>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id.replace('nap-', '') },
    { key: 'nombre', header: 'NOMBRE', width: '120px', render: (row) => row.name },
    { key: 'ubicacion', header: 'UBICACION', width: '220px', render: (row) => row.location },
    { key: 'coordenadas', header: 'COORDENADAS', width: '460px', render: (row) => row.coordinates },
    { key: 'puertos', header: 'PUERTOS', width: '110px', align: 'center', render: (row) => row.ports },
    {
      key: 'detalles',
      header: 'DETALLES',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.details.map((item) => (
            <span
              key={item}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] bg-[#11b8aa] px-3 text-[14px] font-semibold text-white"
            >
              {item}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'acciones',
      header: '',
      width: '90px',
      hideSortIcon: true,
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-3 text-[#2d4257]">
          <Edit className="h-5 w-5" />
          <Trash2 className="h-5 w-5" />
        </div>
      ),
    },
  ];

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="CAJAS NAP"
        breadcrumb="Cajas Nap"
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
            <NetworkTable columns={columns} rows={filteredRows.slice(0, pageSize)} />
            <PaginationBar
              isWispHub={isWispHub}
              summary={
                filteredRows.length === 0
                  ? 'Mostrando 0 registros'
                  : `Mostrando de 1 a ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`
              }
              showCurrentPage={filteredRows.length > 0}
            />
          </div>
        </NetworkPanel>
      </NetworkPageShell>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nueva Caja NAP"
        submitLabel="Guardar Caja"
        values={form}
        fields={[
          { name: 'name', label: 'Nombre', required: true },
          { name: 'location', label: 'Ubicacion', required: true },
          { name: 'coordinates', label: 'Coordenadas', required: true, colSpan: 2 },
          { name: 'ports', label: 'Puertos', type: 'number', required: true, min: 1 },
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
