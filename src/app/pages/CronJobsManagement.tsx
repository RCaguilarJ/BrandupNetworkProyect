import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Play, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { usePersistentState } from '../hooks/usePersistentState';

type NotificationSchedule = {
  reminderOne: string;
  reminderTwo: string;
  reminderThree: string;
  screenAlert: string;
};

type BillingSchedule = {
  applyCutoff: string;
  createInvoices: string;
  backup: string;
  timezone: string;
  targetDate: string;
};

const STORAGE_KEY = 'brandup_crontab_settings';

const timeOptions = [
  '12:00 AM',
  '1:00 AM',
  '2:00 AM',
  '3:00 AM',
  '4:00 AM',
  '5:00 AM',
  '6:00 AM',
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
  '11:00 PM',
];

const timezoneOptions = [
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Guayaquil',
  'America/Santiago',
];

const defaultNotifications: NotificationSchedule = {
  reminderOne: '9:00 AM',
  reminderTwo: '10:00 AM',
  reminderThree: '11:00 AM',
  screenAlert: '8:00 AM',
};

const defaultBilling: BillingSchedule = {
  applyCutoff: '7:00 AM',
  createInvoices: '6:00 AM',
  backup: '2:00 AM',
  timezone: 'America/Mexico_City',
  targetDate: '2026-04-05',
};

function readStoredConfig() {
  if (typeof window === 'undefined') {
    return {
      notifications: defaultNotifications,
      billing: defaultBilling,
    };
  }

  const rawNotifications = window.localStorage.getItem(`${STORAGE_KEY}:notifications`);
  const rawBilling = window.localStorage.getItem(`${STORAGE_KEY}:billing`);

  if (!rawNotifications && !rawBilling) {
    return {
      notifications: defaultNotifications,
      billing: defaultBilling,
    };
  }

  try {
    const parsedNotifications = rawNotifications
      ? (JSON.parse(rawNotifications) as Partial<NotificationSchedule>)
      : {};
    const parsedBilling = rawBilling
      ? (JSON.parse(rawBilling) as Partial<BillingSchedule>)
      : {};

    return {
      notifications: { ...defaultNotifications, ...parsedNotifications },
      billing: { ...defaultBilling, ...parsedBilling },
    };
  } catch {
    return {
      notifications: defaultNotifications,
      billing: defaultBilling,
    };
  }
}

function formatDateTimeInTimezone(timezone: string) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(new Date()).replace(' ', ' ');
}

function TimeSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex h-[50px] overflow-hidden rounded-[4px] border border-[#d7dee8] bg-white">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none border-0 bg-transparent px-5 text-[17px] text-[#243746] outline-none"
      >
        {timeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="flex w-[58px] shrink-0 items-center justify-center border-l border-[#c9d1da] bg-[#dce2e8] text-[#23384f]">
        <Clock3 className="h-6 w-6" strokeWidth={1.9} />
      </div>
    </div>
  );
}

function FieldRow({
  label,
  children,
  tall = false,
}: {
  label: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div className={`grid border-b border-[#d7dee8] md:grid-cols-[58%_42%] ${tall ? 'min-h-[116px]' : 'min-h-[98px]'}`}>
      <div className="flex items-center px-6 py-5 text-[20px] font-normal text-[#334e68]">{label}</div>
      <div className="flex items-center px-5 py-5">{children}</div>
    </div>
  );
}

function CrontabPanel({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[3px] border border-[#d7dee8] bg-white shadow-sm">
      <div className="bg-[#1f242a] px-6 py-5">
        <h2 className="text-[20px] font-semibold text-white">{title}</h2>
      </div>

      <div>{children}</div>

      {footer ? <div className="flex justify-end px-6 py-4">{footer}</div> : null}
    </section>
  );
}

export default function CronJobsManagement() {
  const storedConfig = useMemo(() => readStoredConfig(), []);
  const [notifications, setNotifications] = usePersistentState<NotificationSchedule>(
    `${STORAGE_KEY}:notifications`,
    storedConfig.notifications,
  );
  const [billing, setBilling] = usePersistentState<BillingSchedule>(
    `${STORAGE_KEY}:billing`,
    storedConfig.billing,
  );
  const [clockTick, setClockTick] = useState(0);
  const localTime = formatDateTimeInTimezone(billing.timezone);
  void clockTick;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockTick((currentTick) => currentTick + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  function updateNotification<K extends keyof NotificationSchedule>(key: K, value: NotificationSchedule[K]) {
    setNotifications((current) => ({ ...current, [key]: value }));
  }

  function updateBilling<K extends keyof BillingSchedule>(key: K, value: BillingSchedule[K]) {
    setBilling((current) => ({ ...current, [key]: value }));
  }

  function handleSave(scope: 'notifications' | 'billing') {
    toast.success(
      scope === 'notifications'
        ? 'Configuracion de notificaciones guardada'
        : 'Configuracion de facturacion y corte guardada',
    );
  }

  function handleCreateDate() {
    toast.success(`Fecha ${billing.targetDate} preparada para ejecucion manual`);
  }

  function handleVerifyDate() {
    toast.info(`Verificacion manual lista para ${billing.targetDate}`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[26px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[24px] font-normal leading-none text-[#1f2933]">Crontab</h1>

        <SettingsBreadcrumb currentLabel="Crontab" />
      </div>

      <div className="grid gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CrontabPanel
          title="Notificaciones"
          footer={
            <button
              type="button"
              onClick={() => handleSave('notifications')}
              className="inline-flex items-center gap-2 rounded-full border border-[#1e88e5] px-6 py-3 text-[16px] font-semibold text-[#1e88e5] transition hover:bg-[#eaf4ff]"
            >
              <Save className="h-4 w-4" />
              Guardar cambios
            </button>
          }
        >
          <FieldRow label="Recordatorio de pago #1">
            <TimeSelect
              value={notifications.reminderOne}
              onChange={(value) => updateNotification('reminderOne', value)}
              ariaLabel="Hora recordatorio de pago uno"
            />
          </FieldRow>

          <FieldRow label="Recordatorio de pago #2">
            <TimeSelect
              value={notifications.reminderTwo}
              onChange={(value) => updateNotification('reminderTwo', value)}
              ariaLabel="Hora recordatorio de pago dos"
            />
          </FieldRow>

          <FieldRow label="Recordatorio de pago #3">
            <TimeSelect
              value={notifications.reminderThree}
              onChange={(value) => updateNotification('reminderThree', value)}
              ariaLabel="Hora recordatorio de pago tres"
            />
          </FieldRow>

          <FieldRow label="Aviso en pantalla">
            <TimeSelect
              value={notifications.screenAlert}
              onChange={(value) => updateNotification('screenAlert', value)}
              ariaLabel="Hora aviso en pantalla"
            />
          </FieldRow>
        </CrontabPanel>

        <CrontabPanel
          title="Facturacion & Corte"
          footer={
            <button
              type="button"
              onClick={() => handleSave('billing')}
              className="inline-flex items-center gap-2 rounded-full border border-[#1e88e5] px-6 py-3 text-[16px] font-semibold text-[#1e88e5] transition hover:bg-[#eaf4ff]"
            >
              <Save className="h-4 w-4" />
              Guardar cambios
            </button>
          }
        >
          <FieldRow label="Aplicar corte">
            <TimeSelect
              value={billing.applyCutoff}
              onChange={(value) => updateBilling('applyCutoff', value)}
              ariaLabel="Hora aplicar corte"
            />
          </FieldRow>

          <FieldRow label="Crear Facturas/Aplicar mora">
            <TimeSelect
              value={billing.createInvoices}
              onChange={(value) => updateBilling('createInvoices', value)}
              ariaLabel="Hora crear facturas o aplicar mora"
            />
          </FieldRow>

          <FieldRow label="Generar / Verificar por fecha" tall>
            <div className="w-full space-y-4">
              <div className="flex h-[50px] overflow-hidden rounded-[4px] border border-[#d7dee8] bg-white">
                <input
                  type="date"
                  value={billing.targetDate}
                  onChange={(event) => updateBilling('targetDate', event.target.value)}
                  className="w-full border-0 bg-transparent px-5 text-[17px] text-[#243746] outline-none"
                  aria-label="Fecha para generar o verificar"
                />

                <div className="flex w-[58px] shrink-0 items-center justify-center border-l border-[#c9d1da] bg-[#dce2e8] text-[#23384f]">
                  <CalendarDays className="h-6 w-6" strokeWidth={1.9} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCreateDate}
                  className="inline-flex h-[42px] items-center gap-2 rounded-[4px] bg-[#54bad7] px-4 text-[16px] font-semibold text-white transition hover:bg-[#3aa4c5]"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Crear fecha
                </button>

                <button
                  type="button"
                  onClick={handleVerifyDate}
                  className="inline-flex h-[42px] items-center gap-2 rounded-[4px] border border-[#cfd7e2] bg-white px-4 text-[16px] font-medium text-[#1f2933] transition hover:bg-[#f8fafc]"
                >
                  <Search className="h-5 w-5" />
                  Verificar
                </button>
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Backup">
            <TimeSelect
              value={billing.backup}
              onChange={(value) => updateBilling('backup', value)}
              ariaLabel="Hora backup"
            />
          </FieldRow>

          <FieldRow label="Zona horaria">
            <div className="flex h-[50px] w-full overflow-hidden rounded-[4px] border border-[#d7dee8] bg-white">
              <select
                value={billing.timezone}
                onChange={(event) => updateBilling('timezone', event.target.value)}
                className="w-full appearance-none border-0 bg-transparent px-5 text-[17px] text-[#243746] outline-none"
                aria-label="Zona horaria"
              >
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex w-[58px] shrink-0 items-center justify-center border-l border-[#c9d1da] bg-[#dce2e8] text-[#23384f]">
                <Clock3 className="h-6 w-6" strokeWidth={1.9} />
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Hora local actual">
            <input
              type="text"
              value={localTime}
              readOnly
              className="h-[50px] w-full rounded-[4px] border border-[#d7dee8] bg-white px-5 text-[17px] text-[#243746] outline-none"
              aria-label="Hora local actual"
            />
          </FieldRow>
        </CrontabPanel>
      </div>
    </div>
  );
}
