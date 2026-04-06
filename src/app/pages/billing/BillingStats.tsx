import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Expand,
  List,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';

type MonthlySummary = {
  month: string;
  charged: string;
  commission: string;
  income: string;
  expenses: string;
  operations: string;
  gross: string;
  net: string;
};

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const monthlyRows: MonthlySummary[] = months.map((month) => ({
  month,
  charged: '0.00',
  commission: '0.00',
  income: '0.00',
  expenses: '0.00',
  operations: '0',
  gross: '0.00',
  net: '0.00',
}));

const chartScale = ['MX$ 1', 'MX$ 0.75', 'MX$ 0.5', 'MX$ 0.25', 'MX$ 0'];
const WISPHUB_FONT =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

const wisphubStyles = {
  page: {
    minHeight: '100%',
    background:
      'radial-gradient(circle at top right, rgba(69, 191, 99, 0.08), transparent 28%), #ffffff',
    borderTop: '4px solid #45bf63',
    color: '#17273d',
    fontFamily: WISPHUB_FONT,
    paddingBottom: '32px',
  } satisfies CSSProperties,
  header: {
    borderBottom: '1px solid #d7dde5',
    padding: '22px 12px 18px',
    marginBottom: '20px',
  } satisfies CSSProperties,
  card: {
    margin: '0 12px 18px',
    border: '1px solid #d7dde5',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
  } satisfies CSSProperties,
  input: {
    height: '38px',
    border: '1px solid #cfd6df',
    backgroundColor: '#ffffff',
    padding: '0 12px',
    color: '#20324a',
    fontFamily: WISPHUB_FONT,
    fontSize: '12px',
  } satisfies CSSProperties,
} as const;

const mikrosystemStyles = {
  page: {
    minHeight: '100%',
    backgroundColor: '#d9e7f3',
    padding: '18px 22px 26px',
    color: '#223448',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  } satisfies CSSProperties,
  card: {
    border: '1px solid #d5dde7',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 0 rgba(15, 23, 42, 0.04)',
  } satisfies CSSProperties,
  header: {
    backgroundColor: '#202833',
    color: '#ffffff',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  input: {
    height: '42px',
    border: '1px solid #d5dde7',
    backgroundColor: '#ffffff',
    padding: '0 12px',
    color: '#223448',
    fontSize: '13px',
  } satisfies CSSProperties,
} as const;

function EmptyChart({
  variant,
}: {
  variant: 'wisphub' | 'mikrosystem';
}) {
  const isWispHub = variant === 'wisphub';

  return (
    <div
      className={`grid gap-3 ${
        isWispHub ? 'lg:grid-cols-[84px_minmax(0,1fr)]' : 'lg:grid-cols-[92px_minmax(0,1fr)]'
      }`}
    >
      <div className="space-y-8 pt-2">
        {chartScale.map((label) => (
          <div
            key={label}
            className={`text-right text-[13px] ${
              isWispHub ? 'font-semibold text-[#6b7e90]' : 'text-[#7d8ea3]'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="relative min-h-[280px]">
        <div className="absolute inset-0">
          {chartScale.map((label, index) => (
            <div
              key={label}
              className={`absolute left-0 right-0 border-t ${
                isWispHub ? 'border-[#e1ece3]' : 'border-[#dbe3ec]'
              }`}
              style={{
                top: `${(index / (chartScale.length - 1)) * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative flex h-full items-end justify-between gap-2 px-4 pt-3">
          {months.map((month) => (
            <div
              key={month}
              className={`flex h-full flex-1 items-end justify-center pb-3 ${
                isWispHub ? 'text-[#708499]' : 'text-[#8394a8]'
              }`}
            >
              <span
                className={`origin-bottom-left whitespace-nowrap text-[13px] ${
                  isWispHub ? '-rotate-[55deg]' : '-rotate-90'
                }`}
              >
                {month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsTable({
  variant,
  searchTerm,
  setSearchTerm,
  pageSize,
  setPageSize,
}: {
  variant: 'wisphub' | 'mikrosystem';
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  pageSize: string;
  setPageSize: (value: string) => void;
}) {
  const isWispHub = variant === 'wisphub';

  return (
    <section
      className={`overflow-hidden border ${
        isWispHub
          ? 'border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
          : 'border-[#d5dde7] bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 border-b border-[#e1e7ef] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-[6px] border border-[#d7dde5]">
            <button
              type="button"
              className={`inline-flex h-[42px] min-w-[58px] items-center justify-center border-r border-[#d7dde5] text-[18px] font-semibold ${
                isWispHub ? 'bg-[#f9fcf9] text-[#223448]' : 'bg-white text-[#223448]'
              }`}
            >
              {pageSize}
            </button>
            <button
              type="button"
              className="inline-flex h-[42px] w-[56px] items-center justify-center border-r border-[#d7dde5] bg-white text-[#3d556d]"
              title="Ver listado"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-[42px] w-[56px] items-center justify-center bg-white text-[#3d556d]"
              title="Guardar vista"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <select
              aria-label="Cantidad de registros por página"
              title="Cantidad de registros por página"
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value)}
              className="h-[42px] w-full appearance-none rounded-[6px] border border-[#d7dde5] bg-white pl-3 pr-10 text-[13px] text-[#223448] outline-none"
            >
              <option value="15">15 registros</option>
              <option value="25">25 registros</option>
              <option value="50">50 registros</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
          </div>
        </div>

        <div className="relative w-full lg:max-w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa8b8]" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar..."
            className="h-[42px] w-full rounded-[6px] border border-[#d7dde5] bg-white pl-10 pr-4 text-[13px] text-[#223448] outline-none placeholder:text-[#a8b4c2]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr
              className={`text-left ${
                isWispHub ? 'bg-[#f4fbf6] text-[#1d3045]' : 'bg-white text-[#223448]'
              }`}
            >
              <th className="w-[50px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                <div className="flex items-center gap-1">
                  #
                  <ChevronsUpDown className="h-3.5 w-3.5 text-[#4991e6]" />
                </div>
              </th>
              <th className="min-w-[160px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Mes
              </th>
              <th className="min-w-[130px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Cobrado
              </th>
              <th className="min-w-[140px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Comision
              </th>
              <th className="min-w-[140px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Ingresos
              </th>
              <th className="min-w-[140px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Egresos
              </th>
              <th className="min-w-[140px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Total Op.
              </th>
              <th className="min-w-[120px] border-b border-r border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Bruto
              </th>
              <th className="min-w-[120px] border-b border-[#dbe3ec] px-3 py-3 text-[14px] font-semibold">
                Neto
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyRows.map((row, index) => (
              <tr
                key={row.month}
                className={
                  isWispHub
                    ? index % 2 === 0
                      ? 'bg-white'
                      : 'bg-[#f7fbf8]'
                    : index % 2 === 0
                      ? 'bg-[#eef2f6]'
                      : 'bg-white'
                }
              >
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {index + 1}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.month}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.charged}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.commission}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.income}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.expenses}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.operations}
                </td>
                <td className="border-b border-r border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.gross}
                </td>
                <td className="border-b border-[#dbe3ec] px-3 py-3 text-[13px] text-[#24364b]">
                  {row.net}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-[14px] font-semibold text-[#69809a]">
          Mostrando de 1 al 12 de un total de 12
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#7a8fa3]"
            title="Pagina anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={`inline-flex h-[44px] min-w-[44px] items-center justify-center rounded-[6px] px-4 text-[18px] font-semibold text-white ${
              isWispHub ? 'bg-[#45bf63]' : 'bg-[#4991e6]'
            }`}
          >
            1
          </button>
          <button
            type="button"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#7a8fa3]"
            title="Pagina siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function BillingStats() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [router, setRouter] = useState('Todos los Router');
  const [year, setYear] = useState('2026');
  const [pageSize, setPageSize] = useState('15');
  const [searchTerm, setSearchTerm] = useState('');

  if (isWispHub) {
    return (
      <div style={wisphubStyles.page}>
        <header style={wisphubStyles.header}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45bf63]">
                Facturacion
              </p>
              <h1 className="mt-2 text-[30px] font-semibold leading-none text-[#15263b]">
                Resumen de transacciones
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#4e637c]"
                title="Expandir"
              >
                <Expand className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#4e637c]"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section style={wisphubStyles.card}>
          <div className="grid gap-5 border-b border-[#e1e7ef] px-5 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.6fr)]">
            <div>
              <label
                htmlFor="billing-stats-router-wisphub"
                className="mb-2 block text-[13px] font-semibold text-[#48617c]"
              >
                Router
              </label>
              <div className="relative">
                <select
                  id="billing-stats-router-wisphub"
                  aria-label="Router"
                  title="Router"
                  value={router}
                  onChange={(event) => setRouter(event.target.value)}
                  style={wisphubStyles.input}
                  className="w-full appearance-none rounded-[6px] pr-10"
                >
                  <option>Todos los Router</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div>
              <label
                htmlFor="billing-stats-year-wisphub"
                className="mb-2 block text-[13px] font-semibold text-[#48617c]"
              >
                Año
              </label>
              <div className="relative">
                <select
                  id="billing-stats-year-wisphub"
                  aria-label="Año"
                  title="Año"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  style={wisphubStyles.input}
                  className="w-full appearance-none rounded-[6px] pr-10"
                >
                  <option>2026</option>
                  <option>2025</option>
                  <option>2024</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>
          </div>

          <div className="px-5 py-6">
            <EmptyChart variant="wisphub" />
          </div>
        </section>

        <div className="px-0">
          <StatsTable
            variant="wisphub"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={mikrosystemStyles.page}>
      <section style={mikrosystemStyles.card}>
        <header style={mikrosystemStyles.header}>
          <div className="flex items-center justify-between gap-4">
            <span>Resumen de transacciones</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#3d556d]"
                title="Expandir"
              >
                <Expand className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#3d556d]"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 px-5 py-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)]">
            <div>
              <label
                htmlFor="billing-stats-router-mikrosystem"
                className="mb-2 block text-[13px] text-[#31465d]"
              >
                Router
              </label>
              <div className="relative">
                <select
                  id="billing-stats-router-mikrosystem"
                  aria-label="Router"
                  title="Router"
                  value={router}
                  onChange={(event) => setRouter(event.target.value)}
                  style={mikrosystemStyles.input}
                  className="w-full appearance-none rounded-[6px] pr-10"
                >
                  <option>Todos los Router</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div>
              <label
                htmlFor="billing-stats-year-mikrosystem"
                className="mb-2 block text-[13px] text-[#31465d]"
              >
                Año
              </label>
              <div className="relative">
                <select
                  id="billing-stats-year-mikrosystem"
                  aria-label="Año"
                  title="Año"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  style={mikrosystemStyles.input}
                  className="w-full appearance-none rounded-[6px] pr-10"
                >
                  <option>2026</option>
                  <option>2025</option>
                  <option>2024</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>
          </div>

          <EmptyChart variant="mikrosystem" />

          <StatsTable
            variant="mikrosystem"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </div>
      </section>
    </div>
  );
}
