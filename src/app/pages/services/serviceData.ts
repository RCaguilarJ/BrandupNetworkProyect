import type { CSSProperties } from 'react';

export type InternetServiceRecord = {
  id: string;
  companyId: string;
  name: string;
  downloadKbps: string;
  uploadKbps: string;
  price: string;
  active: string;
  suspended: string;
};

export type VoiceServiceRecord = {
  id: string;
  companyId: string;
  name: string;
  price: string;
  active: string;
  suspended: string;
  retired: string;
};

export type CustomServiceRecord = {
  id: string;
  companyId: string;
  name: string;
  price: string;
  tax: string;
  active: string;
  suspended: string;
  retired: string;
};

export const serviceMikrosystemPageStyle = {
  minHeight: '100%',
  backgroundColor: '#d9e7f3',
  padding: '18px 22px 26px',
  color: '#223448',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
} satisfies CSSProperties;

export const serviceWisphubPageStyle = {
  minHeight: '100%',
  background:
    'radial-gradient(circle at top right, rgba(69, 191, 99, 0.08), transparent 28%), #ffffff',
  borderTop: '4px solid #45bf63',
  color: '#17273d',
  fontFamily:
    '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  paddingBottom: '32px',
} satisfies CSSProperties;

export const INTERNET_SERVICES: InternetServiceRecord[] = [];
export const VOICE_SERVICES: VoiceServiceRecord[] = [];
export const CUSTOM_SERVICES: CustomServiceRecord[] = [];

export function filterServicesByCompany<T extends { companyId: string }>(
  items: T[],
  role?: string,
  companyId?: string,
) {
  if (role === 'super_admin') {
    return items;
  }

  return items.filter((item) => item.companyId === companyId);
}
