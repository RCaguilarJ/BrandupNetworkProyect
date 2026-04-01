import { useState } from 'react';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './networkManagementData';
import {
  NetworkPanel,
  NetworkTable,
  PageSizeCluster,
  PaginationBar,
  SearchField,
  SelectField,
  TopTabs,
  type DataColumn,
} from './networkManagementShared';

type TrapemnTab = 'devices' | 'plans' | 'api';
type EmptyRow = Record<string, never>;

const deviceColumns: DataColumn<EmptyRow>[] = [
  { key: 'cliente', header: 'CLIENTE', render: () => '' },
  { key: 'rut', header: 'RUT', width: '100px', render: () => '' },
  { key: 'crm', header: 'ID CRM', width: '120px', render: () => '' },
  { key: 'usuario', header: 'USUARIO', width: '130px', render: () => '' },
  { key: 'macs', header: 'MACS ASOCIADOS', width: '210px', render: () => '' },
  { key: 'disp', header: 'DISP.', width: '90px', render: () => '' },
  { key: 'plan', header: 'PLAN', width: '100px', render: () => '' },
  { key: 'estado', header: 'ESTADO', width: '120px', render: () => '' },
];

const planColumns: DataColumn<EmptyRow>[] = [
  { key: 'planid', header: 'PLAN ID', width: '160px', render: () => '' },
  { key: 'nombre', header: 'NOMBRE', render: () => '' },
  { key: 'categorias', header: 'CATEGORIAS', render: () => '' },
];

export default function NetworkTrapemn() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [activeTab, setActiveTab] = useState<TrapemnTab>('devices');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [disableTv, setDisableTv] = useState('no');

  const tabs = [
    { id: 'devices', label: 'EQUIPOS CONFIGURADOS' },
    { id: 'plans', label: 'PLANES TRAPEMN' },
    { id: 'api', label: 'API' },
  ];

  const inputClass = isWispHub
    ? 'h-[46px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[16px] text-[#20324a] outline-none'
    : 'h-[50px] rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[16px] text-[#24364b] outline-none';

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <NetworkPanel isWispHub={isWispHub}>
        <div className="px-0 pt-0">
          <TopTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(value) => setActiveTab(value as TrapemnTab)}
            isWispHub={isWispHub}
          />
        </div>

        {activeTab === 'devices' ? (
          <>
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
              <NetworkTable columns={deviceColumns} rows={[]} loadingMessage="Cargando..." />
              <PaginationBar
                isWispHub={isWispHub}
                summary="Mostrando 0 registros"
                showCurrentPage={false}
              />
            </div>
          </>
        ) : null}

        {activeTab === 'plans' ? (
          <>
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
              <NetworkTable columns={planColumns} rows={[]} loadingMessage="Cargando..." />
              <PaginationBar
                isWispHub={isWispHub}
                summary="Mostrando 0 registros"
                showCurrentPage={false}
              />
            </div>
          </>
        ) : null}

        {activeTab === 'api' ? (
          <div className="px-6 py-6">
            <div className="max-w-[760px]">
              <h2 className="text-[24px] text-[#2a3f57]">Configuracion Conexion API</h2>
              <div className="mt-8 space-y-6">
                <div>
                  <label className="mb-3 block text-[16px] text-[#344a5f]">
                    Dominio Trapemn
                  </label>
                  <input
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="Ejm: miwifi"
                    className={`${inputClass} w-full`}
                  />
                  <p className="mt-2 text-[14px] text-[#11b8aa]">
                    Ejm: https://miempresa.trapemn.tv
                  </p>
                </div>

                <div>
                  <label className="mb-3 block text-[16px] text-[#344a5f]">
                    Token de Seguridad
                  </label>
                  <input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="kljsdkljx232klj32"
                    className={`${inputClass} w-full`}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-[16px] text-[#344a5f]">
                    Desactivar TV
                  </label>
                  <SelectField
                    isWispHub={isWispHub}
                    value={disableTv}
                    onChange={setDisableTv}
                    options={[
                      { value: 'no', label: 'NO' },
                      { value: 'si', label: 'SI' },
                    ]}
                    className="max-w-[320px]"
                  />
                  <p className="mt-2 text-[14px] text-[#f7a035]">
                    * ACTIVA/DESACTIVA TV al suspender/activar al cliente en la plataforma.
                  </p>
                </div>

                <button
                  type="button"
                  className={`inline-flex h-[50px] items-center rounded-[4px] px-5 text-[18px] font-semibold ${
                    isWispHub
                      ? 'border border-[#42b960] bg-[#45bf63] text-white'
                      : 'border border-[#268df2] bg-[#3399f6] text-white'
                  }`}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </NetworkPanel>
    </div>
  );
}
