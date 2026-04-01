import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './networkManagementData';
import {
  MetricCards,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  TopTabs,
  type DataColumn,
} from './networkManagementShared';

type AdminTab = 'onus' | 'vlans' | 'zonas' | 'profiles' | 'naps' | 'api';
type EmptyRow = Record<string, never>;

const columns: DataColumn<EmptyRow>[] = [
  { key: 'cliente', header: 'CLIENTE', render: () => '' },
  { key: 'idCliente', header: 'ID CLIENTE', width: '190px', render: () => '' },
  { key: 'sn', header: 'SN', width: '120px', render: () => '' },
  { key: 'olt', header: 'OLT', width: '120px', render: () => '' },
  { key: 'estado', header: 'ESTADO', width: '170px', render: () => '' },
  { key: 'board', header: 'BOARD', width: '170px', render: () => '' },
  { key: 'port', header: 'PORT', width: '120px', render: () => '' },
  { key: 'signal', header: 'SIGNAL', width: '150px', render: () => '' },
  { key: 'rx', header: 'RX SIGNAL', width: '170px', render: () => '' },
  { key: 'acciones', header: 'ACCIONES', width: '170px', render: () => '' },
];

export default function NetworkAdminOlt() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [activeTab, setActiveTab] = useState<AdminTab>('onus');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'onus', label: 'ONUS AUTORIZADAS' },
    { id: 'vlans', label: 'VLANS' },
    { id: 'zonas', label: 'ZONAS' },
    { id: 'profiles', label: 'PROFILES' },
    { id: 'naps', label: 'NAPS' },
    { id: 'api', label: 'API' },
  ];

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPageShell
        title="AdminOLT"
        breadcrumb="AdminOLT"
        isWispHub={isWispHub}
        showHeaderActions={false}
        showMikrosystemHeader={false}
      >
        <div className={isWispHub ? 'px-3 pt-6' : ''}>
          <MetricCards
            isWispHub={isWispHub}
            cards={[
              {
                label: 'Esperando autorizacion',
                value: 0,
                helperLeft: 'NO AUTORIZADAS: 0',
                helperRight: '',
                colorClass: 'bg-[#3f8fe0]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Online',
                value: 0,
                helperLeft: 'Total autorizadas: 0',
                helperRight: '',
                colorClass: 'bg-[#34b32c]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Total Offline',
                value: 0,
                helperLeft: 'Offline: 0',
                helperRight: '',
                colorClass: 'bg-[#323b44]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Low Signals',
                value: 0,
                helperLeft: 'Warning: 0',
                helperRight: 'Critical: 0',
                colorClass: 'bg-[#ffa514]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
            ]}
          />
        </div>

        <NetworkPanel isWispHub={isWispHub}>
          <div className="px-5 pt-5">
            <TopTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(value) => setActiveTab(value as AdminTab)}
              isWispHub={isWispHub}
            />
          </div>

          <div className="px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <PageSizeCluster
                isWispHub={isWispHub}
                pageSize={pageSize}
                onChange={setPageSize}
              />
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
          </div>
        </NetworkPanel>
      </NetworkPageShell>
    </div>
  );
}
