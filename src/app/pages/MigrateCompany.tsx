import { useMemo, useRef } from 'react';
import { Eraser, FileUp, Search } from 'lucide-react';
import { toast } from 'sonner';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { usePersistentState } from '../hooks/usePersistentState';

type BackupSummaryItem = {
  id: string;
  label: string;
  state: 'with-data' | 'without-data';
};

type BackupSession = {
  targetCompany: string;
  zipPassword: string;
  fileName: string;
  analyzedAt: string | null;
  summary: BackupSummaryItem[];
};

const STORAGE_KEY = 'brandup_migrate_company';

const defaultSummary: BackupSummaryItem[] = [
  { id: 'basic-settings', label: 'Ajustes basicos', state: 'without-data' },
  { id: 'plans', label: 'Planes / perfiles', state: 'without-data' },
  { id: 'ipv4', label: 'Redes IPv4', state: 'without-data' },
  { id: 'billing', label: 'Facturas y pagos', state: 'without-data' },
  { id: 'tickets', label: 'Tickets soporte', state: 'without-data' },
  {
    id: 'clients',
    label: 'Clientes y configuracion base',
    state: 'without-data',
  },
  { id: 'routers', label: 'Routers', state: 'without-data' },
  { id: 'services', label: 'Servicios', state: 'without-data' },
  { id: 'operators', label: 'Operadores', state: 'without-data' },
];

const defaultSession: BackupSession = {
  targetCompany: 'DesingsGDL',
  zipPassword: '',
  fileName: '',
  analyzedAt: null,
  summary: defaultSummary,
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[3px] border border-[#d7dee8] bg-white shadow-sm">
      <div className="bg-[#1f242a] px-6 py-5">
        <h2 className="text-[20px] font-semibold text-white">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function SummaryPill({ item }: { item: BackupSummaryItem }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-[2px] h-[24px] w-[24px] rounded-[6px] bg-[#d8dde4]" />
      <p
        className={`text-[18px] leading-[1.45] ${
          item.state === 'with-data' ? 'text-[#486581]' : 'text-[#6d8297]'
        }`}
      >
        {item.label}{' '}
        <span className="text-[14px]">
          (
          {item.state === 'with-data'
            ? 'con datos en backup'
            : 'sin datos en backup'}
          )
        </span>
      </p>
    </div>
  );
}

export default function MigrateCompany() {
  const [session, setSession] = usePersistentState<BackupSession>(
    STORAGE_KEY,
    defaultSession,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function updateSession<K extends keyof BackupSession>(
    key: K,
    value: BackupSession[K],
  ) {
    setSession((current) => ({ ...current, [key]: value }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    updateSession('fileName', file.name);
    toast.success(`Archivo ${file.name} listo para analizar`);
  }

  function handleAnalyzeBackup() {
    if (!session.fileName) {
      toast.error('Selecciona primero un backup SQL o ZIP');
      return;
    }

    setSession((current) => ({
      ...current,
      analyzedAt: new Date().toISOString(),
      summary: [
        {
          id: 'basic-settings',
          label: 'Ajustes basicos',
          state: 'with-data',
        },
        { id: 'plans', label: 'Planes / perfiles', state: 'with-data' },
        { id: 'ipv4', label: 'Redes IPv4', state: 'with-data' },
        { id: 'billing', label: 'Facturas y pagos', state: 'with-data' },
        { id: 'tickets', label: 'Tickets soporte', state: 'without-data' },
        {
          id: 'clients',
          label: 'Clientes y configuracion base',
          state: 'with-data',
        },
        { id: 'routers', label: 'Routers', state: 'with-data' },
        { id: 'services', label: 'Servicios', state: 'with-data' },
        { id: 'operators', label: 'Operadores', state: 'without-data' },
      ],
    }));

    toast.success('Backup analizado correctamente');
  }

  function handleClearSession() {
    setSession({
      ...defaultSession,
      targetCompany: session.targetCompany,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success('Sesion de migracion limpiada');
  }

  function handleImportCompany() {
    if (!session.analyzedAt) {
      toast.error('Analiza primero un backup antes de importar');
      return;
    }

    toast.success(`Importacion preparada hacia ${session.targetCompany}`);
  }

  const leftSummary = useMemo(() => session.summary.slice(0, 5), [session.summary]);
  const rightSummary = useMemo(() => session.summary.slice(5), [session.summary]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[26px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[24px] font-normal leading-none text-[#1f2933]">
          Importar empresa
        </h1>

        <SettingsBreadcrumb currentLabel="Migrar" />
      </div>

      <div className="mb-6 rounded-[4px] bg-[#eef3f7] px-6 py-5 text-center text-[20px] leading-[1.45] text-[#53657a]">
        Sube un backup SQL o ZIP de otra empresa, analizalo en una base
        temporal y luego traelo solo a la empresa destino sin tocar las demas.
      </div>

      <div className="grid gap-7 2xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <Panel title="Analisis del backup">
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
              <label className="text-[18px] font-normal text-[#253746]">
                Empresa destino
              </label>
              <input
                type="text"
                value={session.targetCompany}
                onChange={(event) =>
                  updateSession('targetCompany', event.target.value)
                }
                className="h-[50px] rounded-[4px] border border-[#d2dae3] bg-white px-4 text-[16px] text-[#243746] outline-none"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
              <label className="pt-3 text-[18px] font-normal text-[#253746]">
                Archivo
              </label>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".sql,.zip"
                  onChange={handleFileChange}
                  className="block h-[50px] w-full rounded-[4px] border border-[#d2dae3] bg-white px-4 py-[10px] text-[16px] text-[#243746]"
                />
                <p className="mt-2 text-[14px] text-[#ff9c1a]">
                  Acepta SQL directo o ZIP con un SQL dentro.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
              <label className="pt-3 text-[18px] font-normal text-[#253746]">
                Contraseña ZIP
              </label>
              <div>
                <input
                  type="text"
                  value={session.zipPassword}
                  onChange={(event) =>
                    updateSession('zipPassword', event.target.value)
                  }
                  className="h-[50px] w-full rounded-[4px] border border-[#d2dae3] bg-white px-4 text-[16px] text-[#243746] outline-none"
                />
                <p className="mt-2 text-[14px] leading-[1.5] text-[#6d8297]">
                  Opcional. Si el respaldo esta protegido, escribela aqui antes
                  de analizar.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnalyzeBackup}
                className="inline-flex h-[52px] items-center gap-3 rounded-full border border-[#1e88e5] px-6 text-[18px] font-semibold text-[#1e88e5] transition hover:bg-[#eaf4ff]"
              >
                <Search className="h-5 w-5" />
                Analizar backup
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-[#d7dee8] pt-6">
            <p className="text-[14px] text-[#6d8297]">
              {session.analyzedAt
                ? `Ultimo analisis: ${new Date(session.analyzedAt).toLocaleString('es-MX')}`
                : 'Aun no hay un backup analizado en esta sesion.'}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleClearSession}
                className="inline-flex h-[42px] items-center gap-2 rounded-[4px] border border-[#cfd7e2] bg-white px-4 text-[17px] font-semibold text-[#1f2933] transition hover:bg-[#f8fafc]"
              >
                <Eraser className="h-5 w-5" />
                Limpiar sesion
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Resumen e importacion">
          <div className="rounded-[8px] border border-[#ff9c1a] bg-[#ffe5bc] px-6 py-4 text-center text-[19px] leading-[1.4] text-[#9a5a00]">
            {session.analyzedAt
              ? `Resumen generado desde ${session.fileName}. Ya puedes revisar modulos e importar.`
              : 'Primero analiza un backup para ver el resumen y habilitar la importacion.'}
          </div>

          <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
            <div className="space-y-10">
              {leftSummary.map((item) => (
                <SummaryPill key={item.id} item={item} />
              ))}
            </div>
            <div className="space-y-10">
              {rightSummary.map((item) => (
                <SummaryPill key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[8px] border border-[#ff9c1a] bg-[#ffe5bc] px-6 py-5 text-center text-[18px] leading-[1.45] text-[#9a5a00]">
            La importacion es solo hacia la empresa destino. No borra ni trunca
            otras empresas. Los planes se insertan o reutilizan por nombre
            porque el catalogo de perfiles aun es compartido.
          </div>

          <div className="mt-6 rounded-[8px] border border-[#55b7df] bg-[#d6f3ff] px-6 py-5 text-center text-[18px] leading-[1.45] text-[#2f6f8d]">
            Cuando analices un backup, aqui veras si trae clientes, servicios,
            planes, routers, redes y otros modulos clave.
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleImportCompany}
              className="inline-flex h-[56px] items-center gap-3 rounded-full border border-[#1e88e5] px-6 text-[18px] font-semibold text-[#1e88e5] transition hover:bg-[#eaf4ff]"
            >
              <FileUp className="h-5 w-5" />
              Importar a esta empresa
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
