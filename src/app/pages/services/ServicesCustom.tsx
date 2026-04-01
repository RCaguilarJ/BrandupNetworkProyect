import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  NetworkFormDialog,
  type DataColumn,
  useNetworkDialog,
} from '../network/networkManagementShared';
import {
  CUSTOM_SERVICES,
  filterServicesByCompany,
  type CustomServiceRecord,
} from './serviceData';
import { ServiceListView } from './serviceShared';

export default function ServicesCustom() {
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(() =>
    filterServicesByCompany(CUSTOM_SERVICES, user?.role, user?.companyId),
  );
  const [form, setForm] = useState({
    name: '',
    price: '',
    tax: '',
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
      row.price.toLowerCase().includes(query) ||
      row.tax.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<CustomServiceRecord>[] = [
    { key: 'name', header: 'NOMBRE', render: (row) => row.name },
    { key: 'price', header: 'PRECIO', width: '220px', render: (row) => row.price },
    { key: 'tax', header: 'IMPUESTO %', width: '220px', render: (row) => row.tax },
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
      name: '',
      price: '',
      tax: '',
      active: '0',
      suspended: '0',
      retired: '0',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.name || !form.price || !form.tax) {
      toast.error('Completa los campos requeridos del servicio personalizado');
      return;
    }

    setRows((current) => [
      ...current,
      {
        id: String(current.length + 1),
        companyId: user?.companyId ?? 'comp1',
        ...form,
      },
    ]);
    dialog.closeDialog();
    toast.success('Servicio personalizado agregado correctamente');
  };

  return (
    <>
      <ServiceListView
        title="Servicios personalizados"
        breadcrumb="Personalizado"
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
        title="Nuevo Servicio Personalizado"
        submitLabel="Guardar Servicio"
        values={form}
        fields={[
          { name: 'name', label: 'Nombre', required: true },
          { name: 'price', label: 'Precio', required: true },
          { name: 'tax', label: 'Impuesto %', required: true },
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
