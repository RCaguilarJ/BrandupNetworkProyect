import type { CSSProperties } from 'react';

export type NetworkRouterRecord = {
  id: string;
  companyId: string;
  folio: number;
  name: string;
  subtitle: string;
  ip: string;
  model: string;
  version: string;
  clients: number;
  status: string;
};

export type NapBoxRecord = {
  id: string;
  companyId: string;
  name: string;
  location: string;
  coordinates: string;
  ports: number;
  details: number[];
};

export type TrapemnDeviceRecord = {
  id: string;
  companyId: string;
  client: string;
  rut: string;
  crmId: string;
  user: string;
  macs: number;
  devices: number;
  plan: string;
  status: string;
};

export type TrapemnPlanRecord = {
  id: string;
  companyId: string;
  planId: string;
  name: string;
  categories: string;
};

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
  fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  paddingBottom: '32px',
} satisfies CSSProperties;

export const NETWORK_ROUTERS: NetworkRouterRecord[] = [
  {
    id: 'router-1',
    companyId: 'comp1',
    folio: 1,
    name: 'Router Principal',
    subtitle: 'Api + Colas simples Estaticas',
    ip: '10.214.2.2',
    model: '',
    version: '5',
    clients: 0,
    status: 'API-ERROR',
  },
];

export const NETWORK_NAP_BOXES: NapBoxRecord[] = [
  {
    id: 'nap-1',
    companyId: 'comp1',
    name: 'C 01',
    location: 'Aldama Carranza',
    coordinates: '-9.724369133223936,-76.65902153125',
    ports: 16,
    details: Array.from({ length: 16 }, (_, index) => index + 1),
  },
  {
    id: 'nap-2',
    companyId: 'comp1',
    name: 'C 02',
    location: 'aldama guadalupe',
    coordinates: '19.999965247192577, -100.51917083773984',
    ports: 16,
    details: Array.from({ length: 16 }, (_, index) => index + 1),
  },
];

export const TRAPEMN_DEVICES: TrapemnDeviceRecord[] = [];

export const TRAPEMN_PLANS: TrapemnPlanRecord[] = [];

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
