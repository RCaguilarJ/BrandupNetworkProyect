import { type ChangeEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../context/AuthContext';
import {
  type GeneralSettingsBasicConfigSection,
  type GeneralSettingsCompanySection,
  type GeneralSettingsLoginImageAsset,
  type GeneralSettingsLoginImageSection,
  type GeneralSettingsLogoAsset,
  type GeneralSettingsNotificationsSection,
  type GeneralSettingsStorageData,
} from '../types';
import { toast } from 'sonner';
import { CircleHelp, FileImage, Save, Upload } from 'lucide-react';

const GENERAL_SETTINGS_STORAGE_PREFIX = 'brandup_general_settings';
const LOGO_MAX_SIZE_BYTES = 20 * 1024 * 1024;
const LOGIN_IMAGE_UPLOAD_HELP =
  'Para subir nuevas imagenes debe subirlos al servidor ruta :/var/www/html/admin/images/login-bg';
const TIMEZONE_OPTIONS = [
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Guayaquil',
  'America/Caracas',
  'America/Argentina/Buenos_Aires',
];

type LogoSlotKey = 'mainLogo' | 'invoiceLogo';

function buildStorageKey(companyId?: string) {
  return `${GENERAL_SETTINGS_STORAGE_PREFIX}:${companyId ?? 'global'}`;
}

function getDefaultTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City';
  } catch {
    return 'America/Mexico_City';
  }
}

function createEmptyGeneralSettingsState(): GeneralSettingsStorageData {
  return {
    company: {
      companyName: '',
      address: '',
      phoneNumbers: '',
      identification: '',
    },
    basicConfig: {
      timezone: getDefaultTimezone(),
      backupEmail: '',
      supportEmail: '',
      billingEmail: '',
      validateIdentity: false,
    },
    notifications: {
      routerDownEmail: '',
      routerDownMobile: '',
      paymentReportEmail: '',
    },
    logos: {
      mainLogo: null,
      invoiceLogo: null,
    },
    loginImage: {
      selectedImageId: '',
      images: [],
    },
  };
}

/**
 * Normaliza la persistencia temporal para que la UI no dependa de mocks ni
 * de estructuras parciales guardadas en versiones anteriores del modulo.
 */
function loadStoredGeneralSettings(storageKey: string): GeneralSettingsStorageData {
  const fallback = createEmptyGeneralSettingsState();

  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue) as Partial<GeneralSettingsStorageData>;

    return {
      company: {
        ...fallback.company,
        ...parsed.company,
      },
      basicConfig: {
        ...fallback.basicConfig,
        ...parsed.basicConfig,
      },
      notifications: {
        ...fallback.notifications,
        ...parsed.notifications,
      },
      logos: {
        mainLogo: parsed.logos?.mainLogo ?? fallback.logos.mainLogo,
        invoiceLogo: parsed.logos?.invoiceLogo ?? fallback.logos.invoiceLogo,
      },
      loginImage: {
        selectedImageId: parsed.loginImage?.selectedImageId ?? fallback.loginImage.selectedImageId,
        images: Array.isArray(parsed.loginImage?.images) ? parsed.loginImage.images : fallback.loginImage.images,
      },
    };
  } catch {
    return fallback;
  }
}

/**
 * Convierte un archivo local a data URL para que la vista pueda previsualizarlo
 * y persistirlo localmente mientras backend no este integrado.
 */
function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('No fue posible leer el archivo seleccionado.'));
    };

    reader.onerror = () => reject(new Error('No fue posible leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });
}

function createLogoAsset(file: File, previewUrl: string): GeneralSettingsLogoAsset {
  return {
    fileName: file.name,
    previewUrl,
    mimeType: file.type,
    size: file.size,
  };
}

function createLoginImageAsset(file: File, previewUrl: string): GeneralSettingsLoginImageAsset {
  return {
    id: `${Date.now()}-${file.name}`,
    label: file.name,
    fileName: file.name,
    previewUrl,
    mimeType: file.type,
    size: file.size,
  };
}

function GeneralPanel({
  title,
  className = '',
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-[4px] bg-white shadow-sm ring-1 ring-black/5 ${className}`}>
      <header className="bg-[#202833] px-4 py-3 text-[14px] font-semibold text-white">{title}</header>
      <div className="bg-white">{children}</div>
    </section>
  );
}

function SectionSaveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-9 rounded-full border-[#0d8bff] px-5 text-[14px] font-semibold text-[#0d8bff] hover:bg-[#eef7ff]"
    >
      <Save className="mr-2 h-4 w-4" />
      Guardar cambios
    </Button>
  );
}

function FormRow({
  label,
  labelWidth,
  children,
}: {
  label: string;
  labelWidth: string;
  children: ReactNode;
}) {
  return (
    <div className={`grid items-start gap-4 ${labelWidth}`}>
      <label className="pt-2 text-right text-[14px] text-slate-900">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function EmptyPreview({ iconSize = 'h-10 w-10' }: { iconSize?: string }) {
  return <FileImage className={`${iconSize} text-slate-400`} />;
}

function formatBytesLimitText(size: number) {
  return `*Maximo : ${Math.round(size / (1024 * 1024))}M`;
}

export default function GeneralSettings() {
  const { user } = useAuth();
  const storageKey = useMemo(() => buildStorageKey(user?.companyId), [user?.companyId]);
  const [settings, setSettings] = useState<GeneralSettingsStorageData>(() => loadStoredGeneralSettings(storageKey));

  const mainLogoInputRef = useRef<HTMLInputElement | null>(null);
  const invoiceLogoInputRef = useRef<HTMLInputElement | null>(null);
  const loginImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSettings(loadStoredGeneralSettings(storageKey));
  }, [storageKey]);

  const selectedLoginImage = settings.loginImage.images.find(
    (image) => image.id === settings.loginImage.selectedImageId,
  );

  /**
   * Centraliza la escritura local actual. Backend debe reemplazar este punto por
   * un adapter/API client sin tocar la composicion visual del formulario.
   */
  function persistSettings(nextSettings: GeneralSettingsStorageData, successMessage: string) {
    setSettings(nextSettings);
    localStorage.setItem(storageKey, JSON.stringify(nextSettings));
    toast.success(successMessage);
  }

  function handleCompanyFieldChange(field: keyof GeneralSettingsCompanySection, value: string) {
    setSettings((current) => ({
      ...current,
      company: {
        ...current.company,
        [field]: value,
      },
    }));
  }

  function handleBasicConfigFieldChange(
    field: keyof Omit<GeneralSettingsBasicConfigSection, 'validateIdentity'>,
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      basicConfig: {
        ...current.basicConfig,
        [field]: value,
      },
    }));
  }

  function handleNotificationsFieldChange(
    field: keyof GeneralSettingsNotificationsSection,
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: value,
      },
    }));
  }

  function handleToggleChange(checked: boolean) {
    setSettings((current) => ({
      ...current,
      basicConfig: {
        ...current.basicConfig,
        validateIdentity: checked,
      },
    }));
  }

  function handleLoginImageSelection(value: string) {
    setSettings((current) => ({
      ...current,
      loginImage: {
        ...current.loginImage,
        selectedImageId: value,
      },
    }));
  }

  function handleSaveCompanySection() {
    persistSettings(settings, 'Datos de la empresa guardados.');
  }

  function handleSaveBasicConfigSection() {
    persistSettings(settings, 'Configuracion basica guardada.');
  }

  function handleSaveNotificationsSection() {
    persistSettings(settings, 'Notificaciones del sistema guardadas.');
  }

  function handleSaveLoginImageSection() {
    persistSettings(settings, 'Imagen de login guardada.');
  }

  async function handleLogoUpload(slot: LogoSlotKey, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (!isPng) {
      toast.error('Solo se permiten archivos PNG para los logos.');
      return;
    }

    if (file.size > LOGO_MAX_SIZE_BYTES) {
      toast.error('El archivo supera el tamano maximo de 20 MB.');
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      const nextSettings: GeneralSettingsStorageData = {
        ...settings,
        logos: {
          ...settings.logos,
          [slot]: createLogoAsset(file, previewUrl),
        },
      };

      persistSettings(
        nextSettings,
        slot === 'mainLogo' ? 'Logo principal actualizado.' : 'Logo de facturas actualizado.',
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible cargar el logo.');
    }
  }

  async function handleLoginImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen valida para el login.');
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      const nextImage = createLoginImageAsset(file, previewUrl);
      const nextImages = [nextImage, ...settings.loginImage.images.filter((image) => image.fileName !== file.name)];
      const nextLoginImage: GeneralSettingsLoginImageSection = {
        selectedImageId: nextImage.id,
        images: nextImages,
      };

      const nextSettings: GeneralSettingsStorageData = {
        ...settings,
        loginImage: nextLoginImage,
      };

      persistSettings(nextSettings, 'Nueva imagen de login cargada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible cargar la imagen de login.');
    }
  }

  return (
    <div className="min-h-full bg-[#d3dce7] px-4 pb-8 pt-4 lg:px-6">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-[27px] font-normal leading-none text-slate-900">Ajustes generales</h1>

        <div className="flex items-center gap-2 pt-1 text-[14px] text-slate-500">
          <span>Inicio</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#0d8bff]">General</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GeneralPanel title="Datos de la empresa">
          <div className="px-4 py-4">
            <div className="space-y-[10px]">
              <FormRow label="Empresa" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <Input
                  value={settings.company.companyName}
                  onChange={(event) => handleCompanyFieldChange('companyName', event.target.value)}
                  className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                />
              </FormRow>

              <FormRow label="Direccion" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <Input
                  value={settings.company.address}
                  onChange={(event) => handleCompanyFieldChange('address', event.target.value)}
                  className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                />
              </FormRow>

              <FormRow label="Telefonos" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <Input
                  value={settings.company.phoneNumbers}
                  onChange={(event) => handleCompanyFieldChange('phoneNumbers', event.target.value)}
                  className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                />
              </FormRow>

              <FormRow label="Identificacion" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                  <Input
                    value={settings.company.identification}
                    onChange={(event) => handleCompanyFieldChange('identification', event.target.value)}
                    className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                  />
                  <p className="mt-1 text-[12px] text-slate-700">RUC,CUT,NIT,SAT,RUT,RTN</p>
                </div>
              </FormRow>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-3">
            <SectionSaveButton onClick={handleSaveCompanySection} />
          </div>
        </GeneralPanel>

        <GeneralPanel title="Configuracion basica">
          <div className="px-4 py-4">
            <div className="space-y-[10px]">
              <FormRow label="Zona Horaria" labelWidth="md:grid-cols-[270px_minmax(0,1fr)]">
                <select
                  value={settings.basicConfig.timezone}
                  onChange={(event) => handleBasicConfigFieldChange('timezone', event.target.value)}
                  className="h-9 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900 outline-none"
                >
                  {TIMEZONE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Email backup" labelWidth="md:grid-cols-[270px_minmax(0,1fr)]">
                <Input
                  type="email"
                  value={settings.basicConfig.backupEmail}
                  onChange={(event) => handleBasicConfigFieldChange('backupEmail', event.target.value)}
                  className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                />
              </FormRow>

              <FormRow label="Email Soporte" labelWidth="md:grid-cols-[270px_minmax(0,1fr)]">
                <Input
                  type="email"
                  value={settings.basicConfig.supportEmail}
                  onChange={(event) => handleBasicConfigFieldChange('supportEmail', event.target.value)}
                  className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                />
              </FormRow>

              <FormRow label="Email Facturacion" labelWidth="md:grid-cols-[270px_minmax(0,1fr)]">
                <div>
                  <Input
                    type="email"
                    value={settings.basicConfig.billingEmail}
                    onChange={(event) => handleBasicConfigFieldChange('billingEmail', event.target.value)}
                    className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                  />
                  <p className="mt-1 text-[12px] text-slate-700">* Email remitente</p>
                </div>
              </FormRow>

              <FormRow label="Validar Cedula/DNI/Rut/Cuit" labelWidth="md:grid-cols-[270px_minmax(0,1fr)]">
                <div className="flex items-center gap-3 pt-2">
                  <CircleHelp className="h-4 w-4 text-slate-500" />
                  <Switch
                    checked={settings.basicConfig.validateIdentity}
                    onCheckedChange={handleToggleChange}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
              </FormRow>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-3">
            <SectionSaveButton onClick={handleSaveBasicConfigSection} />
          </div>
        </GeneralPanel>

        <GeneralPanel title="Notificaciones del sistema" className="xl:min-h-[340px]">
          <div className="px-4 py-4">
            <div className="space-y-[10px]">
              <FormRow label="Correo Emisor/Router Caido" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                  <Input
                    type="email"
                    value={settings.notifications.routerDownEmail}
                    onChange={(event) => handleNotificationsFieldChange('routerDownEmail', event.target.value)}
                    className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                  />
                  <p className="mt-1 text-[12px] text-slate-700">Puede indicar varios correos</p>
                </div>
              </FormRow>

              <FormRow label="N° movil Emisor/Router Caido" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                  <Input
                    value={settings.notifications.routerDownMobile}
                    onChange={(event) => handleNotificationsFieldChange('routerDownMobile', event.target.value)}
                    className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                  />
                  <p className="mt-1 text-[12px] text-slate-700">Puede indicar varios numeros</p>
                </div>
              </FormRow>

              <FormRow label="Correo reporte pago" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                  <Input
                    type="email"
                    value={settings.notifications.paymentReportEmail}
                    onChange={(event) => handleNotificationsFieldChange('paymentReportEmail', event.target.value)}
                    className="h-9 rounded-[4px] border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900"
                  />
                  <p className="mt-1 text-[12px] text-slate-700">Puede indicar varios correos</p>
                </div>
              </FormRow>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-3">
            <SectionSaveButton onClick={handleSaveNotificationsSection} />
          </div>
        </GeneralPanel>

        <GeneralPanel title="Logo (.png)" className="xl:min-h-[340px]">
          <div className="divide-y divide-slate-200 px-4">
            <div className="flex flex-col items-center justify-center py-7 text-center">
              <div className="flex min-h-[86px] items-center justify-center">
                {settings.logos.mainLogo ? (
                  <img
                    src={settings.logos.mainLogo.previewUrl}
                    alt={settings.logos.mainLogo.fileName}
                    className="max-h-[74px] max-w-[220px] object-contain"
                  />
                ) : (
                  <EmptyPreview />
                )}
              </div>

              <input
                ref={mainLogoInputRef}
                type="file"
                accept=".png,image/png"
                className="hidden"
                onChange={(event) => void handleLogoUpload('mainLogo', event)}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => mainLogoInputRef.current?.click()}
                className="mt-4 h-9 gap-2 border-[#cbd5e1] px-4 text-[14px]"
              >
                <Upload className="h-4 w-4" />
                Subir Logo principal
              </Button>
              <p className="mt-3 text-[12px] text-red-500">{formatBytesLimitText(LOGO_MAX_SIZE_BYTES)}</p>
            </div>

            <div className="flex flex-col items-center justify-center py-7 text-center">
              <div className="flex min-h-[86px] items-center justify-center">
                {settings.logos.invoiceLogo ? (
                  <img
                    src={settings.logos.invoiceLogo.previewUrl}
                    alt={settings.logos.invoiceLogo.fileName}
                    className="max-h-[74px] max-w-[220px] object-contain"
                  />
                ) : (
                  <EmptyPreview />
                )}
              </div>

              <input
                ref={invoiceLogoInputRef}
                type="file"
                accept=".png,image/png"
                className="hidden"
                onChange={(event) => void handleLogoUpload('invoiceLogo', event)}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => invoiceLogoInputRef.current?.click()}
                className="mt-4 h-9 gap-2 border-[#cbd5e1] px-4 text-[14px]"
              >
                <Upload className="h-4 w-4" />
                Subir Logo Facturas & Recibo
              </Button>
              <p className="mt-3 text-[12px] text-red-500">{formatBytesLimitText(LOGO_MAX_SIZE_BYTES)}</p>
              <p className="mt-4 text-[12px] text-orange-500">
                * Se recomienda que el logo no debe pesar mas de 50kb y un ancho no mayor de 400px
              </p>
            </div>
          </div>
        </GeneralPanel>

        <GeneralPanel title="Imagen Login administrador" className="xl:col-span-1">
          <div className="px-4 py-4">
            <FormRow label="seleccionar imagen" labelWidth="md:grid-cols-[260px_minmax(0,1fr)]">
              <select
                value={settings.loginImage.selectedImageId}
                onChange={(event) => handleLoginImageSelection(event.target.value)}
                className="h-9 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-slate-900 outline-none"
              >
                <option value="">Seleccionar imagen</option>
                {settings.loginImage.images.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormRow>

            <p className="mt-4 text-[12px] text-cyan-600">{LOGIN_IMAGE_UPLOAD_HELP}</p>

            <input
              ref={loginImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleLoginImageUpload(event)}
            />

            <button
              type="button"
              onClick={() => loginImageInputRef.current?.click()}
              className="mt-3 flex min-h-[380px] w-full items-center justify-center rounded-[4px] bg-[#e5e5e5] transition hover:bg-[#dedede]"
            >
              {selectedLoginImage ? (
                <img
                  src={selectedLoginImage.previewUrl}
                  alt={selectedLoginImage.fileName}
                  className="max-h-[360px] w-full rounded-[4px] object-contain"
                />
              ) : (
                <EmptyPreview iconSize="h-12 w-12" />
              )}
            </button>
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-3">
            <SectionSaveButton onClick={handleSaveLoginImageSection} />
          </div>
        </GeneralPanel>
      </div>
    </div>
  );
}
