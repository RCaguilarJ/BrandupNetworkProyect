import type { ReactNode } from 'react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  ActionButton,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  type DataColumn,
} from '../network/networkManagementShared';
import {
  serviceMikrosystemPageStyle,
  serviceWisphubPageStyle,
} from './serviceData';

export function ServiceShell({
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
    <div
      style={
        isWispHub ? serviceWisphubPageStyle : serviceMikrosystemPageStyle
      }
    >
      <NetworkPageShell
        title={title}
        breadcrumb={breadcrumb}
        isWispHub={isWispHub}
        eyebrow={undefined}
      >
        <NetworkPanel isWispHub={isWispHub}>{children}</NetworkPanel>
      </NetworkPageShell>
    </div>
  );
}

/**
 * Shared service list scaffold.
 * Keeps toolbar, table and pagination aligned across internet, voice and custom services.
 */
export function ServiceListView<T>({
  title,
  breadcrumb,
  actionLabel,
  pageSize,
  onPageSizeChange,
  searchTerm,
  onSearchTermChange,
  onOpenNew,
  columns,
  rows,
  summary,
}: {
  title: string;
  breadcrumb: string;
  actionLabel: string;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onOpenNew: () => void;
  columns: DataColumn<T>[];
  rows: T[];
  summary: string;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <ServiceShell title={title} breadcrumb={breadcrumb}>
      <div className="px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <PageSizeCluster
              isWispHub={isWispHub}
              pageSize={pageSize}
              onChange={onPageSizeChange}
            />
            <ActionButton
              isWispHub={isWispHub}
              icon={<span className="text-[18px] leading-none">+</span>}
              label={actionLabel}
              primary
              wide
              onClick={onOpenNew}
            />
          </div>
          <SearchField
            isWispHub={isWispHub}
            value={searchTerm}
            onChange={onSearchTermChange}
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <NetworkTable
          columns={columns}
          rows={rows.slice(0, pageSize)}
          emptyMessage="Ningun registro disponible"
        />
        <PaginationBar
          isWispHub={isWispHub}
          summary={summary}
          showCurrentPage={rows.length > 0}
        />
      </div>
    </ServiceShell>
  );
}
