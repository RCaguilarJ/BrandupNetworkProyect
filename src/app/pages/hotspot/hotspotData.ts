import type { CSSProperties } from 'react';

export type HotspotFicha = {
  id: string;
  companyId: string;
  userPin: string;
  password: string;
  router: string;
  profile: string;
  limit: string;
  createdAt: string;
  activatedAt?: string;
  status: 'activa' | 'pendiente' | 'expirada';
};

export type HotspotRouterItem = {
  id: string;
  companyId: string;
  name: string;
  ip: string;
  availableCards: number;
  status: 'activo' | 'inactivo';
};

export type HotspotProfile = {
  id: string;
  companyId: string;
  name: string;
  cost: number;
  router: string;
  profile: string;
  traffic: string;
  time: string;
  availableCards: number;
};

export const WISPHUB_FONT =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

export const mikrosystemPageStyle = {
  minHeight: '100%',
  backgroundColor: '#d9e7f3',
  padding: '18px 22px 26px',
  color: '#223448',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
} satisfies CSSProperties;

export const wisphubPageStyle = {
  minHeight: '100%',
  background:
    'radial-gradient(circle at top right, rgba(69, 191, 99, 0.08), transparent 28%), #ffffff',
  borderTop: '4px solid #45bf63',
  color: '#17273d',
  fontFamily: WISPHUB_FONT,
  paddingBottom: '32px',
} satisfies CSSProperties;

export const HOTSPOT_FICHAS: HotspotFicha[] = [];

export const HOTSPOT_ROUTERS: HotspotRouterItem[] = [];

export const HOTSPOT_PROFILES: HotspotProfile[] = [
  {
    id: '1',
    companyId: 'comp1',
    name: 'alumnos',
    cost: 1,
    router: '-',
    profile: 'Alumnos',
    traffic: 'Ilimitado',
    time: '0-1-0',
    availableCards: 0,
  },
  {
    id: '2',
    companyId: 'comp1',
    name: 'alumnos2',
    cost: 10,
    router: '-',
    profile: 'AlumnosPrueba',
    traffic: 'Ilimitado',
    time: '0-1-0',
    availableCards: 9,
  },
];

export function filterByCompany<T extends { companyId: string }>(
  items: T[],
  role?: string,
  companyId?: string,
) {
  if (role === 'super_admin') {
    return items;
  }

  return items.filter((item) => item.companyId === companyId);
}

export function formatDateForGrid(value?: string) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

export function statusChipClass(status: 'activa' | 'pendiente' | 'expirada') {
  switch (status) {
    case 'activa':
      return 'bg-emerald-100 text-emerald-700';
    case 'pendiente':
      return 'bg-amber-100 text-amber-700';
    case 'expirada':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
