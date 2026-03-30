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
  { id: 'payment-methods', label: 'Formas de pago', icon: HandCoins, path: '/payment-methods' },
  { id: 'receipts', label: 'Comprobantes', icon: FileText, path: '/settings/receipts' },
  { id: 'units', label: 'Unidades de medida', icon: Box, path: '/settings/units' },
  { id: 'incidents', label: 'Incidencias', icon: Wrench, path: '/settings/incidents' },
  { id: 'cron-jobs', label: 'Cron Jobs', icon: ListChecks, path: '/settings/cron-jobs' },
  { id: 'zones', label: 'Zonas', icon: Map, path: '/settings/zones' },
  { id: 'custom-fields', label: 'Campo Personalizados', icon: ListFilter, path: '/settings/custom-fields' },
  { id: 'wsp-templates', label: 'Plantillas de WSP', icon: Send, path: '/settings/wsp-templates' },
];

const shortcutRows = [shortcutItems.slice(0, 8), shortcutItems.slice(8)];

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
        className="h-9 w-9 text-[#5e5c63] sm:h-10 sm:w-10 xl:h-11 xl:w-11"
        strokeWidth={2.2}
      />
      <span className="mt-4 max-w-[136px] px-2 text-center text-[12px] font-semibold leading-[1.2] text-black sm:mt-5 xl:mt-6">
        {label}
      </span>
    </>
  );

  const className =
    'flex aspect-square w-full max-w-[184px] flex-col items-center rounded-full border border-white bg-white px-0 pb-0 pt-10 text-[12px] shadow-[0_2px_5px_rgba(0,0,0,0.16),0_2px_10px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_6px_14px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.12)] sm:pt-11 xl:pt-[54px]';

  if (path) {
    return (
      <Link to={path} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function ShortcutGrid() {
  return (
    <div className="mt-5 space-y-[20px]">
      <div className="hidden min-[1700px]:grid min-[1700px]:grid-cols-8 min-[1700px]:justify-items-center min-[1700px]:gap-x-[24px] min-[1700px]:gap-y-6">
        {shortcutRows[0].map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>

      <div className="hidden min-[1700px]:mx-auto min-[1700px]:grid min-[1700px]:max-w-[1240px] min-[1700px]:grid-cols-5 min-[1700px]:justify-items-center min-[1700px]:gap-x-[32px] min-[1700px]:gap-y-6">
        {shortcutRows[1].map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>

      <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 min-[1700px]:hidden sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {shortcutItems.map((item) => (
          <ShortcutButton key={item.id} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </div>
    </div>
  );
}

/**
 * La pantalla replica la matriz 8+5 en escritorio amplio.
 * En anchos intermedios y moviles, los botones refluyén a una grilla fluida
 * para evitar desbordes entre navegadores y despliegues como Vercel.
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
