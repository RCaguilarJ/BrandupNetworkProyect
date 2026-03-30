import { Link } from 'react-router';
import {
  Banknote,
  Box,
  Cog,
  Database,
  FileText,
  HandCoins,
  ListChecks,
  LockKeyhole,
  Map,
  Send,
  ListFilter,
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

// Cada boton solo se habilita cuando existe ruta real y contrato documentado.
// Los modulos pendientes siguen visibles como catalogo hasta tener integracion completa.
const shortcutItems: ShortcutItem[] = [
  { id: 'general', label: 'General', icon: Cog, path: '/settings/general' },
  { id: 'database', label: 'Base de datos', icon: Database, path: '/backups' },
  { id: 'users', label: 'Usuarios', icon: UsersRound, path: '/settings/users' },
  { id: 'roles', label: 'Roles', icon: LockKeyhole, path: '/settings/roles' },
  { id: 'currencies', label: 'Divisas', icon: Banknote, path: '/settings/currencies' },
  { id: 'payment-methods', label: 'Formas de pago', icon: HandCoins },
  { id: 'receipts', label: 'Comprobantes', icon: FileText },
  { id: 'units', label: 'Unidades de medida', icon: Box },
  { id: 'incidents', label: 'Incidencias', icon: Wrench },
  { id: 'cron-jobs', label: 'Cron Jobs', icon: ListChecks },
  { id: 'zones', label: 'Zonas', icon: Map },
  { id: 'custom-fields', label: 'Campo Personalizados', icon: ListFilter },
  { id: 'wsp-templates', label: 'Plantillas de WSP', icon: Send },
];

const shortcutRows = [shortcutItems.slice(0, 8), shortcutItems.slice(8)];
const SHORTCUT_BUTTON_SIZE = 184;
const SHORTCUT_ICON_SIZE = 44;
const SHORTCUT_PADDING_TOP = 54;

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
        className="text-[#5e5c63]"
        strokeWidth={2.2}
        style={{ width: SHORTCUT_ICON_SIZE, height: SHORTCUT_ICON_SIZE }}
      />
      <span className="mt-[24px] max-w-[136px] text-center text-[12px] font-semibold leading-[1.2] text-black">
        {label}
      </span>
    </>
  );

  const className =
    'flex shrink-0 flex-col items-center rounded-full border border-white bg-white px-0 pb-0 text-[12px] shadow-[0_2px_5px_rgba(0,0,0,0.16),0_2px_10px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_6px_14px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.12)]';

  if (path) {
    return (
      <Link
        to={path}
        className={className}
        style={{ width: SHORTCUT_BUTTON_SIZE, height: SHORTCUT_BUTTON_SIZE, paddingTop: SHORTCUT_PADDING_TOP }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={{ width: SHORTCUT_BUTTON_SIZE, height: SHORTCUT_BUTTON_SIZE, paddingTop: SHORTCUT_PADDING_TOP }}
    >
      {content}
    </div>
  );
}

function ShortcutGrid() {
  return (
    <div className="mt-5 space-y-[20px]">
      <div className="hidden min-[1500px]:flex min-[1500px]:justify-start min-[1500px]:gap-[38px]">
        {shortcutRows[0].map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>

      <div className="hidden min-[1500px]:flex min-[1500px]:justify-center min-[1500px]:gap-[48px]">
        {shortcutRows[1].map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>

      <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-6 min-[1500px]:hidden sm:grid-cols-3 xl:grid-cols-4">
        {shortcutItems.map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>
    </div>
  );
}

/**
 * La pantalla replica una composicion fija de dos filas como en la referencia:
 * ocho accesos arriba y cinco centrados abajo.
 */
function SettingsCanvas() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-10 pt-[18px]">
      <div className="mb-1 flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Ajustes del Sistema</h1>

        <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Ajustes</span>
        </div>
      </div>

      <ShortcutGrid />
    </div>
  );
}

export default function Settings() {
  return <SettingsCanvas />;
}
