import { useEffect, useRef, useState } from 'react';
import { CircleHelp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { useAuth } from '../../context/AuthContext';
import { sanitizeDecimalValue, sanitizeNumericValue } from '../../lib/input-sanitizers';
import type { DataColumn } from '../network/networkManagementShared';
import {
  filterServicesByCompany,
  INTERNET_SERVICES,
  type InternetServiceRecord,
} from './serviceData';
import {
  ServiceCountBadge,
  ServiceListView,
  ServiceModalFrame,
  ServiceProcessingDialog,
  ServiceRowActions,
  useServiceCreationFlow,
} from './serviceShared';

type InternetFormState = {
  id: string;
  name: string;
  description: string;
  currency: string;
  price: string;
  tax: string;
  noRules: boolean;
  downloadKbps: string;
  uploadKbps: string;
  limitAt: string;
  burstLimit: string;
  burstThreshold: string;
  burstTime: string;
  priority: string;
  addressList: string;
  profile: string;
  addressListPcq: string;
  active: string;
  suspended: string;
};

const priorityOptions = [
  'Baja (8)',
  'Media (5)',
  'Alta (1)',
] as const;

const speedPresetOptions = Array.from({ length: 10 }, (_, index) => {
  const mbps = index + 1;

  return {
    mbps,
    kbps: String(mbps * 1000),
  };
});

type SpeedPresetField = 'downloadKbps' | 'uploadKbps';

function createEmptyForm(nextId: number): InternetFormState {
  return {
    id: String(nextId),
    name: '',
    description: '',
    currency: 'MXN',
    price: '100',
    tax: '0',
    noRules: false,
    downloadKbps: '0',
    uploadKbps: '0',
    limitAt: '10',
    burstLimit: '0',
    burstThreshold: '0',
    burstTime: '0',
    priority: priorityOptions[0],
    addressList: 'habilitados',
    profile: '',
    addressListPcq: '',
    active: '0',
    suspended: '0',
  };
}

function formatPrice(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

function formatMbpsFromKbps(value: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return '0';
  }

  const mbpsValue = numericValue / 1000;

  if (Number.isInteger(mbpsValue)) {
    return String(mbpsValue);
  }

  return mbpsValue.toFixed(2).replace(/\.?0+$/, '');
}

function parseNumericValue(value: string) {
  const normalizedValue = Number(value.replace(',', '.'));

  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

function formatCalculatedKbps(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 Kbps';
  }

  return `${Math.round(value)} Kbps`;
}

export default function ServicesInternet() {
  const { user } = useAuth();
  const flow = useServiceCreationFlow();
  const speedPresetRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<InternetServiceRecord[]>(() =>
    filterServicesByCompany(INTERNET_SERVICES, user?.role, user?.companyId),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openSpeedPreset, setOpenSpeedPreset] = useState<SpeedPresetField | null>(null);
  const [form, setForm] = useState<InternetFormState>(() =>
    createEmptyForm(rows.length + 1),
  );
  const downloadMbpsLabel = formatMbpsFromKbps(form.downloadKbps);
  const uploadMbpsLabel = formatMbpsFromKbps(form.uploadKbps);
  const limitAtRatio = parseNumericValue(form.limitAt) / 100;
  const burstThresholdRatio = parseNumericValue(form.burstThreshold) / 100;
  const guaranteedRxKbps = parseNumericValue(form.uploadKbps) * limitAtRatio;
  const guaranteedTxKbps = parseNumericValue(form.downloadKbps) * limitAtRatio;
  const burstThresholdRxKbps = parseNumericValue(form.uploadKbps) * burstThresholdRatio;
  const burstThresholdTxKbps = parseNumericValue(form.downloadKbps) * burstThresholdRatio;

  const columns: DataColumn<InternetServiceRecord>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '70px',
      render: (row) => row.id,
    },
    {
      key: 'name',
      header: 'NOMBRE',
      render: (row) => row.name,
    },
    {
      key: 'downloadKbps',
      header: 'DESCARGA KBPS',
      width: '220px',
      render: (row) => row.downloadKbps,
    },
    {
      key: 'uploadKbps',
      header: 'SUBIDA KBPS',
      width: '220px',
      render: (row) => row.uploadKbps,
    },
    {
      key: 'price',
      header: 'PRECIO',
      width: '150px',
      render: (row) => row.price,
    },
    {
      key: 'active',
      header: 'ACTIVOS',
      width: '150px',
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

  useEffect(() => {
    if (!openSpeedPreset) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!speedPresetRef.current?.contains(event.target as Node)) {
        setOpenSpeedPreset(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [openSpeedPreset]);

  function handleOpenNew() {
    setEditingId(null);
    setForm(createEmptyForm(rows.length + 1));
    flow.openSequence();
  }

  function handleEdit(row: InternetServiceRecord) {
    setEditingId(row.id);
    setForm({
      id: row.id,
      name: row.name,
      description: row.description,
      currency: row.currency,
      price: row.price,
      tax: row.tax,
      noRules: row.noRules,
      downloadKbps: row.downloadKbps,
      uploadKbps: row.uploadKbps,
      limitAt: row.limitAt,
      burstLimit: row.burstLimit,
      burstThreshold: row.burstThreshold,
      burstTime: row.burstTime,
      priority: row.priority,
      addressList: row.addressList,
      profile: row.profile,
      addressListPcq: row.addressListPcq,
      active: row.active,
      suspended: row.suspended,
    });
    flow.setDialogOpen(true);
  }

  function handleDelete(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
    toast.success('Perfil de internet eliminado');
  }

  function applySpeedPreset(field: SpeedPresetField, kbps: string) {
    setForm((current) => ({
      ...current,
      [field]: kbps,
    }));
    setOpenSpeedPreset(null);
  }

  function saveRow() {
    if (!form.name || !form.description || !form.price) {
      toast.error('Completa nombre, descripción y precio del perfil');
      return;
    }

    const record: InternetServiceRecord = {
      id: form.id,
      companyId: user?.companyId ?? 'comp1',
      name: form.name,
      description: form.description,
      currency: form.currency,
      downloadKbps: form.downloadKbps,
      uploadKbps: form.uploadKbps,
      price: formatPrice(form.price),
      tax: form.tax,
      noRules: form.noRules,
      limitAt: form.limitAt,
      burstLimit: form.burstLimit,
      burstThreshold: form.burstThreshold,
      burstTime: form.burstTime,
      priority: form.priority,
      addressList: form.addressList,
      profile: form.profile,
      addressListPcq: form.addressListPcq,
      active: form.active,
      suspended: form.suspended,
    };

    setRows((current) => {
      if (editingId) {
        return current.map((row) => (row.id === editingId ? record : row));
      }

      return [...current, record];
    });

    flow.closeAll();
    setEditingId(null);
    toast.success(editingId ? 'Perfil actualizado correctamente' : 'Perfil registrado correctamente');
  }

  return (
    <>
      <ServiceListView
        title="Servicios de internet"
        breadcrumb="Internet"
        actionLabel="Nuevo"
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onOpenNew={handleOpenNew}
        columns={columns}
        rows={rows}
      />

      <ServiceProcessingDialog open={flow.processingOpen} />

      <ServiceModalFrame
        open={flow.formOpen}
        title={editingId ? 'Editar Perfil' : 'Nuevo Perfil'}
        submitLabel={editingId ? 'Actualizar' : 'Registrar'}
        onOpenChange={flow.setDialogOpen}
        onCancel={flow.closeAll}
        onSubmit={saveRow}
      >
        <div className={`service-form ${!form.noRules ? 'service-form--rules-active' : ''}`}>
          <div className="service-form__section">
            <div className="service-form__field">
              <label className="service-form__label" htmlFor="internet-plan-name">
                Nombre Plan
              </label>
              <div className="service-form__control">
                <input
                  id="internet-plan-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="service-form__input"
                  placeholder="Plan Premium 4Mbps"
                />
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="internet-plan-description">
                Descripción
              </label>
              <div className="service-form__control">
                <input
                  id="internet-plan-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="service-form__input"
                  placeholder="Internet banda ancha 4Mbps/2Mbps"
                />
                <p className="service-form__hint">* Texto para la Facturación</p>
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="internet-plan-price">
                Precio Plan
              </label>
              <div className="service-form__control">
                <div className="service-form__inline">
                  <div className="service-form__addon">{form.currency}</div>
                  <input
                    id="internet-plan-price"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: sanitizeDecimalValue(event.target.value),
                      }))
                    }
                    className="service-form__input"
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>

            <div className="service-form__field">
              <label className="service-form__label" htmlFor="internet-plan-tax">
                Impuesto (%)
              </label>
              <div className="service-form__control">
                <div className="service-form__inline">
                  <input
                    id="internet-plan-tax"
                    value={form.tax}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tax: sanitizeDecimalValue(event.target.value),
                      }))
                    }
                    className="service-form__input"
                    inputMode="decimal"
                  />
                  <div className="service-form__addon">%</div>
                </div>
              </div>
            </div>

            <div className="service-form__field">
              <span className="service-form__label">No crear reglas</span>
              <div className="service-form__control">
                <div className="service-form__toggle-row service-form__toggle-row--stacked">
                  <div className="service-form__toggle-main">
                    <Switch
                      checked={form.noRules}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({ ...current, noRules: checked }))
                      }
                    />
                    <div className="service-form__tooltip">
                      <button
                        type="button"
                        className="service-form__tooltip-trigger"
                        aria-label="Ver explicación de las reglas"
                      >
                        <CircleHelp className="h-4 w-4" />
                        <span>¿Para qué sirven las reglas?</span>
                      </button>
                      <div className="service-form__tooltip-content">
                        Por defecto la plataforma crea perfiles y reglas en Mikrotik para PPP, Hotspot y PCQ.
                        Si vas a usar tu propia configuración, activa esta opción y administra los nombres y
                        parámetros manualmente.
                      </div>
                    </div>
                  </div>
                  <p className="service-form__hint service-form__hint--info">
                    Desactiva esta opción para configurar las reglas del perfil de internet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="service-form__divider" />

          <div className="service-form__section service-form__section--split">
            <div className="service-form__section">
              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-download">
                  Descarga Kbps
                </label>
                <div className="service-form__control">
                  <div
                    className="service-form__inline service-form__preset"
                    ref={openSpeedPreset === 'downloadKbps' ? speedPresetRef : null}
                  >
                    <button
                      type="button"
                      className="service-form__small-button service-form__small-button--interactive"
                      onClick={() =>
                        setOpenSpeedPreset((current) =>
                          current === 'downloadKbps' ? null : 'downloadKbps',
                        )
                      }
                      aria-label="Seleccionar velocidad de descarga"
                    >
                      +
                    </button>
                    <input
                      id="internet-download"
                      value={form.downloadKbps}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          downloadKbps: sanitizeNumericValue(event.target.value),
                        }))
                      }
                      className="service-form__input"
                      inputMode="numeric"
                    />
                    <div className="service-form__addon">Kbps</div>
                    {openSpeedPreset === 'downloadKbps' ? (
                      <div className="service-form__preset-menu">
                        <p className="service-form__preset-title">Velocidades</p>
                        <div className="service-form__preset-list">
                          {speedPresetOptions.map((option) => (
                            <button
                              key={`download-${option.kbps}`}
                              type="button"
                              className="service-form__preset-option"
                              onClick={() => applySpeedPreset('downloadKbps', option.kbps)}
                            >
                              <span>{option.mbps} Mbps</span>
                              <span className="service-form__preset-note">({option.kbps} Kbps)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <p className="service-form__hint service-form__hint--info">
                    Descarga: {downloadMbpsLabel}Mbps
                  </p>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-limit-at">
                  Limit AT
                </label>
                <div className="service-form__control">
                  <div className="service-form__inline">
                    <input
                      id="internet-limit-at"
                      value={form.limitAt}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          limitAt: sanitizeDecimalValue(event.target.value),
                        }))
                      }
                      className="service-form__input"
                      inputMode="decimal"
                    />
                    <div className="service-form__addon">%</div>
                  </div>
                  <p className="service-form__hint service-form__hint--info">
                    Velocidad garantizada RX/TX: {formatCalculatedKbps(guaranteedRxKbps)} / {formatCalculatedKbps(guaranteedTxKbps)}
                  </p>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-burst-threshold">
                  Burst threshold
                </label>
                <div className="service-form__control">
                  <div className="service-form__inline">
                    <input
                      id="internet-burst-threshold"
                      value={form.burstThreshold}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          burstThreshold: sanitizeDecimalValue(event.target.value),
                        }))
                      }
                      className="service-form__input"
                      inputMode="decimal"
                    />
                    <div className="service-form__addon">%</div>
                  </div>
                  <p className="service-form__hint service-form__hint--info">
                    RX/TX: {formatCalculatedKbps(burstThresholdRxKbps)} / {formatCalculatedKbps(burstThresholdTxKbps)}
                  </p>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-priority">
                  Prioridad
                </label>
                <div className="service-form__control">
                  <div className="relative">
                    <select
                      id="internet-priority"
                      value={form.priority}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, priority: event.target.value }))
                      }
                      className="service-form__select"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5d7289]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="service-form__section">
              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-upload">
                  Subida Kbps
                </label>
                <div className="service-form__control">
                  <div
                    className="service-form__inline service-form__preset"
                    ref={openSpeedPreset === 'uploadKbps' ? speedPresetRef : null}
                  >
                    <button
                      type="button"
                      className="service-form__small-button service-form__small-button--interactive"
                      onClick={() =>
                        setOpenSpeedPreset((current) =>
                          current === 'uploadKbps' ? null : 'uploadKbps',
                        )
                      }
                      aria-label="Seleccionar velocidad de subida"
                    >
                      +
                    </button>
                    <input
                      id="internet-upload"
                      value={form.uploadKbps}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          uploadKbps: sanitizeNumericValue(event.target.value),
                        }))
                      }
                      className="service-form__input"
                      inputMode="numeric"
                    />
                    <div className="service-form__addon">Kbps</div>
                    {openSpeedPreset === 'uploadKbps' ? (
                      <div className="service-form__preset-menu">
                        <p className="service-form__preset-title">Velocidades</p>
                        <div className="service-form__preset-list">
                          {speedPresetOptions.map((option) => (
                            <button
                              key={`upload-${option.kbps}`}
                              type="button"
                              className="service-form__preset-option"
                              onClick={() => applySpeedPreset('uploadKbps', option.kbps)}
                            >
                              <span>{option.mbps} Mbps</span>
                              <span className="service-form__preset-note">({option.kbps} Kbps)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <p className="service-form__hint service-form__hint--info">
                    Subida: {uploadMbpsLabel}Mbps
                  </p>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-burst-limit">
                  Burst Limit
                </label>
                <div className="service-form__control">
                  <div className="service-form__inline">
                    <div className="service-form__small-button">+</div>
                    <input
                      id="internet-burst-limit"
                      value={form.burstLimit}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          burstLimit: sanitizeDecimalValue(event.target.value),
                        }))
                      }
                      className="service-form__input"
                      inputMode="decimal"
                    />
                    <div className="service-form__addon">%</div>
                  </div>
                  <p className="service-form__hint service-form__hint--info">RX/TX: 0/0</p>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-burst-time">
                  Burst Time
                </label>
                <div className="service-form__control">
                  <div className="service-form__inline">
                    <input
                      id="internet-burst-time"
                      value={form.burstTime}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          burstTime: sanitizeDecimalValue(event.target.value),
                        }))
                      }
                      className="service-form__input"
                      inputMode="decimal"
                    />
                    <div className="service-form__addon">seg</div>
                  </div>
                  <p className="service-form__hint service-form__hint--info">Tiempo de Ráfaga</p>
                </div>
              </div>

              <div className="service-form__field">
                <label className="service-form__label" htmlFor="internet-address-list">
                  Addresslist
                </label>
                <div className="service-form__control">
                  <input
                    id="internet-address-list"
                    value={form.addressList}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, addressList: event.target.value }))
                    }
                    className="service-form__input"
                    placeholder="habilitados"
                  />
                  <p className="service-form__hint">
                    *Opcional Lista personalizada ejm: habilitados
                  </p>
                </div>
              </div>
            </div>
          </div>

          {form.noRules ? (
            <>
              <div className="service-form__divider" />

              <div className="service-form__section service-form__section--split">
                <div className="service-form__field">
                  <label className="service-form__label" htmlFor="internet-profile">
                    Profile
                  </label>
                  <div className="service-form__control">
                    <input
                      id="internet-profile"
                      value={form.profile}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, profile: event.target.value }))
                      }
                      className="service-form__input"
                      placeholder="Nombre del profile Mikrotik"
                    />
                    <p className="service-form__hint">*Nombre del Perfil PPPoE/Hotspot.</p>
                  </div>
                </div>

                <div className="service-form__field">
                  <label className="service-form__label" htmlFor="internet-address-list-pcq">
                    Addresslist PCQ
                  </label>
                  <div className="service-form__control">
                    <input
                      id="internet-address-list-pcq"
                      value={form.addressListPcq}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          addressListPcq: event.target.value,
                        }))
                      }
                      className="service-form__input"
                      placeholder="Lista utilizada en su mikrotik"
                    />
                    <p className="service-form__hint">*Lista de addresslist para PCQ + Addresslist</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </ServiceModalFrame>
    </>
  );
}
