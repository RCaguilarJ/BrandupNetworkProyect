import type { ReactNode } from 'react';
import { RotateCcw, ScanSearch, Search } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  HorizontalScrollRail,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  SelectField,
  type DataColumn,
} from '../network/networkManagementShared';
import {
  warehouseMikrosystemPageStyle,
  warehouseWisphubPageStyle,
} from './warehouseData';

export function WarehousePageSurface({
  children,
}: {
  children: ReactNode;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <div
      style={
        isWispHub
          ? warehouseWisphubPageStyle
          : warehouseMikrosystemPageStyle
      }
    >
      {children}
    </div>
  );
}

export function WarehouseShell({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb: string;
  children: ReactNode;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <WarehousePageSurface>
      <NetworkPageShell
        title={title}
        breadcrumb={breadcrumb}
        isWispHub={isWispHub}
        eyebrow={isWispHub ? undefined : 'Gestion de red'}
      >
        <NetworkPanel isWispHub={isWispHub}>{children}</NetworkPanel>
      </NetworkPageShell>
    </WarehousePageSurface>
  );
}

export function WarehouseSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden border border-[#d7dde5] bg-white">
      <div className="flex items-center justify-between bg-[#138f91] px-4 py-3">
        <h3 className="text-[18px] font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2 text-white">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#15898b]">
            <ScanSearch className="h-4 w-4" />
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#15898b]">
            <RotateCcw className="h-4 w-4" />
          </span>
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Standard warehouse list wrapper.
 * Keeps toolbar, search and pagination aligned with the inventory screens.
 */
export function WarehouseListView<T>({
  title,
  breadcrumb,
  toolbarLeft,
  searchTerm,
  onSearchTermChange,
  columns,
  rows,
  pageSize,
  onPageSizeChange,
  emptyMessage,
  summary,
  showHorizontalRail = false,
}: {
  title: string;
  breadcrumb: string;
  toolbarLeft?: ReactNode;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  columns: DataColumn<T>[];
  rows: T[];
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  emptyMessage?: string;
  summary: string;
  showHorizontalRail?: boolean;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <WarehouseShell title={title} breadcrumb={breadcrumb}>
      <div className="px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <PageSizeCluster
              isWispHub={isWispHub}
              pageSize={pageSize}
              onChange={onPageSizeChange}
            />
            {toolbarLeft}
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
          rows={rows.slice(0, pageSize)}
          emptyMessage={emptyMessage}
        />
        <PaginationBar
          isWispHub={isWispHub}
          summary={summary}
          showCurrentPage={rows.length > 0}
        />
        {showHorizontalRail && !isWispHub ? <HorizontalScrollRail /> : null}
      </div>
    </WarehouseShell>
  );
}

export function WarehouseFilterRow({
  searchTerm,
  onSearchTermChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
}: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:px-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <SelectField
          isWispHub={isWispHub}
          value={status}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'Estado' },
            { value: 'disponible', label: 'Disponible' },
            { value: 'asignado', label: 'Asignado' },
            { value: 'bodega', label: 'En bodega' },
          ]}
          className="min-w-[180px]"
        />
        <SelectField
          isWispHub={isWispHub}
          value={category}
          onChange={onCategoryChange}
          options={[
            { value: 'all', label: 'Categoria' },
            { value: 'router', label: 'Router' },
            { value: 'onu', label: 'ONU' },
            { value: 'cable', label: 'Cableado' },
          ]}
          className="min-w-[180px]"
        />
      </div>

      <div className="relative w-full xl:max-w-[300px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6b5]" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="h-[48px] w-full rounded-[4px] border border-[#d7dde5] bg-white pl-11 pr-4 text-[14px] text-[#24364b] outline-none placeholder:text-[#c1cad3]"
          placeholder="Buscar..."
          aria-label="Buscar"
        />
      </div>
    </div>
  );
}
