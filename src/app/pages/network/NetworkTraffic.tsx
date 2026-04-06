import { useState } from 'react';
import { BarChart3, List } from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  DateRangeField,
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  SelectField,
  SummaryCard,
  TopTabs,
  TrafficChartPlaceholder,
  type DataColumn,
} from './networkManagementShared';

type TrafficTab = 'list' | 'chart';
type EmptyRow = Record<string, never>;

const wisphubPageClassName =
  'min-h-full border-t-4 border-[#45bf63] bg-[radial-gradient(circle_at_top_right,rgba(69,191,99,0.08),transparent_28%),#ffffff] pb-8 text-[#17273d] [font-family:Trebuchet_MS,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';
const mikrosystemPageClassName =
  'min-h-full bg-[#d9e7f3] px-[22px] pt-[18px] pb-[26px] text-[#223448] [font-family:Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]';

const listColumns: DataColumn<EmptyRow>[] = [
  { key: 'num', header: '#', width: '60px', render: () => '' },
  { key: 'cliente', header: 'CLIENTE', render: () => '' },
  { key: 'ip', header: 'IP', width: '120px', render: () => '' },
  { key: 'descarga', header: 'DESCARGA', width: '180px', render: () => '' },
  { key: 'subida', header: 'SUBIDA', width: '170px', render: () => '' },
  { key: 'user', header: 'USER PPP/HS', width: '230px', render: () => '' },
  { key: 'fecha', header: 'FECHA', width: '170px', render: () => '' },
  { key: 'tiempo', header: 'TIEMPO', width: '170px', render: () => '' },
  { key: 'mac', header: 'MAC', width: '140px', render: () => '' },
  { key: 'router', header: 'ROUTER', width: '170px', render: () => '' },
];

const tabs = [
  { id: 'list', label: 'LISTA TRAFICO', icon: <List className="h-4 w-4" /> },
  { id: 'chart', label: 'GRAFICOS', icon: <BarChart3 className="h-4 w-4" /> },
];

const sharedOptions = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'norte', label: 'Zona Norte' },
  { value: 'sur', label: 'Zona Sur' },
];

export default function NetworkTraffic() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [activeTab, setActiveTab] = useState<TrafficTab>('list');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [routerFilter, setRouterFilter] = useState('any');
  const [locationFilter, setLocationFilter] = useState('any');
  const [issuerFilter, setIssuerFilter] = useState('any');
  const [planFilter, setPlanFilter] = useState('any');
  const [year, setYear] = useState('2026');
  const [startDate, setStartDate] = useState('01/04/2026');
  const [endDate, setEndDate] = useState('30/04/2026');

  return (
    <div className={isWispHub ? wisphubPageClassName : mikrosystemPageClassName}>
      <NetworkPanel isWispHub={isWispHub}>
        <div className="px-0 pt-0">
          <TopTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(value) => setActiveTab(value as TrafficTab)}
            isWispHub={isWispHub}
          />
        </div>

        <div className="px-5 py-4">
          <div className="grid gap-4 lg:grid-cols-4">
            {activeTab === 'chart' ? (
              <SelectField
                isWispHub={isWispHub}
                value={year}
                onChange={setYear}
                options={[
                  { value: '2026', label: '2026' },
                  { value: '2025', label: '2025' },
                ]}
                className="lg:max-w-[200px]"
              />
            ) : null}
            <SelectField
              isWispHub={isWispHub}
              value={routerFilter}
              onChange={setRouterFilter}
              options={sharedOptions}
            />
            <SelectField
              isWispHub={isWispHub}
              value={locationFilter}
              onChange={setLocationFilter}
              options={sharedOptions}
            />
            <SelectField
              isWispHub={isWispHub}
              value={issuerFilter}
              onChange={setIssuerFilter}
              options={sharedOptions}
            />
            <SelectField
              isWispHub={isWispHub}
              value={planFilter}
              onChange={setPlanFilter}
              options={sharedOptions}
            />
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="px-5 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <PageSizeCluster
                    isWispHub={isWispHub}
                    pageSize={pageSize}
                    onChange={setPageSize}
                  />
                  <div className="min-w-[320px]">
                    <DateRangeField
                      isWispHub={isWispHub}
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                    />
                  </div>
                </div>
                <SearchField
                  isWispHub={isWispHub}
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>
            </div>

            <div className="px-5 pb-5">
              <NetworkTable columns={listColumns} rows={[]} emptyMessage="Ningun registro disponible" />
              <PaginationBar
                isWispHub={isWispHub}
                summary="Mostrando 0 registros"
                showCurrentPage={false}
              />
              <SummaryCard
                title="Resumen"
                rows={[
                  { label: 'Tiempo', value: '00:00:00' },
                  { label: 'Descarga', value: 0 },
                  { label: 'Subida', value: 0 },
                ]}
              />
            </div>
          </>
        ) : (
          <div className="px-5 pb-5">
            <TrafficChartPlaceholder />
            <SummaryCard
              title="Resumen"
              rows={[
                { label: 'Sesiones', value: 0 },
                { label: 'Tiempo', value: '00:00:00' },
                { label: 'Descarga', value: 0 },
                { label: 'Subida', value: 0 },
              ]}
            />
          </div>
        )}
      </NetworkPanel>
    </div>
  );
}
