import { useState } from 'react';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './networkManagementData';
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
} from './networkManagementShared';

type EmptyRow = Record<string, never>;

const columns: DataColumn<EmptyRow>[] = [
  { key: 'cliente', header: 'Cliente', render: () => '' },
  { key: 'ipv4', header: 'IP V4', width: '220px', render: () => '' },
  { key: 'ipdst', header: 'IP DST', width: '260px', render: () => '' },
  { key: 'userppp', header: 'USER PPP', width: '260px', render: () => '' },
  { key: 'fecha', header: 'Fecha', width: '220px', render: () => '' },
  { key: 'router', header: 'router', width: '220px', render: () => '' },
];

export default function NetworkVisitedIps() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('actual');

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="Registros de IPs Visitadas por el cliente"
        breadcrumb="Ips Visitadas"
        isWispHub={isWispHub}
      >
        <NetworkPanel isWispHub={isWispHub}>
          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <PageSizeCluster
                  isWispHub={isWispHub}
                  pageSize={pageSize}
                  onChange={setPageSize}
                />
                <SelectField
                  isWispHub={isWispHub}
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'actual', label: 'Trafico Actual' },
                    { value: 'historico', label: 'Trafico Historico' },
                  ]}
                  className="min-w-[260px]"
                />
              </div>
              <SearchField
                isWispHub={isWispHub}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
          </div>

          <div className="px-5 pb-5">
            <NetworkTable columns={columns} rows={[]} emptyMessage="Ningun registro disponible" />
            <PaginationBar
              isWispHub={isWispHub}
              summary="Mostrando 0 registros"
              showCurrentPage={false}
            />
            {!isWispHub ? <HorizontalScrollRail /> : null}
          </div>
        </NetworkPanel>
      </NetworkPageShell>
    </div>
  );
}
