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

type MonitoringRow = {
  id: string;
  nombre: string;
  equipo: string;
  ip: string;
  estado: string;
  online: string;
  activos: string;
  suspendidos: string;
};

const columns: DataColumn<MonitoringRow>[] = [
  { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
  { key: 'nombre', header: 'NOMBRE', render: (row) => row.nombre },
  { key: 'equipo', header: 'EQUIPO', width: '180px', render: (row) => row.equipo },
  { key: 'ip', header: 'IP', width: '110px', render: (row) => row.ip },
  { key: 'estado', header: 'ESTADO', width: '170px', render: (row) => row.estado },
  { key: 'online', header: 'ONLINE', width: '170px', render: (row) => row.online },
  { key: 'activos', header: 'ACTIVOS', width: '170px', render: (row) => row.activos },
  { key: 'suspendidos', header: 'SUSPENDIDOS', width: '200px', render: (row) => row.suspendidos },
  { key: 'empty', header: '', width: '90px', hideSortIcon: true, render: () => '' },
];

export default function NetworkMonitoring() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<MonitoringRow[]>([]);
  const [form, setForm] = useState<MonitoringRow>({
    id: '1',
    nombre: '',
    equipo: '',
    ip: '',
    estado: 'ACTIVO',
    online: '0',
    activos: '0',
    suspendidos: '0',
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.nombre.toLowerCase().includes(query) ||
      row.equipo.toLowerCase().includes(query) ||
      row.ip.toLowerCase().includes(query)
    );
  });

  const openDialog = () => {
    setForm({
      id: String(rows.length + 1),
      nombre: '',
      equipo: '',
      ip: '',
      estado: 'ACTIVO',
      online: '0',
      activos: '0',
      suspendidos: '0',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.nombre || !form.equipo || !form.ip) {
      toast.error('Completa los campos requeridos del monitoreo');
      return;
    }

    setRows((current) => [...current, form]);
    dialog.closeDialog();
    toast.success('Equipo agregado al monitoreo');
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="Monitoreo"
        breadcrumb="Monitoreo"
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
        title="Nuevo Equipo de Monitoreo"
        submitLabel="Guardar Equipo"
        values={form}
        fields={[
          { name: 'id', label: 'ID', type: 'number', required: true, min: 1 },
          { name: 'nombre', label: 'Nombre', required: true },
          { name: 'equipo', label: 'Equipo', required: true },
          { name: 'ip', label: 'IP', required: true },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'ACTIVO', label: 'ACTIVO' },
              { value: 'OFFLINE', label: 'OFFLINE' },
              { value: 'MANTENIMIENTO', label: 'MANTENIMIENTO' },
            ],
          },
          { name: 'online', label: 'Online' },
          { name: 'activos', label: 'Activos' },
          { name: 'suspendidos', label: 'Suspendidos' },
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
