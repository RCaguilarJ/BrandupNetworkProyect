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

type BlacklistRow = {
  id: string;
  nombre: string;
  ip: string;
  estado: string;
  listado: string;
  actualizado: string;
};

const columns: DataColumn<BlacklistRow>[] = [
  { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
  { key: 'nombre', header: 'NOMBRE', render: (row) => row.nombre },
  { key: 'ip', header: 'IP', width: '150px', render: (row) => row.ip },
  { key: 'estado', header: 'ESTADO', width: '210px', render: (row) => row.estado },
  { key: 'listado', header: 'LISTADO EN', width: '280px', render: (row) => row.listado },
  { key: 'actualizado', header: 'ACTUALIZADO', width: '280px', render: (row) => row.actualizado },
  { key: 'empty', header: '', width: '90px', hideSortIcon: true, render: () => '' },
];

export default function NetworkBlacklist() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<BlacklistRow[]>([]);
  const [form, setForm] = useState<BlacklistRow>({
    id: '1',
    nombre: '',
    ip: '',
    estado: 'LISTADO',
    listado: 'Firewall',
    actualizado: new Date().toISOString().slice(0, 10),
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.nombre.toLowerCase().includes(query) ||
      row.ip.toLowerCase().includes(query) ||
      row.estado.toLowerCase().includes(query)
    );
  });

  const openDialog = () => {
    setForm({
      id: String(rows.length + 1),
      nombre: '',
      ip: '',
      estado: 'LISTADO',
      listado: 'Firewall',
      actualizado: new Date().toISOString().slice(0, 10),
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.nombre || !form.ip) {
      toast.error('Completa los campos requeridos de la lista negra');
      return;
    }

    setRows((current) => [...current, form]);
    dialog.closeDialog();
    toast.success('IP agregada a la lista negra');
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="Monitor IPs Lista Negra"
        breadcrumb="Monitor BlackList"
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
        title="Nuevo Registro de BlackList"
        submitLabel="Guardar Registro"
        values={form}
        fields={[
          { name: 'id', label: 'ID', type: 'number', required: true, min: 1 },
          { name: 'nombre', label: 'Nombre', required: true },
          { name: 'ip', label: 'IP', required: true },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'LISTADO', label: 'LISTADO' },
              { value: 'PENDIENTE', label: 'PENDIENTE' },
            ],
          },
          { name: 'listado', label: 'Listado en', required: true },
          { name: 'actualizado', label: 'Actualizado', type: 'date', required: true },
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
