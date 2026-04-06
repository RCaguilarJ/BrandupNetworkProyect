import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  Download,
  List,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';

type TransactionColumn = {
  key: string;
  title: string;
  placeholder: string;
};

const WISPHUB_FONT = '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, sans-serif';

const wispHubStyles = {
  page: {
    minHeight: '100%',
    backgroundColor: '#ffffff',
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
  } satisfies CSSProperties,
  input: {
    height: '34px',
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
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
  } satisfies CSSProperties,
  body: {
    padding: '18px 16px 20px',
  } satisfies CSSProperties,
} as const;

const transactionColumns: TransactionColumn[] = [
  { key: 'id', title: 'ID', placeholder: 'Buscar' },
  { key: 'client', title: 'CLIENTE', placeholder: 'Buscar' },
  { key: 'invoice', title: '# FACTURA', placeholder: 'Buscar' },
  { key: 'legal', title: '# LEGAL', placeholder: 'Buscar' },
  { key: 'transaction', title: '# TRANSACCIÓN', placeholder: 'Buscar' },
  { key: 'type', title: 'TIPO', placeholder: 'Buscar' },
  { key: 'datetime', title: 'FECHA & HORA', placeholder: 'Buscar' },
  { key: 'charged', title: 'COBRADO', placeholder: 'Buscar' },
];

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 border border-[#dde4ec] bg-white text-center">
      <div className="border-b border-[#dde4ec] px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.02em] text-[#24364b]">
        {label}
      </div>
      <div className="px-4 py-3 text-[16px] font-semibold text-[#24364b]">
        {value}
      </div>
    </div>
  );
}

export default function Transactions() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [paymentType, setPaymentType] = useState('Cualquiera');
  const [operator, setOperator] = useState('Cualquiera');
  const [router, setRouter] = useState('Cualquiera');
  const [pageSize, setPageSize] = useState('15');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('31/03/2026');
  const [fromTime, setFromTime] = useState('12:00:00 AM');
  const [toTime, setToTime] = useState('11:59:59 PM');

  const emptyStateText = 'Ningún registro disponible';

  if (isWispHub) {
    return (
      <div style={wispHubStyles.page}>
        <header style={wispHubStyles.header}>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[30px] font-semibold leading-none text-[#15263b]">
              Transacciones
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#4e637c]"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#4e637c]"
                title="Refrescar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section style={wispHubStyles.card}>
          <div className="grid gap-5 px-5 py-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-[#4e637c]">
                  Tipo pago
                </label>
                <div className="relative">
                  <select
                    aria-label="Tipo de pago"
                    value={paymentType}
                    onChange={(event) => setPaymentType(event.target.value)}
                    style={wispHubStyles.input}
                    className="w-full appearance-none rounded-[4px] pr-10"
                  >
                    <option>Cualquiera</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-[#4e637c]">
                  Fechas
                </label>
                <div className="flex">
                  <input
                    aria-label="Fecha de inicio"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    style={wispHubStyles.input}
                    className="w-full rounded-l-[4px] rounded-r-none"
                  />
                  <span className="inline-flex h-[34px] items-center border-y border-[#cfd6df] bg-[#e9edf2] px-4 text-[12px] font-semibold text-[#51657d]">
                    al
                  </span>
                  <input
                    aria-label="Fecha de fin"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    style={wispHubStyles.input}
                    className="w-full rounded-l-none rounded-r-[4px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-[#4e637c]">
                  Horario
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="flex">
                      <input
                        aria-label="Hora desde"
                        value={fromTime}
                        onChange={(event) => setFromTime(event.target.value)}
                        style={wispHubStyles.input}
                        className="w-full rounded-l-[4px] rounded-r-none"
                      />
                      <button
                        type="button"
                        className="inline-flex h-[34px] w-[42px] items-center justify-center rounded-r-[4px] border border-l-0 border-[#cfd6df] bg-[#eff3f6] text-[#51657d]"
                        title="Seleccionar hora inicial"
                      >
                        <Clock3 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6d7a8e]">
                      Desde
                    </p>
                  </div>
                  <div>
                    <div className="flex">
                      <input
                        aria-label="Hora hasta"
                        value={toTime}
                        onChange={(event) => setToTime(event.target.value)}
                        style={wispHubStyles.input}
                        className="w-full rounded-l-[4px] rounded-r-none"
                      />
                      <button
                        type="button"
                        className="inline-flex h-[34px] w-[42px] items-center justify-center rounded-r-[4px] border border-l-0 border-[#cfd6df] bg-[#eff3f6] text-[#51657d]"
                        title="Seleccionar hora final"
                      >
                        <Clock3 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6d7a8e]">
                      Hasta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-[#4e637c]">
                  Operador
                </label>
                <div className="relative">
                  <select
                    aria-label="Operador"
                    value={operator}
                    onChange={(event) => setOperator(event.target.value)}
                    style={wispHubStyles.input}
                    className="w-full appearance-none rounded-[4px] pr-10"
                  >
                    <option>Cualquiera</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-[#4e637c]">
                  Router
                </label>
                <div className="relative">
                  <select
                    aria-label="Router"
                    value={router}
                    onChange={(event) => setRouter(event.target.value)}
                    style={wispHubStyles.input}
                    className="w-full appearance-none rounded-[4px] pr-10"
                  >
                    <option>Cualquiera</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={wispHubStyles.card}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-[4px] border border-[#d7dde5]">
                <select
                  aria-label="Registros por página"
                  value={pageSize}
                  onChange={(event) => setPageSize(event.target.value)}
                  className="h-[34px] min-w-[58px] border-r border-[#d7dde5] bg-white px-3 text-[12px] font-semibold text-[#24364b] outline-none"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
                <button
                  type="button"
                  className="inline-flex h-[34px] w-[42px] items-center justify-center border-r border-[#d7dde5] bg-white text-[#4e637c]"
                  title="Vista de lista"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-[34px] w-[42px] items-center justify-center bg-white text-[#4e637c]"
                  title="Resumen PDF"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                className="inline-flex h-[34px] items-center gap-2 rounded-[4px] border border-[#42b960] bg-[#45bf63] px-4 text-[12px] font-semibold text-white"
              >
                <Download className="h-4 w-4" />
                Resumen PDF
              </button>
            </div>

            <label className="relative block w-full max-w-[330px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar..."
                className="h-[34px] w-full rounded-[4px] border border-[#d7dde5] bg-white pl-10 pr-3 text-[12px] text-[#24364b] outline-none placeholder:text-[#c0cad5]"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            </label>
          </div>

          <div className="px-5 pb-5">
            <div className="overflow-x-auto border border-[#d7dde5]">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-white">
                    {transactionColumns.map((column) => (
                      <th
                        key={column.key}
                        className="border border-[#d7dde5] px-3 py-3 text-left font-bold text-[#1b2b41]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{column.title}</span>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-[#c2cad4]" />
                        </div>
                      </th>
                    ))}
                    <th className="w-[92px] border border-[#d7dde5] px-3 py-3 text-left font-bold text-[#1b2b41]">
                      Acción
                    </th>
                  </tr>
                  <tr className="bg-[#fbfcfd]">
                    {transactionColumns.map((column) => (
                      <th
                        key={`${column.key}-filter`}
                        className="border border-[#d7dde5] px-2 py-3"
                      >
                        <input
                          type="text"
                          placeholder={column.placeholder}
                          className="h-[32px] w-full rounded-[4px] border border-[#d7dde5] bg-white px-3 text-[12px] text-[#24364b] outline-none placeholder:text-[#c0cad5]"
                        />
                      </th>
                    ))}
                    <th className="border border-[#d7dde5] px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={transactionColumns.length + 1}
                      className="border border-[#d7dde5] px-4 py-8 text-center text-[14px] text-[#37485f]"
                    >
                      {emptyStateText}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#20324a]">
              <div>Mostrando 0 registros</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8da0b3] opacity-70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Página siguiente"
                  disabled
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#8da0b3] opacity-70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-[12px]">
          <div className="flex flex-wrap gap-0">
            <SummaryRow label="TOTAL COBRADO" value="MX$ 0.00" />
            <SummaryRow label="TOTAL COMISION" value="MX$ 0.00" />
            <SummaryRow label="TOTAL NETO" value="MX$ 0.00" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={mikrosystemStyles.page}>
      <section style={mikrosystemStyles.card}>
        <header
          style={mikrosystemStyles.header}
          className="flex items-center justify-between gap-3"
        >
          <span>Transacciones</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white"
              title="Actualizar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white"
              title="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div style={mikrosystemStyles.body}>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[14px] text-[#4c6078]">
                  Tipo Pago
                </label>
                <div className="relative">
                  <select
                    aria-label="Tipo de pago"
                    value={paymentType}
                    onChange={(event) => setPaymentType(event.target.value)}
                    className="h-12 w-full appearance-none rounded-[6px] border border-[#d7e0ea] bg-white px-4 pr-10 text-[14px] font-semibold text-[#24364b] outline-none"
                  >
                    <option>Cualquiera</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[14px] text-[#4c6078]">
                  Fechas
                </label>
                <div className="flex">
                  <input
                    aria-label="Fecha de inicio"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-12 w-full rounded-l-[6px] rounded-r-none border border-[#d7e0ea] bg-white px-4 text-center text-[14px] text-[#4c6078] outline-none"
                  />
                  <span className="inline-flex h-12 items-center border-y border-[#d7e0ea] bg-[#dbe2ea] px-4 text-[14px] font-semibold text-[#4c6078]">
                    al
                  </span>
                  <input
                    aria-label="Fecha de fin"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-12 w-full rounded-l-none rounded-r-[6px] border border-[#d7e0ea] bg-white px-4 text-center text-[14px] text-[#4c6078] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[14px] text-[#4c6078]">
                  Horario
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex">
                      <input
                        aria-label="Hora desde"
                        value={fromTime}
                        onChange={(event) => setFromTime(event.target.value)}
                        className="h-12 w-full rounded-l-[6px] rounded-r-none border border-[#d7e0ea] bg-white px-4 text-[14px] text-[#4c6078] outline-none"
                      />
                      <button
                        type="button"
                        className="inline-flex h-12 w-[58px] items-center justify-center rounded-r-[6px] border border-l-0 border-[#d7e0ea] bg-[#dbe2ea] text-[#4c6078]"
                        title="Horario desde"
                      >
                        <Clock3 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#4c6078]">
                      Desde
                    </p>
                  </div>

                  <div>
                    <div className="flex">
                      <input
                        aria-label="Hora hasta"
                        value={toTime}
                        onChange={(event) => setToTime(event.target.value)}
                        className="h-12 w-full rounded-l-[6px] rounded-r-none border border-[#d7e0ea] bg-white px-4 text-[14px] text-[#4c6078] outline-none"
                      />
                      <button
                        type="button"
                        className="inline-flex h-12 w-[58px] items-center justify-center rounded-r-[6px] border border-l-0 border-[#d7e0ea] bg-[#dbe2ea] text-[#4c6078]"
                        title="Horario hasta"
                      >
                        <Clock3 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#4c6078]">
                      Hasta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[14px] text-[#4c6078]">
                  Operador
                </label>
                <div className="relative">
                  <select
                    aria-label="Operador"
                    value={operator}
                    onChange={(event) => setOperator(event.target.value)}
                    className="h-12 w-full appearance-none rounded-[6px] border border-[#d7e0ea] bg-white px-4 pr-10 text-[14px] font-semibold text-[#24364b] outline-none"
                  >
                    <option>Cualquiera</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                </div>
              </div>

              <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                <label className="text-right text-[14px] text-[#4c6078]">
                  Router
                </label>
                <div className="relative">
                  <select
                    aria-label="Router"
                    value={router}
                    onChange={(event) => setRouter(event.target.value)}
                    className="h-12 w-full appearance-none rounded-[6px] border border-[#d7e0ea] bg-white px-4 pr-10 text-[14px] font-semibold text-[#24364b] outline-none"
                  >
                    <option>Cualquiera</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-[6px] border border-[#d7e0ea]">
                <select
                  aria-label="Registros por página"
                  value={pageSize}
                  onChange={(event) => setPageSize(event.target.value)}
                  className="h-[50px] min-w-[58px] border-r border-[#d7e0ea] bg-white px-3 text-[14px] font-semibold text-[#24364b] outline-none"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
                <button
                  type="button"
                  className="inline-flex h-[50px] w-[56px] items-center justify-center border-r border-[#d7e0ea] bg-white text-[#4c6078]"
                  title="Vista de lista"
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-[50px] w-[56px] items-center justify-center bg-white text-[#4c6078]"
                  title="Guardar plantilla"
                >
                  <Save className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                className="inline-flex h-[50px] items-center gap-2 rounded-[6px] border border-[#d7e0ea] bg-white px-5 text-[14px] font-semibold text-[#24364b]"
              >
                <Download className="h-5 w-5 text-[#4c6078]" />
                Resumen PDF
              </button>
            </div>

            <label className="relative block w-full max-w-[390px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar..."
                className="h-[52px] w-full rounded-[6px] border border-[#d7e0ea] bg-white pl-11 pr-4 text-[14px] text-[#24364b] outline-none placeholder:text-[#c0cad5]"
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa8b7]" />
            </label>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px] text-[#24364b]">
              <thead>
                <tr className="bg-white">
                  {transactionColumns.map((column, index) => (
                    <th
                      key={column.key}
                      className={`border border-[#d7e0ea] px-3 py-3 text-left font-semibold ${
                        index === 0 ? 'w-[78px]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.title}</span>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                      </div>
                    </th>
                  ))}
                  <th className="w-[90px] border border-[#d7e0ea] px-3 py-3 text-left font-semibold">
                    Acción
                  </th>
                </tr>
                <tr className="bg-[#fbfdff]">
                  {transactionColumns.map((column) => (
                    <th
                      key={`${column.key}-filter`}
                      className="border border-[#d7e0ea] px-2 py-3"
                    >
                      <input
                        type="text"
                        placeholder={column.placeholder}
                        className="h-12 w-full rounded-[6px] border border-[#d7e0ea] bg-white px-4 text-[14px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
                      />
                    </th>
                  ))}
                  <th className="border border-[#d7e0ea] px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={transactionColumns.length + 1}
                    className="border border-[#d7e0ea] bg-[#f4f6f8] px-4 py-10 text-center text-[18px] text-[#4c6078]"
                  >
                    {emptyStateText}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[14px] font-semibold text-[#6f8296]">
            <div>Mostrando 0 registros</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Página anterior"
                disabled
                className="inline-flex h-12 w-12 items-center justify-center rounded-[6px] border border-[#d7e0ea] bg-white text-[#9fb0c2] opacity-70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Página siguiente"
                disabled
                className="inline-flex h-12 w-12 items-center justify-center rounded-[6px] border border-[#d7e0ea] bg-white text-[#9fb0c2] opacity-70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-[930px] flex-wrap gap-0">
            <SummaryRow label="TOTAL COBRADO" value="MX$ 0.00" />
            <SummaryRow label="TOTAL COMISION" value="MX$ 0.00" />
            <SummaryRow label="TOTAL NETO" value="MX$ 0.00" />
          </div>
        </div>
      </section>
    </div>
  );
}
