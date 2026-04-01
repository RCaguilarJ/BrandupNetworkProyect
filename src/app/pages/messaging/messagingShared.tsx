import type { ReactNode } from 'react';
import {
  CheckCheck,
  MessagesSquare,
  Search,
  Smartphone,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  DateRangeField,
  HorizontalScrollRail,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  type DataColumn,
} from '../network/networkManagementShared';
import {
  messagingMikrosystemPageStyle,
  messagingWisphubPageStyle,
} from './messagingData';

export function MessagingPageShell({
  title,
  breadcrumb,
  panelTitle,
  children,
}: {
  title: string;
  breadcrumb: string;
  panelTitle: string;
  children: ReactNode;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <div
      style={
        isWispHub
          ? messagingWisphubPageStyle
          : messagingMikrosystemPageStyle
      }
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-[24px] font-normal text-[#20344a]">
          {title}
        </h1>
        <div className="pt-1 text-right text-[14px] text-[#6f8397]">
          <span>Inicio</span>
          <span className="mx-2 text-[#aab7c4]">/</span>
          <span
            className={
              isWispHub ? 'font-semibold text-[#45bf63]' : 'text-[#2d8ae7]'
            }
          >
            {breadcrumb}
          </span>
        </div>
      </div>

      <NetworkPanel isWispHub={isWispHub}>
        <div className="flex items-center justify-between bg-[#1f2429] px-5 py-4">
          <h2 className="text-[18px] font-bold uppercase text-white">
            {panelTitle}
          </h2>
          <div className="flex items-center gap-2">
            <HeaderCircle />
            <HeaderCircle />
          </div>
        </div>

        {children}
      </NetworkPanel>
    </div>
  );
}

function HeaderCircle() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#314153]">
      <CheckCheck className="h-4 w-4" />
    </span>
  );
}

/**
 * Shared shell for the sent/received list screens.
 * Keeps toolbar, date range and footer behavior aligned across both views.
 */
export function MessagingTableScreen<T>({
  title,
  breadcrumb,
  panelTitle,
  actionSlot,
  pageSize,
  onPageSizeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchTerm,
  onSearchTermChange,
  columns,
  rows,
  emptyMessage,
  summary,
  showHorizontalRail = false,
}: {
  title: string;
  breadcrumb: string;
  panelTitle: string;
  actionSlot: ReactNode;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  columns: DataColumn<T>[];
  rows: T[];
  emptyMessage: string;
  summary: string;
  showHorizontalRail?: boolean;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <MessagingPageShell
      title={title}
      breadcrumb={breadcrumb}
      panelTitle={panelTitle}
    >
      <div className="px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <PageSizeCluster
              isWispHub={isWispHub}
              pageSize={pageSize}
              onChange={onPageSizeChange}
            />
            {actionSlot}
            <div className="min-w-[220px]">
              <DateRangeField
                isWispHub={isWispHub}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
              />
            </div>
          </div>

          <SearchField
            isWispHub={isWispHub}
            value={searchTerm}
            onChange={onSearchTermChange}
          />
        </div>
      </div>

      <div className="px-4 pb-5 md:px-5">
        <NetworkTable
          columns={columns}
          rows={rows}
          emptyMessage={emptyMessage}
        />
        <PaginationBar
          isWispHub={isWispHub}
          summary={summary}
          showCurrentPage={false}
        />
        {showHorizontalRail && !isWispHub ? <HorizontalScrollRail /> : null}
      </div>
    </MessagingPageShell>
  );
}

export function ChatWhatsappScreen() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <div
      style={
        isWispHub
          ? messagingWisphubPageStyle
          : messagingMikrosystemPageStyle
      }
    >
      <section
        className={`overflow-hidden border bg-white ${
          isWispHub
            ? 'mx-3 border-[#d7dde5] shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
            : 'border-[#d5dde7]'
        }`}
      >
        <div className="grid min-h-[700px] lg:grid-cols-[540px_minmax(0,1fr)]">
          <aside className="border-r border-[#d7dde5] bg-white">
            <div className="flex items-center border-b border-[#d7dde5]">
              <button
                type="button"
                className="inline-flex h-[46px] w-[42px] items-center justify-center border-r border-[#d7dde5] text-[#2f4156]"
                aria-label="Buscar conversaciones"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                className="h-[46px] flex-1 px-4 text-[14px] text-[#33485e] outline-none placeholder:text-[#c1cad3]"
                placeholder="Buscar..."
                aria-label="Buscar"
              />
              <button
                type="button"
                className={`mr-1 inline-flex h-[34px] items-center rounded-[4px] border px-4 text-[13px] font-semibold ${
                  isWispHub
                    ? 'border-[#45bf63] text-[#45bf63]'
                    : 'border-[#0eb3e3] text-[#0eb3e3]'
                }`}
              >
                Los mas recientes
              </button>
            </div>
          </aside>

          <div className="flex items-center justify-center bg-white px-6 py-10">
            <div className="w-full max-w-[760px] text-center">
              <div className="mx-auto flex max-w-[360px] items-end justify-center gap-6">
                <div className="rounded-[28px] border-2 border-[#3c6584] bg-[#f4ffff] p-4 shadow-[0_6px_0_#48c7b5]">
                  <Smartphone className="h-20 w-20 text-[#3c6584]" />
                </div>
                <div className="rounded-[36px] border-2 border-[#3c6584] bg-[#f4ffff] px-10 py-8 shadow-[0_6px_0_#48c7b5]">
                  <MessagesSquare className="mx-auto h-20 w-20 text-[#3cc6b1]" />
                </div>
              </div>

              <h2 className="mt-10 text-[34px] font-semibold uppercase text-[#26384d]">
                Activacion requerida
              </h2>
              <p className="mt-3 text-[18px] text-[#32485e]">
                Este modulo de WhatsApp aun no esta disponible para su cuenta.
              </p>

              <div className="mt-8 rounded-[6px] border border-[#f0a136] bg-[#ffe7bf] px-4 py-4 text-left text-[16px] text-[#8a5b16]">
                Comuniquese con soporte para solicitar la activacion del
                servicio.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
