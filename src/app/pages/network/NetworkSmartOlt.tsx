import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  MetricCards,
  NetworkPageShell,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  SelectField,
  TopTabs,
  type DataColumn,
} from './networkManagementShared';

type SmartTab = 'onus' | 'vlans' | 'zonas' | 'profiles' | 'odb' | 'api';

type EmptyRow = Record<string, never>;

const wisphubPageClassName =
  'min-h-full border-t-4 border-[#45bf63] bg-[radial-gradient(circle_at_top_right,rgba(69,191,99,0.08),transparent_28%),#ffffff] pb-8 text-[#17273d] [font-family:Trebuchet_MS,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';
const mikrosystemPageClassName =
  'min-h-full bg-[#d9e7f3] px-[22px] pt-[18px] pb-[26px] text-[#223448] [font-family:Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';

const columns: DataColumn<EmptyRow>[] = [
  { key: 'cliente', header: 'CLIENTE', render: () => '' },
  { key: 'sn', header: 'SN', width: '120px', render: () => '' },
  { key: 'olt', header: 'OLT', width: '120px', render: () => '' },
  { key: 'estado', header: 'ESTADO', width: '170px', render: () => '' },
  { key: 'board', header: 'BOARD', width: '170px', render: () => '' },
  { key: 'port', header: 'PORT', width: '120px', render: () => '' },
  { key: 'signal', header: 'SIGNAL', width: '150px', render: () => '' },
  { key: 'rx', header: 'RX SIGNAL', width: '170px', render: () => '' },
  { key: 'acciones', header: 'ACCIONES', width: '170px', render: () => '' },
];

export default function NetworkSmartOlt() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [activeTab, setActiveTab] = useState<SmartTab>('onus');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('todos');

  const tabs = [
    { id: 'onus', label: 'ONUS CONFIGURADOS' },
    { id: 'vlans', label: 'VLANS' },
    { id: 'zonas', label: 'Zonas' },
    { id: 'profiles', label: 'PROFILES' },
    { id: 'odb', label: 'ODB' },
    { id: 'api', label: 'API' },
  ];

  const filterOptions = [
    { value: 'todos', label: 'TODOS' },
    { value: 'online', label: 'ONLINE' },
    { value: 'offline', label: 'OFFLINE' },
  ];

  return (
    <div className={isWispHub ? wisphubPageClassName : mikrosystemPageClassName}>
      <NetworkPageShell
        title="Smart Olt"
        breadcrumb="Smart Olt"
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
                helperLeft: 'GPON: 0',
                helperRight: '',
                colorClass: isWispHub ? 'bg-[#3f8fe0]' : 'bg-[#16afb4]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Online',
                value: 0,
                helperLeft: 'Total Autorizados: 0',
                helperRight: '',
                colorClass: 'bg-[#34b32c]',
                watermark: <Globe className="h-[170px] w-[170px]" />,
              },
              {
                label: 'Total Offline',
                value: 0,
                helperLeft: isWispHub ? 'Offline: 0' : 'PwrFail: 0   LoS: 0',
                helperRight: isWispHub ? '' : 'N/A: 0',
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
              onChange={(value) => setActiveTab(value as SmartTab)}
              isWispHub={isWispHub}
            />
          </div>

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
                  value={filterValue}
                  onChange={setFilterValue}
                  options={filterOptions}
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
          </div>
        </NetworkPanel>
      </NetworkPageShell>
    </div>
  );
}
