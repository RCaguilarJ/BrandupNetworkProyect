import { type ReactNode } from 'react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import {
  type ServerManagementAction,
  type ServerManagementData,
  type ServerManagementMysqlVariable,
} from '../types';
import { Link } from 'react-router';
import { Power, RefreshCcw, Settings2 } from 'lucide-react';

/**
 * Devuelve la forma estable que la pantalla espera consumir.
 * Backend puede entregar esta estructura o un adapter equivalente.
 */
function getServerManagementMockData(): ServerManagementData {
  return {
    pageTitle: 'Servidor',
    pageDescription: 'Panel de mantenimiento y acceso remoto preparado para integracion backend.',
    mysqlPanel: {
      title: 'Servidor MYSQL',
      variables: [
        { key: 'in_predicate_conversion_threshold', label: 'in predicate conversion threshold', value: '1000' },
        { key: 'system_versioning_alter_history', label: 'system versioning alter history', value: 'ERROR', tone: 'error' },
        { key: 'system_versioning_asof', label: 'system versioning asof', value: 'DEFAULT' },
        { key: 'system_versioning_insert_history', label: 'system versioning insert history', value: 'OFF' },
        { key: 'tls_version', label: 'tls version', value: 'TLSv1.2,TLSv1.3' },
        { key: 'version', label: 'version', value: '10.11.14-MariaDB-0+deb12u2' },
        { key: 'version_comment', label: 'version comment', value: 'Debian 12' },
        { key: 'version_compile_machine', label: 'version compile machine', value: 'x86_64' },
        { key: 'version_source_revision', label: 'version source revision', value: '053f9bcb5b147bf00edb99e1310bae9125b7f125' },
      ],
    },
    repairPanel: {
      title: 'Reparar Permisos & Archivos',
      items: [
        { id: 'crontab', title: 'Crontab', description: 'Instalar las tareas programadas.' },
        { id: 'filesystem', title: 'Archivos y Carpetas', description: 'Reparar permisos de archivos y carpetas.' },
        { id: 'socket-io', title: 'Socket IO', description: 'Reparar conexión socket para alertas, telegram y reinstalar el localtunnel & ngrok.' },
      ],
      actionLabel: 'Reparar servicios',
      actionKey: 'repair_services',
    },
    controlPanel: {
      title: 'Servidor',
      actions: [
        {
          id: 'restart-telegram',
          label: 'Reiniciar Telegram',
          actionKey: 'restart_telegram',
          variant: 'outline',
          helperText: '* Elimina la conexión a telegram para volver ser configurado.',
        },
        { id: 'restart-server', label: 'Reiniciar servidor', actionKey: 'restart_server', variant: 'outline', requiresConfirmation: true },
        { id: 'shutdown-server', label: 'Apagar servidor', actionKey: 'shutdown_server', variant: 'destructive', requiresConfirmation: true },
      ],
    },
    remoteAccessPanel: {
      title: 'LocalTunnel & ngrok (Acceso remoto)',
      access: {
        description: 'Permite acceder de forma remota a nuestro servidor Mikrowisp sin contar con una IP pública.',
        webAccessLabel: 'URL ACCESO WEB',
        webAccessUrl: '',
        sshAccessLabel: 'ACCESO SSH',
        sshAccessHost: '',
        sshTokenLabel: 'Token de acceso ssh',
        sshTokenValue: '',
        helperText: 'Para obtener nuestro token "ngrok" debemos registrarnos',
        helperLinkLabel: 'Aquí',
        helperLinkUrl: 'https://ngrok.com/',
        actionLabel: 'Crear TunelVPN',
        actionKey: 'create_tunnel_vpn',
      },
    },
  };
}

/**
 * Traduce la semántica del dato MySQL a una clase visual estable.
 */
function getMysqlValueClass(variable: ServerManagementMysqlVariable) {
  return variable.tone === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200';
}

/**
 * Resuelve el icono operativo según la accion para reforzar intención visual.
 */
function getActionIcon(action: ServerManagementAction) {
  if (action.actionKey === 'shutdown_server') {
    return <Power className="h-4 w-4" />;
  }

  if (action.actionKey === 'repair_services') {
    return <Settings2 className="h-4 w-4" />;
  }

  return <RefreshCcw className="h-4 w-4" />;
}

function ServerPanel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5', className)}>
      <header className="bg-slate-800 px-4 py-3 text-sm font-semibold text-white">{title}</header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function ServerManagement() {
  const data = getServerManagementMockData();

  return (
    <div className="min-h-full bg-[#d3dce7] px-4 pb-6 pt-4 lg:px-6">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{data.pageTitle}</h1>
          <p className="text-sm text-slate-600">{data.pageDescription}</p>
        </div>
        <Link
          to="/settings"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Volver a Ajustes
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <ServerPanel title={data.mysqlPanel.title} className="xl:min-h-[640px]">
          <div className="space-y-4">
            {data.mysqlPanel.variables.map((variable) => (
              <article key={variable.key}>
                <h2 className="text-[19px] font-medium text-slate-900">{variable.label}</h2>
                <p className={cn('mt-1 text-[13px]', getMysqlValueClass(variable))}>{variable.value}</p>
              </article>
            ))}
          </div>
        </ServerPanel>

        <div className="grid gap-5">
          <ServerPanel title={data.repairPanel.title}>
            <div className="space-y-4">
              {data.repairPanel.items.map((item) => (
                <article key={item.id}>
                  <h2 className="text-[18px] font-medium text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-[14px] text-slate-700">{item.description}</p>
                </article>
              ))}
              <Button variant="outline" size="sm" className="mt-2 gap-2">
                {getActionIcon({ id: 'repair', label: data.repairPanel.actionLabel, actionKey: data.repairPanel.actionKey, variant: 'outline' })}
                {data.repairPanel.actionLabel}
              </Button>
            </div>
          </ServerPanel>

          <ServerPanel title={data.remoteAccessPanel.title}>
            <div className="space-y-5">
              <p className="text-[15px] text-slate-700">{data.remoteAccessPanel.access.description}</p>

              <div className="space-y-3">
                <div>
                  <h2 className="text-[18px] font-medium text-slate-900">{data.remoteAccessPanel.access.webAccessLabel}</h2>
                  <p className="mt-1 min-h-7 text-[15px] text-slate-700">
                    {data.remoteAccessPanel.access.webAccessUrl || '-'}
                  </p>
                </div>
                <div>
                  <h2 className="text-[18px] font-medium text-slate-900">{data.remoteAccessPanel.access.sshAccessLabel}</h2>
                  <p className="mt-1 min-h-7 text-[15px] text-slate-700">
                    {data.remoteAccessPanel.access.sshAccessHost || '-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[14px] text-slate-700">{data.remoteAccessPanel.access.sshTokenLabel}</label>
                <input
                  readOnly
                  value={data.remoteAccessPanel.access.sshTokenValue}
                  placeholder="Your SSH token"
                  title="SSH access token"
                  className="h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none"
                />
                <p className="mt-2 text-[13px] text-slate-700">
                  {data.remoteAccessPanel.access.helperText}{' '}
                  <a
                    href={data.remoteAccessPanel.access.helperLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-green-600 hover:underline"
                  >
                    {data.remoteAccessPanel.access.helperLinkLabel}
                  </a>
                  . El código token lo encontramos en el paso 3.
                </p>
              </div>

              <Button variant="outline" size="sm">{data.remoteAccessPanel.access.actionLabel}</Button>
            </div>
          </ServerPanel>
        </div>

        <ServerPanel title={data.controlPanel.title}>
          <div className="space-y-3">
            {data.controlPanel.actions.map((action) => (
              <div key={action.id}>
                <Button variant={action.variant} size="sm" className="gap-2">
                  {getActionIcon(action)}
                  {action.label}
                </Button>
                {action.helperText && <p className="mt-2 text-[13px] text-slate-500">{action.helperText}</p>}
              </div>
            ))}
          </div>
        </ServerPanel>
      </div>
    </div>
  );
}
