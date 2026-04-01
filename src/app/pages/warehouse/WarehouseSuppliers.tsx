import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  ActionButton,
  NetworkFormDialog,
  type DataColumn,
  useNetworkDialog,
} from '../network/networkManagementShared';
import {
  filterWarehouseByCompany,
  WAREHOUSE_SUPPLIERS,
  type WarehouseSupplierRecord,
} from './warehouseData';
import { WarehouseListView } from './warehouseShared';

export default function WarehouseSuppliers() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(() =>
    filterWarehouseByCompany(
      WAREHOUSE_SUPPLIERS,
      user?.role,
      user?.companyId,
    ),
  );
  const [form, setForm] = useState({
    supplier: '',
    email: '',
    phone: '',
    address: '',
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.supplier.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.phone.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<WarehouseSupplierRecord>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
    { key: 'supplier', header: 'PROVEEDOR', render: (row) => row.supplier },
    { key: 'email', header: 'EMAIL', width: '280px', render: (row) => row.email },
    { key: 'phone', header: 'TELEFONO', width: '190px', render: (row) => row.phone },
    { key: 'address', header: 'DIRECCION', width: '380px', render: (row) => row.address },
    { key: 'actions', header: 'ACCIONES', width: '120px', render: () => '' },
  ];

  const openDialog = () => {
    setForm({
      supplier: '',
      email: '',
      phone: '',
      address: '',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.supplier || !form.email) {
      toast.error('Completa los campos requeridos del proveedor');
      return;
    }

    setRows((current) => [
      ...current,
      {
        id: String(current.length + 1),
        companyId: user?.companyId ?? 'comp1',
        supplier: form.supplier,
        email: form.email,
        phone: form.phone,
        address: form.address,
      },
    ]);
    dialog.closeDialog();
    toast.success('Proveedor agregado correctamente');
  };

  return (
    <>
      <WarehouseListView
        title="Lista de Proveedores"
        breadcrumb="Proveedores"
        toolbarLeft={
          <ActionButton
            isWispHub={isWispHub}
            icon={<Plus className="h-5 w-5" />}
            label="Nuevo Proveedor"
            onClick={openDialog}
          />
        }
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        columns={columns}
        rows={filteredRows}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        emptyMessage="Ningun registro disponible"
        summary={
          filteredRows.length === 0
            ? 'Mostrando 0 registros'
            : `Mostrando de 1 a ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`
        }
      />

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo Proveedor"
        submitLabel="Guardar Proveedor"
        values={form}
        fields={[
          { name: 'supplier', label: 'Proveedor', required: true },
          { name: 'email', label: 'Email', required: true },
          { name: 'phone', label: 'Telefono' },
          { name: 'address', label: 'Direccion', colSpan: 2 },
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
