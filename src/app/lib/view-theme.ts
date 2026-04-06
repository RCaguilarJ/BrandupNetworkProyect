export type ViewThemeId = 'mikrosystem' | 'wisphub';

export type ViewThemeOption = {
  id: ViewThemeId;
  name: string;
  description: string;
  previewClassName: string;
};

export const VIEW_THEME_STORAGE_KEY = 'viewTheme';

export const VIEW_THEME_OPTIONS: ViewThemeOption[] = [
  {
    id: 'mikrosystem',
    name: 'Tema Mikrosystem',
    description: 'Vista azul profesional',
    previewClassName: 'bg-gradient-to-r from-blue-600 to-blue-800',
  },
  {
    id: 'wisphub',
    name: 'Tema WispHub',
    description: 'Vista verde moderna',
    previewClassName: 'bg-gradient-to-r from-green-500 to-emerald-600',
  },
];

export const THEME_DASHBOARD_ROLES = [
  'super_admin',
  'isp_admin',
  'tecnico',
] as const;

export function isViewTheme(value: string | null): value is ViewThemeId {
  return value === 'mikrosystem' || value === 'wisphub';
}

/**
 * Mantiene una única clase de tema visual en el documento para que CSS global,
 * dashboards y tablas reutilicen el mismo selector de estado.
 */
export function applyViewThemeClass(viewTheme: ViewThemeId) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.remove(
    'view-mikrosystem',
    'view-wisphub',
  );
  document.documentElement.classList.add(`view-${viewTheme}`);
}
