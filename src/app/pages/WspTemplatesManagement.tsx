import { type WspTemplateCard } from '../types';

const WSP_TEMPLATE_CARDS: WspTemplateCard[] = [
  { id: 'payment-registration', title: 'CONFIRMACIÓN DE REGISTRO DE PAGO' },
  { id: 'technical-support', title: 'SOPORTE TECNICO' },
  { id: 'pending-payment', title: 'PAGO PENDIENTE' },
  { id: 'payment-confirmation', title: 'CONFIRMACIÓN DE PAGO' },
  { id: 'service-restored', title: 'RESTABLECIMIENTO DE SU SERVICIO' },
  { id: 'service-suspension', title: 'SUSPENSIÓN DE SERVICIO POR FALTA DE PAGO' },
  { id: 'service-cancelled', title: 'CONFIRMACIÓN DE CANCELACIÓN DE SERVICIO' },
  { id: 'suspended-plus-10', title: '+10 DÍAS SUSPENDIDOS*' },
  { id: 'suspended-10', title: '10 DÍAS SUSPEDIDOS' },
  { id: 'payment-commitment', title: 'COMPROMISO DE PAGO' },
];

function TemplateCard({ title }: { title: string }) {
  return (
    <article className="overflow-hidden rounded-[12px] border border-[#59d638] bg-white">
      <div className="flex min-h-[190px] items-center justify-center px-6 py-10">
        <WhatsAppIcon />
      </div>
      <div className="flex min-h-[58px] items-center justify-center bg-[#28c79a] px-3 py-3 text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.01em] text-white">
          {title}
        </span>
      </div>
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
  return (
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
            <TemplateCard key={card.id} title={card.title} />
          ))}
        </div>
      </section>
    </div>
  );
}
