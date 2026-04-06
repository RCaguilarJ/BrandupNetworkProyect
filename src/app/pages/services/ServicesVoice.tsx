import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import type { DataColumn } from '../network/networkManagementShared';
import {
  filterServicesByCompany,
  VOICE_SERVICES,
  type VoiceServiceRecord,
} from './serviceData';
import {
  ServiceCountBadge,
  ServiceListView,
  ServiceModalFrame,
  ServiceRowActions,
} from './serviceShared';

type VoiceFormState = {
  id: string;
  name: string;
  description: string;
  notes: string;
  minutes: string;
  currency: string;
  price: string;
  fixedValue: string;
  mobileValue: string;
  tax: string;
  active: string;
  suspended: string;
  retired: string;
};

function createEmptyForm(nextId: number): VoiceFormState {
  return {
    id: String(nextId),
    name: '',
    description: '',
    notes: '',
    minutes: '0',
    currency: 'MXN',
    price: '0.00',
    fixedValue: '0.00',
    mobileValue: '0.00',
    tax: '0',
    active: '0',
    suspended: '0',
    retired: '0',
  };
}

export default function ServicesVoice() {
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<VoiceServiceRecord[]>(() =>
    filterServicesByCompany(VOICE_SERVICES, user?.role, user?.companyId),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<VoiceFormState>(() => createEmptyForm(rows.length + 1));

  const filteredRows = rows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [row.id, row.name, row.description, row.notes, row.price].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  const columns: DataColumn<VoiceServiceRecord>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => row.id },
    { key: 'name', header: 'NOMBRE', render: (row) => row.name },
    { key: 'price', header: 'PRECIO', width: '170px', render: (row) => row.price },
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
      key: 'retired',
      header: 'RETIRADOS',
      width: '160px',
      align: 'center',
      render: (row) => <ServiceCountBadge value={row.retired} tone="slate" />,
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
    setDialogOpen(true);
  }

  function handleEdit(row: VoiceServiceRecord) {
    setEditingId(row.id);
    setForm({
      id: row.id,
      name: row.name,
      description: row.description,
      notes: row.notes,
      minutes: row.minutes,
      currency: row.currency,
      price: row.price,
      fixedValue: row.fixedValue,
      mobileValue: row.mobileValue,
      tax: row.tax,
      active: row.active,
      suspended: row.suspended,
      retired: row.retired,
    });
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
    toast.success('Servicio de voz eliminado');
  }

  function saveRow() {
    if (!form.name || !form.price) {
      toast.error('Completa nombre y precio del servicio');
      return;
    }

    const record: VoiceServiceRecord = {
      id: form.id,
      companyId: user?.companyId ?? 'comp1',
      name: form.name,
      description: form.description,
      notes: form.notes,
      minutes: form.minutes,
      currency: form.currency,
      price: form.price,
      fixedValue: form.fixedValue,
      mobileValue: form.mobileValue,
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

    setDialogOpen(false);
    setEditingId(null);
    toast.success(editingId ? 'Servicio de voz actualizado' : 'Servicio de voz registrado');
  }

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
        onOpenNew={handleOpenNew}
        columns={columns}
        rows={filteredRows}
        summary={
          filteredRows.length === 0
            ? 'Mostrando 0 registros'
            : `Mostrando de 1 al ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`
        }
      />

      <ServiceModalFrame
        open={dialogOpen}
        title={editingId ? 'Editar servicio voz' : 'Nuevo servicio voz'}
        submitLabel="Guardar Cambios"
        submitIcon={<Save className="h-4 w-4" />}
        size="compact"
        onOpenChange={setDialogOpen}
        onCancel={() => setDialogOpen(false)}
        onSubmit={saveRow}
      >
        <div className="service-form">
          <div className="service-form__section">
            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-name">
                Nombre
              </label>
              <div className="service-form__control">
                <input
                  id="voice-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="service-form__input"
                />
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-description">
                Descripción
              </label>
              <div className="service-form__control">
                <input
                  id="voice-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="service-form__textarea"
                />
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-notes">
                Notas
              </label>
              <div className="service-form__control">
                <textarea
                  id="voice-notes"
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="service-form__textarea"
                />
              </div>
            </div>
          </div>

          <div className="service-form__section service-form__section--split">
            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-minutes">
                Minutos
              </label>
              <div className="service-form__control">
                <input
                  id="voice-minutes"
                  value={form.minutes}
                  onChange={(event) => setForm((current) => ({ ...current, minutes: event.target.value }))}
                  className="service-form__input"
                />
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-price">
                Precio
              </label>
              <div className="service-form__control">
                <input
                  id="voice-price"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="service-form__input"
                />
              </div>
            </div>
          </div>

          <div className="service-form__section service-form__section--split">
            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-fixed-value">
                Valor fijo
              </label>
              <div className="service-form__control">
                <input
                  id="voice-fixed-value"
                  value={form.fixedValue}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fixedValue: event.target.value }))
                  }
                  className="service-form__input"
                />
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-mobile-value">
                Valor móvil
              </label>
              <div className="service-form__control">
                <input
                  id="voice-mobile-value"
                  value={form.mobileValue}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mobileValue: event.target.value }))
                  }
                  className="service-form__input"
                />
              </div>
            </div>
          </div>

          <div className="service-form__section">
            <div className="service-form__field">
              <label className="service-form__label" htmlFor="voice-tax">
                Impuesto (%)
              </label>
              <div className="service-form__control">
                <input
                  id="voice-tax"
                  value={form.tax}
                  onChange={(event) => setForm((current) => ({ ...current, tax: event.target.value }))}
                  className="service-form__input"
                />
              </div>
            </div>
          </div>
        </div>
      </ServiceModalFrame>
    </>
  );
}
