import { useMemo, useState } from 'react';
import {
  Bell,
  FileText,
  Mail,
  MessageCircleMore,
  Pencil,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';

type TemplateTabId = 'documents' | 'emails' | 'sms' | 'alerts';
type TemplatePreviewKind = 'document' | 'email' | 'telegram' | 'sms' | 'alert';

type TemplateItem = {
  id: string;
  title: string;
  subtitle?: string;
  kind: TemplatePreviewKind;
  selected?: boolean;
  actionLabel?: string;
};

type TemplateTab = {
  id: TemplateTabId;
  label: string;
  icon: LucideIcon;
  items: TemplateItem[];
};

const TEMPLATE_TABS: TemplateTab[] = [
  {
    id: 'documents',
    label: 'Plantillas Documentos',
    icon: FileText,
    items: [
      { id: 'invoice', title: 'FACTURA', kind: 'document' },
      { id: 'receipt', title: 'RECIBO', kind: 'document' },
      { id: 'receipt-pos', title: 'RECIBO POS', kind: 'document' },
      { id: 'invoice-afip', title: 'FACTURA AFIP', kind: 'document', selected: true },
      { id: 'invoice-dian', title: 'FACTURA DIAN', kind: 'document' },
      { id: 'install-sheet', title: 'HOJA INSTALACION', kind: 'document' },
      { id: 'ticket-print', title: 'IMPRESION TICKET', kind: 'document' },
      { id: 'contract', title: 'CONTRATO', kind: 'document' },
    ],
  },
  {
    id: 'emails',
    label: 'Plantillas Correos',
    icon: Mail,
    items: [
      { id: 'payment-notice-1', title: 'AVISO PAGO 1', kind: 'email' },
      { id: 'payment-notice-2', title: 'AVISO PAGO 2', kind: 'email' },
      { id: 'payment-notice-3', title: 'AVISO PAGO 3', kind: 'email' },
      { id: 'payment-confirmation', title: 'CONFIRMACION PAGO', kind: 'email' },
      { id: 'invoice-generated', title: 'FACTURA GENERADA', kind: 'email' },
      { id: 'welcome', title: 'BIENVENIDA', kind: 'email' },
      { id: 'support-ticket', title: 'TICKET SOPORTE', kind: 'email' },
      { id: 'support-reply', title: 'RESPUESTA TICKET SOPORTE', kind: 'email' },
      { id: 'router-down', title: 'CAIDA ROUTER', kind: 'email' },
      { id: 'router-up', title: 'ROUTER CONECTADO', kind: 'email' },
      { id: 'issuer-down', title: 'CAIDA EMISOR', kind: 'email' },
      { id: 'issuer-up', title: 'EMISOR CONECTADO', kind: 'email' },
      { id: 'custom-email', title: 'PLANTILLA CORREO PESONALIZADO', subtitle: 'plantilla de ejemplo', kind: 'email' },
    ],
  },
  {
    id: 'sms',
    label: 'Plantillas SMS/Telegram',
    icon: MessageCircleMore,
    items: [
      { id: 'sms-payment-notice', title: 'AVISO PAGO', subtitle: '(1,2,3)', kind: 'sms', selected: true, actionLabel: 'Editar plantilla' },
      { id: 'telegram-payment-notice', title: 'AVISO PAGO', subtitle: '(1,2,3)', kind: 'telegram' },
      { id: 'sms-new-invoice', title: 'NUEVA FACTURA GENERADA', kind: 'sms' },
      { id: 'telegram-new-invoice', title: 'NUEVA FACTURA GENERADA', kind: 'telegram' },
      { id: 'sms-cut-service', title: 'SMS CORTE SERVICIO', kind: 'sms' },
      { id: 'sms-welcome', title: 'SMS BIENVENIDA', kind: 'sms' },
      { id: 'sms-payment-confirmation', title: 'SMS CONFIRMACION PAGO', kind: 'sms' },
    ],
  },
  {
    id: 'alerts',
    label: 'Avisos',
    icon: Bell,
    items: [
      { id: 'cut-notice', title: 'AVISO CORTE', kind: 'alert' },
      { id: 'screen-notice', title: 'AVISO PANTALLA', kind: 'alert' },
    ],
  },
];

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[50px] items-center rounded-t-[6px] px-5 text-[18px] transition ${
        active ? 'bg-white text-[#2d3748]' : 'text-[#2687ff] hover:text-[#0d6de8]'
      }`}
    >
      <Icon className="mr-2 h-5 w-5" />
      {label}
    </button>
  );
}

function TemplatePreview({
  item,
}: {
  item: TemplateItem;
}) {
  if (item.kind === 'document') {
    return (
      <div className="relative flex h-full flex-col bg-white">
        <div className="m-3 flex-1 border border-[#cfd8e3] bg-white p-3">
          <div className="mb-2 h-2 w-full bg-[#f75656]" />
          <div className="mb-3 flex justify-between text-[6px] text-[#6b7280]">
            <span>LOGO</span>
            <span>FACTURA</span>
          </div>
          <div className="space-y-1">
            <div className="h-[5px] w-[55%] bg-[#d9e2ec]" />
            <div className="h-[5px] w-[72%] bg-[#d9e2ec]" />
            <div className="h-[5px] w-[48%] bg-[#d9e2ec]" />
          </div>
          <div className="mt-4 border-t border-[#e5ebf2] pt-2">
            <div className="grid grid-cols-4 gap-1">
              <div className="h-[4px] bg-[#d9e2ec]" />
              <div className="h-[4px] bg-[#d9e2ec]" />
              <div className="h-[4px] bg-[#d9e2ec]" />
              <div className="h-[4px] bg-[#d9e2ec]" />
            </div>
            <div className="mt-2 h-[6px] w-[40%] bg-[#1f2937]" />
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === 'alert') {
    return (
      <div className="m-3 flex h-[calc(100%-24px)] flex-col overflow-hidden border border-[#262626] bg-[#202020]">
        <div className="flex h-5 items-center justify-between bg-white px-2 text-[5px] text-[#9ca3af]">
          <span>MIKROWISP</span>
          <span>HOME</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center text-white">
          <Bell className="mb-3 h-8 w-8 text-[#d8df39]" />
          <div className="mb-2 text-[10px] font-semibold text-[#f97373]">
            {item.id === 'cut-notice' ? 'Servicio Suspendido' : 'Aviso de pago'}
          </div>
          <div className="max-w-[160px] text-[6px] leading-3 text-[#d1d5db]">
            Plantilla visual para aviso en portal o pantalla del cliente.
          </div>
          <div className="mt-4 flex gap-2">
            <div className="rounded bg-[#18a0d7] px-2 py-1 text-[6px]">Mi Portal</div>
            <div className="rounded bg-[#18a0d7] px-2 py-1 text-[6px]">Ir a pago</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === 'telegram') {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-[#2a2a2a]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2c2c2c] text-white">
            <Send className="h-5 w-5 fill-current" />
          </div>
          <span className="text-[19px] font-semibold">Telegram</span>
        </div>
      </div>
    );
  }

  if (item.kind === 'sms') {
    return (
      <div className="relative flex h-full items-center justify-center bg-white">
        <MessageCircleMore className="h-16 w-16 text-[#353535]" strokeWidth={2.2} />
        {item.actionLabel ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toast.info(`Edicion de ${item.title} lista para integrarse.`);
            }}
            className="absolute left-1/2 top-[42%] flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-[#2f96f3] bg-white px-4 py-3 text-[16px] font-medium text-[#2a2a2a]"
          >
            <Pencil className="mr-2 h-5 w-5 text-[#2f96f3]" />
            {item.actionLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="m-3 flex h-[calc(100%-24px)] flex-col overflow-hidden border border-[#d5dde7] bg-white">
      <div className="flex h-4 items-center px-2 text-[5px] text-[#98a2b3]">
        <span>LOGO</span>
      </div>
      <div className="px-4 pt-2 text-right text-[6px] font-semibold text-[#78c4d1]">
        {item.id.includes('payment') ? 'AVISO FACTURA' : item.id.includes('router') || item.id.includes('issuer') ? 'TICKET SOPORTE' : 'BIENVENIDO'}
      </div>
      <div className="px-4 pt-3 text-[6px] leading-3 text-[#353535]">
        <div>Querido {'{nombre_cliente}'},</div>
        <div className="mt-2">Esta es una vista resumida de la plantilla para correo.</div>
        <div className="mt-3 space-y-1">
          <div className="h-[4px] w-[80%] bg-[#e5ebf2]" />
          <div className="h-[4px] w-[72%] bg-[#e5ebf2]" />
          <div className="h-[4px] w-[65%] bg-[#e5ebf2]" />
        </div>
      </div>
      <div className="mt-auto px-4 pb-6">
        <div className="border border-[#b9d7f8]">
          <div className="bg-[#2f96f3] px-2 py-1 text-center text-[5px] font-semibold text-white">
            Datos de Acceso
          </div>
          <div className="space-y-1 px-2 py-2">
            <div className="h-[4px] w-[74%] bg-[#edf2f7]" />
            <div className="h-[4px] w-[68%] bg-[#edf2f7]" />
          </div>
        </div>
        <div className="mx-auto mt-3 h-4 w-[56px] rounded bg-[#2f96f3]" />
      </div>
    </div>
  );
}

function TemplateCard({
  item,
  activeTab,
  onClick,
}: {
  item: TemplateItem;
  activeTab: TemplateTabId;
  onClick: () => void;
}) {
  const highlight = item.selected && (activeTab === 'documents' || activeTab === 'sms');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden border-[5px] text-left transition hover:-translate-y-1 hover:shadow-md ${
        highlight ? 'border-[#2f96f3]' : 'border-[#3b3b3b]'
      }`}
    >
      <div className="h-[270px] bg-white">
        <TemplatePreview item={item} />
      </div>
      <div className={`flex min-h-[44px] items-center justify-center px-3 py-2 text-center ${
        highlight ? 'bg-[#2f96f3]' : 'bg-[#2f2f2f]'
      }`}>
        <span className="text-[14px] font-semibold uppercase text-white">
          {item.title}
          {item.subtitle ? <span className="ml-1 normal-case">{item.subtitle}</span> : null}
        </span>
      </div>
    </button>
  );
}

export default function TemplateEditor() {
  const [activeTab, setActiveTab] = useState<TemplateTabId>('documents');

  const currentTab = useMemo(
    () => TEMPLATE_TABS.find((tab) => tab.id === activeTab) ?? TEMPLATE_TABS[0],
    [activeTab],
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Plantillas</h1>

        <SettingsBreadcrumb currentLabel="Editor plantillas" />
      </div>

      <section className="rounded-[2px] bg-white shadow-sm">
        <div className="flex flex-wrap gap-1 px-4 pt-4">
          {TEMPLATE_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={tab.id === activeTab}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        <div className="px-4 pb-8 pt-6">
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {currentTab.items.map((item) => (
              <TemplateCard
                key={item.id}
                item={item}
                activeTab={activeTab}
                onClick={() => toast.info(`Plantilla ${item.title} lista para abrir editor.`)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
