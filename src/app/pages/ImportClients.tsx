import { useRef, useState } from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';

type ImportTemplateConfig = {
  router: string;
  security: string;
  speedControl: string;
  includeBilling: boolean;
  includeNotifications: boolean;
  presetTemplate: string;
  uploadedFileName: string;
};

const STORAGE_KEY = 'brandup_import_clients';

const defaultConfig: ImportTemplateConfig = {
  router: 'Router Principal',
  security: 'Ninguna',
  speedControl: 'Colas Simples',
  includeBilling: false,
  includeNotifications: false,
  presetTemplate: '',
  uploadedFileName: '',
};

function readStoredConfig(): ImportTemplateConfig {
  if (typeof window === 'undefined') {
    return defaultConfig;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return defaultConfig;
  }

  try {
    return { ...defaultConfig, ...(JSON.parse(rawValue) as Partial<ImportTemplateConfig>) };
  } catch {
    return defaultConfig;
  }
}

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
      <div className="px-7 py-7">{children}</div>
    </section>
  );
}

function Step({
  number,
  title,
  children,
  connect = true,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  connect?: boolean;
}) {
  return (
    <div className="relative flex gap-5 pl-1">
      <div className="relative flex w-[46px] shrink-0 justify-center">
        {connect ? <div className="absolute top-[54px] h-[calc(100%-28px)] w-[2px] bg-[#4aa5e8]" /> : null}
        <div className="relative z-10 flex h-[48px] w-[48px] items-center justify-center rounded-full border-[4px] border-[#4aa5e8] bg-white text-[20px] font-semibold text-[#4aa5e8]">
          {number}
        </div>
      </div>

      <div className="min-w-0 flex-1 pb-8">
        <h3 className="mb-3 text-[18px] font-semibold text-[#4aa5e8]">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function PrimarySelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="h-[52px] w-full rounded-[4px] border border-[#d2dae3] bg-white px-4 text-[16px] text-[#243746] outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function ImportClients() {
  const initialConfig = readStoredConfig();
  const [config, setConfig] = useState<ImportTemplateConfig>(initialConfig);
  const templateInputRef = useRef<HTMLInputElement | null>(null);

  function updateConfig<K extends keyof ImportTemplateConfig>(key: K, value: ImportTemplateConfig[K]) {
    setConfig((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleTemplateSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    updateConfig('uploadedFileName', file.name);
    toast.success(`Plantilla ${file.name} cargada`);
  }

  function handleGenerateTemplate() {
    toast.success('Plantilla base de importacion lista para descarga');
  }

  function handleImport() {
    if (!config.uploadedFileName) {
      toast.error('Selecciona primero una plantilla para importar');
      return;
    }

    toast.success(`Importacion iniciada con ${config.uploadedFileName}`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[26px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[24px] font-normal leading-none text-[#1f2933]">Importar</h1>

        <SettingsBreadcrumb currentLabel="Importar" />
      </div>

      <div className="grid gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Generar formato">
          <p className="mb-7 max-w-[760px] text-[20px] leading-[1.45] text-[#00a4c7]">
            Antes de iniciar la importación necesita Registrar su router y crear los perfiles de velocidad en el menú servicios-&gt;Internet
          </p>

          <Step number={1} title="Router">
            <div className="max-w-[376px]">
              <PrimarySelect
                value={config.router}
                onChange={(value) => updateConfig('router', value)}
                options={['Router Principal', 'Router Norte', 'Router Sur']}
                ariaLabel="Router"
              />
            </div>
          </Step>

          <Step number={2} title="Seguridad">
            <div className="max-w-[376px]">
              <PrimarySelect
                value={config.security}
                onChange={(value) => updateConfig('security', value)}
                options={['Ninguna', 'PPPoE', 'Hotspot']}
                ariaLabel="Seguridad"
              />
            </div>
          </Step>

          <Step number={3} title="Control deVelocidad">
            <div className="max-w-[376px]">
              <PrimarySelect
                value={config.speedControl}
                onChange={(value) => updateConfig('speedControl', value)}
                options={['Colas Simples', 'PCQ', 'Queues Tree']}
                ariaLabel="Control de velocidad"
              />
            </div>
          </Step>

          <Step number={4} title="Facturación">
            <button
              type="button"
              onClick={() => updateConfig('includeBilling', !config.includeBilling)}
              className="inline-flex h-[52px] w-[84px] items-center justify-center rounded-[6px] border border-[#d2dae3] bg-white text-[#1f2933] transition hover:bg-[#f8fafc]"
              aria-pressed={config.includeBilling}
            >
              <Plus className="h-8 w-8" strokeWidth={2.3} />
            </button>
          </Step>

          <Step number={5} title="Notificaciones">
            <button
              type="button"
              onClick={() => updateConfig('includeNotifications', !config.includeNotifications)}
              className="inline-flex h-[52px] w-[84px] items-center justify-center rounded-[6px] border border-[#d2dae3] bg-white text-[#1f2933] transition hover:bg-[#f8fafc]"
              aria-pressed={config.includeNotifications}
            >
              <Plus className="h-8 w-8" strokeWidth={2.3} />
            </button>
          </Step>

          <Step number={6} title="Descargar" connect={false}>
            <button
              type="button"
              onClick={handleGenerateTemplate}
              className="inline-flex h-[52px] items-center gap-3 rounded-[6px] border border-[#d2dae3] bg-white px-6 text-[17px] font-semibold text-[#1f2933] transition hover:bg-[#f8fafc]"
            >
              <Download className="h-5 w-5" />
              Generar plantilla
            </button>
          </Step>
        </Panel>

        <Panel title="Importar clientes">
          <p className="mb-7 max-w-[680px] text-[20px] leading-[1.45] text-[#00a4c7]">
            Antes de iniciar la importación generar un backup de base de datos y su mikrotik para para poder revertir algún cambio no deseado
          </p>

          <Step number={2} title="Plantilla predeterminada">
            <div className="max-w-[376px]">
              <PrimarySelect
                value={config.presetTemplate}
                onChange={(value) => updateConfig('presetTemplate', value)}
                options={['', 'Prepago Base', 'Postpago Base', 'Residencial Basica']}
                ariaLabel="Plantilla predeterminada"
              />
            </div>
            <p className="mt-4 text-[16px] text-[#5f7487]">
              Opcional. Precarga las reglas operativas de esta subcuenta.
            </p>
          </Step>

          <Step number={1} title="Plantilla">
            <input
              ref={templateInputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={handleTemplateSelection}
            />

            <button
              type="button"
              onClick={() => templateInputRef.current?.click()}
              className="inline-flex h-[52px] items-center gap-3 rounded-[6px] border border-[#d2dae3] bg-white px-6 text-[17px] font-semibold text-[#1f2933] transition hover:bg-[#f8fafc]"
            >
              <Upload className="h-5 w-5" />
              Seleccionar plantilla
            </button>

            {config.uploadedFileName ? (
              <p className="mt-3 text-[15px] text-[#5f7487]">{config.uploadedFileName}</p>
            ) : null}
          </Step>

          <Step number={2} title="Importar" connect={false}>
            <button
              type="button"
              onClick={handleImport}
              className="inline-flex h-[52px] items-center gap-3 rounded-[6px] border border-[#d2dae3] bg-white px-6 text-[17px] font-semibold text-[#1f2933] transition hover:bg-[#f8fafc]"
            >
              <Upload className="h-5 w-5" />
              Iniciar importación
            </button>
            <p className="mt-4 text-[16px] text-[#3d4f63]">
              Este proceso puede tardar algunos minutos.
            </p>
          </Step>
        </Panel>
      </div>
    </div>
  );
}
