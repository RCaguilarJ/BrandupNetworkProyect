import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  NetworkFormDialog,
  type DataColumn,
  useNetworkDialog,
} from '../network/networkManagementShared';
import {
  filterServicesByCompany,
  VOICE_SERVICES,
  type VoiceServiceRecord,
} from './serviceData';
import { ServiceListView } from './serviceShared';

export default function ServicesVoice() {
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(() =>
    filterServicesByCompany(VOICE_SERVICES, user?.role, user?.companyId),
  );
  const [form, setForm] = useState({
    id: String(rows.length + 1),
    name: '',
    price: '',
    active: '0',
    suspended: '0',
    retired: '0',
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.name.toLowerCase().includes(query) ||
      row.price.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<VoiceServiceRecord>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
    { key: 'name', header: 'NOMBRE', render: (row) => row.name },
    { key: 'price', header: 'PRECIO', width: '220px', render: (row) => row.price },
    { key: 'active', header: 'ACTIVOS', width: '190px', render: (row) => row.active },
    {
      key: 'suspended',
      header: 'SUSPENDIDOS',
      width: '210px',
      render: (row) => row.suspended,
    },
    {
      key: 'retired',
      header: 'RETIRADOS',
      width: '190px',
      render: (row) => row.retired,
    },
    { key: 'empty', header: '', width: '90px', hideSortIcon: true, render: () => '' },
  ];

  const openDialog = () => {
    setForm({
      id: String(rows.length + 1),
      name: '',
      price: '',
      active: '0',
      suspended: '0',
      retired: '0',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.name || !form.price) {
      toast.error('Completa los campos requeridos del servicio de voz');
      return;
    }

    setRows((current) => [
      ...current,
      {
        ...form,
        companyId: user?.companyId ?? 'comp1',
      },
    ]);
    dialog.closeDialog();
    toast.success('Servicio de voz agregado correctamente');
  };

  return (
    <>
      <ServiceListView
        title="Servicios de voz"
        breadcrumb="Voz"
        actionLabel="Nuevo"
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onOpenNew={openDialog}
        columns={columns}
        rows={filteredRows}
        summary={
          filteredRows.length === 0
            ? 'Mostrando 0 registros'
            : `Mostrando de 1 a ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`
        }
      />

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo Servicio de Voz"
        submitLabel="Guardar Servicio"
        values={form}
        fields={[
          { name: 'id', label: 'ID', type: 'number', required: true, min: 1 },
          { name: 'name', label: 'Nombre', required: true },
          { name: 'price', label: 'Precio', required: true },
          { name: 'active', label: 'Activos', type: 'number', min: 0 },
          { name: 'suspended', label: 'Suspendidos', type: 'number', min: 0 },
          { name: 'retired', label: 'Retirados', type: 'number', min: 0 },
        ]}
        onOpenChange={dialog.setOpen}
        onFieldChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
        onSubmit={saveRow}
      />
    </>
  );
}
