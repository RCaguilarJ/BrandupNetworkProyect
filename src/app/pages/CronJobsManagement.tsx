import { useMemo, useState } from 'react';
import {
  type CronJobManagementAlert,
  type CronJobManagementRecord,
} from '../types';
import {
  CircleAlert,
  Cog,
  List,
  Play,
  Power,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const CRON_ALERT: CronJobManagementAlert = {
  message:
    '¡Alerta! Detectamos que la tarea principal no esta siendo ejecutada. Favor agregar la siguiente tarea programada (CronJob) al panel de control:',
  command: '* * * * * wget -q -O - https://tudominio.com/cronjob/run >/dev/null 2>&1',
  dismissible: true,
};

const SYSTEM_CRON_JOBS: CronJobManagementRecord[] = [
  {
    id: 'cron-whatsapp-due-today',
    description: 'Notificación de deuda, mismo dia de pago (API-WhatsApp)',
    frequency: 'Cada 1 día',
    parameter: '',
    lastResult: 'Ejecución automática exitosa',
    lastExecution: 'Hace 10 meses',
    status: 'active',
    canRun: true,
    canToggle: true,
    canViewLogs: true,
    canInspect: true,
    canConfigure: true,
  },
  {
    id: 'cron-whatsapp-all-clients',
    description: 'Notificación de deudas a todos los clientes (API-WhatsApp)',
    frequency: 'Cada 30 días',
    parameter: '',
    lastResult: 'Ejecución automática exitosa',
    lastExecution: 'Hace 1 año',
    status: 'active',
    canRun: true,
    canToggle: true,
    canViewLogs: true,
    canInspect: true,
    canConfigure: true,
  },
  {
    id: 'cron-overdue-cut',
    description: 'Corte de servicio de las facturas vencidas (respetando dia de gracia y promesas)',
    frequency: 'Cada 1 día',
    parameter: '',
    lastResult: 'Prueba exitosa',
    lastExecution: 'Hace 11 meses',
    status: 'inactive',
    canRun: true,
    canToggle: true,
    canViewLogs: true,
    canInspect: true,
    canConfigure: true,
  },
  {
    id: 'cron-email-mass-send',
    description: 'Envio masivo de deudas por correo electronico',
    frequency: 'Cada 15 días',
    parameter: '',
    lastResult: 'Prueba exitosa',
    lastExecution: 'Hace 11 meses',
    status: 'inactive',
    canRun: true,
    canToggle: true,
    canViewLogs: true,
    canInspect: true,
    canConfigure: true,
  },
  {
    id: 'cron-backup-database',
    description: 'Backup base de datos',
    frequency: 'Cada 30 días',
    parameter: 'dias después',
    parameterHint: 'Parámetro configurable posterior al cierre.',
    lastResult: 'El backup ya existe!!!',
    lastExecution: 'Hace 11 meses',
    status: 'active',
    canRun: true,
    canToggle: true,
    canViewLogs: true,
    canInspect: true,
    canConfigure: true,
  },
];

export default function CronJobsManagement() {
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  /**
   * Catalogo base de cron jobs del sistema.
   * Backend debe reemplazar esta fuente por el listado real y su estado
   * de ejecucion sin alterar el contrato tipado ni la distribucion visual.
   */
  const records = useMemo(() => SYSTEM_CRON_JOBS, []);

  function handleRefresh() {
    toast.success('Listado de cron jobs actualizado');
  }

  function handleAction(job: CronJobManagementRecord, action: string) {
    const labelMap: Record<string, string> = {
      run: 'Ejecucion manual',
      toggle: 'Cambio de estado',
      logs: 'Consulta de logs',
      inspect: 'Inspeccion',
      configure: 'Configuracion',
    };

    toast.info(`${labelMap[action]} de ${job.description} lista para backend.`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[26px] pb-6 pt-[18px]">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[22px] font-normal leading-none text-[#1f2933]">
          Tareas programadas
        </h1>

        <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Cronjobs</span>
        </div>
      </div>

      {isAlertVisible ? (
        <section className="mb-4 rounded-[4px] border border-[#f0ad4e] bg-[#ffe7bf] px-5 py-3 text-center text-[14px] text-[#7a4b0f]">
          <div className="relative pr-8">
            <p>
              <span className="font-semibold">¡Alerta!</span> {CRON_ALERT.message.replace('¡Alerta! ', '')}
            </p>
            <p className="mt-4 font-medium">{CRON_ALERT.command}</p>

            {CRON_ALERT.dismissible ? (
              <button
                type="button"
                className="absolute right-0 top-0 text-[#b98543] hover:text-[#7a4b0f]"
                onClick={() => setIsAlertVisible(false)}
                aria-label="Cerrar alerta de cron job"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d7dfe8] px-4 py-3">
          <p className="text-[14px] text-[#1f2933]">Todas las tareas (Cronjobs)</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                toast.info('Accion de expandir lista pendiente de integracion visual.')
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Expandir"
              aria-label="Expandir listado de cron jobs"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Actualizar"
              aria-label="Actualizar listado de cron jobs"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border border-[#d7dfe8]">
                <th className="w-[4%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  N°
                </th>
                <th className="w-[42%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Descripción
                </th>
                <th className="w-[8%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Frecuencia
                </th>
                <th className="w-[9%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Parámetro
                </th>
                <th className="w-[16%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Último resultado
                </th>
                <th className="w-[10%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Última ejecución
                </th>
                <th className="w-[7%] border-r border-[#d7dfe8] px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Status
                </th>
                <th className="px-2 py-[8px] text-left text-[14px] font-normal text-[#111827]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr
                  key={record.id}
                  className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#111827]"
                >
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">{index + 1}</td>
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">{record.description}</td>
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">{record.frequency}</td>
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">
                    {record.parameter ? (
                      <span className="inline-flex items-center gap-1">
                        <span>{record.parameter}</span>
                        {record.parameterHint ? (
                          <CircleAlert
                            className="h-3.5 w-3.5 text-[#374151]"
                            aria-label={record.parameterHint}
                          />
                        ) : null}
                      </span>
                    ) : null}
                  </td>
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">{record.lastResult}</td>
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">{record.lastExecution}</td>
                  <td className="border-r border-[#d7dfe8] px-2 py-[6px]">
                    <span
                      className={`inline-flex rounded-[4px] px-2 py-[2px] text-[11px] font-semibold text-white ${
                        record.status === 'active' ? 'bg-[#10b8b8]' : 'bg-[#6b7280]'
                      }`}
                    >
                      {record.status === 'active' ? 'Activado' : 'Desactivado'}
                    </span>
                  </td>
                  <td className="px-2 py-[6px]">
                    <div className="flex items-center gap-1 text-[#1f2933]">
                      {record.canRun ? (
                        <button
                          type="button"
                          className="text-[#7b5cd6]"
                          onClick={() => handleAction(record, 'run')}
                          aria-label={`Ejecutar ${record.description}`}
                        >
                          <Play className="h-4 w-4 fill-current" />
                        </button>
                      ) : null}
                      {record.canToggle ? (
                        <button
                          type="button"
                          className="text-[#ff7f50]"
                          onClick={() => handleAction(record, 'toggle')}
                          aria-label={`Cambiar estado de ${record.description}`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      ) : null}
                      {record.canViewLogs ? (
                        <button
                          type="button"
                          className="text-[#1f2933]"
                          onClick={() => handleAction(record, 'logs')}
                          aria-label={`Ver logs de ${record.description}`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      ) : null}
                      {record.canInspect ? (
                        <button
                          type="button"
                          className="text-[#1f2933]"
                          onClick={() => handleAction(record, 'inspect')}
                          aria-label={`Inspeccionar ${record.description}`}
                        >
                          <CircleAlert className="h-4 w-4" />
                        </button>
                      ) : null}
                      {record.canConfigure ? (
                        <button
                          type="button"
                          className="text-[#1f2933]"
                          onClick={() => handleAction(record, 'configure')}
                          aria-label={`Configurar ${record.description}`}
                        >
                          <Cog className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
