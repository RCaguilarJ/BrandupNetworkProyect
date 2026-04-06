import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  List,
  Save,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';

const columns = [
  'N° FACTURA',
  'CLIENTE',
  'PUNTO VENTA',
  'CAE',
  'EMITIDO',
  'VENCIMIENTO',
  'TOTAL',
  'ESTADO',
  'ACCIONES',
];

export default function BillingAfip() {
  const { viewTheme } = useViewTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('01/04/2026');
  const [endDate, setEndDate] = useState('30/04/2026');
  const [statusFilter, setStatusFilter] = useState('cualquiera');

  if (viewTheme === 'wisphub') {
    return (
      <div className="min-h-full border-t-4 border-[#45bf63] bg-white px-3 pt-6 pb-7 [font-family:Trebuchet_MS,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
        <div className="mb-6 flex items-center gap-3 border-b border-[#d7dde5] pb-5">
          <FileText className="h-8 w-8 text-[#45bf63]" />
          <h1 className="text-[2rem] font-semibold text-[#13253c]">Facturas AFIP</h1>
        </div>
        <div className="border border-[#d7dde5] bg-white p-4 text-[13px] text-[#6f8293]">
          Vista WispHub disponible. La paridad fina se esta concentrando en Mikrosystem.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#dbe6f2] px-6 pt-[18px] pb-7 text-[#25364b] [font-family:Open_Sans,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-[21px] font-normal text-[#24364b]">Facturas AFIP</h1>
        <div className="pt-1 text-[12px] text-[#3d6fb5]">
          <span className="text-[#5f738a]">Inicio</span>
          <span className="mx-1">/</span>
          <span>facturas-afip</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[4px] border border-[#d6dee8] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#dbe3ec] px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-8 w-[106px] rounded-l border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              />
              <span className="inline-flex h-8 items-center border-y border-[#cfd7e2] bg-[#e8edf3] px-3 text-[12px] text-[#51657d]">
                al
              </span>
              <input
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-8 w-[106px] rounded-r border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-[12px] text-[#51657d]">
              <span>Estado</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-8 min-w-[150px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                <option value="cualquiera">Cualquiera</option>
                <option value="emitida">Emitida</option>
                <option value="anulada">Anulada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </label>

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sincronizar
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select disabled className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none">
                <option>15</option>
              </select>
              <button type="button" className="inline-flex h-8 w-10 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[12px] text-[#24364b]">
                <List className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="inline-flex h-8 w-10 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[12px] text-[#24364b]">
                <Save className="h-3.5 w-3.5" />
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
            <table className="w-full min-w-[1080px] border-collapse text-[12px] text-[#24364b]">
              <thead>
                <tr className="bg-white">
                  {columns.map((column) => (
                    <th key={column} className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">
                      <div className="flex items-center justify-between gap-2">
                        <span>{column}</span>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="border border-[#d7e0ea] px-4 py-10 text-center text-[13px] text-[#7d8da1]">
                    Ningun registro disponible
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#51657d]">
            <div>Mostrando 0 registros</div>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" disabled className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
