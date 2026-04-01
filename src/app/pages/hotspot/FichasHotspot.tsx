import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  List,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  filterByCompany,
  formatDateForGrid,
  HOTSPOT_FICHAS,
  mikrosystemPageStyle,
  statusChipClass,
  wisphubPageStyle,
} from './hotspotData';

const fichasColumns = [
  'USUARIO/PIN',
  'CONTRASEÑA',
  'ROUTER',
  'PERFIL',
  'LÍMITE',
  'CREADO',
  'ACTIVADO',
  'ESTADO',
];

export default function FichasHotspot() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('31/03/2026');

  const fichas = useMemo(
    () => filterByCompany(HOTSPOT_FICHAS, user?.role, user?.companyId),
    [user?.companyId, user?.role],
  );

  const filteredFichas = fichas.filter((item) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.userPin.toLowerCase().includes(query) ||
      item.password.toLowerCase().includes(query) ||
      item.router.toLowerCase().includes(query) ||
      item.profile.toLowerCase().includes(query)
    );
  });

  const visibleFichas = filteredFichas.slice(0, pageSize);

  const pageStyle = isWispHub ? wisphubPageStyle : mikrosystemPageStyle;
  const panelClass = isWispHub
    ? 'mx-3 mb-5 border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white';
  const shellPadding = isWispHub ? 'px-5 py-5' : 'px-6 py-6';
  const controlClass = isWispHub
    ? 'h-[42px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#20324a] outline-none'
    : 'h-[48px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#394b60]'
    : 'inline-flex h-[48px] w-[48px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#394b60]';
  const actionButtonClass = isWispHub
    ? 'inline-flex h-[42px] items-center gap-2 rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] font-semibold text-[#2b3d51]'
    : 'inline-flex h-[48px] items-center gap-2 rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] font-semibold text-[#2b3d51]';
  const primaryButtonClass = isWispHub
    ? 'inline-flex h-[42px] items-center gap-2 rounded-[6px] border border-[#42b960] bg-[#45bf63] px-4 text-[14px] font-semibold text-white'
    : 'inline-flex h-[48px] items-center gap-2 rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] font-semibold text-[#1f2f43]';

  return (
    <div style={pageStyle}>
      {isWispHub ? (
        <header className="border-b border-[#d7dde5] px-3 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45bf63]">
                Hotspot
              </p>
              <h1 className="mt-2 text-[30px] font-semibold text-[#15263b]">
                Fichas Hotspot
              </h1>
            </div>
            <div className="text-right text-[13px] text-[#6d8093]">
              <span>Inicio</span>
              <span className="mx-2 text-[#b6c1cb]">/</span>
              <span className="font-semibold text-[#45bf63]">Fichas</span>
            </div>
          </div>
        </header>
      ) : (
        <div className="mb-6 flex items-center justify-between bg-[#1f2429] px-6 py-4">
          <h1 className="text-[18px] font-bold uppercase tracking-[0.03em] text-white">
            Fichas Hotspot
          </h1>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2c98f0] text-white"
            aria-label="Actualizar fichas hotspot"
            title="Actualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className={panelClass}>
        <div className={shellPadding}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-[6px] border border-[#d7dde5] bg-white">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className={`${controlClass} min-w-[58px] rounded-none border-0 border-r border-[#d7dde5] px-4`}
                  aria-label="Cantidad de fichas por página"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button
                  type="button"
                  className={`${iconButtonClass} rounded-none border-0 border-r border-[#d7dde5]`}
                  aria-label="Vista de lista"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`${iconButtonClass} rounded-none border-0`}
                  aria-label="Guardar configuración"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>

              <button type="button" className={actionButtonClass}>
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
              <button type="button" className={actionButtonClass}>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
              <button type="button" className={primaryButtonClass}>
                <Plus className="h-4 w-4" />
                Nuevo
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 xl:max-w-[760px] xl:flex-row xl:items-center xl:justify-end">
              <div className="flex min-w-0 flex-1 overflow-hidden rounded-[6px] border border-[#d7dde5] bg-white">
                <input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={`${controlClass} min-w-0 flex-1 rounded-none border-0`}
                  placeholder="01/03/2026"
                  aria-label="Fecha inicial"
                />
                <span className="flex items-center border-x border-[#d7dde5] bg-[#d0d6dc] px-4 text-[14px] font-semibold text-[#38485b]">
                  al
                </span>
                <input
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={`${controlClass} min-w-0 flex-1 rounded-none border-0`}
                  placeholder="31/03/2026"
                  aria-label="Fecha final"
                />
                <button
                  type="button"
                  className={`${iconButtonClass} rounded-none border-0 border-l border-[#d7dde5]`}
                  aria-label="Abrir calendario"
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
              </div>

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={`${controlClass} w-full xl:max-w-[360px]`}
                placeholder="Buscar..."
                aria-label="Buscar ficha hotspot"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="overflow-hidden border border-[#d7dde5] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
                <thead>
                  <tr className="bg-white">
                    <th className="w-[54px] border-b border-r border-[#d7dde5] px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" aria-label="Seleccionar todas las fichas" />
                      </div>
                    </th>
                    {fichasColumns.map((column) => (
                      <th
                        key={column}
                        className="border-b border-r border-[#d7dde5] px-4 py-3 text-left text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{column}</span>
                          <ChevronsUpDown className="h-4 w-4 text-[#c3ccd6]" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleFichas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={fichasColumns.length + 1}
                        className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]"
                      >
                        Ningún registro disponible
                      </td>
                    </tr>
                  ) : (
                    visibleFichas.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                          <input type="checkbox" aria-label={`Seleccionar ficha ${item.userPin}`} />
                        </td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{item.userPin}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{item.password}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{item.router}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{item.profile}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{item.limit}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                          {formatDateForGrid(item.createdAt)}
                        </td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                          {formatDateForGrid(item.activatedAt)}
                        </td>
                        <td className="border-b border-[#d7dde5] px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${statusChipClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[16px] text-[#667b92]">
            <div>
              {filteredFichas.length === 0
                ? 'Mostrando 0 registros'
                : `Mostrando de 1 a ${visibleFichas.length} de un total de ${filteredFichas.length}`}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#8091a4]"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {filteredFichas.length > 0 && (
                <button
                  type="button"
                  className={`flex h-[48px] w-[48px] items-center justify-center rounded-[6px] font-semibold ${
                    isWispHub ? 'bg-[#45bf63] text-white' : 'bg-[#3f93e7] text-white'
                  }`}
                >
                  1
                </button>
              )}
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#8091a4]"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {isWispHub && (
        <div className="mx-3 mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-[#d7dde5] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf8ef] text-[#45bf63]">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.12em] text-[#7a8c9f]">Total</p>
                <p className="text-[24px] font-semibold text-[#15263b]">{fichas.length}</p>
              </div>
            </div>
          </div>
          <div className="border border-[#d7dde5] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#7a8c9f]">Rango</p>
            <p className="mt-2 text-[18px] font-semibold text-[#15263b]">{startDate}</p>
            <p className="text-[14px] text-[#6d8093]">hasta {endDate}</p>
          </div>
          <div className="border border-[#d7dde5] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#7a8c9f]">Busqueda</p>
            <p className="mt-2 text-[18px] font-semibold text-[#15263b]">
              {searchTerm ? `"${searchTerm}"` : 'Sin filtros activos'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
