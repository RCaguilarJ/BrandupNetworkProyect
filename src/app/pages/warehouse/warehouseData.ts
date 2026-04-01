import type { CSSProperties } from 'react';

export type WarehouseProductTypeRecord = {
  id: string;
  companyId: string;
  product: string;
  description: string;
  type: string;
  tax: string;
  available: string;
};

export type WarehouseSupplierRecord = {
  id: string;
  companyId: string;
  supplier: string;
  email: string;
  phone: string;
  address: string;
};

export type WarehouseProductRecord = {
  id: string;
  companyId: string;
  product: string;
  supplier: string;
  serialNumber: string;
  macAddress: string;
  cost: string;
  status: string;
  client: string;
  ingreso: string;
  salida: string;
  category: string;
};

export type WarehouseAccessoryRecord = {
  id: string;
  companyId: string;
  accessory: string;
  unitCost: string;
  quantity: string;
};

export const warehouseMikrosystemPageStyle = {
  minHeight: '100%',
  backgroundColor: '#d9e7f3',
  padding: '18px 22px 26px',
  color: '#223448',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
} satisfies CSSProperties;

export const warehouseWisphubPageStyle = {
  minHeight: '100%',
  background:
    'radial-gradient(circle at top right, rgba(69, 191, 99, 0.08), transparent 28%), #ffffff',
  borderTop: '4px solid #45bf63',
  color: '#17273d',
  fontFamily:
    '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  paddingBottom: '32px',
} satisfies CSSProperties;

export const WAREHOUSE_PRODUCT_TYPES: WarehouseProductTypeRecord[] = [];

export const WAREHOUSE_SUPPLIERS: WarehouseSupplierRecord[] = [];

export const WAREHOUSE_PRODUCTS: WarehouseProductRecord[] = [];

export const WAREHOUSE_ACCESSORIES: WarehouseAccessoryRecord[] = [];

export function filterWarehouseByCompany<T extends { companyId: string }>(
  items: T[],
  role?: string,
  companyId?: string,
) {
  if (role === 'super_admin') {
    return items;
  }

  return items.filter((item) => item.companyId === companyId);
}
