import { useMemo, useState } from 'react';
import { Bell, FileText, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

type BillingTemplateSettings = {
  templateId: string;
  templateName: string;
  billingType: string;
  paymentDay: string;
  createInvoiceOffset: string;
  taxMode: string;
  graceDays: string;
  cutoffPolicy: string;
  applyLateFee: boolean;
  applyReconnection: boolean;
  reactivateWithPartialPayment: boolean;
  tax1: string;
  tax2: string;
  tax3: string;
};

type NotificationTemplateSettings = {
  newInvoiceNotice: string;
  onScreenNotice: string;
  paymentReminders: string;
  reminder1: string;
  reminder2: string;
  reminder3: string;
};

type ConfigurationTemplatesState = {
  billing: BillingTemplateSettings;
  notifications: NotificationTemplateSettings;
};

const CONFIGURATION_TEMPLATES_STORAGE_KEY = 'brandup_configuration_templates';

function createDefaultState(): ConfigurationTemplatesState {
  return {
    billing: {
      templateId: '',
      templateName: '',
      billingType: 'Prepago (Adelantado)',
      paymentDay: '01',
      createInvoiceOffset: '5 Dias antes',
      taxMode: 'Impuestos incluido',
      graceDays: '0 Dias',
      cutoffPolicy: '1 Mes vencido',
      applyLateFee: false,
      applyReconnection: false,
      reactivateWithPartialPayment: false,
      tax1: '0',
      tax2: '0',
      tax3: '0',
    },
    notifications: {
      newInvoiceNotice: 'Desactivado',
      onScreenNotice: 'Desactivado',
      paymentReminders: 'Desactivado',
      reminder1: 'Desactivado',
      reminder2: 'Desactivado',
      reminder3: 'Desactivado',
    },
  };
}

function loadStoredState() {
  const fallback = createDefaultState();

  try {
    const rawValue = localStorage.getItem(CONFIGURATION_TEMPLATES_STORAGE_KEY);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue) as Partial<ConfigurationTemplatesState>;

    return {
      billing: {
        ...fallback.billing,
        ...parsed.billing,
      },
      notifications: {
        ...fallback.notifications,
        ...parsed.notifications,
      },
    };
  } catch {
    return fallback;
  }
}

function HeaderPanel({
  title,
  icon: Icon,
}: {
  title: string;
  icon: typeof FileText;
}) {
  return (
    <div className="flex items-center border-b border-[#d8e0ea] px-4 py-4">
      <Icon className="mr-2 h-5 w-5 text-[#425466]" />
      <h2 className="text-[18px] font-semibold text-[#425466]">{title}</h2>
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  helper?: string;
}) {
  return (
    <div className="grid gap-x-6 gap-y-2 xl:grid-cols-[220px_minmax(0,1fr)]">
      <label className="pt-3 text-right text-[15px] text-[#374151]">{label}</label>
      <div>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[46px] w-full rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        {helper ? <p className="mt-2 text-[13px] text-[#ff9b26]">{helper}</p> : null}
      </div>
    </div>
  );
}

function InputRow({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <div className="grid gap-x-6 gap-y-2 xl:grid-cols-[220px_minmax(0,1fr)]">
      <label className="pt-3 text-right text-[15px] text-[#374151]">{label}</label>
      <div>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[46px] w-full rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none"
        />
        {helper ? <p className="mt-2 text-[13px] text-[#9a8a6d]">{helper}</p> : null}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  helper,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: string;
}) {
  return (
    <div className="grid gap-x-6 gap-y-2 xl:grid-cols-[220px_minmax(0,1fr)]">
      <label className="pt-3 text-right text-[15px] text-[#374151]">{label}</label>
      <div>
        <label className="inline-flex cursor-pointer items-center">
          <span className={`relative inline-flex h-[34px] w-[70px] rounded-full transition ${checked ? 'bg-[#2f96f3]' : 'bg-[#cfcfcf]'}`}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => onChange(event.target.checked)}
              className="sr-only"
            />
            <span
              className={`absolute top-[3px] h-[28px] w-[28px] rounded-full bg-white shadow transition ${
                checked ? 'left-[39px]' : 'left-[3px]'
              }`}
            />
          </span>
        </label>
        {helper ? <p className="mt-2 text-[13px] text-[#ff9b26]">{helper}</p> : null}
      </div>
    </div>
  );
}

export default function ConfigurationTemplates() {
  const [state, setState] = useState<ConfigurationTemplatesState>(() => loadStoredState());

  const templateOptions = useMemo(
    () => ['Seleccionar plantilla', 'Plantilla Prepago', 'Plantilla Postpago', 'Plantilla Residencial'],
    [],
  );

  function updateBillingField<K extends keyof BillingTemplateSettings>(field: K, value: BillingTemplateSettings[K]) {
    setState((current) => ({
      ...current,
      billing: {
        ...current.billing,
        [field]: value,
      },
    }));
  }

  function updateNotificationField<K extends keyof NotificationTemplateSettings>(
    field: K,
    value: NotificationTemplateSettings[K],
  ) {
    setState((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: value,
      },
    }));
  }

  function persist(successMessage: string) {
    localStorage.setItem(CONFIGURATION_TEMPLATES_STORAGE_KEY, JSON.stringify(state));
    toast.success(successMessage);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-8 pt-[18px]">
      <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
        <div className="bg-[#20262a] px-6 py-5">
          <h1 className="text-[18px] font-semibold text-white">Plantillas de configuracion</h1>
        </div>

        <div className="space-y-6 px-5 py-5">
          <div className="rounded-[6px] bg-[#eef3f8] px-6 py-4 text-center text-[18px] text-[#64748b]">
            Plantillas de configuracion predeterminada al registrar un nuevo cliente.
          </div>

          <div className="grid gap-4 xl:grid-cols-[280px_1fr_220px_240px] xl:items-start">
            <label className="pt-3 text-right text-[15px] text-[#374151]">Seleccionar Plantilla</label>
            <select
              value={state.billing.templateId || templateOptions[0]}
              onChange={(event) => updateBillingField('templateId', event.target.value)}
              className="h-[46px] w-full rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none"
            >
              {templateOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <label className="pt-3 text-right text-[15px] text-[#374151]">Nombre Plantilla</label>
            <input
              type="text"
              value={state.billing.templateName}
              onChange={(event) => updateBillingField('templateName', event.target.value)}
              className="h-[46px] w-full rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.98fr]">
            <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white">
              <HeaderPanel title="Facturacion" icon={FileText} />

              <div className="space-y-4 px-5 py-5">
                <SelectRow
                  label="Tipo"
                  value={state.billing.billingType}
                  onChange={(value) => updateBillingField('billingType', value)}
                  options={['Prepago (Adelantado)', 'Postpago', 'Mixto']}
                />
                <SelectRow
                  label="Dia pago"
                  value={state.billing.paymentDay}
                  onChange={(value) => updateBillingField('paymentDay', value)}
                  options={['01', '05', '10', '15', '20', '25', '30']}
                />
                <SelectRow
                  label="Crear factura"
                  value={state.billing.createInvoiceOffset}
                  onChange={(value) => updateBillingField('createInvoiceOffset', value)}
                  options={['5 Dias antes', '3 Dias antes', '1 Dia antes', 'Mismo dia']}
                />
                <SelectRow
                  label="Tipo impuesto"
                  value={state.billing.taxMode}
                  onChange={(value) => updateBillingField('taxMode', value)}
                  options={['Impuestos incluido', 'Impuestos aparte', 'Sin impuesto']}
                />
                <SelectRow
                  label="Dias de gracia"
                  value={state.billing.graceDays}
                  onChange={(value) => updateBillingField('graceDays', value)}
                  options={['0 Dias', '3 Dias', '5 Dias', '10 Dias']}
                  helper="* Dias de tolerancia para aplicar corte"
                />
                <SelectRow
                  label="Aplicar corte"
                  value={state.billing.cutoffPolicy}
                  onChange={(value) => updateBillingField('cutoffPolicy', value)}
                  options={['1 Mes vencido', '15 Dias vencido', '30 Dias vencido', 'Sin corte']}
                />
                <ToggleRow
                  label="Aplicar Mora"
                  checked={state.billing.applyLateFee}
                  onChange={(checked) => updateBillingField('applyLateFee', checked)}
                />
                <ToggleRow
                  label="Aplicar Reconexion"
                  checked={state.billing.applyReconnection}
                  onChange={(checked) => updateBillingField('applyReconnection', checked)}
                />
                <ToggleRow
                  label="Reactivar con pago parcial"
                  checked={state.billing.reactivateWithPartialPayment}
                  onChange={(checked) => updateBillingField('reactivateWithPartialPayment', checked)}
                  helper="* Desactivado por defecto. Solo reactivara cuando la factura quede saldada."
                />

                <div className="pt-4 text-center">
                  <h3 className="text-[22px] font-semibold text-[#1f2933]">Otros Impuestos</h3>
                  <p className="mt-2 text-[15px] text-[#5b6470]">
                    Estos Impuestos seran Agregados al total de la factura
                  </p>
                </div>

                <InputRow
                  label="Impuesto #1 (%)"
                  value={state.billing.tax1}
                  onChange={(value) => updateBillingField('tax1', value)}
                  helper="* Dejar en 0 (cero) para quedar deshabilitado"
                />
                <InputRow
                  label="Impuesto #2 (%)"
                  value={state.billing.tax2}
                  onChange={(value) => updateBillingField('tax2', value)}
                  helper="* Dejar en 0 (cero) para quedar deshabilitado"
                />
                <InputRow
                  label="Impuesto #3 (%)"
                  value={state.billing.tax3}
                  onChange={(value) => updateBillingField('tax3', value)}
                  helper="* Dejar en 0 (cero) para quedar deshabilitado"
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white">
              <HeaderPanel title="Notificaciones" icon={Bell} />

              <div className="space-y-4 px-5 py-5">
                <SelectRow
                  label="Aviso nueva factura"
                  value={state.notifications.newInvoiceNotice}
                  onChange={(value) => updateNotificationField('newInvoiceNotice', value)}
                  options={['Desactivado', 'Correo', 'SMS', 'Telegram']}
                />
                <SelectRow
                  label="Aviso en Pantalla"
                  value={state.notifications.onScreenNotice}
                  onChange={(value) => updateNotificationField('onScreenNotice', value)}
                  options={['Desactivado', 'Activado']}
                />
                <SelectRow
                  label="Recordatorios de pago"
                  value={state.notifications.paymentReminders}
                  onChange={(value) => updateNotificationField('paymentReminders', value)}
                  options={['Desactivado', 'Activado']}
                />
                <SelectRow
                  label="Recordatorio #1"
                  value={state.notifications.reminder1}
                  onChange={(value) => updateNotificationField('reminder1', value)}
                  options={['Desactivado', '3 Dias antes', '1 Dia antes', 'Mismo dia']}
                />
                <SelectRow
                  label="Recordatorio #2"
                  value={state.notifications.reminder2}
                  onChange={(value) => updateNotificationField('reminder2', value)}
                  options={['Desactivado', '1 Dia despues', '3 Dias despues', '5 Dias despues']}
                />
                <SelectRow
                  label="Recordatorio #3"
                  value={state.notifications.reminder3}
                  onChange={(value) => updateNotificationField('reminder3', value)}
                  options={['Desactivado', '7 Dias despues', '10 Dias despues', '15 Dias despues']}
                />

                <div className="flex flex-wrap gap-4 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => persist('Cambios de la plantilla guardados.')}
                    className="h-[48px] rounded-full border-[#3399f4] px-6 text-[16px] font-medium text-[#1788eb] hover:bg-[#eff7ff]"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => persist('Nueva plantilla guardada.')}
                    className="h-[48px] rounded-full border-[#3399f4] px-6 text-[16px] font-medium text-[#1788eb] hover:bg-[#eff7ff]"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Nueva plantilla
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
