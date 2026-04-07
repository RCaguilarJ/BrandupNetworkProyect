import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  List,
  Mail,
  MapPin,
  Monitor,
  NotebookText,
  Plus,
  Receipt,
  Router,
  Search,
  Settings2,
  Smartphone,
  Ticket,
  Trash2,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import type { JSX } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  sanitizeDecimalValue,
  sanitizeLettersValue,
  sanitizeNumericValue,
} from '../lib/input-sanitizers';
import {
  appendClientLog,
  createEmptyClientWorkspace,
  ensureClientRegistration,
  getClientWorkspace,
  updateClientStatus,
  type ClientBillingSettings,
  type ClientNotificationSettings,
  type ClientServiceSetup,
  type ClientWorkspaceData,
} from '../lib/client-workspace';

type WizardStepId = 'personal' | 'billing' | 'services';
type ClientMainTab =
  | 'summary'
  | 'services'
  | 'billing'
  | 'tickets'
  | 'emails'
  | 'documents'
  | 'statistics'
  | 'log';
type BillingDetailTab = 'invoices' | 'config' | 'transactions' | 'balances';

interface WizardStep {
  id: WizardStepId;
  number: number;
  title: string;
  subtitle: string;
}

interface EmptyTableCardProps {
  title: string;
  columns: string[];
  actionLabel?: string;
  searchPlaceholder?: string;
}

interface TimelineCardProps {
  colorClassName: string;
  title: string;
  detail: string;
}

const wizardSteps: WizardStep[] = [
  { id: 'personal', number: 1, title: 'Datos personales', subtitle: 'Nombre, direccion, telefonos' },
  { id: 'billing', number: 2, title: 'Facturacion y Notificaciones', subtitle: 'Dia de pago, Corte, aviso' },
  { id: 'services', number: 3, title: 'Servicios', subtitle: 'Queues, PPPoE, Hotspot, etc.' },
];

const locationOptions = ['Seleccionar Ubicacion', 'Centro', 'Lomas', 'Norte', 'Sur', 'Cumbres'];
const routerOptions = ['Seleccionar Router', 'Router Principal', 'Torre Norte', 'Torre Centro', 'Torre Sur'];
const billingTemplateOptions = ['Seleccionar plantilla', 'Plantilla estandar', 'Plantilla prepago', 'Plantilla corporativa'];
const billingTypeOptions = ['Prepago (Adelantado)', 'Pospago'];
const paymentDayOptions = ['01', '05', '10', '15', '20', '25'];
const createInvoiceOptions = ['5 Dias antes', '3 Dias antes', '1 Dia antes', 'El mismo dia'];
const taxTypeOptions = ['Impuestos incluido', 'Impuestos separado'];
const graceDayOptions = ['0 Dias', '3 Dias', '5 Dias', '10 Dias'];
const cutoffOptions = ['1 Mes vencido', 'Corte inmediato', 'Con 5 dias de gracia'];
const slowdownOptions = ['Desactivado', 'Activado'];
const notificationToggleOptions = ['Desactivado', 'Correo', 'SMS'];
const reminderOptions = ['2 Dias Antes', '1 Dia Antes', 'El mismo dia', 'Desactivado'];
const statisticsDateRange = ['22/03/2026', '06/04/2026'] as const;

function pageInputClassName(extraClassName = '') {
  return `h-[40px] w-full rounded-[4px] border border-[#cfd7e2] bg-white px-3 text-[14px] leading-[1.4] text-[#333333] outline-none placeholder:text-[#b7c2cf] ${extraClassName}`;
}

function pageSelectClassName(extraClassName = '') {
  return `${pageInputClassName(extraClassName)} appearance-none pr-8`;
}

function pageFormRowClassName(
  size: 'wide' | 'medium' | 'compact' = 'wide',
  align: 'center' | 'start' = 'center',
) {
  const sizeClassName =
    size === 'wide'
      ? 'md:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]'
      : size === 'medium'
        ? 'md:grid-cols-[170px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)]'
        : 'md:grid-cols-[155px_minmax(0,1fr)] lg:grid-cols-[175px_minmax(0,1fr)]';

  return `grid gap-3 sm:gap-4 lg:gap-5 ${sizeClassName} ${
    align === 'start' ? 'md:items-start' : 'md:items-center'
  }`;
}

function pageFormLabelClassName(extraClassName = '') {
  return `text-left md:text-right leading-[1.5] ${extraClassName}`;
}

function controlA11yProps(label: string) {
  return {
    'aria-label': label,
    title: label,
  } as const;
}

function sanitizeDateLikeValue(value: string) {
  return value.replace(/[^0-9/\-:\s]/g, '');
}

function deriveInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'CA'
  );
}

function readNumericPrefix(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getNextPaymentDate(paymentDay: string) {
  const now = new Date();
  const day = Math.max(1, Math.min(28, Number(paymentDay) || 1));
  const nextDate = new Date(now.getFullYear(), now.getMonth(), day, 4, 30, 0);

  if (nextDate < now) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getNotificationTimeline(billing: ClientBillingSettings, notifications: ClientNotificationSettings) {
  const paymentDate = getNextPaymentDate(billing.paymentDay);
  const invoiceDate = addDays(paymentDate, -readNumericPrefix(billing.createInvoice));
  const cutoffDate = addDays(paymentDate, readNumericPrefix(billing.graceDays));
  const reminderOneDate = addDays(paymentDate, -readNumericPrefix(notifications.reminderOne));

  return { paymentDate, invoiceDate, cutoffDate, reminderOneDate };
}

function EmptyTableCard({
  title,
  columns,
  actionLabel,
  searchPlaceholder = 'Buscar...',
}: EmptyTableCardProps) {
  return (
    <section className="rounded border border-[#d7e0ea] bg-white">
      <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">{title}</header>
      <div className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              {...controlA11yProps('Cantidad de registros')}
            >
              <option>15</option>
            </select>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#30465f]"
              {...controlA11yProps('Vista de lista')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#30465f]"
              {...controlA11yProps('Capturar imagen')}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            {actionLabel ? (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-2 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] font-semibold text-[#24364b]"
                {...controlA11yProps(actionLabel)}
              >
                <Plus className="h-3.5 w-3.5" />
                {actionLabel}
              </button>
            ) : null}
          </div>

          <div className="relative w-full sm:w-[230px]">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded border border-[#d7e0ea] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
              {...controlA11yProps(searchPlaceholder)}
            />
            <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a0aebe]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px] text-[#24364b]">
            <thead>
              <tr className="bg-white">
                {columns.map((column) => (
                  <th key={column} className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="border border-[#d7e0ea] px-4 py-8 text-center text-[13px] text-[#7d8da1]">
                  Ningun registro disponible
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#6e8197] sm:flex-row sm:items-center sm:justify-between">
          <span>Mostrando 0 registros</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              {...controlA11yProps('Pagina anterior')}
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              {...controlA11yProps('Pagina siguiente')}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ colorClassName, title, detail }: TimelineCardProps) {
  return (
    <div className={`rounded px-4 py-3 text-[12px] text-white ${colorClassName}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-white/90">{detail}</div>
    </div>
  );
}

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const initialDraft = useMemo(() => {
    if (isEditing && id) {
      return getClientWorkspace(id);
    }

    return createEmptyClientWorkspace(user?.companyId ?? 'comp1');
  }, [id, isEditing, user?.companyId]);

  const [draft, setDraft] = useState<ClientWorkspaceData | null>(initialDraft);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ClientMainTab>('summary');
  const [activeBillingTab, setActiveBillingTab] = useState<BillingDetailTab>('config');
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showPortalPassword, setShowPortalPassword] = useState(false);

  useEffect(() => {
    if (isEditing && id && !initialDraft) {
      toast.error('No se encontro el cliente solicitado');
      navigate('/clients', { replace: true });
    }
  }, [id, initialDraft, isEditing, navigate]);

  const schedule = useMemo(() => {
    if (!draft) {
      return null;
    }

    return getNotificationTimeline(draft.billing, draft.notifications);
  }, [draft]);

  function updatePersonalField<Field extends keyof ClientWorkspaceData['personal']>(
    field: Field,
    value: ClientWorkspaceData['personal'][Field],
  ) {
    const nextValue =
      typeof value === 'string' && field === 'fullName'
        ? sanitizeLettersValue(value)
        : value;

    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            personal: {
              ...currentDraft.personal,
              [field]: nextValue,
            },
          }
        : currentDraft,
    );
  }

  function updatePersonalNumericField(
    field: 'clientCode' | 'identification' | 'landlinePhone' | 'mobilePhone',
    value: string,
  ) {
    updatePersonalField(field, sanitizeNumericValue(value));
  }

  function updateBillingField<Field extends keyof ClientBillingSettings>(
    field: Field,
    value: ClientBillingSettings[Field],
  ) {
    const nextValue =
      typeof value === 'string' &&
      (field === 'fixedDate' || field === 'fixedCutoffDate')
        ? sanitizeDateLikeValue(value)
        : value;

    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            billing: {
              ...currentDraft.billing,
              [field]: nextValue,
            },
          }
        : currentDraft,
    );
  }

  function updateNotificationField<Field extends keyof ClientNotificationSettings>(
    field: Field,
    value: ClientNotificationSettings[Field],
  ) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            notifications: {
              ...currentDraft.notifications,
              [field]: value,
            },
          }
        : currentDraft,
    );
  }

  function updateServiceField<Field extends keyof ClientServiceSetup>(
    field: Field,
    value: ClientServiceSetup[Field],
  ) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            services: {
              ...currentDraft.services,
              [field]: value,
            },
          }
        : currentDraft,
    );
  }

  function getStepValidationErrors(
    stepId: WizardStepId,
    currentDraft: ClientWorkspaceData,
  ) {
    if (stepId === 'personal') {
      const missingFields: string[] = [];

      if (!currentDraft.personal.identification.trim()) {
        missingFields.push('N° Identificación');
      }
      if (!currentDraft.personal.fullName.trim()) {
        missingFields.push('Nombre Completo');
      }
      if (!currentDraft.personal.primaryAddress.trim()) {
        missingFields.push('Dirección principal');
      }
      if (!currentDraft.personal.location.trim()) {
        missingFields.push('Ubicación');
      }
      if (!currentDraft.personal.landlinePhone.trim()) {
        missingFields.push('Teléfono fijo');
      }
      if (!currentDraft.personal.mobilePhone.trim()) {
        missingFields.push('Teléfono móvil');
      }
      if (!currentDraft.personal.email.trim()) {
        missingFields.push('E-mail');
      }

      return missingFields;
    }

    if (stepId === 'billing') {
      const missingFields: string[] = [];

      if (!currentDraft.billing.type.trim()) {
        missingFields.push('Tipo de facturación');
      }
      if (!currentDraft.billing.paymentDay.trim()) {
        missingFields.push('Día de pago');
      }
      if (!currentDraft.billing.createInvoice.trim()) {
        missingFields.push('Crear factura');
      }
      if (!currentDraft.billing.taxType.trim()) {
        missingFields.push('Tipo impuesto');
      }
      if (!currentDraft.billing.graceDays.trim()) {
        missingFields.push('Días de gracia');
      }
      if (!currentDraft.billing.applyCutoff.trim()) {
        missingFields.push('Aplicar corte');
      }
      if (!currentDraft.notifications.newInvoiceNotice.trim()) {
        missingFields.push('Aviso nueva factura');
      }
      if (!currentDraft.notifications.screenNotice.trim()) {
        missingFields.push('Aviso en pantalla');
      }
      if (!currentDraft.notifications.remindersChannel.trim()) {
        missingFields.push('Recordatorios de pago');
      }

      return missingFields;
    }

    if (stepId === 'services') {
      const missingFields: string[] = [];

      if (!currentDraft.services.router.trim()) {
        missingFields.push('Router');
      }

      return missingFields;
    }

    return [];
  }

  function showStepValidationError(stepId: WizardStepId, errors: string[]) {
    if (errors.length === 0) {
      return;
    }

    const stepTitle = wizardSteps.find((step) => step.id === stepId)?.title ?? 'la etapa actual';
    toast.error(`Completa los campos obligatorios de ${stepTitle}: ${errors.join(', ')}`);
  }

  function validateStep(stepId: WizardStepId, currentDraft: ClientWorkspaceData) {
    const errors = getStepValidationErrors(stepId, currentDraft);

    if (errors.length > 0) {
      showStepValidationError(stepId, errors);
      return false;
    }

    return true;
  }

  function handleStepChange(nextStepIndex: number) {
    if (!draft) {
      return;
    }

    if (nextStepIndex <= activeStepIndex) {
      setActiveStepIndex(nextStepIndex);
      return;
    }

    for (let index = 0; index < nextStepIndex; index += 1) {
      const step = wizardSteps[index];
      if (!validateStep(step.id, draft)) {
        setActiveStepIndex(index);
        return;
      }
    }

    setActiveStepIndex(nextStepIndex);
  }

  function handleGoNext() {
    if (!draft) {
      return;
    }

    const currentStep = wizardSteps[activeStepIndex];
    if (!validateStep(currentStep.id, draft)) {
      return;
    }

    setActiveStepIndex((currentStepIndex) =>
      Math.min(currentStepIndex + 1, wizardSteps.length - 1),
    );
  }

  function handleRegisterClient() {
    if (!draft) {
      return;
    }

    for (let index = 0; index < wizardSteps.length; index += 1) {
      const step = wizardSteps[index];
      if (!validateStep(step.id, draft)) {
        setActiveStepIndex(index);
        return;
      }
    }

    const registeredClient = ensureClientRegistration(
      draft,
      user?.name ?? 'admin',
    );
    setDraft(registeredClient);
    toast.success('Cliente registrado correctamente');
    navigate(`/clients/${registeredClient.id}/edit`, {
      replace: true,
    });
  }

  function handleSavePersonalChanges() {
    if (!draft) {
      return;
    }

    const nextRecord = appendClientLog(
      draft,
      `Datos del cliente actualizados para ${draft.personal.fullName}`,
      user?.name ?? 'admin',
    );
    setDraft(nextRecord);
    toast.success('Datos guardados');
  }

  function handleSaveBillingChanges() {
    if (!draft) {
      return;
    }

    const nextRecord = appendClientLog(
      draft,
      `Configuracion de facturacion actualizada para ${draft.personal.fullName}`,
      user?.name ?? 'admin',
    );
    setDraft(nextRecord);
    toast.success('Configuracion guardada');
  }

  function handleToolStatusChange(
    status: ClientWorkspaceData['status'],
  ) {
    if (!draft) {
      return;
    }

    const nextRecord = updateClientStatus(
      draft,
      status,
      user?.name ?? 'admin',
    );
    setDraft(nextRecord);
    toast.success(`Cliente ${status.toLowerCase()}`);
    setShowToolsMenu(false);
  }

  if (!draft) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#d9e7f3] text-sm font-medium text-[#47617c]">
        Cargando cliente...
      </div>
    );
  }

  const initials = deriveInitials(draft.personal.fullName);
  const breadcrumbAction = isEditing ? 'Editar usuario' : 'Nuevo cliente';
  const scheduleCards = schedule
    ? [
        {
          colorClassName: 'bg-[#3395ea]',
          title: formatDate(schedule.paymentDate),
          detail: 'Dia de Pago',
        },
        {
          colorClassName: 'bg-[#f5a623]',
          title: formatDateTime(schedule.invoiceDate),
          detail: 'Crear & Enviar Factura',
        },
        {
          colorClassName: 'bg-[#1db2a3]',
          title: draft.notifications.screenNotice,
          detail: 'Aviso en pantalla',
        },
        {
          colorClassName: 'bg-[#6b4fc0]',
          title:
            draft.notifications.remindersChannel === 'SMS'
              ? formatDateTime(schedule.reminderOneDate)
              : 'Desactivado',
          detail: 'Aviso SMS',
        },
        {
          colorClassName: 'bg-[#e45656]',
          title: formatDateTime(schedule.cutoffDate),
          detail: 'Proximo Corte de Servicios',
        },
        {
          colorClassName: 'bg-[#2f73b9]',
          title: '$0.00',
          detail: 'Deuda Actual',
        },
        {
          colorClassName: 'bg-[#c44ea4]',
          title: '$0.00',
          detail: 'Saldos',
        },
      ]
    : [];

  const mainTabs: Array<{
    id: ClientMainTab;
    label: string;
    icon: JSX.Element;
  }> = [
    {
      id: 'summary',
      label: 'Resumen',
      icon: <UserRound className="h-3.5 w-3.5" />,
    },
    {
      id: 'services',
      label: 'Servicios',
      icon: <Router className="h-3.5 w-3.5" />,
    },
    {
      id: 'billing',
      label: 'Facturacion',
      icon: <Receipt className="h-3.5 w-3.5" />,
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: <Ticket className="h-3.5 w-3.5" />,
    },
    {
      id: 'emails',
      label: 'Email & SMS',
      icon: <Mail className="h-3.5 w-3.5" />,
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    {
      id: 'statistics',
      label: 'Estadisticas',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
    },
    {
      id: 'log',
      label: 'Log',
      icon: <NotebookText className="h-3.5 w-3.5" />,
    },
  ];

  const billingTabs: Array<{
    id: BillingDetailTab;
    label: string;
  }> = [
    { id: 'invoices', label: 'Facturas' },
    { id: 'config', label: 'Configuracion' },
    { id: 'transactions', label: 'Transacciones' },
    { id: 'balances', label: 'Saldos' },
  ];

  const currentStep = wizardSteps[activeStepIndex];

  if (!isEditing) {
    return (
      <div className="min-h-full bg-[#d9e7f3] px-3 py-4 text-[#223448] sm:px-4 lg:px-6 lg:py-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#223448]">
              Nuevo Cliente
            </h1>
          </div>
          <div className="text-left text-[12px] text-[#58708b] md:text-right">
            Inicio <span className="px-1">/</span> Usuarios{' '}
            <span className="px-1">/</span>{' '}
            <span className="text-[#2f93e4]">Nuevo cliente</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-[3px] border border-[#d7e0ea] bg-white">
          <div className="grid grid-cols-1 border-b border-[#d7e0ea] md:grid-cols-3">
            {wizardSteps.map((step, stepIndex) => {
              const isActive = currentStep.id === step.id;
              const isComplete = activeStepIndex > stepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepChange(stepIndex)}
                  className={`flex min-h-[76px] items-start gap-3 px-5 py-4 text-left ${isActive ? 'bg-[#3395ea] text-white' : 'bg-white text-[#1d2d42]'}`}
                  {...controlA11yProps(step.title)}
                >
                  <span
                    className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${isActive ? 'bg-[#1f6cb3] text-white' : 'bg-[#dbe4ec] text-[#24364b]'}`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold leading-5">
                      {step.title}
                    </span>
                    <span
                      className={`block pt-0.5 text-[12px] leading-4 ${isActive ? 'text-white/80' : 'text-[#6f859c]'}`}
                    >
                      {step.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-5 text-[13px] text-[#333333] sm:px-6">
            {currentStep.id === 'personal' ? (
              <div className="mx-auto max-w-[1180px] space-y-5">
                <div className={pageFormRowClassName('wide', 'start')}>
                  <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#3c536d]')}>
                    ID cliente
                  </label>
                  <div>
                    <input
                      value={draft.personal.clientCode}
                      onChange={(event) =>
                        updatePersonalNumericField('clientCode', event.target.value)
                      }
                      placeholder="100"
                      inputMode="numeric"
                      className={pageInputClassName()}
                      {...controlA11yProps('ID cliente')}
                    />
                    <p className="mt-1.5 text-[12px] text-[#e08d42]">
                      Dejar en blanco para que sea automatico.
                    </p>
                  </div>
                </div>

                <div className={pageFormRowClassName('wide', 'start')}>
                  <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Contraseña Portal
                  </label>
                  <div>
                    <div className="relative">
                      <input
                        type={showPortalPassword ? 'text' : 'password'}
                        value={draft.personal.portalPassword}
                        onChange={(event) =>
                          updatePersonalField(
                            'portalPassword',
                            event.target.value,
                          )
                        }
                        placeholder="4243Tdp"
                        className={pageInputClassName('pr-10')}
                        {...controlA11yProps('Contrasena portal')}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPortalPassword((current) => !current)
                        }
                        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded p-1 text-[#7f92a7] transition hover:bg-[#eef3f8] hover:text-[#405468]"
                        aria-label={
                          showPortalPassword
                            ? 'Ocultar contrasena portal'
                            : 'Mostrar contrasena portal'
                        }
                        title={
                          showPortalPassword
                            ? 'Ocultar contrasena portal'
                            : 'Mostrar contrasena portal'
                        }
                      >
                        {showPortalPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[12px] text-[#e08d42]">
                      Dejar en blanco para que sea automatico.
                    </p>
                  </div>
                </div>

                <div className={pageFormRowClassName('wide', 'start')}>
                  <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#3c536d]')}>
                    N° Identificacion
                  </label>
                  <div>
                    <input
                      value={draft.personal.identification}
                      onChange={(event) =>
                        updatePersonalNumericField(
                          'identification',
                          event.target.value,
                        )
                      }
                      placeholder="223456634"
                      inputMode="numeric"
                      className={`${pageInputClassName()} max-w-[280px]`}
                      {...controlA11yProps('Numero de identificacion')}
                    />
                    <p className="mt-1.5 text-[12px] uppercase tracking-[0.02em] text-[#e08d42]">
                      Cedula, DNI, RUC, CUIT, NIT, SAT, RUT, RTN, etc.
                    </p>
                  </div>
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Nombre Completo <span className="text-[#e16b5f]">*</span>
                  </label>
                  <input
                    value={draft.personal.fullName}
                    onChange={(event) =>
                      updatePersonalField('fullName', event.target.value)
                    }
                    placeholder="Carlos Miguel Santana castro"
                    inputMode="text"
                    pattern="[A-Za-zÀ-ÿ\\s'-]+"
                    className={pageInputClassName()}
                    {...controlA11yProps('Nombre completo')}
                  />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Direccion principal
                  </label>
                    <input
                      value={draft.personal.primaryAddress}
                    onChange={(event) =>
                      updatePersonalField(
                        'primaryAddress',
                        event.target.value,
                      )
                    }
                      placeholder="Av. urios 4453"
                      className={pageInputClassName()}
                      {...controlA11yProps('Direccion principal')}
                    />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Ubicacion
                  </label>
                  <select
                    value={
                      draft.personal.location || locationOptions[0]
                    }
                    onChange={(event) =>
                      updatePersonalField(
                        'location',
                        event.target.value === locationOptions[0]
                          ? ''
                          : event.target.value,
                      )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Ubicacion')}
                  >
                    {locationOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Telefono fijo
                  </label>
                    <input
                      value={draft.personal.landlinePhone}
                    onChange={(event) =>
                      updatePersonalNumericField(
                        'landlinePhone',
                        event.target.value,
                      )
                    }
                      placeholder="564567"
                      inputMode="numeric"
                      className={pageInputClassName()}
                      {...controlA11yProps('Telefono fijo')}
                    />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Telefono Movil
                  </label>
                    <input
                      value={draft.personal.mobilePhone}
                    onChange={(event) =>
                      updatePersonalNumericField(
                        'mobilePhone',
                        event.target.value,
                      )
                    }
                      placeholder="9876526478"
                      inputMode="numeric"
                      className={pageInputClassName()}
                      {...controlA11yProps('Telefono movil')}
                    />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    E-mail
                  </label>
                    <input
                      value={draft.personal.email}
                    onChange={(event) =>
                      updatePersonalField('email', event.target.value)
                    }
                      placeholder="jorge@correo.com"
                      className={pageInputClassName()}
                      {...controlA11yProps('E-mail')}
                    />
                </div>
              </div>
            ) : null}

            {currentStep.id === 'billing' ? (
              <div className="mx-auto max-w-[1560px] space-y-4">
                <div className={`mx-auto w-full max-w-[620px] ${pageFormRowClassName('medium')}`}>
                  <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                    Cargar desde plantilla
                  </label>
                  <select
                    value={draft.billing.template || billingTemplateOptions[0]}
                    onChange={(event) =>
                      updateBillingField(
                        'template',
                        event.target.value === billingTemplateOptions[0]
                          ? ''
                          : event.target.value,
                      )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Cargar desde plantilla')}
                  >
                    {billingTemplateOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <section className="overflow-hidden rounded-[3px] border border-[#d7e0ea] bg-white">
                    <header className="flex items-center gap-2 border-b border-[#d7e0ea] bg-[#f5f7fa] px-[15px] py-[10px] text-[12px] font-semibold text-[#2a3d53]">
                      <Receipt className="h-3.5 w-3.5 text-[#51687f]" />
                      Facturación
                    </header>
                    <div className="space-y-4 p-[15px]">
                      {[
                        ['Tipo', 'type', billingTypeOptions],
                        ['Día pago', 'paymentDay', paymentDayOptions],
                        ['Crear Factura', 'createInvoice', createInvoiceOptions],
                        ['Tipo impuesto', 'taxType', taxTypeOptions],
                      ].map(([label, key, options], index) => (
                        <div key={`wizard-billing-${index}`} className={pageFormRowClassName('medium')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                            {label}
                          </label>
                          <select
                            value={draft.billing[key as keyof ClientBillingSettings] as string}
                            onChange={(event) =>
                              updateBillingField(
                                key as keyof ClientBillingSettings,
                                event.target.value as never,
                              )
                            }
                            className={pageSelectClassName()}
                            {...controlA11yProps(String(label))}
                          >
                            {(options as string[]).map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ))}

                      <div className={pageFormRowClassName('medium', 'start')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Días de gracia
                        </label>
                        <div>
                          <select
                            value={draft.billing.graceDays}
                            onChange={(event) =>
                              updateBillingField('graceDays', event.target.value)
                            }
                            className={pageSelectClassName()}
                            {...controlA11yProps('Dias de gracia')}
                          >
                            {graceDayOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-[#ee9747]">
                            *días tolerancia para aplicar corte
                          </p>
                        </div>
                      </div>

                      <div className={pageFormRowClassName('medium')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Aplicar Corte
                        </label>
                        <select
                          value={draft.billing.applyCutoff}
                          onChange={(event) =>
                            updateBillingField(
                              'applyCutoff',
                              event.target.value,
                            )
                          }
                          className={pageSelectClassName()}
                          {...controlA11yProps('Aplicar Corte')}
                        >
                          {cutoffOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className={pageFormRowClassName('medium')}>
                        <label className={`flex items-center gap-2 md:justify-end ${pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}`}>
                          Fecha Fija
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#485d73]">
                            <CircleHelp className="h-3 w-3" />
                          </span>
                        </label>
                        <div className="grid grid-cols-[minmax(0,1fr)_31px]">
                          <input
                            value={draft.billing.fixedDate}
                            onChange={(event) =>
                              updateBillingField(
                                'fixedDate',
                                event.target.value,
                              )
                            }
                            placeholder="Automático"
                            className={`${pageInputClassName('rounded-r-none bg-[#f8fafc] text-[#a4b1bf]')} rounded-r-none`}
                            aria-label="Fecha Fija"
                            title="Fecha Fija"
                          />
                          <button
                            type="button"
                            className="inline-flex h-[31px] items-center justify-center rounded-r-[3px] border border-l-0 border-[#cfd7e2] bg-[#edf2f6] text-[#55697d]"
                            aria-label="Limpiar fecha fija"
                            title="Limpiar fecha fija"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {[
                        ['Aplicar Mora', 'applyLateFee'],
                        ['Aplicar Reconexión', 'applyReconnection'],
                        ['Reactivar con pago parcial', 'reactivateWithPartialPayment'],
                      ].map(([label, key], index) => (
                        <div key={`wizard-toggle-${index}`} className={pageFormRowClassName('medium', 'start')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[6px]')}>
                            {label}
                          </label>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                updateBillingField(
                                  key as keyof ClientBillingSettings,
                                  !(draft.billing[
                                    key as keyof ClientBillingSettings
                                  ] as boolean) as never,
                                )
                              }
                              className={`relative h-6 w-[40px] rounded-full transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                              {...controlA11yProps(String(label))}
                            >
                              <span
                                className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'left-[18px]' : 'left-[2px]'}`}
                              />
                            </button>
                            {index === 2 ? (
                              <p className="mt-1 max-w-[300px] text-[11px] text-[#ee9747]">
                                * Desactivado por defecto. Solo reactivará cuando la factura quede saldada.
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}

                      <div className="pt-1 text-center">
                        <div className="text-[18px] font-semibold text-[#24364b]">
                          Otros Impuestos
                        </div>
                        <p className="mt-1 text-[11px] text-[#61768d]">
                          Estos impuestos serán agregados al total de la factura
                        </p>
                      </div>

                      {draft.billing.taxes.map((taxValue, taxIndex) => (
                        <div key={`wizard-tax-${taxIndex}`} className={pageFormRowClassName('medium', 'start')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>{`Impuesto #${taxIndex + 1} (%)`}</label>
                          <div>
                            <input
                              value={taxValue}
                              onChange={(event) => {
                                const nextTaxes = [...draft.billing.taxes] as ClientBillingSettings['taxes'];
                                nextTaxes[taxIndex] = sanitizeDecimalValue(event.target.value);
                                updateBillingField('taxes', nextTaxes);
                              }}
                              inputMode="decimal"
                              className={pageInputClassName()}
                              placeholder="0"
                              {...controlA11yProps(`Impuesto ${taxIndex + 1} porcentaje`)}
                            />
                            <p className="mt-1 text-[11px] text-[#24364b]">
                              * Dejar en 0 (cero) para quedar deshabilitado
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-[3px] border border-[#d7e0ea] bg-white">
                    <header className="flex items-center gap-2 border-b border-[#d7e0ea] bg-[#f5f7fa] px-[15px] py-[10px] text-[12px] font-semibold text-[#2a3d53]">
                      <Bell className="h-3.5 w-3.5 text-[#51687f]" />
                      Notificaciones
                    </header>
                    <div className="space-y-4 p-[15px]">
                      <div className={pageFormRowClassName('medium')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Aviso nueva factura
                        </label>
                        <select
                          value={draft.notifications.newInvoiceNotice}
                          onChange={(event) =>
                            updateNotificationField(
                              'newInvoiceNotice',
                              event.target.value,
                            )
                          }
                          className={pageSelectClassName()}
                          {...controlA11yProps('Aviso nueva factura')}
                        >
                          {notificationToggleOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className={pageFormRowClassName('medium', 'start')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Aviso en Pantalla
                        </label>
                        <div>
                          <select
                            value={draft.notifications.screenNotice}
                            onChange={(event) =>
                              updateNotificationField(
                                'screenNotice',
                                event.target.value,
                              )
                            }
                            className={pageSelectClassName()}
                            {...controlA11yProps('Aviso en Pantalla')}
                          >
                            {notificationToggleOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-[#ee9747]">
                            * Aviso solo en páginas HTTP
                          </p>
                        </div>
                      </div>

                      {[
                        ['Recordatorios de pago', 'remindersChannel', ['Correo', 'SMS', 'Desactivado']],
                        ['Recordatorio #1', 'reminderOne', reminderOptions],
                        ['Recordatorio #2', 'reminderTwo', reminderOptions],
                        ['Recordatorio #3', 'reminderThree', reminderOptions],
                      ].map(([label, key, options], index) => (
                        <div key={`wizard-notification-${index}`} className={pageFormRowClassName('medium', 'start')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                            {label}
                          </label>
                          <div>
                            <select
                              value={draft.notifications[key as keyof ClientNotificationSettings] as string}
                              onChange={(event) =>
                                updateNotificationField(
                                  key as keyof ClientNotificationSettings,
                                  event.target.value as never,
                                )
                              }
                            className={pageSelectClassName()}
                            {...controlA11yProps(String(label))}
                          >
                              {(options as string[]).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                            {key === 'reminderThree' ? (
                              <p className="mt-1 text-[11px] text-[#ee9747]">
                                * Días antes/después del vencimiento de una factura
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {currentStep.id === 'services' ? (
              <div className="mx-auto max-w-[1560px] pt-1">
                <div className="mx-auto max-w-[620px] space-y-4">
                  <div className={pageFormRowClassName('medium')}>
                    <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                      Router
                  </label>
                  <select
                    value={draft.services.router || routerOptions[0]}
                    onChange={(event) =>
                      updateServiceField(
                        'router',
                        event.target.value === routerOptions[0]
                          ? ''
                          : event.target.value,
                      )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Router')}
                  >
                    {routerOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className={pageFormRowClassName('medium')}>
                  <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                    Excluir Firewall
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateServiceField(
                        'excludeFirewall',
                        draft.services.excludeFirewall === 'Activado'
                          ? 'Desactivado'
                          : 'Activado',
                      )
                    }
                    className={`relative h-6 w-[40px] rounded-full transition ${draft.services.excludeFirewall === 'Activado' ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                    {...controlA11yProps('Excluir Firewall')}
                  >
                    <span
                      className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${draft.services.excludeFirewall === 'Activado' ? 'left-[18px]' : 'left-[2px]'}`}
                    />
                  </button>
                </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={`border-t border-[#d7e0ea] px-4 py-4 sm:px-6 ${activeStepIndex < wizardSteps.length - 1 ? 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4' : 'flex justify-center'}`}>
            {activeStepIndex < wizardSteps.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveStepIndex((currentIndex) =>
                      Math.max(0, currentIndex - 1),
                    )
                  }
                  disabled={activeStepIndex === 0}
                  className="inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-[#cfd7e2] bg-white px-6 text-[14px] text-[#7b8da3] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  {...controlA11yProps('Anterior')}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={handleGoNext}
                  className="inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-[#cfd7e2] bg-white px-6 text-[14px] font-semibold text-[#24364b] sm:w-auto"
                  {...controlA11yProps('Siguiente')}
                >
                  Siguiente
                </button>
              </>
            ) : (
                <button
                  type="button"
                  onClick={handleRegisterClient}
                  className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-[#2f93e4] px-6 text-[14px] font-semibold text-white"
                  {...controlA11yProps('Registrar Cliente')}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Registrar Cliente
                </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#d9e7f3] px-3 py-4 text-[#223448] sm:px-4 lg:px-6 lg:py-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f35f93] text-[20px] font-semibold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#223448]">
              {draft.personal.fullName || 'Cliente sin nombre'}{' '}
              <span className="text-[18px] font-normal text-[#5f7d98]">
                (#{draft.personal.clientCode})
              </span>
            </h1>
          </div>
        </div>

        <div className="text-left text-[12px] text-[#58708b] md:text-right">
          Inicio <span className="px-1">/</span> Lista usuarios
          (Activos) <span className="px-1">/</span>{' '}
          <span className="text-[#2f93e4]">{breadcrumbAction}</span>
        </div>
      </div>

      <section className="rounded border border-[#d7e0ea] bg-white">
        <div className="relative bg-[#1f252c] px-2 py-0">
          <div className="flex flex-wrap items-center gap-0">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 px-4 text-[12px] font-semibold ${isActive ? 'bg-white text-[#23384d]' : 'text-white'}`}
                {...controlA11yProps(tab.label)}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowToolsMenu((currentValue) => !currentValue)}
            className={`inline-flex h-10 items-center justify-center px-4 sm:ml-2 ${showToolsMenu ? 'bg-white text-[#23384d]' : 'text-white'}`}
            {...controlA11yProps('Abrir herramientas')}
          >
            <Wrench className="h-4 w-4" />
          </button>

          <div className="ml-auto flex w-full items-center justify-end gap-2 py-2 pr-2 sm:w-auto sm:py-0">
            <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f93e4] text-white" {...controlA11yProps('Pestana anterior')}>
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f93e4] text-white" {...controlA11yProps('Pestana siguiente')}>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          </div>

          {showToolsMenu ? (
            <div className="absolute right-3 top-[calc(100%+0.5rem)] z-20 w-[min(270px,calc(100vw-2rem))] rounded border border-[#d1d8df] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.16)] sm:right-14 sm:top-12">
              <div className="flex items-center justify-between border-b border-[#e3e8ee] px-4 py-3 text-[14px] font-semibold text-[#334b64]">
                <span>Herramientas</span>
                <button type="button" onClick={() => setShowToolsMenu(false)} className="text-[#6d8097]" {...controlA11yProps('Cerrar herramientas')}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <label className="mb-1 block text-[12px] text-[#4d6278]">
                    Seleccionar servicio
                  </label>
                  <select className={pageSelectClassName()} {...controlA11yProps('Seleccionar servicio')}>
                    <option>{draft.services.router || 'No hay ningun servicio...'}</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    ['Ver Antena', <Router className="h-3.5 w-3.5" key="router" />],
                    ['Trafico mikrotik', <BarChart3 className="h-3.5 w-3.5" key="traffic" />],
                    ['Ping Mikrotik', <Monitor className="h-3.5 w-3.5" key="ping" />],
                    ['Graficos Mikrotik', <BarChart3 className="h-3.5 w-3.5" key="chart" />],
                    ['Portal cliente', <UserRound className="h-3.5 w-3.5" key="portal" />],
                    ['Mail Bienvenida', <Mail className="h-3.5 w-3.5" key="mail" />],
                    ['¿Como llegar?', <MapPin className="h-3.5 w-3.5" key="map" />],
                    ['Enviar SMS', <Smartphone className="h-3.5 w-3.5" key="sms" />],
                  ].map(([label, icon], toolIndex) => (
                    <button key={`tool-${toolIndex}`} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded border border-[#cfd7e2] text-[12px] text-[#24364b]" {...controlA11yProps(String(label))}>
                      {icon as JSX.Element}
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleToolStatusChange('SUSPENDIDO')}
                    className="inline-flex h-10 items-center justify-center rounded bg-[#f5a623] text-[12px] font-semibold text-white"
                    {...controlA11yProps('Suspender')}
                  >
                    SUSPENDER
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolStatusChange('RETIRADO')}
                    className="inline-flex h-10 items-center justify-center rounded bg-[#ef5c5c] text-[12px] font-semibold text-white"
                    {...controlA11yProps('Retirar cliente')}
                  >
                    RETIRAR cliente
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative p-4">
          {activeTab === 'summary' ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.9fr)]">
              <section className="border-r border-[#e4ebf1] pr-0 xl:pr-5">
                <div className="mb-4 flex items-center gap-2 text-[18px] text-[#24364b]">
                  <ChevronRight className="h-4 w-4" />
                  <h2>Datos del cliente</h2>
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                    Estado
                  </label>
                  <div>
                    <span className={`inline-flex rounded px-3 py-1 text-[12px] font-semibold text-white ${draft.status === 'ACTIVO' ? 'bg-[#11b981]' : draft.status === 'SUSPENDIDO' ? 'bg-[#f5a623]' : 'bg-[#ef5c5c]'}`}>
                      {draft.status}
                    </span>
                  </div>
                </div>

                <div className={`mt-4 ${pageFormRowClassName()}`}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                    Conectado al Router(s)
                  </label>
                  <div className="text-[13px] text-[#526b84]">
                    {draft.services.router || 'Sin router asignado'}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    ['ID', 'clientCode'],
                    ['Contraseña', 'portalPassword'],
                    ['Cliente', 'fullName'],
                    ['Direccion Principal', 'primaryAddress'],
                    ['Telefono fijo', 'landlinePhone'],
                    ['Telefono Movil', 'mobilePhone'],
                    ['E-mail', 'email'],
                  ].map(([label, key]) => (
                    <div key={key} className={pageFormRowClassName()}>
                      <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                        {label}
                      </label>
                      <input
                        value={draft.personal[key as keyof ClientWorkspaceData['personal']] as string}
                        onChange={(event) =>
                          key === 'clientCode' || key === 'landlinePhone' || key === 'mobilePhone'
                            ? updatePersonalNumericField(
                                key as 'clientCode' | 'landlinePhone' | 'mobilePhone',
                                event.target.value,
                              )
                            : updatePersonalField(
                                key as keyof ClientWorkspaceData['personal'],
                                event.target.value as never,
                              )
                        }
                        inputMode={
                          key === 'clientCode' || key === 'landlinePhone' || key === 'mobilePhone'
                            ? 'numeric'
                            : key === 'fullName'
                              ? 'text'
                              : undefined
                        }
                        pattern={key === 'fullName' ? "[A-Za-zÀ-ÿ\\s'-]+" : undefined}
                        className={pageInputClassName(key === 'clientCode' || key === 'portalPassword' ? 'max-w-[160px]' : '')}
                        {...controlA11yProps(String(label))}
                      />
                    </div>
                  ))}

                  <div className={pageFormRowClassName('wide', 'start')}>
                    <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#415970]')}>
                      N° Identificacion
                    </label>
                    <div>
                      <input
                        value={draft.personal.identification}
                        onChange={(event) =>
                          updatePersonalNumericField(
                            'identification',
                            event.target.value,
                          )
                        }
                        inputMode="numeric"
                        className={`${pageInputClassName()} max-w-[180px]`}
                        {...controlA11yProps('Numero de identificacion')}
                      />
                      <p className="mt-1 text-[11px] uppercase tracking-[0.02em] text-[#5b748c]">
                        Cedula, DNI, RUC, CUIT, NIT, SAT, RUT, RTN, etc.
                      </p>
                    </div>
                  </div>

                  <div className={pageFormRowClassName()}>
                    <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                      Ubicacion
                    </label>
                  <select
                    value={draft.personal.location || locationOptions[0]}
                      onChange={(event) =>
                        updatePersonalField(
                          'location',
                          event.target.value === locationOptions[0]
                            ? ''
                            : event.target.value,
                        )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Ubicacion')}
                  >
                      {locationOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSavePersonalChanges}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2f93e4] px-6 text-[13px] font-semibold text-[#2f93e4]"
                    {...controlA11yProps('Guardar datos')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Guardar datos
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2 text-[18px] text-[#24364b]">
                  <ChevronRight className="h-4 w-4" />
                  <h2>Resumen Notificaciones</h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {scheduleCards.map((card) => (
                    <TimelineCard key={`${card.title}-${card.detail}`} {...card} />
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === 'services' ? (
            <div className="space-y-5">
              <EmptyTableCard title="Servicios de Internet" columns={['ID', 'PLAN', 'COSTO', 'IP', 'ROUTER', 'INSTALADO', 'DIRECCION', 'ESTADO', 'ACCIONES']} actionLabel="Nueva" />
              <EmptyTableCard title="Equipos Asignados" columns={['ID', 'N° SERIE', 'N° MAC', 'EQUIPO', 'FECHA', 'ESTADO', 'ACCIONES']} />
              <EmptyTableCard title="Servicios Voip" columns={['ID', 'PLAN', 'SIP SERVER', 'SIP USER', 'AUTHENTICATE ID', 'N° TELEFONO', 'COSTO', 'INSTALADO', 'NOTAS', 'ACCIONES']} actionLabel="Nueva" />
              <EmptyTableCard title="Productos y otros Servicios Recurrentes" columns={['ID', 'PRODUCTO', 'MONTO', 'N° SERIE', 'N° MAC', 'FECHA INICIO', 'N° CUOTAS', 'ESTADO', 'ACCIONES']} actionLabel="Nuevo" />
              <EmptyTableCard title="Productos y Otros Servicios" columns={['ID', 'PRODUCTO', 'MONTO', 'N° SERIE', 'N° MAC', 'FECHA INICIO', 'FACTURA', 'ESTADO', 'ACCIONES']} />
            </div>
          ) : null}

          {activeTab === 'billing' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-b border-[#d7e0ea] pb-1">
                {billingTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveBillingTab(tab.id)}
                    className={`inline-flex h-9 items-center gap-2 border border-b-0 px-4 text-[12px] ${activeBillingTab === tab.id ? 'bg-white font-semibold text-[#24364b]' : 'bg-[#f5f7fa] text-[#6b8198]'}`}
                    {...controlA11yProps(tab.label)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeBillingTab === 'invoices' ? (
                <EmptyTableCard title="Facturas" columns={['N° FACTURA', 'N° FISCAL', 'EMITIDO', 'VENCIMIENTO', 'ESTADO', 'TOTAL', 'IMPUESTO', 'TIPO', 'PAGADO', 'FECHA PAGO', 'FORMA PAGO', 'ACCIONES']} actionLabel="Factura Libre" />
              ) : null}

              {activeBillingTab === 'config' ? (
                <div className="space-y-5">
                  <div className={`w-full max-w-[520px] ${pageFormRowClassName()}`}>
                    <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                      Configurar utilizando plantilla
                    </label>
                    <select
                      value={draft.billing.template || billingTemplateOptions[0]}
                      onChange={(event) =>
                        updateBillingField(
                          'template',
                          event.target.value === billingTemplateOptions[0] ? '' : event.target.value,
                        )
                      }
                      className={pageSelectClassName()}
                      {...controlA11yProps('Plantilla de facturacion')}
                    >
                      {billingTemplateOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <section className="rounded border border-[#d7e0ea] bg-white">
                      <header className="bg-[#0f9488] px-4 py-3 text-[13px] font-semibold text-white">
                        Facturacion
                      </header>
                      <div className="space-y-4 p-4">
                        {[
                          ['Tipo', 'type', billingTypeOptions],
                          ['Dia pago', 'paymentDay', paymentDayOptions],
                          ['Crear Factura', 'createInvoice', createInvoiceOptions],
                          ['Tipo impuesto', 'taxType', taxTypeOptions],
                          ['Dias de gracia', 'graceDays', graceDayOptions],
                          ['Aplicar Corte', 'applyCutoff', cutoffOptions],
                          ['Bajar Velocidad', 'slowdownMode', slowdownOptions],
                        ].map(([label, key, options], index) => (
                          <div key={`config-billing-${index}`} className={pageFormRowClassName('medium')}>
                            <label className={pageFormLabelClassName('text-[13px] text-[#40576f]')}>
                              {label}
                            </label>
                            <select
                              value={draft.billing[key as keyof ClientBillingSettings] as string}
                              onChange={(event) =>
                                updateBillingField(
                                  key as keyof ClientBillingSettings,
                                  event.target.value as never,
                                )
                              }
                              className={pageSelectClassName()}
                              {...controlA11yProps(String(label))}
                            >
                              {(options as string[]).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        ))}

                        {[
                          ['Fecha Fija', 'fixedDate'],
                          ['Corte Fijo Programado', 'fixedCutoffDate'],
                        ].map(([label, key], index) => (
                          <div key={`config-fixed-${index}`} className={pageFormRowClassName('medium')}>
                            <label className={`flex items-center gap-2 md:justify-end ${pageFormLabelClassName('text-[13px] text-[#40576f]')}`}>
                              {label} <CircleHelp className="h-3.5 w-3.5 text-[#67809a]" />
                            </label>
                            <div className="grid grid-cols-[minmax(0,1fr)_40px]">
                              <input
                                value={draft.billing[key as keyof ClientBillingSettings] as string}
                                onChange={(event) =>
                                  updateBillingField(
                                    key as keyof ClientBillingSettings,
                                    event.target.value as never,
                                  )
                                }
                                placeholder="Automatico"
                                className={pageInputClassName('rounded-r-none')}
                                {...controlA11yProps(String(label))}
                              />
                              <button type="button" className="inline-flex h-8 items-center justify-center rounded-r border border-l-0 border-[#cfd7e2] bg-[#eef3f7] text-[#4c5f74]" {...controlA11yProps(`Configurar ${String(label)}`)}>
                                <Settings2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {[
                          ['Aplicar Mora', 'applyLateFee'],
                          ['Aplicar Reconexion', 'applyReconnection'],
                          ['Reactivar con pago parcial', 'reactivateWithPartialPayment'],
                        ].map(([label, key], index) => (
                          <div key={`config-toggle-${index}`} className={pageFormRowClassName('medium', 'start')}>
                            <label className={pageFormLabelClassName('pt-1 text-[13px] text-[#40576f]')}>
                              {label}
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateBillingField(
                                  key as keyof ClientBillingSettings,
                                  !(draft.billing[key as keyof ClientBillingSettings] as boolean) as never,
                                )
                              }
                              className={`relative h-7 w-13 rounded-full transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                              {...controlA11yProps(String(label))}
                            >
                              <span className={`absolute top-[2px] h-6 w-6 rounded-full bg-white transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'left-[26px]' : 'left-[2px]'}`} />
                            </button>
                          </div>
                        ))}

                        <div className="pt-2 text-center text-[14px] font-semibold text-[#233549]">
                          Otros Impuestos
                        </div>
                        {draft.billing.taxes.map((taxValue, taxIndex) => (
                          <div key={`config-tax-${taxIndex}`} className={pageFormRowClassName('medium', 'start')}>
                            <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] text-[#40576f]')}>{`Impuesto #${taxIndex + 1} (%)`}</label>
                            <div>
                              <input
                                value={taxValue}
                                onChange={(event) => {
                                  const nextTaxes = [...draft.billing.taxes] as ClientBillingSettings['taxes'];
                                  nextTaxes[taxIndex] = sanitizeDecimalValue(event.target.value);
                                  updateBillingField('taxes', nextTaxes);
                                }}
                                inputMode="decimal"
                                className={pageInputClassName()}
                                placeholder="0"
                                {...controlA11yProps(`Impuesto ${taxIndex + 1} porcentaje`)}
                              />
                              <p className="mt-1 text-[11px] text-[#24364b]">
                                * Dejar en 0 (cero) para quedar deshabilitado
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={handleSaveBillingChanges}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2f93e4] px-6 text-[13px] font-semibold text-[#2f93e4]"
                            {...controlA11yProps('Guardar cambios de facturacion')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Guardar cambios
                          </button>
                        </div>

                        {schedule ? (
                          <div className="grid gap-3 pt-4 sm:grid-cols-2">
                            <div className="rounded bg-[#fff3b3] px-4 py-4 text-center text-[13px] text-[#6d5d1d]">
                              Dia de pago: <span className="font-semibold">{formatDate(schedule.paymentDate)}</span>
                            </div>
                            <div className="rounded bg-[#f8c4c4] px-4 py-4 text-center text-[13px] text-[#803535]">
                              Dia de corte: <span className="font-semibold">{formatDateTime(schedule.cutoffDate)}</span>
                            </div>
                            <div className="rounded bg-[#c7edf8] px-4 py-4 text-center text-[13px] text-[#245b73]">
                              Crear factura: <span className="font-semibold">{formatDateTime(schedule.invoiceDate)}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="rounded border border-[#d7e0ea] bg-white">
                      <header className="bg-[#0f9488] px-4 py-3 text-[13px] font-semibold text-white">
                        Notificaciones
                      </header>
                      <div className="space-y-4 p-4">
                        {[
                          ['Aviso nueva factura', 'newInvoiceNotice', notificationToggleOptions],
                          ['Aviso en Pantalla', 'screenNotice', notificationToggleOptions],
                          ['Recordatorios de pago', 'remindersChannel', ['Correo', 'SMS', 'Desactivado']],
                          ['Recordatorio #1', 'reminderOne', reminderOptions],
                          ['Recordatorio #2', 'reminderTwo', reminderOptions],
                          ['Recordatorio #3', 'reminderThree', reminderOptions],
                        ].map(([label, key, options], index) => (
                          <div key={`config-notification-${index}`} className={pageFormRowClassName('medium', 'start')}>
                            <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] text-[#40576f]')}>
                              {label}
                            </label>
                            <select
                              value={draft.notifications[key as keyof ClientNotificationSettings] as string}
                              onChange={(event) =>
                                updateNotificationField(
                                  key as keyof ClientNotificationSettings,
                                  event.target.value as never,
                                )
                              }
                              className={pageSelectClassName()}
                              {...controlA11yProps(String(label))}
                            >
                              {(options as string[]).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        ))}

                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={handleSaveBillingChanges}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2f93e4] px-6 text-[13px] font-semibold text-[#2f93e4]"
                            {...controlA11yProps('Guardar cambios de notificaciones')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Guardar cambios
                          </button>
                        </div>

                        {schedule ? (
                          <div className="grid gap-3 pt-4 sm:grid-cols-2">
                            <div className="rounded bg-[#b4d0f0] px-4 py-4 text-center text-[13px] text-[#27496b]">
                              Aviso pantalla: <span className="font-semibold">{draft.notifications.screenNotice}</span>{' '}
                              {formatDateTime(schedule.paymentDate)}
                            </div>
                            <div className="rounded bg-[#a6e0de] px-4 py-4 text-center text-[13px] text-[#24615d]">
                              Recordatorio #1: <span className="font-semibold">{formatDateTime(schedule.reminderOneDate)}</span>
                            </div>
                            <div className="rounded bg-[#d9efb7] px-4 py-4 text-center text-[13px] text-[#587337]">
                              Recordatorio #2: <span className="font-semibold">{draft.notifications.reminderTwo}</span>
                            </div>
                            <div className="rounded bg-[#e7edf3] px-4 py-4 text-center text-[13px] text-[#607488]">
                              Recordatorio #3: <span className="font-semibold">{draft.notifications.reminderThree}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}

              {activeBillingTab === 'transactions' ? (
                <EmptyTableCard title="Transacciones" columns={['ID', 'N° FACTURA', 'FECHA PAGO', 'TOTAL PAGADO', 'COMISION', 'SALDO', 'N° TRANSACCION', 'FORMA PAGO', 'OPERADOR']} />
              ) : null}

              {activeBillingTab === 'balances' ? (
                <EmptyTableCard title="Saldos" columns={['ID', 'FECHA', 'DETALLE', 'SALDO', 'ACCIONES']} />
              ) : null}
            </div>
          ) : null}

          {activeTab === 'tickets' ? (
            <EmptyTableCard title="Tickets" columns={['N°', 'DEPARTAMENTO', 'ASUNTO', 'TECNICO', 'FECHA', 'ESTADO', 'ABIERTO POR', 'ULTIMA RSPTA.', 'ACCIONES']} actionLabel="Nuevo" />
          ) : null}

          {activeTab === 'emails' ? (
            <div className="space-y-5">
              <EmptyTableCard title="Correo Enviados" columns={['ID', 'ASUNTO', 'FECHA', 'REMITENTE', 'DESTINO', 'ESTADO', 'LOG', 'ACCIONES']} actionLabel="Nuevo correo" />
              <EmptyTableCard title="Mensajes de texto" columns={['ID', 'MENSAJE', 'ESTADO', '# DESTINO', 'FECHA ENVIO', 'ACCIONES']} actionLabel="Nuevo sms" />
            </div>
          ) : null}

          {activeTab === 'documents' ? (
            <div className="space-y-5">
              <EmptyTableCard title="Contratos" columns={['N°', 'N° EXTERNO', 'TITULO', 'CREADO', 'INICIO', 'FINALIZA', 'DURACION', 'FIRMADO', 'ESTADO', 'ACCIONES']} actionLabel="Nuevo Contrato" />
              <EmptyTableCard title="Documentos PDF" columns={['CREADO POR', 'TITULO', 'DESCRIPCION', 'ARCHIVO', 'FECHA', 'ACCIONES']} actionLabel="Nuevo Documento" />
                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="flex items-center justify-between border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                    <span>Notas</span>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 rounded bg-[#43c2eb] px-3 text-[12px] font-semibold text-white"
                    {...controlA11yProps('Agregar nota')}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agrega Nota
                  </button>
                  </header>
                  <div className="min-h-[90px] bg-[#edf2f6]" />
              </section>
            </div>
          ) : null}

          {activeTab === 'statistics' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="grid w-full max-w-[720px] gap-3 md:grid-cols-[110px_minmax(0,1fr)] lg:grid-cols-[110px_minmax(0,1fr)_150px_100px_24px_100px] md:items-center">
                  <label className={pageFormLabelClassName('text-[13px] text-[#40576f]')}>Servicio</label>
                  <select className={pageSelectClassName()} {...controlA11yProps('Servicio')}>
                    <option>Todos los servicios</option>
                  </select>
                  <select className={pageSelectClassName()} {...controlA11yProps('Tipo de grafico')}>
                    <option>Grafico diario</option>
                  </select>
                  <input value={statisticsDateRange[0]} readOnly className={pageInputClassName()} {...controlA11yProps('Fecha inicial')} />
                  <span className="text-center text-[12px] text-[#40576f]">al</span>
                  <input value={statisticsDateRange[1]} readOnly className={pageInputClassName()} {...controlA11yProps('Fecha final')} />
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">Resumen</header>
                  <div className="p-4">
                    <div className="grid grid-cols-[1fr_110px] border border-[#d7e0ea] text-[13px] text-[#24364b]">
                      {[
                        ['Sesiones', '0'],
                        ['Tiempo', '00:00:00'],
                        ['Descarga', '0'],
                        ['Subida', '0'],
                      ].map(([label, value]) => (
                        <div key={label} className="contents">
                          <div className="border-b border-r border-[#d7e0ea] px-3 py-3">{label}</div>
                          <div className="border-b border-[#d7e0ea] px-3 py-3 text-right">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex justify-center">
                      <button type="button" className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd7e2] bg-white px-5 text-[13px] text-[#24364b]" {...controlA11yProps('Sitios visitados hoy')}>
                        <Monitor className="h-4 w-4" />
                        Sitios visitados Hoy
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">Grafico</header>
                  <div className="relative h-[300px] p-6">
                    {['top-[70px]', 'top-[122px]', 'top-[174px]', 'top-[226px]'].map((topClassName, row) => (
                      <div
                        key={`line-${row}`}
                        className={`absolute left-12 right-6 border-t border-[#dce4ec] ${topClassName}`}
                      />
                    ))}
                    <div className="absolute bottom-12 left-12 right-6 border-t border-[#dce4ec]" />
                    <div className="absolute bottom-12 left-12 top-6 border-l border-[#dce4ec]" />
                    <div className="absolute left-16 top-[122px] rounded border border-[#cfd7e2] bg-white px-3 py-2 text-[12px] text-[#24364b] shadow-sm">
                      <div>2026-03-22</div>
                      <div className="text-[#2f93e4]">DOWN: 0 MiB</div>
                      <div className="text-[#0f9488]">UP: 0 MiB</div>
                    </div>
                    <div className="absolute bottom-5 left-16 right-6 flex justify-between text-[11px] text-[#6d8198]">
                      {['2026-03-22', '2026-03-24', '2026-03-26', '2026-03-28', '2026-03-30', '2026-04-01', '2026-04-03', '2026-04-05'].map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <EmptyTableCard title="Historico" columns={['#', 'CONECTADO', 'DESCONECTADO', 'TIEMPO', 'DESCARGA', 'SUBIDA', 'IPV4', 'MAC', 'IP ROUTER']} />
            </div>
          ) : null}

          {activeTab === 'log' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <select className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none" {...controlA11yProps('Cantidad de logs')}>
                  <option>15</option>
                </select>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#30465f]" {...controlA11yProps('Vista de lista de logs')}>
                  <List className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="inline-flex h-8 items-center rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b]" {...controlA11yProps('Fecha inicial de logs')}>
                  01/04/2026
                </button>
                <span className="text-[12px] text-[#415970]">al</span>
                <button type="button" className="inline-flex h-8 items-center rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b]" {...controlA11yProps('Fecha final de logs')}>
                  30/04/2026
                </button>
                <select className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none" {...controlA11yProps('Filtro de logs')}>
                  <option>Todos los logs</option>
                </select>
                <div className="relative ml-auto">
                  <input type="text" placeholder="Buscar..." className="h-8 w-[260px] rounded border border-[#d7e0ea] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none" {...controlA11yProps('Buscar en logs')} />
                  <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a0aebe]" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px] text-[#24364b]">
                  <thead>
                    <tr className="bg-white">
                      <th className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">FECHA</th>
                      <th className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">DETALLE</th>
                      <th className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">OPERADOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.log.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="border border-[#d7e0ea] px-4 py-8 text-center text-[13px] text-[#7d8da1]">
                          Ningun registro disponible
                        </td>
                      </tr>
                    ) : (
                      draft.log.map((entry) => (
                        <tr key={entry.id}>
                          <td className="border border-[#d7e0ea] px-3 py-2">{entry.date}</td>
                          <td className="border border-[#d7e0ea] px-3 py-2">{entry.detail}</td>
                          <td className="border border-[#d7e0ea] px-3 py-2">{entry.operator}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#607488]">
                <span>Mostrando de 1 al {draft.log.length} de un total de {draft.log.length}</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]" {...controlA11yProps('Pagina anterior de logs')}>
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#2f93e4] text-[12px] font-semibold text-white" {...controlA11yProps('Pagina 1')}>
                    1
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]" {...controlA11yProps('Pagina siguiente de logs')}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
