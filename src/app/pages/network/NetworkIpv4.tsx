import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import { toast } from 'sonner';
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

type Ipv4Row = {
  folio: string;
  nombre: string;
  red: string;
  usoIps: string;
  cidr: string;
  router: string;
  tipo: string;
};

const columns: DataColumn<Ipv4Row>[] = [
  { key: 'folio', header: 'FOLIO', width: '90px', render: (row) => row.folio },
  { key: 'nombre', header: 'NOMBRE', render: (row) => row.nombre },
  { key: 'red', header: 'RED', width: '190px', render: (row) => row.red },
  { key: 'usoIps', header: 'USO IPS', width: '220px', render: (row) => row.usoIps },
  { key: 'cidr', header: 'CIDR', width: '90px', render: (row) => row.cidr },
  { key: 'router', header: 'ROUTER', width: '220px', render: (row) => row.router },
  { key: 'tipo', header: 'TIPO', width: '180px', render: (row) => row.tipo },
];

export default function NetworkIpv4() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<Ipv4Row[]>([]);
  const [form, setForm] = useState<Ipv4Row>({
    folio: '1',
    nombre: '',
    red: '',
    usoIps: '',
    cidr: '',
    router: '',
    tipo: '',
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.nombre.toLowerCase().includes(query) ||
      row.red.toLowerCase().includes(query) ||
      row.router.toLowerCase().includes(query)
    );
  });

  const openDialog = () => {
    setForm({
      folio: String(rows.length + 1),
      nombre: '',
      red: '',
      usoIps: '',
      cidr: '',
      router: '',
      tipo: '',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.nombre || !form.red || !form.cidr) {
      toast.error('Completa los campos requeridos de la red IPv4');
      return;
    }

    setRows((current) => [...current, form]);
    dialog.closeDialog();
    toast.success('Red IPv4 agregada correctamente');
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="Redes IPv4"
        breadcrumb="Redes IPv4"
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
            <NetworkTable columns={columns} rows={filteredRows.slice(0, pageSize)} emptyMessage="Ningun registro disponible" />
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
        title="Nueva Red IPv4"
        submitLabel="Guardar Red"
        values={form}
        fields={[
          { name: 'folio', label: 'Folio', type: 'number', required: true, min: 1 },
          { name: 'nombre', label: 'Nombre', required: true },
          { name: 'red', label: 'Red', required: true },
          { name: 'usoIps', label: 'Uso IPs', required: true },
          { name: 'cidr', label: 'CIDR', required: true },
          { name: 'router', label: 'Router' },
          { name: 'tipo', label: 'Tipo' },
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
