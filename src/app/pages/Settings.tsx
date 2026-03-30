import { type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { MOCK_COMPANIES } from '../data/mockData';
import { Link } from 'react-router';
import {
  ArrowLeftRight,
  Chrome,
  CircleUserRound,
  Clock3,
  Cog,
  Code,
  Database,
  FileSliders,
  FileText,
  Files,
  HandCoins,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircleMore,
  ReceiptText,
  ScrollText,
  Server,
  Ticket,
  Upload,
  UserRoundPen,
  UsersRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

type ShortcutItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
};

// Solo los accesos con `path` navegan a una vista real; el resto permanece visual
// hasta que exista modulo y contrato backend documentado.
const shortcutItems: ShortcutItem[] = [
  { id: 'general', label: 'General', icon: Cog, path: '/settings/general' },
  { id: 'staff', label: 'Gestión personal', icon: UsersRound },
  { id: 'mail-server', label: 'Servidor de correo', icon: Mail },
  { id: 'billing', label: 'Facturación', icon: FileText },
  { id: 'electronic-billing', label: 'Facturación electrónica', icon: ReceiptText },
  { id: 'payment-gateways', label: 'Pasarelas de pago', icon: HandCoins },
  { id: 'template-editor', label: 'Editor plantillas', icon: Code },
  { id: 'client-portal', label: 'Portal cliente', icon: CircleUserRound },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'import-clients', label: 'Importar clientes', icon: Upload },
  { id: 'mass-changes', label: 'Cambios masivos', icon: ArrowLeftRight },
  { id: 'config-templates', label: 'Plantillas configuración', icon: FileSliders },
  { id: 'invoice-messages', label: 'Mensajes facturas', icon: ScrollText },
  { id: 'locations', label: 'Ubicaciones', icon: MapPin },
  { id: 'custom-fields', label: 'Campos personalizados', icon: UserRoundPen },
  { id: 'messaging', label: 'Mensajería', icon: MessageCircleMore },
  { id: 'google', label: 'Google', icon: Chrome },
  { id: 'database', label: 'Base de datos', icon: Database },
  { id: 'crontab', label: 'Crontab', icon: Clock3 },
  { id: 'logs', label: 'Logs', icon: Files },
  { id: 'system', label: 'Sistema', icon: Wrench },
  { id: 'server', label: 'Servidor', icon: Server, path: '/settings/server' },
];

/**
 * Renderiza la cuadricula de Ajustes y deja navegables solo los modulos ya preparados.
 */
function ShortcutGrid({ variant }: { variant: 'mikrosystem' | 'wisphub' }) {
  const panelClass =
    variant === 'mikrosystem'
      ? 'rounded-[1.75rem] border border-slate-200 bg-slate-200/90 p-4 dark:border-slate-700 dark:bg-slate-900/70'
      : 'rounded-[1.75rem] border border-slate-200 bg-slate-100/90 p-4 dark:border-slate-700 dark:bg-slate-900/70';

  return (
    <div className={panelClass}>
      <div className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {shortcutItems.map(({ id, label, icon: Icon, path }) => (
          <div key={id} className="m-[10px_16px] flex items-center justify-center">
            {path ? (
              <Link
                to={path}
                className="flex h-[170px] w-[170px] flex-col items-center rounded-full border border-white/80 bg-white px-0 pb-0 pt-[50px] text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <Icon className="h-10 w-10 text-slate-600 dark:text-slate-200" />
                <span className="mt-4 max-w-[120px] text-[12px] font-semibold leading-[1.25] text-slate-700 dark:text-slate-100">
                  {label}
                </span>
              </Link>
            ) : (
              <div className="flex h-[170px] w-[170px] flex-col items-center rounded-full border border-white/80 bg-white px-0 pb-0 pt-[50px] text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <Icon className="h-10 w-10 text-slate-600 dark:text-slate-200" />
                <span className="mt-4 max-w-[120px] text-[12px] font-semibold leading-[1.25] text-slate-700 dark:text-slate-100">
                  {label}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Unifica la presentacion de la vista Ajustes entre ambos temas.
 */
function SingleSettingsView({
  variant,
  title,
  description,
}: {
  variant: 'mikrosystem' | 'wisphub';
  title: string;
  description: string;
}) {
  if (variant === 'mikrosystem') {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <ShortcutGrid variant="mikrosystem" />
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <ShortcutGrid variant="wisphub" />
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { viewTheme } = useViewTheme();
  const { user } = useAuth();
  const company = user?.role === 'isp_admin' ? MOCK_COMPANIES.find((item) => item.id === user.companyId) : null;
  const pageTitle = user?.role === 'super_admin' ? 'Configuración Global' : 'Configuración de Empresa';
  const pageDescription =
    user?.role === 'super_admin'
      ? 'Accesos rápidos a los módulos principales de configuración.'
      : `Accesos rápidos de configuración para ${company?.name || 'tu empresa'}.`;

  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center justify-between bg-gray-800 px-6 py-3 dark:bg-gray-900">
          <h1 className="text-base font-bold text-white">{pageTitle}</h1>
        </div>
        <div className="h-[calc(100vh-120px)] overflow-y-auto p-6">
          <SingleSettingsView variant="mikrosystem" title="Ajustes" description={pageDescription} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 lg:px-6 lg:pb-6">
      <div className="mb-6 pt-4 lg:pt-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{pageDescription}</p>
      </div>
      <SingleSettingsView variant="wisphub" title="Ajustes" description={pageDescription} />
    </div>
  );
}
