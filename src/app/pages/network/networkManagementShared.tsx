import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Expand,
  Info,
  List,
  Minus,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

type DataColumn<T> = {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  hideSortIcon?: boolean;
  render: (row: T) => ReactNode;
};

type MetricCard = {
  label: string;
  value: string | number;
  helperLeft?: string;
  helperRight?: string;
  colorClass: string;
  watermark?: ReactNode;
};

type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type SummaryRow = {
  label: string;
  value: string | number;
};

type FormField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  helper?: string;
  colSpan?: 1 | 2;
  min?: number;
};

function getAlignClass(align: DataColumn<unknown>['align']) {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
}

export function NetworkPageShell({
  title,
  isWispHub,
  breadcrumb,
  children,
  eyebrow,
  showHeaderActions = true,
  showMikrosystemHeader = true,
}: {
  title: string;
  isWispHub: boolean;
  breadcrumb: string;
  children: ReactNode;
  eyebrow?: string;
  showHeaderActions?: boolean;
  showMikrosystemHeader?: boolean;
}) {
  return (
    <>
      {isWispHub ? (
        <header className="border-b border-[#d7dde5] px-3 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {eyebrow ? (
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45bf63]">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-2 text-[30px] font-semibold text-[#15263b]">
                {title}
              </h1>
            </div>
            <div className="text-right text-[13px] text-[#6d8093]">
              <span>Inicio</span>
              <span className="mx-2 text-[#b6c1cb]">/</span>
              <span className="font-semibold text-[#45bf63]">{breadcrumb}</span>
            </div>
          </div>
        </header>
      ) : showMikrosystemHeader ? (
        <div className="mb-6 flex items-center justify-between bg-[#1f2429] px-6 py-4">
          <h1 className="text-[18px] font-bold text-white">{title}</h1>
          {showHeaderActions ? (
            <div className="flex items-center gap-2">
              <HeaderCircleButton ariaLabel="Expandir panel" title="Expandir">
                <Expand className="h-4 w-4" />
              </HeaderCircleButton>
              <HeaderCircleButton ariaLabel="Actualizar panel" title="Actualizar">
                <RefreshCw className="h-4 w-4" />
              </HeaderCircleButton>
              <HeaderCircleButton ariaLabel="Minimizar panel" title="Minimizar">
                <Minus className="h-4 w-4" />
              </HeaderCircleButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {children}
    </>
  );
}

function HeaderCircleButton({
  children,
  ariaLabel,
  title,
}: {
  children: ReactNode;
  ariaLabel: string;
  title: string;
}) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2f3d4b]"
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

export function NetworkPanel({
  isWispHub,
  children,
}: {
  isWispHub: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={
        isWispHub
          ? 'mx-3 mb-5 border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
          : 'border border-[#d5dde7] bg-white'
      }
    >
      {children}
    </section>
  );
}

export function PageSizeCluster({
  isWispHub,
  pageSize,
  onChange,
}: {
  isWispHub: boolean;
  pageSize: number;
  onChange: (value: number) => void;
}) {
  const controlClass = isWispHub
    ? 'h-[42px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#20324a] outline-none'
    : 'h-[48px] rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#394b60]'
    : 'inline-flex h-[48px] w-[48px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#394b60]';

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-[6px] border border-[#d7dde5] bg-white align-middle">
      <select
        value={pageSize}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`${controlClass} min-w-[58px] appearance-none rounded-none border-0 border-r border-[#d7dde5] px-4 leading-none`}
        aria-label="Cantidad de registros por pagina"
      >
        <option value={15}>15</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>
      <button
        type="button"
        className={`${iconButtonClass} shrink-0 rounded-none border-0 border-r border-[#d7dde5]`}
        aria-label="Vista de lista"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`${iconButtonClass} shrink-0 rounded-none border-0`}
        aria-label="Guardar configuracion"
      >
        <Save className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ActionButton({
  isWispHub,
  icon,
  label,
  primary = false,
  wide = false,
  onClick,
}: {
  isWispHub: boolean;
  icon: ReactNode;
  label: string;
  primary?: boolean;
  wide?: boolean;
  onClick?: () => void;
}) {
  const className = primary
    ? isWispHub
      ? 'inline-flex h-[42px] items-center gap-2 rounded-[6px] border border-[#42b960] bg-[#45bf63] px-4 text-[14px] font-semibold text-white'
      : 'inline-flex h-[48px] items-center gap-2 rounded-[4px] border border-[#268df2] bg-[#3399f6] px-5 text-[14px] font-semibold text-white'
    : isWispHub
      ? 'inline-flex h-[42px] items-center gap-2 rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] font-semibold text-[#2b3d51]'
      : 'inline-flex h-[48px] items-center gap-2 rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] font-semibold text-[#1f2f43]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className}${wide ? ' min-w-[120px] justify-center' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
}

export function SearchField({
  isWispHub,
  value,
  onChange,
  placeholder = 'Buscar...',
}: {
  isWispHub: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const controlClass = isWispHub
    ? 'h-[42px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#20324a] outline-none'
    : 'h-[48px] rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none';

  return (
    <div className="relative w-full xl:max-w-[360px]">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6b5]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} w-full pl-11`}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export function SelectField({
  isWispHub,
  value,
  onChange,
  options,
  className = '',
  ariaLabel = 'Seleccionar opcion',
}: {
  isWispHub: boolean;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  ariaLabel?: string;
}) {
  const controlClass = isWispHub
    ? 'h-[42px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#20324a] outline-none'
    : 'h-[48px] rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none';

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} w-full appearance-none pr-11`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#586d82]" />
    </div>
  );
}

export function DateRangeField({
  isWispHub,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  isWispHub: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}) {
  const controlClass = isWispHub
    ? 'h-[42px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#20324a] outline-none'
    : 'h-[48px] rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#394b60]'
    : 'inline-flex h-[48px] w-[48px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#394b60]';

  return (
    <div className="flex min-w-0 overflow-hidden rounded-[6px] border border-[#d7dde5] bg-white">
      <input
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
        className={`${controlClass} min-w-0 flex-1 rounded-none border-0`}
        placeholder="01/04/2026"
        aria-label="Fecha inicial"
      />
      <span className="flex items-center border-x border-[#d7dde5] bg-[#d0d6dc] px-4 text-[14px] font-semibold text-[#38485b]">
        al
      </span>
      <input
        value={endDate}
        onChange={(event) => onEndDateChange(event.target.value)}
        className={`${controlClass} min-w-0 flex-1 rounded-none border-0`}
        placeholder="30/04/2026"
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
  );
}

export function NetworkTable<T>({
  columns,
  rows,
  emptyMessage,
  loadingMessage,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  loadingMessage?: string;
}) {
  const [headerDirection, setHeaderDirection] = useState<'up' | 'down'>('up');
  const message = loadingMessage ?? emptyMessage ?? 'Ningun registro disponible';
  const visibleRows =
    headerDirection === 'down'
      ? rows.slice(Math.max(rows.length - 15, 0))
      : rows.slice(0, 15);

  const toggleHeaderDirection = () => {
    setHeaderDirection((current) => (current === 'up' ? 'down' : 'up'));
  };

  return (
    <div className="overflow-hidden border border-[#d7dde5] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
          <thead>
            <tr className="bg-white">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border-b border-r border-[#d7dde5] px-4 py-3 text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0 ${getAlignClass(column.align)} ${column.width ? `[width:${column.width}]` : ''}`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      column.align === 'center'
                        ? 'justify-center'
                        : column.align === 'right'
                          ? 'justify-end'
                          : 'justify-between'
                    }`}
                  >
                    <span>{column.header}</span>
                    {!column.hideSortIcon ? (
                      <button
                        type="button"
                        onClick={toggleHeaderDirection}
                        className="text-[#c3ccd6] transition hover:text-[#3f93e7]"
                        aria-label={
                          headerDirection === 'up'
                            ? 'Ir a los ultimos registros'
                            : 'Ir a los primeros registros'
                        }
                      >
                        {headerDirection === 'up' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]"
                >
                  {message}
                </td>
              </tr>
              ) : (
              visibleRows.map((row, index) => (
                <tr key={index} className="bg-white">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`border-b border-r border-[#d7dde5] px-4 py-3 last:border-r-0 ${getAlignClass(column.align)}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PaginationBar({
  isWispHub,
  summary,
  showCurrentPage = true,
}: {
  isWispHub: boolean;
  summary: string;
  showCurrentPage?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[16px] text-[#667b92]">
      <div>{summary}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#8091a4]"
          aria-label="Pagina anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {showCurrentPage ? (
          <button
            type="button"
            className={`flex h-[48px] w-[48px] items-center justify-center rounded-[6px] font-semibold ${
              isWispHub ? 'bg-[#45bf63] text-white' : 'bg-[#3f93e7] text-white'
            }`}
          >
            1
          </button>
        ) : null}
        <button
          type="button"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#8091a4]"
          aria-label="Pagina siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function HorizontalScrollRail() {
  return (
    <div className="mt-12 flex items-center gap-3 px-7 pb-6">
      <div className="h-0 w-0 border-y-[9px] border-y-transparent border-r-[9px] border-r-[#8f8f8f]" />
      <div className="h-3 flex-1 rounded-full bg-[#9c9c9c]" />
      <div className="h-0 w-0 border-y-[9px] border-y-transparent border-l-[9px] border-l-[#8f8f8f]" />
    </div>
  );
}

export function MetricCards({
  cards,
  isWispHub,
}: {
  cards: MetricCard[];
  isWispHub: boolean;
}) {
  return (
    <div className="mb-8 grid gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-[8px] px-6 py-6 text-white ${card.colorClass}`}
        >
          {isWispHub && card.watermark ? (
            <div className="pointer-events-none absolute -right-2 top-0 opacity-15">
              {card.watermark}
            </div>
          ) : null}
          <p className="text-[16px] font-semibold uppercase tracking-[0.04em]">
            {card.label}
          </p>
          <p className="mt-3 text-[54px] font-semibold leading-none">{card.value}</p>
          <div className="mt-8 h-[4px] bg-white/80" />
          <div className="mt-6 flex items-center justify-between gap-4 text-[18px] font-semibold">
            <span>{card.helperLeft}</span>
            <span>{card.helperRight}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopTabs({
  tabs,
  activeTab,
  onChange,
  isWispHub,
}: {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  isWispHub: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-2 border-b border-[#d7dde5]">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-6 ${
              isWispHub ? 'h-[48px] rounded-t-[10px] text-[17px]' : 'h-[54px] rounded-t-[8px] text-[18px]'
            } ${
              active
                ? 'border border-b-0 border-[#d7dde5] bg-white font-semibold text-[#26384d]'
                : isWispHub
                  ? 'font-semibold text-[#45bf63]'
                  : 'font-semibold text-[#7089a4]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function SummaryCard({
  title,
  rows,
}: {
  title: string;
  rows: SummaryRow[];
}) {
  return (
    <div className="mx-auto mt-10 w-full max-w-[670px] overflow-hidden rounded-[4px] border border-[#d7dde5] bg-white">
      <div className="flex items-center gap-2 border-b border-[#d7dde5] bg-[#f3f6f9] px-5 py-5 text-[18px] font-semibold text-[#425b74]">
        <Info className="h-5 w-5" />
        {title}
      </div>
      <div className="px-4 py-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border border-[#e0e6ec] border-b-0 px-4 py-4 text-[18px] text-[#4c5f74] last:border-b"
          >
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrafficChartPlaceholder() {
  const gridTopClasses = [
    'top-[20%]',
    'top-[40%]',
    'top-[60%]',
    'top-[80%]',
    'top-[100%]',
  ];

  return (
    <div className="overflow-hidden rounded-[4px] border border-[#d7dde5] bg-white">
      <div className="border-b border-[#d7dde5] bg-[#f3f6f9] px-5 py-5 text-[18px] font-semibold text-[#425b74]">
        Resumen Trafico
      </div>
      <div className="px-6 py-8">
        <div className="relative h-[420px]">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`absolute left-[7%] right-[2%] border-t border-[#d2d7dd] ${gridTopClasses[index]}`}
            />
          ))}
          <div className="absolute inset-x-[10%] bottom-9 flex justify-between text-[16px] text-[#7f8fa0]">
            {['Febrero', 'Abril', 'Junio', 'Agosto', 'Octubre', 'Diciembre'].map((month) => (
              <span key={month} className="-rotate-[32deg]">
                {month}
              </span>
            ))}
          </div>
          <div className="absolute left-0 top-[12%] flex h-[74%] flex-col justify-between text-[16px] text-[#7f8fa0]">
            <span>1 MiB</span>
            <span>0.75 MiB</span>
            <span>0.5 MiB</span>
            <span>0.25 MiB</span>
            <span>0 MiB</span>
          </div>
          <div className="absolute left-1/2 top-[46%] w-[132px] -translate-x-1/2 rounded-[18px] border-4 border-[#e9edf1] bg-white px-5 py-3 text-center text-[16px] text-[#6a6f74] shadow-sm">
            <div>Julio</div>
            <div className="mt-1 text-[#3d89ff]">Descarga: 0 MiB</div>
            <div className="text-[#00a5aa]">Subida: 0 MiB</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable popup state with a short loading phase to match the modal behavior
 * already used in other management screens.
 */
export function useNetworkDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const updateOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!nextOpen) {
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, 450);
  };

  return {
    open,
    loading,
    setOpen: updateOpen,
    openDialog: () => updateOpen(true),
    closeDialog: () => updateOpen(false),
  };
}

export function NetworkFormDialog({
  open,
  loading,
  title,
  submitLabel,
  values,
  fields,
  onOpenChange,
  onFieldChange,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  title: string;
  submitLabel: string;
  values: Record<string, string>;
  fields: FormField[];
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
}) {
  const fieldClass =
    'h-[48px] rounded-[6px] border border-[#d7dfe8] bg-white px-4 text-[14px] text-[#24364b] outline-none placeholder:text-[#c6ced8]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto border border-[#d7dfe8] bg-white p-0 sm:max-w-[760px]">
        <DialogHeader className="border-b border-[#d7dfe8] bg-[#f5f5f5] px-6 py-3">
          <DialogTitle className="text-[18px] font-semibold text-[#303030]">
            {title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="px-6 py-10">
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d7dfe8] bg-[#fbfcfe]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ff] text-[#2f7ee8]">
                <RefreshCw className="h-10 w-10 animate-spin" />
              </div>
              <p className="mt-6 text-[16px] font-semibold text-[#24364b]">
                Cargando formulario...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              {fields.map((field) => {
                const colSpanClass = field.colSpan === 2 ? 'md:col-span-2' : '';

                return (
                  <div key={field.name} className={colSpanClass}>
                    <label
                      htmlFor={`network-form-${field.name}`}
                      className="mb-2 block text-[14px] font-medium text-[#5b6470]"
                    >
                      {field.label}
                      {field.required ? ' *' : ''}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        id={`network-form-${field.name}`}
                        value={values[field.name] ?? ''}
                        onChange={(event) =>
                          onFieldChange(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        className="min-h-[118px] w-full rounded-[6px] border border-[#d7dfe8] bg-white px-4 py-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#c6ced8]"
                      />
                    ) : field.type === 'select' ? (
                      <div className="relative">
                        <select
                          id={`network-form-${field.name}`}
                          value={values[field.name] ?? ''}
                          onChange={(event) =>
                            onFieldChange(field.name, event.target.value)
                          }
                          required={field.required}
                          className={`${fieldClass} w-full appearance-none pr-10`}
                          aria-label={field.label}
                          title={field.label}
                        >
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7a]" />
                      </div>
                    ) : (
                      <input
                        id={`network-form-${field.name}`}
                        type={field.type === 'date' ? 'date' : field.type ?? 'text'}
                        value={values[field.name] ?? ''}
                        onChange={(event) =>
                          onFieldChange(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        min={field.min}
                        className={`${fieldClass} w-full`}
                      />
                    )}

                    {field.helper ? (
                      <p className="mt-2 text-[12px] text-[#8b99a8]">{field.helper}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="border-t border-[#d7dfe8] px-6 py-4 sm:justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-[44px] items-center rounded-[6px] border border-[#d7dfe8] bg-white px-5 text-[14px] font-semibold text-[#4b5563]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-[44px] items-center rounded-[6px] bg-[#2f7ee8] px-5 text-[14px] font-semibold text-white"
              >
                {submitLabel}
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { DataColumn, FormField, TabItem };
