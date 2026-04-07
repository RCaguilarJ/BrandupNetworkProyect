import { useMemo, useState, type ReactNode } from 'react';
import {
  Ban,
  BarChart3,
  ChevronDown,
  FileText,
  Monitor,
  Router,
  Shield,
  ArrowLeft,
  MapPin,
  Eye,
  EyeOff,
  Save,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import {
  getNetworkRouterById,
  mikrosystemPageStyle,
  type NetworkRouterRecord,
  wisphubPageStyle,
} from './networkManagementData';

type RouterEditTab = 'data' | 'vpn' | 'blocking' | 'mikrotik' | 'graphs' | 'log';

type RouterEditFormState = {
  name: string;
  routerType: string;
  location: string;
  ipHost: string;
  security: string;
  alternateSecurity: string;
  apiUser: string;
  apiPassword: string;
  trafficLog: string;
  speedControl: string;
  saveVisitedIps: boolean;
  backupMikrotik: boolean;
  radiusSecret: string;
  radiusNasIp: string;
};

type RouterLocationState = {
  router?: NetworkRouterRecord;
};

const routerTypeOptions = ['MikroTik', 'Cisco', 'Ubiquiti', 'Huawei'];
const securityOptions = [
  'Ninguno / Accounting API',
  'PPP / Accounting API',
  'Hotspot / Accounting API',
  'PPP / Accounting Radius',
  'Hotspot / Accounting Radius',
];
const alternateSecurityOptions = [
  'Ninguno',
  'Amarre de IP y Mac',
  'DHCP Leases',
  'IP Binding',
  'Amarre de IP y Mac + DHCP Leases',
];
const trafficLogOptions = [
  'Traffic Flow (RouterOS V6x,V7.x)',
  'NetFlow',
  'sFlow',
  'Ninguno',
];
const speedControlOptions = [
  'Colas Simples (Estaticas)',
  'Queues dinamicas',
  'Burst control',
  'Sin control',
];

const tabs: Array<{ id: RouterEditTab; label: string; icon: LucideIcon }> = [
  { id: 'data', label: 'Datos & Configuracion', icon: Monitor },
  { id: 'vpn', label: 'VPN', icon: Shield },
  { id: 'blocking', label: 'Bloqueo de Paginas', icon: Ban },
  { id: 'mikrotik', label: 'Mikrotik', icon: Router },
  { id: 'graphs', label: 'Graficos', icon: BarChart3 },
  { id: 'log', label: 'Log', icon: FileText },
];

function buildRouterFormState(router?: NetworkRouterRecord): RouterEditFormState {
  return {
    name: router?.name ?? '',
    routerType: 'MikroTik',
    location: '',
    ipHost: router?.ip ?? '',
    security: router?.security ?? securityOptions[0],
    alternateSecurity: alternateSecurityOptions[0],
    apiUser: router?.username ?? '',
    apiPassword: router?.password ?? '',
    trafficLog: trafficLogOptions[0],
    speedControl: speedControlOptions[0],
    saveVisitedIps: false,
    backupMikrotik: true,
    radiusSecret: '',
    radiusNasIp: '192.168.1.1',
  };
}

function inputClassName(extraClassName = '') {
  return `h-[50px] w-full rounded-[6px] border border-[#cfd8e3] bg-white px-5 text-[15px] text-[#24364b] outline-none placeholder:text-[#c3ccd6] ${extraClassName}`;
}

function labelClassName() {
  return 'text-[15px] font-medium text-[#3a4c60]';
}

function sanitizeCoordinateValue(value: string) {
  return value.replace(/[^0-9,.\-\s]/g, '');
}

function sanitizeIpValue(value: string) {
  return value.replace(/[^0-9.]/g, '');
}

function FormRow({
  label,
  children,
  action,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
      <div className="flex items-center gap-2 md:justify-end">
        <label className={labelClassName()}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function SelectField({
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
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName()} appearance-none pr-10`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6e82]" />
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  sanitize,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
  inputMode?: 'text' | 'numeric' | 'decimal';
  sanitize?: (value: string) => string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(sanitize ? sanitize(event.target.value) : event.target.value)
      }
      inputMode={inputMode}
      placeholder={placeholder}
      className={inputClassName()}
    />
  );
}

function PlaceholderTabCard({ label }: { label: string }) {
  return (
    <div className="rounded-[4px] border border-dashed border-[#cfd8e3] bg-[#f8fbff] px-6 py-10 text-center text-[#58708a]">
      <p className="text-[18px] font-semibold">{label}</p>
      <p className="mt-2 text-[14px]">
        Esta seccion queda lista como base visual para configurarla en el siguiente paso.
      </p>
    </div>
  );
}

export default function NetworkRouterEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const routerFromState = (location.state as RouterLocationState | null)?.router;
  const [activeTab, setActiveTab] = useState<RouterEditTab>('data');
  const [showApiPassword, setShowApiPassword] = useState(false);
  const [showRadiusSecret, setShowRadiusSecret] = useState(false);

  const routerRecord = useMemo(
    () =>
      routerFromState ??
      (id ? getNetworkRouterById(id, user?.role, user?.companyId) : undefined),
    [id, routerFromState, user?.companyId, user?.role],
  );

  const [form, setForm] = useState<RouterEditFormState>(() =>
    buildRouterFormState(routerRecord),
  );

  const updateField = <K extends keyof RouterEditFormState>(
    field: K,
    value: RouterEditFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.ipHost.trim() || !form.apiUser.trim()) {
      toast.error('Completa nombre del router, IP/Host y usuario API');
      return;
    }

    toast.success('Vista base del router lista para seguir configurandose');
  };

  if (!routerRecord) {
    return (
      <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
        <div className="mx-auto max-w-[920px] rounded-[4px] border border-[#d5dde7] bg-white p-8 text-center">
          <h1 className="text-[28px] font-semibold text-[#223448]">Router no encontrado</h1>
          <p className="mt-3 text-[15px] text-[#607286]">
            No se encontro el registro que intentaste editar.
          </p>
          <button
            type="button"
            onClick={() => navigate('/network-management/routers')}
            className="mt-6 inline-flex h-[42px] items-center gap-2 rounded-[4px] bg-[#268df2] px-5 text-[14px] font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#24364b] lg:text-[22px]">
            Configuracion de Router
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#6d8093]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="transition hover:text-[#268df2]"
          >
            Inicio
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => navigate('/network-management/routers')}
            className="transition hover:text-[#268df2]"
          >
            Lista Routers
          </button>
          <span>/</span>
          <span className="font-semibold text-[#268df2]">Editar router</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[4px] border border-[#d5dde7] bg-white">
        <div className="flex flex-wrap items-center gap-1 bg-[#1f2429] px-3 py-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-[40px] items-center gap-2 border-t-[3px] px-4 text-[14px] font-semibold transition ${
                  isActive
                    ? 'border-[#268df2] bg-white text-[#233549]'
                    : 'border-transparent text-[#f5f7fa] hover:bg-[#2a3037]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-8 lg:px-8">
          {activeTab === 'data' ? (
            <div className="grid gap-12 xl:grid-cols-[1.12fr_0.88fr]">
              <div className="space-y-10">
                <div className="space-y-5">
                  <FormRow label="Nombre Router">
                    <TextInput
                      value={form.name}
                      onChange={(value) => updateField('name', value)}
                    />
                  </FormRow>

                  <FormRow label="Tipo Router">
                    <SelectField
                      value={form.routerType}
                      onChange={(value) => updateField('routerType', value)}
                      options={routerTypeOptions}
                      ariaLabel="Tipo Router"
                    />
                  </FormRow>

                  <FormRow
                    label="Ubicacion"
                    action={
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#cfd8e3] bg-[#f8fafc] text-[#334155]">
                        <MapPin className="h-4 w-4" />
                      </span>
                    }
                  >
                    <TextInput
                      value={form.location}
                      onChange={(value) => updateField('location', value)}
                      placeholder="Coordenadas Latitud,Longitud"
                      inputMode="decimal"
                      sanitize={sanitizeCoordinateValue}
                    />
                  </FormRow>

                  <FormRow label="IP / Host">
                    <TextInput
                      value={form.ipHost}
                      onChange={(value) => updateField('ipHost', value)}
                      inputMode="decimal"
                      sanitize={sanitizeIpValue}
                    />
                  </FormRow>

                  <FormRow label="Seguridad">
                    <SelectField
                      value={form.security}
                      onChange={(value) => updateField('security', value)}
                      options={securityOptions}
                      ariaLabel="Seguridad"
                    />
                  </FormRow>

                  <FormRow label="Seguridad alterna">
                    <SelectField
                      value={form.alternateSecurity}
                      onChange={(value) => updateField('alternateSecurity', value)}
                      options={alternateSecurityOptions}
                      ariaLabel="Seguridad alterna"
                    />
                  </FormRow>
                </div>

                <div className="border-t border-[#e2e8f0] pt-7">
                  <h2 className="mb-5 text-center text-[20px] font-semibold text-[#24364b] lg:text-[22px]">
                    Configuracion Radius
                  </h2>

                  <div className="space-y-5">
                    <FormRow label="Radius Secret">
                      <div className="relative">
                        <TextInput
                          value={form.radiusSecret}
                          onChange={(value) => updateField('radiusSecret', value)}
                          placeholder="Contrasena Radius"
                          type={showRadiusSecret ? 'text' : 'password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRadiusSecret((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#607286] hover:text-[#24364b]"
                          aria-label={showRadiusSecret ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                        >
                          {showRadiusSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormRow>

                    <FormRow label="Radius NAS IP">
                      <TextInput
                        value={form.radiusNasIp}
                        onChange={(value) => updateField('radiusNasIp', value)}
                        placeholder="192.168.1.1"
                        inputMode="decimal"
                        sanitize={sanitizeIpValue}
                      />
                    </FormRow>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h2 className="text-center text-[30px] font-bold tracking-[0.04em] text-[#24364b]">
                  MIKROTIK
                </h2>

                <FormRow label="Usuario (API)">
                  <TextInput
                    value={form.apiUser}
                    onChange={(value) => updateField('apiUser', value)}
                  />
                </FormRow>

                <FormRow label="Contrasena (API)">
                  <div className="relative">
                    <TextInput
                      value={form.apiPassword}
                      onChange={(value) => updateField('apiPassword', value)}
                      type={showApiPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#607286] hover:text-[#24364b]"
                      aria-label={showApiPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showApiPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormRow>

                <FormRow label="Registro de trafico">
                  <SelectField
                    value={form.trafficLog}
                    onChange={(value) => updateField('trafficLog', value)}
                    options={trafficLogOptions}
                    ariaLabel="Registro de trafico"
                  />
                </FormRow>

                <FormRow label="Control Velocidad">
                  <SelectField
                    value={form.speedControl}
                    onChange={(value) => updateField('speedControl', value)}
                    options={speedControlOptions}
                    ariaLabel="Control Velocidad"
                  />
                </FormRow>

                <div className="space-y-5 pt-2">
                  <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                    <span className={`${labelClassName()} md:text-right`}>Guardar IP Visitadas</span>
                    <div className="flex items-center">
                      <Switch
                        checked={form.saveVisitedIps}
                        onCheckedChange={(value) => updateField('saveVisitedIps', value)}
                        className="h-8 w-14 data-[state=checked]:bg-[#17b6cf] data-[state=unchecked]:bg-[#d9e2ec]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                    <span className={`${labelClassName()} md:text-right`}>Backup Mikrotik</span>
                    <div className="flex items-center">
                      <Switch
                        checked={form.backupMikrotik}
                        onCheckedChange={(value) => updateField('backupMikrotik', value)}
                        className="h-8 w-14 data-[state=checked]:bg-[#14b8a6] data-[state=unchecked]:bg-[#d9e2ec]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex h-[42px] items-center gap-2 rounded-[6px] bg-[#268df2] px-5 text-[15px] font-semibold text-white"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          ) : (
              <PlaceholderTabCard
              label={tabs.find((tab) => tab.id === activeTab)?.label ?? 'Configuracion'}
              />
          )}
        </div>
      </section>
    </div>
  );
}
