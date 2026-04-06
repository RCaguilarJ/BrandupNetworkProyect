import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import type { DataColumn } from '../network/networkManagementShared';
import {
  CUSTOM_SERVICES,
  filterServicesByCompany,
  type CustomServiceRecord,
} from './serviceData';
import {
  ServiceCountBadge,
  ServiceListView,
  ServiceModalFrame,
  ServiceProcessingDialog,
  ServiceRowActions,
  useServiceCreationFlow,
} from './serviceShared';

type CustomFormState = {
  id: string;
  name: string;
  description: string;
  currency: string;
  price: string;
  tax: string;
  active: string;
  suspended: string;
  retired: string;
};

function createEmptyForm(nextId: number): CustomFormState {
  return {
    id: String(nextId),
    name: '',
    description: '',
    currency: 'MXN',
    price: '0.00',
    tax: '0',
    active: '0',
    suspended: '0',
    retired: '0',
  };
}

export default function ServicesCustom() {
  const { user } = useAuth();
  const flow = useServiceCreationFlow();
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<CustomServiceRecord[]>(() =>
    filterServicesByCompany(CUSTOM_SERVICES, user?.role, user?.companyId),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomFormState>(() => createEmptyForm(rows.length + 1));

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [row.id, row.name, row.description, row.price, row.tax].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  const columns: DataColumn<CustomServiceRecord>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
    { key: 'name', header: 'NOMBRE', render: (row) => row.name },
    { key: 'price', header: 'PRECIO', width: '170px', render: (row) => row.price },
    { key: 'tax', header: 'IMPUESTO %', width: '160px', render: (row) => row.tax },
    {
      key: 'active',
      header: 'ACTIVOS',
      width: '160px',
      align: 'center',
      render: (row) => <ServiceCountBadge value={row.active} tone="teal" />,
    },
    {
      key: 'suspended',
      header: 'SUSPENDIDOS',
      width: '180px',
      align: 'center',
      render: (row) => <ServiceCountBadge value={row.suspended} tone="amber" />,
    },
    {
      key: 'actions',
      header: '',
      width: '90px',
      align: 'center',
      hideSortIcon: true,
      render: (row) => (
        <ServiceRowActions
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  function handleOpenNew() {
    setEditingId(null);
    setForm(createEmptyForm(rows.length + 1));
    flow.openSequence();
  }

  function handleEdit(row: CustomServiceRecord) {
    setEditingId(row.id);
    setForm({
      id: row.id,
      name: row.name,
      description: row.description,
      currency: row.currency,
      price: row.price,
      tax: row.tax,
      active: row.active,
      suspended: row.suspended,
      retired: row.retired,
    });
    flow.setDialogOpen(true);
  }

  function handleDelete(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
    toast.success('Servicio personalizado eliminado');
  }

  function saveRow() {
    if (!form.name || !form.description || !form.price) {
      toast.error('Completa nombre, descripción y precio del servicio');
      return;
    }

    const record: CustomServiceRecord = {
      id: form.id,
      companyId: user?.companyId ?? 'comp1',
      name: form.name,
      description: form.description,
      currency: form.currency,
      price: form.price,
      tax: form.tax,
      active: form.active,
      suspended: form.suspended,
      retired: form.retired,
    };

    setRows((current) =>
      editingId
        ? current.map((row) => (row.id === editingId ? record : row))
        : [...current, record],
    );

    flow.closeAll();
    setEditingId(null);
    toast.success(editingId ? 'Servicio personalizado actualizado' : 'Servicio personalizado registrado');
  }

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
        onOpenNew={handleOpenNew}
        columns={columns}
        rows={filteredRows}
        summary={
          filteredRows.length === 0
            ? 'Mostrando 0 registros'
            : `Mostrando de 1 al ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`
        }
      />

      <ServiceProcessingDialog open={flow.processingOpen} />

      <ServiceModalFrame
        open={flow.formOpen}
        title={editingId ? 'Editar Servicio Personalizado' : 'Nuevo Servicio Personalizado'}
        submitLabel={editingId ? 'Actualizar' : 'Registrar'}
        onOpenChange={flow.setDialogOpen}
        onCancel={flow.closeAll}
        onSubmit={saveRow}
      >
        <div className="service-form">
          <div className="service-form__section">
            <div className="service-form__field">
              <label className="service-form__label" htmlFor="custom-name">
                Nombre
              </label>
              <div className="service-form__control">
                <input
                  id="custom-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="service-form__input"
                  placeholder="Servicio personalizado"
                />
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="custom-description">
                Descripción
              </label>
              <div className="service-form__control">
                <input
                  id="custom-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="service-form__input"
                  placeholder="Detalle del servicio"
                />
              </div>
            </div>
          </div>

          <div className="service-form__divider" />

          <div className="service-form__section service-form__section--split">
            <div className="service-form__section">
              <div className="service-form__field">
                <label className="service-form__label" htmlFor="custom-price">
                  Precio
                </label>
                <div className="service-form__control">
                  <div className="service-form__inline">
                    <div className="service-form__addon">{form.currency}</div>
                    <input
                      id="custom-price"
                      value={form.price}
                      onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                      className="service-form__input"
                    />
                  </div>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="custom-tax">
                  Impuesto (%)
                </label>
                <div className="service-form__control">
                  <div className="service-form__inline">
                    <input
                      id="custom-tax"
                      value={form.tax}
                      onChange={(event) => setForm((current) => ({ ...current, tax: event.target.value }))}
                      className="service-form__input"
                    />
                    <div className="service-form__addon">%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="service-form__section">
              <div className="service-form__field">
                <label className="service-form__label" htmlFor="custom-active">
                  Activos
                </label>
                <div className="service-form__control">
                  <input
                    id="custom-active"
                    value={form.active}
                    onChange={(event) => setForm((current) => ({ ...current, active: event.target.value }))}
                    className="service-form__input"
                  />
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="custom-suspended">
                  Suspendidos
                </label>
                <div className="service-form__control">
                  <input
                    id="custom-suspended"
                    value={form.suspended}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, suspended: event.target.value }))
                    }
                    className="service-form__input"
                  />
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="custom-retired">
                  Retirados
                </label>
                <div className="service-form__control">
                  <input
                    id="custom-retired"
                    value={form.retired}
                    onChange={(event) => setForm((current) => ({ ...current, retired: event.target.value }))}
                    className="service-form__input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ServiceModalFrame>
    </>
  );
}
