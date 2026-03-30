import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  type WspTemplateCard,
  type WspTemplateEditorData,
} from '../types';
import { toast } from 'sonner';

const WSP_TEMPLATE_CARDS: WspTemplateCard[] = [
  { id: 'payment-registration', title: 'CONFIRMACIÓN DE REGISTRO DE PAGO' },
  { id: 'technical-support', title: 'SOPORTE TECNICO' },
  { id: 'pending-payment', title: 'PAGO PENDIENTE' },
  { id: 'payment-confirmation', title: 'CONFIRMACIÓN DE PAGO' },
  { id: 'service-restored', title: 'RESTABLECIMIENTO DE SU SERVICIO' },
  { id: 'service-suspension', title: 'SUSPENSIÓN DE SERVICIO POR FALTA DE PAGO' },
  { id: 'service-cancelled', title: 'CONFIRMACIÓN DE CANCELACIÓN DE SERVICIO' },
  { id: 'suspended-plus-10', title: '+10 DÍAS SUSPENDIDOS*' },
  { id: 'payment-commitment', title: 'COMPROMISO DE PAGO' },
];

const COMMON_TEMPLATE_VARIABLES = [
  { key: 'names', description: 'Nombres' },
  { key: 'surnames', description: 'Apellidos' },
  { key: 'cliente', description: 'Nombre Completo' },
  { key: 'document', description: 'N° de Identidad' },
  { key: 'mobile', description: 'N° Telefonico' },
  { key: 'mobileds', description: 'mobile opcional' },
  { key: 'note', description: 'nota' },
  { key: 'email', description: 'Correo' },
  { key: 'address', description: 'Dirección' },
  { key: 'latitud', description: 'Latitud' },
  { key: 'longitud', description: 'Longitud' },
  { key: 'reference', description: 'Referencia' },
  { key: 'net_ip', description: 'IP' },
  { key: 'business_name', description: 'Nombre de la empresa' },
  { key: 'debt_total_list', description: 'Lista de todas las deuda del cliente' },
  {
    key: 'debt_total_month_count',
    description: 'Total de meses de todas las deuda del cliente',
  },
] as const;

const PAYMENT_REGISTRATION_TEMPLATE: WspTemplateEditorData = {
  id: 'payment-registration',
  code: 'PAGO_MASSIVE',
  title: 'CONFIRMACIÓN DE REGISTRO DE PAGO',
  content:
    'Estimado(a) *{cliente}*,\n\nSe registro su pago de *{payment_total}* , correspondiente al recibo de {payment_months} .\n\nPuede descargar su recibo en el siguiente enlace:\n{list_payments}\n\nAgradecemos su puntualidad y la confianza en nuestros servicios.\n\nAtentamente,\n*NS TELECOM* / *{business_name}*',
  variables: [
    ...COMMON_TEMPLATE_VARIABLES,
    { key: 'list_payments', description: 'Lista basica de pago' },
    { key: 'payment_total', description: 'Monto total del pago registrado' },
    { key: 'payment_months', description: 'Periodo o meses asociados al pago' },
  ],
};

const TECHNICAL_SUPPORT_TEMPLATE: WspTemplateEditorData = {
  id: 'technical-support',
  code: 'SUPPORT_TECNICO',
  title: 'SOPORTE TECNICO',
  content:
    'Estimado(a) *{cliente}*,\n\nLe informamos que se ha generado el ticket Nº *{ticket_num}* para atender su solicitud. Un técnico se estará comunicando con usted a la brevedad para brindarle asistencia y solucionar el inconveniente con su servicio.\n\nQuedamos a su disposición para cualquier consulta adicional.\n\nAtentamente,\n*{business_name}*',
  variables: [
    ...COMMON_TEMPLATE_VARIABLES,
    { key: 'ticket_num', description: 'Número de Ticket' },
  ],
};

const PENDING_PAYMENT_TEMPLATE: WspTemplateEditorData = {
  id: 'pending-payment',
  code: 'PAYMENT_PENDING',
  title: 'PAGO PENDIENTE',
  content:
    'Estimado cliente *{cliente}*\n\nLe informamos que registra una deuda *PENDIENTE* por el monto *TOTAL* de {debt_amount}, correspondiente al siguiente período:\n\n{debt_list}\n\nAgradecemos su pronta regularización para evitar inconvenientes en la continuidad del servicio.\n\nAtte. {business_name}',
  variables: [
    ...COMMON_TEMPLATE_VARIABLES,
    { key: 'debt_list', description: 'Lista de deudas seleccionadas' },
    { key: 'debt_amount', description: 'Total de deudas seleccionadas' },
    { key: 'debt_months', description: 'Meses de deudas seleccionadas' },
  ],
};

const PAYMENT_CONFIRMATION_TEMPLATE: WspTemplateEditorData = {
  id: 'payment-confirmation',
  code: 'PAYMENT_CONFIRMED',
  title: 'CONFIRMACIÓN DE PAGO',
  content:
    'Estimado(a) *{cliente}*\n\nHemos registrado su pago de *{payment_total}* correspondiente al recibo {payment_num} del mes de {payment_months}.\n\nPuede descargar su recibo en el siguiente enlace:\n{payment_links}\n\nAtentamente,\n*NS TELECOM* / *{business_name}*',
  variables: [
    ...COMMON_TEMPLATE_VARIABLES,
    { key: 'payment_total', description: 'Total pagado' },
    { key: 'payment_months', description: 'Lista de meses pagados separado por ","' },
    { key: 'payment_links', description: 'Links de boleta' },
    { key: 'payment_num', description: 'Número de recibo de pago' },
    { key: 'payment_pending', description: 'Saldo pendiente de pago' },
  ],
};

const SERVICE_RESTORED_TEMPLATE: WspTemplateEditorData = {
  id: 'service-restored',
  code: 'CLIENT_ACTIVED',
  title: 'Restablecimiento de su Servicio',
  content:
    'Estimado(a) *{cliente}*,\n\nLe informamos que su servicio ha sido restaurado con éxito. Ahora puede disfrutar nuevamente de su conexión sin inconvenientes.\n\nSi requiere asistencia adicional, no dude en contactarnos.\n\nGracias por su confianza.\n\nAtentamente,\n*{business_name}*',
  variables: [...COMMON_TEMPLATE_VARIABLES],
};

const SERVICE_SUSPENSION_TEMPLATE: WspTemplateEditorData = {
  id: 'service-suspension',
  code: 'CLIENT_SUSPENDED',
  title: 'Suspensión de Servicio por Falta de Pago',
  content:
    'Estimado(a) *{cliente}*,\n\nLe informamos que su servicio ha sido *SUSPENDIDO* debido a la falta de pago. Actualmente, mantiene un saldo pendiente de {debt_total_list}, correspondiente a {debt_total_month_count}.\n\nRealiza el pago a la brevedad posible. Si ya ha efectuado el pago, le agradeceríamos que nos envíe el comprobante para su verificación.\n\nSi necesita más información o asistencia, no dude en comunicarse con nosotros a través de nuestros canales de atención.\n\nAtentamente,\n*{business_name}*',
  variables: [...COMMON_TEMPLATE_VARIABLES],
};

const SERVICE_CANCELLATION_TEMPLATE: WspTemplateEditorData = {
  id: 'service-cancelled',
  code: 'CLIENT_CANCELLED',
  title: 'Confirmación de Cancelación de Servicio',
  content:
    'Estimado(a) *{cliente}*,\n\nLe informamos que su servicio ha sido cancelado.\n\nLamentamos su partida y agradecemos la confianza que nos brindó durante el tiempo que estuvo con nosotros. Si en el futuro decide regresar, estaremos encantados de recibirlo nuevamente.\n\nQuedamos a su disposición para cualquier consulta.\n\nAtentamente,\n*{business_name}*',
  variables: [...COMMON_TEMPLATE_VARIABLES],
};

const SUSPENDED_PLUS_TEN_TEMPLATE: WspTemplateEditorData = {
  id: 'suspended-plus-10',
  code: 'SUSPENDED_NOTIFY',
  title: '*10 Días suspendidos*',
  content: 'Estimado(a) *{cliente}*,',
  variables: [
    ...COMMON_TEMPLATE_VARIABLES,
    { key: 'debt_list', description: 'Lista de deudas seleccionadas' },
    { key: 'debt_amount', description: 'Total de deudas seleccionadas' },
    { key: 'debt_months', description: 'Meses de deudas seleccionadas' },
  ],
};

const PAYMENT_COMMITMENT_TEMPLATE: WspTemplateEditorData = {
  id: 'payment-commitment',
  code: 'PAYMENT_PROMISE',
  title: 'Compromiso de Pago',
  content:
    'Estimado(a) {cliente},\nSe ha registrado su compromiso de pago con fecha *{promise_date}*, con el siguiente comentario: *{promise_comment}.*\n\nLe recordamos que mantiene una deuda *TOTAL* de *{debt_total_list}*, correspondiente a *{debt_total_month_count}*.\nEn caso de no realizar el pago en la fecha indicada, el sistema procederá automáticamente con la suspensión del servicio al día siguiente.\n\nAgradecemos su atención y cumplimiento oportuno.\n\nAtentamente,\n*{business_name}*',
  variables: [
    ...COMMON_TEMPLATE_VARIABLES,
    { key: 'promise_date', description: 'Fecha del compromiso de pago' },
    { key: 'promise_comment', description: 'Comentario del compromiso de pago' },
  ],
};

const EDITABLE_TEMPLATE_MAP: Record<string, WspTemplateEditorData> = {
  [PAYMENT_REGISTRATION_TEMPLATE.id]: PAYMENT_REGISTRATION_TEMPLATE,
  [TECHNICAL_SUPPORT_TEMPLATE.id]: TECHNICAL_SUPPORT_TEMPLATE,
  [PENDING_PAYMENT_TEMPLATE.id]: PENDING_PAYMENT_TEMPLATE,
  [PAYMENT_CONFIRMATION_TEMPLATE.id]: PAYMENT_CONFIRMATION_TEMPLATE,
  [SERVICE_RESTORED_TEMPLATE.id]: SERVICE_RESTORED_TEMPLATE,
  [SERVICE_SUSPENSION_TEMPLATE.id]: SERVICE_SUSPENSION_TEMPLATE,
  [SERVICE_CANCELLATION_TEMPLATE.id]: SERVICE_CANCELLATION_TEMPLATE,
  [SUSPENDED_PLUS_TEN_TEMPLATE.id]: SUSPENDED_PLUS_TEN_TEMPLATE,
  [PAYMENT_COMMITMENT_TEMPLATE.id]: PAYMENT_COMMITMENT_TEMPLATE,
};

type TemplateCardProps = {
  title: string;
  isEditable?: boolean;
  onClick?: () => void;
};

function TemplateCard({ title, isEditable = false, onClick }: TemplateCardProps) {
  const content = (
    <>
      <div className="flex min-h-[190px] items-center justify-center px-6 py-10">
        <WhatsAppIcon />
      </div>
      <div className="flex min-h-[58px] items-center justify-center bg-[#28c79a] px-3 py-3 text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.01em] text-white">
          {title}
        </span>
      </div>
    </>
  );

  if (isEditable) {
    return (
      <button
        type="button"
        className="overflow-hidden rounded-[12px] border border-[#59d638] bg-white text-left transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28c79a] focus-visible:ring-offset-2"
        onClick={onClick}
        aria-label={`Abrir plantilla ${title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#59d638] bg-white">
      {content}
    </article>
  );
}

function WhatsAppIcon() {
  return (
    <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#eef8ee] shadow-[0_10px_18px_rgba(0,0,0,0.08)]">
      <div className="translate-x-[1px] translate-y-[1px]">
        <svg
          viewBox="0 0 64 64"
          className="h-[56px] w-[56px]"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="32" cy="32" r="26" fill="#4ac959" />
          <path
            fill="#ffffff"
            d="M31.7 15.2c-9.5 0-17.2 7.7-17.2 17.2 0 3 0.8 5.9 2.3 8.5l-2.5 9.1 9.3-2.4c2.5 1.4 5.2 2.1 8 2.1 9.5 0 17.2-7.7 17.2-17.2S41.2 15.2 31.7 15.2Zm0 31.6c-2.5 0-4.9-0.7-7-2l-0.5-0.3-5.5 1.4 1.5-5.3-0.3-0.5a13.8 13.8 0 1 1 11.8 6.7Zm7.8-10.3c-0.4-0.2-2.6-1.3-3-1.4-0.4-0.2-0.7-0.2-0.9 0.2l-1.2 1.4c-0.2 0.3-0.5 0.3-0.9 0.1-2.4-1.2-4.5-3-6-5.3-0.2-0.4 0-0.6 0.2-0.9l0.8-0.9c0.2-0.2 0.3-0.4 0.4-0.7 0.1-0.2 0-0.5-0.1-0.7-0.1-0.2-0.9-2.3-1.3-3.1-0.3-0.8-0.7-0.7-0.9-0.7h-0.8c-0.3 0-0.8 0.1-1.2 0.5-0.4 0.4-1.6 1.6-1.6 3.9 0 2.3 1.7 4.6 2 4.9 0.2 0.3 3.3 5 8.1 6.9 1.1 0.5 2 0.7 2.8 0.9 1.2 0.4 2.2 0.3 3 0.2 0.9-0.1 2.6-1.1 3-2.2 0.4-1.1 0.4-2 0.3-2.2-0.2-0.1-0.5-0.2-0.9-0.4Z"
          />
          <path
            fill="#ffffff"
            d="M26.8 28.4c0.3-0.7 0.6-0.7 0.8-0.7 0.2 0 0.5 0 0.7 0 0.2 0 0.6-0.1 0.9 0.7 0.3 0.8 1 2.6 1.1 2.8 0.1 0.2 0.1 0.4 0 0.6-0.1 0.2-0.2 0.3-0.4 0.5l-0.5 0.6c-0.2 0.2-0.3 0.4-0.1 0.7 0.2 0.3 0.9 1.5 2 2.4 1.4 1.3 2.6 1.7 2.9 1.9 0.3 0.1 0.5 0.1 0.7-0.1l0.8-1c0.2-0.3 0.4-0.2 0.7-0.1 0.3 0.1 1.8 0.8 2.1 0.9 0.3 0.2 0.5 0.3 0.6 0.5 0.1 0.2 0.1 1-0.2 1.8-0.3 0.8-1.7 1.6-2.3 1.7-0.6 0.1-1.5 0.2-2.4-0.1-0.6-0.2-1.4-0.4-2.4-0.8-4.2-1.8-6.9-6-7.1-6.3-0.2-0.3-1.6-2.1-1.6-4 0-1.9 1-2.9 1.4-3.3Z"
            opacity="0.96"
          />
        </svg>
      </div>
    </div>
  );
}

export default function WspTemplatesManagement() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = useState<WspTemplateEditorData>(
    PAYMENT_REGISTRATION_TEMPLATE,
  );

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) {
      return null;
    }

    return EDITABLE_TEMPLATE_MAP[selectedTemplateId] ?? null;
  }, [selectedTemplateId]);

  function openTemplate(cardId: string) {
    const template = EDITABLE_TEMPLATE_MAP[cardId];

    if (!template) {
      return;
    }

    setTemplateDraft(template);
    setSelectedTemplateId(cardId);
  }

  function closeTemplateEditor() {
    setSelectedTemplateId(null);
  }

  function handleTemplateFieldChange(field: 'title' | 'content', value: string) {
    setTemplateDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSaveTemplate() {
    toast.success('Plantilla lista para conectarse con backend.');
    setSelectedTemplateId(null);
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-6 pt-[18px]">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">
            Plantilla WSP
          </h1>

          <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
            <span>Dashboard</span>
            <span>/</span>
            <span>Campaña</span>
            <span>/</span>
            <span className="text-[#1bc3dc]">Plantilla WSP</span>
          </div>
        </div>

        <section className="mb-5 overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
          <div className="px-4 py-3">
            <p className="text-[14px] text-[#1f2933]">Plantilla WSP</p>
          </div>
        </section>

        <section className="rounded-[2px] border border-[#d7dfe8] bg-white px-[34px] py-[46px] shadow-sm">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {WSP_TEMPLATE_CARDS.map((card) => (
              <TemplateCard
                key={card.id}
                title={card.title}
                isEditable={Boolean(EDITABLE_TEMPLATE_MAP[card.id])}
                onClick={
                  EDITABLE_TEMPLATE_MAP[card.id]
                    ? () => openTemplate(card.id)
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      </div>

      <Dialog
        open={selectedTemplate !== null}
        onOpenChange={(open) => !open && closeTemplateEditor()}
      >
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden border border-[#d7dfe8] bg-white p-0 sm:max-w-[520px]">
          <DialogHeader className="border-b border-[#d7dfe8] px-6 py-4">
            <DialogTitle className="text-[14px] font-semibold uppercase text-[#3a3a3a]">
              PLANTILLA WSP - {templateDraft.code}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[calc(92vh-132px)] overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[14px] font-medium uppercase text-[#4b5563]">
                  TITULO <span className="text-[#ef4444]">*</span>
                </span>
                <input
                  type="text"
                  value={templateDraft.title}
                  onChange={(event) =>
                    handleTemplateFieldChange('title', event.target.value)
                  }
                  className="h-[44px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[14px] text-[#374151] outline-none focus:border-[#9cc5ff]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[14px] font-medium uppercase text-[#4b5563]">
                  CONTENIDO <span className="text-[#ef4444]">*</span>
                </span>
                <textarea
                  value={templateDraft.content}
                  onChange={(event) =>
                    handleTemplateFieldChange('content', event.target.value)
                  }
                  rows={11}
                  className="min-h-[280px] w-full resize-none rounded-[4px] border border-[#d7dfe8] px-4 py-3 text-[14px] leading-7 text-[#374151] outline-none focus:border-[#9cc5ff]"
                />
              </label>

              <section>
                <h3 className="mb-3 text-[14px] font-semibold text-[#374151]">
                  Variables
                </h3>
                <ul className="space-y-1.5 pl-5 text-[14px] text-[#374151]">
                  {templateDraft.variables.map((variable) => (
                    <li key={variable.key} className="list-disc">
                      <span className="font-medium">{`{${variable.key}}`}</span>:{' '}
                      {variable.description}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <DialogFooter className="border-t border-[#d7dfe8] px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-[34px] rounded-[4px] border-[#d1d5db] px-5 text-[14px]"
              onClick={closeTemplateEditor}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              className="h-[34px] rounded-[4px] bg-[#3b82f6] px-5 text-[14px] text-white hover:bg-[#2563eb]"
              onClick={handleSaveTemplate}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
