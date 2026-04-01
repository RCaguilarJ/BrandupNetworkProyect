import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Edit,
  List,
  Plus,
  Router,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { formatCurrency } from '../../lib/utils';
import {
  filterByCompany,
  HOTSPOT_PROFILES,
  HOTSPOT_ROUTERS,
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './hotspotData';

type RouterTab = 'routers' | 'profiles';

const routerColumns = ['ID', 'NOMBRE', 'IP', 'F. DISPONIBLES', 'ESTADO'];
const profileColumns = [
  'ID',
  'NOMBRE',
  'COSTO',
  'ROUTER',
  'PROFILE',
  'TRÁFICO',
  'TIEMPO',
  'F. DISPONIBLES',
  '',
];

export default function HotspotRouters() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [activeTab, setActiveTab] = useState<RouterTab>('routers');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  const routers = useMemo(
    () => filterByCompany(HOTSPOT_ROUTERS, user?.role, user?.companyId),
    [user?.companyId, user?.role],
  );
  const profiles = useMemo(
    () => filterByCompany(HOTSPOT_PROFILES, user?.role, user?.companyId),
    [user?.companyId, user?.role],
  );

  const filteredRouters = routers.filter((router) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      router.name.toLowerCase().includes(query) ||
      router.ip.toLowerCase().includes(query)
    );
  });

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      profile.name.toLowerCase().includes(query) ||
      profile.profile.toLowerCase().includes(query) ||
      profile.router.toLowerCase().includes(query)
    );
  });

  const visibleProfiles = filteredProfiles.slice(0, pageSize);

  const pageStyle = isWispHub ? wisphubPageStyle : mikrosystemPageStyle;
  const panelClass = isWispHub
    ? 'mx-3 mb-5 border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white';
  const controlClass = isWispHub
    ? 'h-[42px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#20324a] outline-none'
    : 'h-[48px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[14px] text-[#24364b] outline-none';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#394b60]'
    : 'inline-flex h-[48px] w-[48px] items-center justify-center rounded-[4px] border border-[#d7dde5] bg-white text-[#394b60]';
  const actionButtonClass = isWispHub
    ? 'inline-flex h-[42px] items-center gap-2 rounded-[6px] border border-[#42b960] bg-[#45bf63] px-4 text-[14px] font-semibold text-white'
    : 'inline-flex h-[48px] items-center gap-2 rounded-[4px] border border-[#d7dde5] bg-white px-4 text-[14px] font-semibold text-[#1f2f43]';

  const tabButtonClass = (tab: RouterTab) => {
    const active = activeTab === tab;

    if (isWispHub) {
      return `inline-flex h-[42px] items-center gap-2 rounded-t-[8px] px-5 text-[16px] font-semibold ${
        active
          ? 'border border-b-0 border-[#d7dde5] bg-white text-[#1f2f43]'
          : 'text-[#45bf63]'
      }`;
    }

    return `inline-flex h-[52px] items-center gap-2 rounded-t-[6px] px-5 text-[18px] ${
      active
        ? 'border border-b-0 border-[#d7dde5] bg-white text-[#33465a]'
        : 'text-[#4294ed]'
    }`;
  };

  const renderRouterTable = () => (
    <div className="overflow-hidden border border-[#d7dde5] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
          <thead>
            <tr className="bg-white">
              {routerColumns.map((column) => (
                <th
                  key={column}
                  className="border-b border-r border-[#d7dde5] px-4 py-3 text-left text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column}</span>
                    <ChevronsUpDown className="h-4 w-4 text-[#c3ccd6]" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRouters.length === 0 ? (
              <tr>
                <td
                  colSpan={routerColumns.length}
                  className="border-b border-[#d7dde5] bg-[#f5f7f9] px-4 py-7 text-center text-[16px] text-[#4d6177]"
                >
                  Ningún registro disponible
                </td>
              </tr>
            ) : (
              filteredRouters.slice(0, pageSize).map((router) => (
                <tr key={router.id}>
                  <td className="border-b border-r border-[#d7dde5] px-4 py-3">{router.id}</td>
                  <td className="border-b border-r border-[#d7dde5] px-4 py-3">{router.name}</td>
                  <td className="border-b border-r border-[#d7dde5] px-4 py-3">{router.ip}</td>
                  <td className="border-b border-r border-[#d7dde5] px-4 py-3">{router.availableCards}</td>
                  <td className="border-b border-[#d7dde5] px-4 py-3">{router.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfilesTable = () => (
    <div className="overflow-hidden border border-[#d7dde5] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[14px] text-[#24364b]">
          <thead>
            <tr className="bg-white">
              {profileColumns.map((column) => (
                <th
                  key={column || 'actions'}
                  className="border-b border-r border-[#d7dde5] px-4 py-3 text-left text-[13px] font-semibold uppercase text-[#24364b] last:border-r-0"
                >
                  {column ? (
                    <div className="flex items-center justify-between gap-2">
                      <span>{column}</span>
                      <ChevronsUpDown className="h-4 w-4 text-[#c3ccd6]" />
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleProfiles.map((profile) => (
              <tr key={profile.id} className="bg-white">
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">{profile.id}</td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">{profile.name}</td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                  {formatCurrency(profile.cost)}
                </td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">{profile.router}</td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">{profile.profile}</td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">{profile.traffic}</td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">{profile.time}</td>
                <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                  <span className="inline-flex min-w-[32px] justify-center rounded-full bg-[#11b5bb] px-3 py-1 text-[13px] font-semibold text-white">
                    {profile.availableCards}
                  </span>
                </td>
                <td className="border-b border-[#d7dde5] px-4 py-3">
                  <div className="flex items-center justify-center gap-3 text-[#2d4257]">
                    <button type="button" aria-label={`Editar perfil ${profile.name}`}>
                      <Edit className="h-5 w-5" />
                    </button>
                    <button type="button" aria-label={`Eliminar perfil ${profile.name}`}>
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const currentCount =
    activeTab === 'routers' ? filteredRouters.length : filteredProfiles.length;

  return (
    <div style={pageStyle}>
      {isWispHub ? (
        <header className="border-b border-[#d7dde5] px-3 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45bf63]">
                Hotspot
              </p>
              <h1 className="mt-2 text-[30px] font-semibold text-[#15263b]">
                Routers y Perfiles
              </h1>
            </div>
            <div className="text-right text-[13px] text-[#6d8093]">
              <span>Inicio</span>
              <span className="mx-2 text-[#b6c1cb]">/</span>
              <span className="font-semibold text-[#45bf63]">Routers</span>
            </div>
          </div>
        </header>
      ) : null}

      <section className={panelClass}>
        <div className={isWispHub ? 'px-5 pt-5' : 'px-5 pt-5'}>
          <div className="flex items-end gap-4 border-b border-[#d7dde5]">
            <button
              type="button"
              onClick={() => setActiveTab('routers')}
              className={tabButtonClass('routers')}
            >
              <Router className="h-4 w-4" />
              Routers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profiles')}
              className={tabButtonClass('profiles')}
            >
              <List className="h-4 w-4" />
              Perfiles
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-[6px] border border-[#d7dde5] bg-white">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className={`${controlClass} min-w-[58px] rounded-none border-0 border-r border-[#d7dde5] px-4`}
                  aria-label="Cantidad de registros"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button
                  type="button"
                  className={`${iconButtonClass} rounded-none border-0 border-r border-[#d7dde5]`}
                  aria-label="Vista de lista"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`${iconButtonClass} rounded-none border-0`}
                  aria-label="Guardar configuración"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>

              <button type="button" className={actionButtonClass}>
                <Plus className="h-4 w-4" />
                Nuevo
              </button>
            </div>

            <div className="relative w-full xl:max-w-[360px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6b5]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={`${controlClass} w-full pl-11`}
                placeholder="Buscar..."
                aria-label="Buscar router o perfil"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          {activeTab === 'routers' ? renderRouterTable() : renderProfilesTable()}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[16px] text-[#667b92]">
            <div>
              {currentCount === 0
                ? 'Mostrando 0 registros'
                : `Mostrando de 1 a ${activeTab === 'profiles' ? visibleProfiles.length : Math.min(pageSize, currentCount)} de un total de ${currentCount}`}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#8091a4]"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {currentCount > 0 && (
                <button
                  type="button"
                  className={`flex h-[48px] w-[48px] items-center justify-center rounded-[6px] font-semibold ${
                    isWispHub ? 'bg-[#45bf63] text-white' : 'bg-[#3f93e7] text-white'
                  }`}
                >
                  1
                </button>
              )}
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#8091a4]"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
