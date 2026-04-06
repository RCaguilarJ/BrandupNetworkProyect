import { Link } from 'react-router';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import {
  BadgeDollarSign,
  BellRing,
  Clock3,
  CodeXml,
  Cog,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Globe,
  HandCoins,
  LifeBuoy,
  ListChecks,
  Logs,
  Mail,
  MapPinned,
  MessageCircleMore,
  RefreshCw,
  Settings2,
  ShieldAlert,
  Upload,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

type ShortcutItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
};

// El tablero replica el catalogo del diseno oficial.
// Solo se habilita navegacion cuando ya existe una vista real o reutilizable.
const shortcutItems: ShortcutItem[] = [
  { id: 'general', label: 'General', icon: Cog, path: '/settings/general' },
  { id: 'staff-management', label: 'Gestion personal', icon: UsersRound, path: '/settings/staff-management' },
  { id: 'mail-server', label: 'Servidor de correo', icon: Mail, path: '/settings/mail-server' },
  { id: 'custom-domains', label: 'Dominios personalizados', icon: Globe, path: '/settings/custom-domains' },
  { id: 'billing', label: 'Facturacion', icon: FileText, path: '/billing' },
  {
    id: 'electronic-billing',
    label: 'Facturacion Electronica',
    icon: FileSpreadsheet,
    path: '/billing/electronic-billing',
  },
  { id: 'payment-gateways', label: 'Pasarelas de pago', icon: HandCoins, path: '/payment-methods' },
  { id: 'template-editor', label: 'Editor plantillas', icon: CodeXml, path: '/settings/template-editor' },
  { id: 'client-portal', label: 'Portal cliente', icon: UserRound, path: '/settings/client-portal' },
  { id: 'push-notifications', label: 'Notificaciones Push', icon: BellRing },
  { id: 'tickets', label: 'Tickets', icon: LifeBuoy, path: '/tickets' },
  { id: 'zendesk-support', label: 'Zendesk Support', icon: BadgeDollarSign },
  {
    id: 'blacklist-monitor',
    label: 'Monitor Blacklist',
    icon: ShieldAlert,
    path: '/network-management/monitor-blacklist',
  },
  { id: 'import-clients', label: 'Importar clientes', icon: Upload, path: '/settings/import-clients' },
  { id: 'bulk-changes', label: 'Cambios Masivos', icon: RefreshCw },
  { id: 'settings-templates', label: 'Plantillas Configuracion', icon: Settings2, path: '/settings/configuration-templates' },
  { id: 'invoice-messages', label: 'Mensajes Facturas', icon: FileCode2, path: '/settings/invoice-messages' },
  { id: 'locations', label: 'Ubicaciones', icon: MapPinned, path: '/settings/locations' },
  { id: 'custom-fields', label: 'Campos personalizados', icon: UsersRound, path: '/settings/custom-fields' },
  { id: 'messaging', label: 'Mensajeria', icon: MessageCircleMore, path: '/messaging' },
  { id: 'crontab', label: 'Crontab', icon: Clock3, path: '/settings/cron-jobs' },
  { id: 'logs', label: 'Logs', icon: Logs },
  { id: 'migrate', label: 'Migrar', icon: RefreshCw, path: '/settings/migrate' },
];

const desktopRows = [
  shortcutItems.slice(0, 5),
  shortcutItems.slice(5, 10),
  shortcutItems.slice(10, 15),
  shortcutItems.slice(15, 20),
  shortcutItems.slice(20, 23),
];

function ShortcutButton({
  icon: Icon,
  label,
  path,
}: {
  icon: LucideIcon;
  label: string;
  path?: string;
}) {
  const content = (
    <>
      <Icon
        className="h-11 w-11 text-[#66636d] sm:h-12 sm:w-12 xl:h-[54px] xl:w-[54px]"
        strokeWidth={2.1}
      />
      <span className="mt-5 max-w-[148px] px-3 text-center text-[13px] font-medium leading-[1.25] text-black sm:mt-6 xl:text-[14px]">
        {label}
      </span>
    </>
  );

  const className =
    'flex aspect-square w-full max-w-[188px] flex-col items-center justify-center rounded-full border border-white bg-white px-4 py-0 shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]';

  if (path) {
    return (
      <Link to={path} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function DesktopRow({
  items,
  columns,
  maxWidthClass,
}: {
  items: ShortcutItem[];
  columns: string;
  maxWidthClass: string;
}) {
  return (
    <div className={`mx-auto hidden ${maxWidthClass} ${columns} min-[1700px]:grid min-[1700px]:justify-items-center min-[1700px]:gap-x-[34px] min-[1700px]:gap-y-7`}>
      {items.map((item) => (
        <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
      ))}
    </div>
  );
}

function ShortcutGrid() {
  return (
    <div className="mt-6 space-y-[28px]">
      <DesktopRow items={desktopRows[0]} columns="min-[1700px]:grid-cols-5" maxWidthClass="min-[1700px]:max-w-[1260px]" />
      <DesktopRow items={desktopRows[1]} columns="min-[1700px]:grid-cols-5" maxWidthClass="min-[1700px]:max-w-[1260px]" />
      <DesktopRow items={desktopRows[2]} columns="min-[1700px]:grid-cols-5" maxWidthClass="min-[1700px]:max-w-[1260px]" />
      <DesktopRow items={desktopRows[3]} columns="min-[1700px]:grid-cols-5" maxWidthClass="min-[1700px]:max-w-[1260px]" />
      <DesktopRow items={desktopRows[4]} columns="min-[1700px]:grid-cols-3" maxWidthClass="min-[1700px]:max-w-[760px]" />

      <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 min-[1700px]:hidden sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {shortcutItems.map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>
    </div>
  );
}

function SettingsCanvas() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-10 pt-[18px]">
      <div className="mb-1 flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Ajustes del Sistema</h1>

        <SettingsBreadcrumb currentLabel="Ajustes" />
      </div>

      <ShortcutGrid />
    </div>
  );
}

export default function Settings() {
  return <SettingsCanvas />;
}
