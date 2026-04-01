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
  WAREHOUSE_PRODUCT_TYPES,
  type WarehouseProductTypeRecord,
} from './warehouseData';
import { WarehouseListView } from './warehouseShared';

export default function WarehouseProductTypes() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState(() =>
    filterWarehouseByCompany(
      WAREHOUSE_PRODUCT_TYPES,
      user?.role,
      user?.companyId,
    ),
  );
  const [form, setForm] = useState({
    product: '',
    description: '',
    type: '',
    tax: '16',
    available: '0',
  });
  const dialog = useNetworkDialog();

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      row.product.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query) ||
      row.type.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<WarehouseProductTypeRecord>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
    { key: 'product', header: 'PRODUCTO', render: (row) => row.product },
    {
      key: 'description',
      header: 'DESCRIPCION',
      width: '340px',
      render: (row) => row.description,
    },
    { key: 'type', header: 'TIPO', width: '180px', render: (row) => row.type },
    { key: 'tax', header: 'IMPUESTO (%)', width: '170px', render: (row) => row.tax },
    { key: 'available', header: 'DISPONIBLES', width: '170px', render: (row) => row.available },
    { key: 'actions', header: 'ACCIONES', width: '120px', render: () => '' },
  ];

  const openDialog = () => {
    setForm({
      product: '',
      description: '',
      type: '',
      tax: '16',
      available: '0',
    });
    dialog.openDialog();
  };

  const saveRow = () => {
    if (!form.product || !form.description || !form.type) {
      toast.error('Completa los campos requeridos del tipo de producto');
      return;
    }

    setRows((current) => [
      ...current,
      {
        id: String(current.length + 1),
        companyId: user?.companyId ?? 'comp1',
        product: form.product,
        description: form.description,
        type: form.type,
        tax: form.tax,
        available: form.available,
      },
    ]);
    dialog.closeDialog();
    toast.success('Tipo de producto agregado correctamente');
  };

  return (
    <>
      <WarehouseListView
        title="Lista de Productos"
        breadcrumb="Tipos de Productos"
        toolbarLeft={
          <ActionButton
            isWispHub={isWispHub}
            icon={<Plus className="h-5 w-5" />}
            label="Nuevo Tipo"
            onClick={openDialog}
          />
        }
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        columns={columns}
        rows={filteredRows}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        emptyMessage="Cargando..."
        summary={
          filteredRows.length === 0
            ? 'Mostrando 0 registros'
            : `Mostrando de 1 a ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`
        }
      />

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo Tipo de Producto"
        submitLabel="Guardar Tipo"
        values={form}
        fields={[
          { name: 'product', label: 'Producto', required: true },
          { name: 'description', label: 'Descripcion', required: true, colSpan: 2 },
          { name: 'type', label: 'Tipo', required: true },
          { name: 'tax', label: 'Impuesto (%)', type: 'number', required: true, min: 0 },
          { name: 'available', label: 'Disponibles', type: 'number', required: true, min: 0 },
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
