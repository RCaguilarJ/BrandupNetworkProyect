import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  ActionButton,
  NetworkFormDialog,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  SelectField,
  type DataColumn,
  useNetworkDialog,
} from '../network/networkManagementShared';
import {
  filterWarehouseByCompany,
  WAREHOUSE_ACCESSORIES,
  WAREHOUSE_PRODUCTS,
  type WarehouseAccessoryRecord,
  type WarehouseProductRecord,
} from './warehouseData';
import {
  WarehouseSection,
  WarehouseShell,
} from './warehouseShared';

export default function WarehouseProducts() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState(() =>
    filterWarehouseByCompany(
      WAREHOUSE_PRODUCTS,
      user?.role,
      user?.companyId,
    ),
  );
  const [accessories] = useState(() =>
    filterWarehouseByCompany(
      WAREHOUSE_ACCESSORIES,
      user?.role,
      user?.companyId,
    ),
  );
  const [form, setForm] = useState({
    product: '',
    supplier: '',
    serialNumber: '',
    macAddress: '',
    cost: '',
    status: 'disponible',
    client: '',
    ingreso: '',
    salida: '',
    category: '',
  });
  const dialog = useNetworkDialog();

  const filteredProducts = products.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !query ||
      row.product.toLowerCase().includes(query) ||
      row.supplier.toLowerCase().includes(query) ||
      row.serialNumber.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === 'all' || row.status.toLowerCase() === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' ||
      row.category.toLowerCase() === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const productColumns: DataColumn<WarehouseProductRecord>[] = [
    { key: 'id', header: 'ID', width: '60px', render: (row) => row.id },
    { key: 'product', header: 'PRODUCTO', width: '190px', render: (row) => row.product },
    { key: 'supplier', header: 'PROVEEDOR', width: '170px', render: (row) => row.supplier },
    { key: 'serialNumber', header: 'N° SERIE', width: '160px', render: (row) => row.serialNumber || 'Cualquiera' },
    { key: 'macAddress', header: 'N° MAC', width: '160px', render: (row) => row.macAddress || 'Cualquiera' },
    { key: 'cost', header: 'COSTO', width: '150px', render: (row) => row.cost || 'Cualquiera' },
    { key: 'status', header: 'ESTADO', width: '130px', render: (row) => row.status || 'Cualquiera' },
    { key: 'client', header: 'CLIENTE', width: '160px', render: (row) => row.client || 'Cualquiera' },
    { key: 'ingreso', header: 'INGRESO', width: '170px', render: (row) => row.ingreso || 'Cualquiera' },
    { key: 'salida', header: 'SALIDA', width: '170px', render: (row) => row.salida || 'Cualquiera' },
    { key: 'actions', header: 'ACCIONES', width: '120px', render: () => '' },
  ];

  const accessoryColumns: DataColumn<WarehouseAccessoryRecord>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
    { key: 'accessory', header: 'ACCESORIO', render: (row) => row.accessory },
    { key: 'unitCost', header: 'COSTO UNITARIO', width: '240px', render: (row) => row.unitCost },
    { key: 'quantity', header: 'CANTIDAD', width: '180px', render: (row) => row.quantity },
    { key: 'actions', header: 'ACCIONES', width: '120px', render: () => '' },
  ];

  const openDialog = () => {
    setForm({
      product: '',
      supplier: '',
      serialNumber: '',
      macAddress: '',
      cost: '',
      status: 'disponible',
      client: '',
      ingreso: '',
      salida: '',
      category: '',
    });
    dialog.openDialog();
  };

  const saveProduct = () => {
    if (!form.product || !form.supplier || !form.category) {
      toast.error('Completa los campos requeridos del producto');
      return;
    }

    setProducts((current) => [
      ...current,
      {
        id: String(current.length + 1),
        companyId: user?.companyId ?? 'comp1',
        product: form.product,
        supplier: form.supplier,
        serialNumber: form.serialNumber,
        macAddress: form.macAddress,
        cost: form.cost,
        status: form.status,
        client: form.client,
        ingreso: form.ingreso,
        salida: form.salida,
        category: form.category,
      },
    ]);
    dialog.closeDialog();
    toast.success('Producto agregado correctamente');
  };

  return (
    <>
      <WarehouseShell
        title="Lista de Productos en Almacen"
        breadcrumb="Productos"
      >
        <div className="space-y-5 px-4 py-4 md:px-5">
          <WarehouseSection title="Productos">
            <div className="flex flex-col gap-4 px-4 py-4 md:px-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <PageSizeCluster
                  isWispHub={isWispHub}
                  pageSize={pageSize}
                  onChange={setPageSize}
                />
                <ActionButton
                  isWispHub={isWispHub}
                  icon={<Plus className="h-5 w-5" />}
                  label="Nuevo Producto"
                  onClick={openDialog}
                />
                <ActionButton
                  isWispHub={isWispHub}
                  icon={<Upload className="h-4 w-4" />}
                  label="Subir"
                />
                <SelectField
                  isWispHub={isWispHub}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'Estado' },
                    { value: 'disponible', label: 'Disponible' },
                    { value: 'asignado', label: 'Asignado' },
                    { value: 'bodega', label: 'Bodega' },
                  ]}
                  className="min-w-[150px]"
                />
                <SelectField
                  isWispHub={isWispHub}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: 'all', label: 'Categoria' },
                    { value: 'router', label: 'Router' },
                    { value: 'onu', label: 'ONU' },
                    { value: 'cable', label: 'Cableado' },
                  ]}
                  className="min-w-[180px]"
                />
              </div>
              <SearchField
                isWispHub={isWispHub}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            <div className="px-4 pb-5 md:px-5">
              <NetworkTable
                columns={productColumns}
                rows={filteredProducts.slice(0, pageSize)}
                emptyMessage="Ningun registro disponible"
              />
              <PaginationBar
                isWispHub={isWispHub}
                summary={
                  filteredProducts.length === 0
                    ? 'Mostrando 0 registros'
                    : `Mostrando de 1 a ${Math.min(pageSize, filteredProducts.length)} de un total de ${filteredProducts.length}`
                }
                showCurrentPage={filteredProducts.length > 0}
              />
            </div>
          </WarehouseSection>

          <WarehouseSection title="Accesorios">
            <div className="flex flex-col gap-4 px-4 py-4 md:px-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <PageSizeCluster
                  isWispHub={isWispHub}
                  pageSize={pageSize}
                  onChange={setPageSize}
                />
              </div>
              <SearchField
                isWispHub={isWispHub}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            <div className="px-4 pb-5 md:px-5">
              <NetworkTable
                columns={accessoryColumns}
                rows={accessories.slice(0, pageSize)}
                emptyMessage="Cargando..."
              />
              <PaginationBar
                isWispHub={isWispHub}
                summary={
                  accessories.length === 0
                    ? 'Mostrando 0 registros'
                    : `Mostrando de 1 a ${Math.min(pageSize, accessories.length)} de un total de ${accessories.length}`
                }
                showCurrentPage={accessories.length > 0}
              />
            </div>
          </WarehouseSection>
        </div>
      </WarehouseShell>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo Producto"
        submitLabel="Guardar Producto"
        values={form}
        fields={[
          { name: 'product', label: 'Producto', required: true },
          { name: 'supplier', label: 'Proveedor', required: true },
          { name: 'serialNumber', label: 'Numero de serie' },
          { name: 'macAddress', label: 'Numero MAC' },
          { name: 'cost', label: 'Costo' },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'disponible', label: 'Disponible' },
              { value: 'asignado', label: 'Asignado' },
              { value: 'bodega', label: 'Bodega' },
            ],
          },
          { name: 'client', label: 'Cliente' },
          { name: 'ingreso', label: 'Ingreso' },
          { name: 'salida', label: 'Salida' },
          { name: 'category', label: 'Categoria', required: true },
        ]}
        onOpenChange={dialog.setOpen}
        onFieldChange={(field, value) =>
          setForm((current) => ({ ...current, [field]: value }))
        }
        onSubmit={saveProduct}
      />
    </>
  );
}
