import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  List,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import { TicketFormModal } from '../../components/forms/TicketFormModal';
import { ServiceProcessingDialog } from '../services/serviceShared';
import { useTicketCreationFlow } from '../services/serviceShared';
import { MOCK_CLIENTS } from '../../data/mockData';

const mikrosystemTicketColumns = [
  'N°',
  'DEPARTAMENTO',
  'REMITENTE',
  'ASUNTO',
  'TÉCNICO',
  'FECHA',
  'FECHA VISITA',
  'COORDENADAS',
  'ESTADO',
  'UBICACIÓN',
  'DIRECCIÓN',
  'TELÉFONO',
  'F. CERRADO',
  'ABIERTO POR',
  'ÚLTIMA RSPTA.',
];

const mikrosystemPageClassName =
  'min-h-full bg-[#dbe6f2] px-6 pt-[18px] pb-7 text-[#25364b] [font-family:Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';
const mikrosystemPanelClassName =
  'overflow-hidden rounded-[4px] border border-[#d6dee8] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]';

export default function OverdueTickets() {
  const { viewTheme } = useViewTheme();
  const ticketFlow = useTicketCreationFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(viewTheme === 'wisphub' ? 10 : 15);
  const [tickets, setTickets] = useState<any[]>([]);

  const handleCreateTicket = (data: any) => {
    const newTicket = {
      id: String(tickets.length + 1),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  if (viewTheme === 'wisphub') {
    return (
      <div className="min-h-full border-t-4 border-[#45bf63] bg-white px-3 pt-6 pb-7 [font-family:Trebuchet_MS,Segoe_UI,Tahoma,Geneva,sans-serif]">
        <div className="mb-6 flex items-center gap-3 border-b border-[#d7dde5] pb-5">
          <Clock3 className="h-8 w-8 text-[#45bf63]" />
          <h1 className="text-[2rem] font-semibold text-[#13253c]">Tickets respondidos</h1>
        </div>
        <div className="border border-[#d7dde5] bg-white p-4 text-[13px] text-[#6f8293]">
          Vista WispHub disponible. La paridad fina se está concentrando en Mikrosystem.
        </div>
      </div>
    );
  }

  return (
    <div className={mikrosystemPageClassName}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-[21px] font-normal text-[#24364b]">Ticket respondidos</h1>
        <div className="pt-1 text-[12px] text-[#3d6fb5]">
          <span className="text-[#5f738a]">Inicio</span>
          <span className="mx-1">/</span>
          <span>soporte</span>
        </div>
      </div>

      <section className={mikrosystemPanelClassName}>
        <header
          className="flex items-center justify-between gap-3 bg-[#f59c1a] px-4 py-[10px] text-[14px] font-semibold text-white"
        >
          <span>Lista de Ticket respondidos</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pageSize}
                disabled
                className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                <option value={15}>{pageSize}</option>
              </select>

              <button
                type="button"
                className="inline-flex h-8 w-10 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[12px] text-[#24364b]"
              >
                <List className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={ticketFlow.openSequence}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nuevo</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar..."
                className="h-8 w-[260px] rounded border border-[#cfd7e2] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa8b7]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1620px] border-collapse text-[12px] text-[#24364b]">
              <thead>
                <tr className="bg-white">
                  {mikrosystemTicketColumns.map((column) => (
                    <th
                      key={column}
                      className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column}</span>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                      </div>
                    </th>
                  ))}
                  <th className="w-[88px] border border-[#d7e0ea] px-3 py-2 text-left font-semibold">
                    <div className="flex items-center justify-between gap-2">
                      <span>ACCIONES</span>
                      <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={mikrosystemTicketColumns.length + 1}
                    className="border border-[#d7e0ea] px-4 py-10 text-center text-[13px] text-[#7d8da1]"
                  >
                    Ningún registro disponible
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#51657d]">
            <div>Mostrando 0 registros</div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <ServiceProcessingDialog open={ticketFlow.processingOpen} />

      <TicketFormModal
        open={ticketFlow.formOpen}
        onClose={ticketFlow.closeAll}
        onSubmit={handleCreateTicket}
        clients={MOCK_CLIENTS}
      />
    </div>
  );
}
