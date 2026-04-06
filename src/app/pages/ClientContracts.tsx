import { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Gauge,
  List,
  Save,
} from 'lucide-react';
import { useViewTheme } from '../context/ViewThemeContext';
import { HorizontalScrollRail } from './network/networkManagementShared';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './network/networkManagementData';

type ContractsTab = 'resumen' | 'contratos';

type ContractRecord = {
  number: string;
  externalNumber: string;
  client: string;
  title: string;
  createdAt: string;
  startAt: string;
  endAt: string;
  duration: string;
  signed: string;
  status: string;
  zone: string;
};

const contractColumns = [
  'N°',
  'N° EXTERNO',
  'CLIENTE',
  'TITULO',
  'CREADO',
  'INICIO',
  'FINALIZA',
  'DURACION',
  'FIRMADO',
  'ESTADO',
] as const;

const mockContracts: ContractRecord[] = [];

const summaryCards = [
  {
    title: 'EN ESPERA',
    value: '0',
    helper: 'Esperando firma del cliente',
    cardClass:
      'bg-[linear-gradient(135deg,#ffb347_0%,#f79400_100%)] text-white',
    accentClass: 'bg-white/10',
  },
  {
    title: 'ACTIVOS',
    value: '0',
    helper: 'Contratos Firmados',
    cardClass:
      'bg-[linear-gradient(135deg,#1ecad0_0%,#0ea0a5_100%)] text-white',
    accentClass: 'bg-white/10',
  },
  {
    title: 'ANULADOS',
    value: '0',
    helper: 'Contratos anulados',
    cardClass:
      'bg-[linear-gradient(135deg,#ff8a8a_0%,#ff4747_100%)] text-white',
    accentClass: 'bg-white/10',
  },
  {
    title: 'FINALIZADOS',
    value: '0',
    helper: 'Contratos finalizados',
    cardClass:
      'bg-[linear-gradient(135deg,#1d1d1d_0%,#050505_100%)] text-[#f8d7ae]',
    accentClass: 'bg-white/10',
  },
] as const;

export default function ClientContracts() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [activeTab, setActiveTab] = useState<ContractsTab>('resumen');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Cualquiera');
  const [zoneFilter, setZoneFilter] = useState('Cualquiera');

  const pageStyle = isWispHub ? wisphubPageStyle : mikrosystemPageStyle;
  const panelClass = isWispHub
    ? 'border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]';
  const controlClass = isWispHub
    ? 'h-[46px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#b9c4d0]'
    : 'h-[50px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8]';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[46px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#405365]'
    : 'inline-flex h-[50px] w-[56px] items-center justify-center rounded-[4px] border border-[#cdd8e4] bg-white text-[#405365]';
  const tabActiveClass = isWispHub
    ? 'bg-white text-[#45bf63] shadow-[0_-1px_0_rgba(15,23,42,0.04)]'
    : 'bg-[#3a8dde] text-white shadow-[0_-1px_0_rgba(15,23,42,0.04)]';
  const tabInactiveClass = isWispHub ? 'text-[#7a8da2]' : 'text-[#6c8097]';

  const filteredContracts = useMemo(() => {
    return mockContracts.filter((contract) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        Object.values(contract).some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesStatus =
        statusFilter === 'Cualquiera' || contract.status === statusFilter;
      const matchesZone =
        zoneFilter === 'Cualquiera' || contract.zone === zoneFilter;

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [searchTerm, statusFilter, zoneFilter]);

  const visibleContracts = filteredContracts.slice(0, pageSize);

  return (
    <div style={pageStyle}>
      <section className={`relative pt-[50px] ${panelClass}`}>
        <div className="absolute left-6 top-0 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('resumen')}
            className={`inline-flex h-[50px] items-center gap-2 rounded-t-[8px] px-6 text-[16px] font-semibold ${
              activeTab === 'resumen' ? tabActiveClass : tabInactiveClass
            }`}
          >
            <Gauge className="h-5 w-5" />
            Resumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contratos')}
            className={`inline-flex h-[50px] items-center gap-2 rounded-t-[8px] px-6 text-[16px] font-semibold ${
              activeTab === 'contratos' ? tabActiveClass : tabInactiveClass
            }`}
          >
            <FileSpreadsheet className="h-5 w-5" />
            Contratos
          </button>
        </div>

        <div className="border-b border-[#d7dde5] px-3 py-4" />

        {activeTab === 'resumen' ? (
          <div className="px-6 py-6">
            <div className="grid gap-4 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.title}
                  className={`relative overflow-hidden rounded-[6px] px-5 py-5 ${card.cardClass}`}
                >
                  <div
                    className={`absolute -bottom-6 right-4 h-36 w-36 rounded-full ${card.accentClass}`}
                  />
                  <div
                    className={`absolute right-16 top-10 h-10 w-10 rotate-45 rounded-[10px] ${card.accentClass}`}
                  />
                  <p className="relative text-[14px] uppercase">{card.title}</p>
                  <p className="relative mt-3 text-[38px] font-semibold leading-none">
                    {card.value}
                  </p>
                  <p className="relative mt-8 text-[16px]">{card.helper}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 grid gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
              <section className="rounded-[6px] bg-black px-7 py-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold">Resumen 2026</h2>
                    <p className="mt-1 text-[16px] text-[#9bb7da]">
                      Contratos Activos/Finalizados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[44px] font-semibold leading-none">0</p>
                    <p className="mt-2 text-[16px] text-[#9bb7da]">Total Contratos</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_300px]">
                  <div className="relative min-h-[360px]">
                    <div className="absolute inset-x-10 top-2 flex flex-col gap-[72px] text-[18px] text-white/90">
                      <span>1</span>
                      <span>0.75</span>
                      <span>0.5</span>
                      <span>0.25</span>
                      <span>0</span>
                    </div>

                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="absolute left-20 right-4 border-t border-white/35"
                        style={{ top: `${56 + index * 74}px` }}
                      />
                    ))}

                    <div className="absolute bottom-7 left-20 right-6">
                      <div className="relative h-[2px] bg-[#55bdf4]">
                        {Array.from({ length: 12 }, (_, index) => (
                          <span
                            key={index}
                            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#d8efff] bg-[#55bdf4]"
                            style={{ left: `calc(${index} * (100% / 11))` }}
                          />
                        ))}
                      </div>
                      <div className="mt-4 text-[18px] text-white">Ene</div>
                    </div>

                    <div className="absolute bottom-16 left-0 rounded-[16px] border-4 border-white/80 bg-[#d4d4d4]/80 px-4 py-3 text-[#6e9fd6]">
                      <div>Inician Contrato: 0</div>
                      <div className="mt-2">Finalizan Contrato: 0</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-[28px] font-semibold text-[#00c4ec]">
                      Activos
                    </h3>
                    <p className="mt-1 text-[24px] text-[#00c4ec]">0</p>
                    <div className="mt-10 h-9 w-2 rounded-full bg-white" />
                    <div className="mt-8 space-y-3 text-left text-[14px] text-[#a6c4e7]">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full bg-[#00c4ec]" />
                        <span>Activos :0%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full bg-[#9bc9ff]" />
                        <span>En espera: 0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[6px] bg-black text-white">
                <div className="bg-[#20252a] px-6 py-4 text-[18px] font-semibold">
                  Próximos a finalizar
                </div>
                <table className="min-w-full border-collapse text-[14px]">
                  <thead>
                    <tr className="border-b border-white/35 text-[#6aa7ff]">
                      <th className="px-6 py-4 text-left">#</th>
                      <th className="px-6 py-4 text-left">Cliente</th>
                      <th className="px-6 py-4 text-left">Finaliza</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-[16px]">
                        Sin registros
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="px-4 pb-4">
                  <HorizontalScrollRail />
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex overflow-hidden rounded-[4px] border border-[#cdd8e4] bg-white">
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className={`${controlClass} min-w-[56px] rounded-none border-0 border-r border-[#cdd8e4] px-4`}
                    aria-label="Cantidad de registros"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button
                    type="button"
                    className={`${iconButtonClass} rounded-none border-0 border-r border-[#cdd8e4]`}
                    aria-label="Vista lista"
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className={`${iconButtonClass} rounded-none border-0`}
                    aria-label="Guardar configuracion"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1.5 text-[11px] uppercase tracking-[0.08em] text-[#ff7f4e]">
                      Estado
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className={`${controlClass} min-w-[140px] pt-4`}
                    >
                      <option value="Cualquiera">Cualquiera</option>
                      <option value="Activo">Activo</option>
                      <option value="En espera">En espera</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Anulado">Anulado</option>
                    </select>
                  </label>

                  <label className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1.5 text-[11px] uppercase tracking-[0.08em] text-[#ffb14e]">
                      Zona
                    </span>
                    <select
                      value={zoneFilter}
                      onChange={(event) => setZoneFilter(event.target.value)}
                      className={`${controlClass} min-w-[180px] pt-4`}
                    >
                      <option value="Cualquiera">Cualquiera</option>
                      <option value="Norte">Norte</option>
                      <option value="Centro">Centro</option>
                      <option value="Sur">Sur</option>
                    </select>
                  </label>
                </div>
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-[50px] min-w-[280px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8] xl:min-w-[390px]"
                placeholder="Buscar..."
                aria-label="Buscar contratos"
              />
            </div>

            <div className="mt-6 overflow-hidden border border-[#d7dde5] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-[14px] text-[#31465d]">
                  <thead>
                    <tr className="bg-white">
                      {contractColumns.map((header) => (
                        <th
                          key={header}
                          className="border-b border-r border-[#d7dde5] px-4 py-4 text-left text-[13px] font-semibold uppercase text-[#3f4b57] last:border-r-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{header}</span>
                            <div className="flex flex-col gap-[2px] text-[#c4ccd5]">
                              <span className="h-0 w-0 border-b-[5px] border-x-[5px] border-b-current border-x-transparent" />
                              <span className="h-0 w-0 border-t-[5px] border-x-[5px] border-t-current border-x-transparent" />
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="w-[40px] border-b px-3 py-4 text-[#c4ccd5]">
                        <div className="flex flex-col items-center gap-[2px]">
                          <span className="h-0 w-0 border-b-[5px] border-x-[5px] border-b-current border-x-transparent" />
                          <span className="h-0 w-0 border-t-[5px] border-x-[5px] border-t-current border-x-transparent" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleContracts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={contractColumns.length + 1}
                          className="border-b border-[#d7dde5] bg-[#f6f7f9] px-4 py-8 text-center text-[16px] text-[#495b70]"
                        >
                          Ningún registro disponible
                        </td>
                      </tr>
                    ) : (
                      visibleContracts.map((contract) => (
                        <tr key={contract.number} className="bg-white">
                          <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                            {contract.number}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-[16px] font-semibold text-[#6c8097]">
              <span>
                {filteredContracts.length === 0
                  ? 'Mostrando 0 registros'
                  : `Mostrando ${Math.min(filteredContracts.length, pageSize)} registros`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-[48px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#a8b5c4]"
                  aria-label="Pagina anterior"
                >
                  <span className="h-0 w-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-current" />
                </button>
                <button
                  type="button"
                  className="flex h-[48px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#9cadbe]"
                  aria-label="Pagina siguiente"
                >
                  <span className="h-0 w-0 border-y-[8px] border-y-transparent border-l-[10px] border-l-current" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
