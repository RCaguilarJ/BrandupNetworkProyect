import { useMemo, useState } from 'react';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { Button } from '../components/ui/button';
import { FileText, ImagePlus, Mail, Palette, Plus, Save, Settings2, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../assets/logo_admin.png';

type PortalTabId = 'general' | 'payment-report' | 'banners' | 'design';

type PortalGeneralSettings = {
  portalUrl: string;
  portalTitle: string;
  speedTestUrl: string;
  customMenuTitle: string;
  showReceipts: boolean;
  showSupport: boolean;
  showDocuments: boolean;
  showReportPayment: boolean;
  showSpeedTest: boolean;
  showTraffic: boolean;
  showAdBanner: boolean;
  showCustomMenu: boolean;
  allowAutologin: boolean;
  allowPasswordChange: boolean;
  allowProfileUpdate: boolean;
  showTrafficStats: boolean;
  customMenuHtml: string;
};

type PortalReportSettings = {
  customFields: string[];
  outputMessage: string;
};

type PortalBannerSettings = {
  banners: string[];
};

type PortalDesignSettings = {
  loginDesign: string;
  portalDesign: string;
  colorPalette: string;
  backgroundImage: string;
  accessTitle: string;
  subtitle: string;
  buttonText: string;
  formPosition: string;
  backgroundIntensity: string;
  primaryColor: string;
};

type PortalClientSettingsState = {
  general: PortalGeneralSettings;
  paymentReport: PortalReportSettings;
  banners: PortalBannerSettings;
  design: PortalDesignSettings;
};

const PORTAL_CLIENT_STORAGE_PREFIX = 'brandup_portal_client_settings';

function buildStorageKey() {
  return `${PORTAL_CLIENT_STORAGE_PREFIX}:global`;
}

function createDefaultState(): PortalClientSettingsState {
  return {
    general: {
      portalUrl: 'http://clientes.olinet.com.mx',
      portalTitle: 'Acceso Clientes',
      speedTestUrl: 'https://fast.com/es/',
      customMenuTitle: 'Lugares de Pagos',
      showReceipts: true,
      showSupport: true,
      showDocuments: true,
      showReportPayment: true,
      showSpeedTest: true,
      showTraffic: true,
      showAdBanner: true,
      showCustomMenu: false,
      allowAutologin: true,
      allowPasswordChange: true,
      allowProfileUpdate: true,
      showTrafficStats: true,
      customMenuHtml: '<div style="padding:20px">Menu personalizado</div>',
    },
    paymentReport: {
      customFields: [],
      outputMessage: '<div style="padding:20px">Gracias por reportar tu pago.</div>',
    },
    banners: {
      banners: [],
    },
    design: {
      loginDesign: 'Login 1',
      portalDesign: 'Diseno 1',
      colorPalette: 'Rojo',
      backgroundImage: 'login-bg-15.jpg',
      accessTitle: 'Accede a tu cuenta',
      subtitle: 'Gestiona tu servicio en linea',
      buttonText: 'Ingresar',
      formPosition: 'Izquierda',
      backgroundIntensity: 'Suave',
      primaryColor: '#3564d8',
    },
  };
}

function loadStoredState(storageKey: string) {
  const fallback = createDefaultState();

  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
      return fallback;
    }

    return {
      ...fallback,
      ...(JSON.parse(rawValue) as Partial<PortalClientSettingsState>),
      general: {
        ...fallback.general,
        ...(JSON.parse(rawValue) as Partial<PortalClientSettingsState>).general,
      },
      paymentReport: {
        ...fallback.paymentReport,
        ...(JSON.parse(rawValue) as Partial<PortalClientSettingsState>).paymentReport,
      },
      banners: {
        ...fallback.banners,
        ...(JSON.parse(rawValue) as Partial<PortalClientSettingsState>).banners,
      },
      design: {
        ...fallback.design,
        ...(JSON.parse(rawValue) as Partial<PortalClientSettingsState>).design,
      },
    };
  } catch {
    return fallback;
  }
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[50px] items-center rounded-t-[6px] px-5 text-[18px] transition ${
        active ? 'bg-white text-[#2d3748]' : 'text-[#2687ff] hover:text-[#0d6de8]'
      }`}
    >
      <Icon className="mr-2 h-5 w-5" />
      {label}
    </button>
  );
}

function SectionFrame({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d8e0ea] px-5 py-4">
        <h2 className="text-[18px] font-medium text-[#425466]">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-[15px] text-[#374151]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-[#cdd5df] accent-[#2f96f3]"
      />
    </label>
  );
}

function PortalLoginPreview({
  title,
  subtitle,
  buttonText,
  primaryColor,
}: {
  title: string;
  subtitle: string;
  buttonText: string;
  primaryColor: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#253148_0%,#141b2e_100%)] p-8 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
      <div className="mx-auto max-w-[340px] rounded-[24px] border border-white/10 bg-slate-950/55 px-6 py-7 text-white backdrop-blur-sm">
        <div className="mb-4 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.06em]">
            Vista previa
          </div>
          <img src={logo} alt="Brandup" className="mx-auto h-14 w-auto object-contain" />
          <p className="mt-5 text-[24px] font-semibold">{title}</p>
          <p className="mt-2 text-[15px] text-white/70">{subtitle}</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value="Usuario"
            readOnly
            className="h-[50px] w-full rounded-[12px] border border-white/10 bg-white text-[16px] text-[#475467]"
          />
          <input
            type="text"
            value="Contrasena"
            readOnly
            className="h-[50px] w-full rounded-[12px] border border-white/10 bg-white text-[16px] text-[#475467]"
          />
          <div
            className="mx-auto mt-5 h-[14px] w-[150px] rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="pt-1 text-center text-[14px] font-medium text-white/75">{buttonText}</div>
        </div>
      </div>
    </div>
  );
}

function PortalScreenPreview({
  primaryColor,
}: {
  primaryColor: string;
}) {
  return (
    <div className="overflow-hidden rounded-[6px] border-[3px] border-[#383838] bg-white">
      <div className="flex h-8 items-center justify-between border-b border-[#d7dfe8] px-3">
        <span className="text-[10px] font-semibold text-[#3564d8]">COREBN</span>
        <span className="text-[9px] text-[#98a2b3]">portal</span>
      </div>
      <div className="grid grid-cols-[88px_minmax(0,1fr)]">
        <div className="min-h-[200px] bg-[#3b4651] px-3 py-4 text-[8px] text-white/80">
          <div className="mb-2 h-[6px] w-12 rounded bg-white/20" />
          <div className="mb-2 h-[6px] w-10 rounded bg-white/20" />
          <div className="mb-2 h-[6px] w-11 rounded bg-white/20" />
          <div className="mb-2 h-[6px] w-9 rounded bg-white/20" />
        </div>
        <div className="min-h-[200px] bg-[#f8fbff] px-3 py-3">
          <div className="grid grid-cols-4 gap-2">
            <div className="h-10 rounded" style={{ backgroundColor: primaryColor }} />
            <div className="h-10 rounded bg-[#8fd0ef]" />
            <div className="h-10 rounded bg-[#7ad3db]" />
            <div className="h-10 rounded bg-[#8a6ef3]" />
          </div>
          <div className="mt-3 h-24 rounded bg-[#ffffff] shadow-[0_6px_18px_rgba(15,23,42,0.08)]" />
          <div className="mt-4 flex h-12 items-center justify-center rounded bg-[linear-gradient(90deg,#f7d7f9,#d0ecff)] text-[12px] font-semibold text-[#c05ab4]">
            Banner Ejemplo
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalClientSettings() {
  const storageKey = useMemo(() => buildStorageKey(), []);
  const [activeTab, setActiveTab] = useState<PortalTabId>('general');
  const [state, setState] = useState<PortalClientSettingsState>(() => loadStoredState(storageKey));

  function persist(nextState: PortalClientSettingsState, successMessage: string) {
    setState(nextState);
    localStorage.setItem(storageKey, JSON.stringify(nextState));
    toast.success(successMessage);
  }

  function updateGeneralField<K extends keyof PortalGeneralSettings>(field: K, value: PortalGeneralSettings[K]) {
    setState((current) => ({
      ...current,
      general: {
        ...current.general,
        [field]: value,
      },
    }));
  }

  function updatePaymentReportField<K extends keyof PortalReportSettings>(field: K, value: PortalReportSettings[K]) {
    setState((current) => ({
      ...current,
      paymentReport: {
        ...current.paymentReport,
        [field]: value,
      },
    }));
  }

  function updateDesignField<K extends keyof PortalDesignSettings>(field: K, value: PortalDesignSettings[K]) {
    setState((current) => ({
      ...current,
      design: {
        ...current.design,
        [field]: value,
      },
    }));
  }

  function saveGeneralSection() {
    persist(state, 'Configuracion general del portal guardada.');
  }

  function saveOptionsSection() {
    persist(state, 'Opciones del portal guardadas.');
  }

  function saveDesignSection() {
    persist(state, 'Diseno del portal guardado.');
  }

  function addCustomField() {
    const nextFields = [...state.paymentReport.customFields, `Campo personalizado ${state.paymentReport.customFields.length + 1}`];
    setState((current) => ({
      ...current,
      paymentReport: {
        ...current.paymentReport,
        customFields: nextFields,
      },
    }));
    toast.info('Campo personalizado agregado.');
  }

  function addBanner() {
    setState((current) => ({
      ...current,
      banners: {
        banners: [...current.banners.banners, `Banner ${current.banners.banners.length + 1}`],
      },
    }));
    toast.info('Banner agregado.');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Portal cliente</h1>

        <SettingsBreadcrumb currentLabel="Portal cliente" />
      </div>

      <section className="rounded-[2px] bg-white shadow-sm">
        <div className="flex flex-wrap gap-1 px-4 pt-4">
          <TabButton icon={Settings2} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
          <TabButton icon={Mail} label="Reporte pago" active={activeTab === 'payment-report'} onClick={() => setActiveTab('payment-report')} />
          <TabButton icon={FileText} label="Baners" active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} />
          <TabButton icon={Palette} label="Diseno" active={activeTab === 'design'} onClick={() => setActiveTab('design')} />
        </div>

        <div className="space-y-6 px-5 pb-6 pt-4">
          {activeTab === 'general' ? (
            <>
              <SectionFrame
                title="Datos del portal"
                action={
                  <Button type="button" onClick={saveGeneralSection} className="h-[46px] rounded-[6px] bg-[#3a92dd] px-5 text-[16px] font-semibold text-white hover:bg-[#2e84cf]">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </Button>
                }
              >
                <div className="grid gap-y-4 xl:grid-cols-[430px_minmax(0,1fr)]">
                  <label className="pt-3 text-right text-[15px] text-[#374151]">URL Portal</label>
                  <div>
                    <input
                      type="text"
                      value={state.general.portalUrl}
                      onChange={(event) => updateGeneralField('portalUrl', event.target.value)}
                      className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none"
                    />
                    <p className="mt-2 text-[14px] leading-8 text-[#ff6b5f]">
                      Debe colocar la IP o dominio correcto ya que este tambien sera utilizado para mostrar los avisos. Ejm: https://192.168.2.2 o http://clientes.dominio.net
                    </p>
                  </div>

                  <label className="pt-3 text-right text-[15px] text-[#374151]">Titulo Portal</label>
                  <input
                    type="text"
                    value={state.general.portalTitle}
                    onChange={(event) => updateGeneralField('portalTitle', event.target.value)}
                    className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none"
                  />

                  <label className="pt-3 text-right text-[15px] text-[#374151]">Url test velocidad</label>
                  <input
                    type="text"
                    value={state.general.speedTestUrl}
                    onChange={(event) => updateGeneralField('speedTestUrl', event.target.value)}
                    className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none"
                  />

                  <label className="pt-3 text-right text-[15px] text-[#374151]">Titulo "Menu personalizado"</label>
                  <input
                    type="text"
                    value={state.general.customMenuTitle}
                    onChange={(event) => updateGeneralField('customMenuTitle', event.target.value)}
                    className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none"
                  />
                </div>
              </SectionFrame>

              <SectionFrame
                title="Opciones disponibles"
                action={
                  <Button type="button" onClick={saveOptionsSection} className="h-[46px] rounded-[6px] bg-[#3a92dd] px-5 text-[16px] font-semibold text-white hover:bg-[#2e84cf]">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </Button>
                }
              >
                <div className="grid gap-x-16 gap-y-6 xl:grid-cols-2">
                  <div className="space-y-6">
                    <ToggleRow label='Mostrar "Mis comprobantes"' checked={state.general.showReceipts} onChange={(checked) => updateGeneralField('showReceipts', checked)} />
                    <ToggleRow label='Mostrar "Soporte tecnico"' checked={state.general.showSupport} onChange={(checked) => updateGeneralField('showSupport', checked)} />
                    <ToggleRow label='Mostrar "Mis documentos"' checked={state.general.showDocuments} onChange={(checked) => updateGeneralField('showDocuments', checked)} />
                    <ToggleRow label='Mostrar "Informar pago"' checked={state.general.showReportPayment} onChange={(checked) => updateGeneralField('showReportPayment', checked)} />
                    <ToggleRow label='Mostrar "Test velocidad"' checked={state.general.showSpeedTest} onChange={(checked) => updateGeneralField('showSpeedTest', checked)} />
                    <ToggleRow label='Mostrar "Trafico actual"' checked={state.general.showTraffic} onChange={(checked) => updateGeneralField('showTraffic', checked)} />
                  </div>

                  <div className="space-y-6">
                    <ToggleRow label='Mostrar "Banner de Publicidad"' checked={state.general.showAdBanner} onChange={(checked) => updateGeneralField('showAdBanner', checked)} />
                    <ToggleRow label='Mostrar "Menu Personalizado"' checked={state.general.showCustomMenu} onChange={(checked) => updateGeneralField('showCustomMenu', checked)} />
                    <div>
                      <ToggleRow label="Permitir Autologin" checked={state.general.allowAutologin} onChange={(checked) => updateGeneralField('allowAutologin', checked)} />
                      <p className="mt-2 text-[14px] text-[#ff9b26]">* Solo es compatible con servidores locales y una red sin doble Nat.</p>
                    </div>
                    <ToggleRow label="Permitir cambiar contrasena" checked={state.general.allowPasswordChange} onChange={(checked) => updateGeneralField('allowPasswordChange', checked)} />
                    <ToggleRow label="Permitir Actualizar datos" checked={state.general.allowProfileUpdate} onChange={(checked) => updateGeneralField('allowProfileUpdate', checked)} />
                    <ToggleRow label="Mostrar estadisticas de trafico" checked={state.general.showTrafficStats} onChange={(checked) => updateGeneralField('showTrafficStats', checked)} />
                  </div>
                </div>
              </SectionFrame>

              <SectionFrame title='Contenido "Menu personalizado"'>
                <textarea
                  value={state.general.customMenuHtml}
                  onChange={(event) => updateGeneralField('customMenuHtml', event.target.value)}
                  className="min-h-[140px] w-full rounded-[4px] border border-[#d7dfe8] px-4 py-3 text-[15px] text-[#24364b] outline-none"
                />
              </SectionFrame>
            </>
          ) : null}

          {activeTab === 'payment-report' ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <SectionFrame title="Campos por defecto">
                  <div className="space-y-2">
                    {[
                      'Asunto',
                      'Fecha del pago',
                      'Tipo de pago',
                      'Descripcion de pago',
                      'N° Transacción',
                      'Comprobante a Pagar',
                      'Total Pagado',
                      'Adjunto',
                      'Mensaje',
                    ].map((field) => (
                      <div key={field} className="flex items-center bg-[#20262a] px-5 py-5 text-[15px] font-semibold text-white">
                        <Plus className="mr-3 h-5 w-5" />
                        {field}
                      </div>
                    ))}
                  </div>
                </SectionFrame>

                <SectionFrame
                  title="Campos Personalizados"
                  action={
                    <Button type="button" onClick={addCustomField} className="h-[40px] rounded-[6px] bg-[#3a92dd] px-4 text-[16px] font-semibold text-white hover:bg-[#2e84cf]">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo campo
                    </Button>
                  }
                >
                  <div className="min-h-[280px]">
                    {state.paymentReport.customFields.length === 0 ? null : (
                      <div className="space-y-2">
                        {state.paymentReport.customFields.map((field) => (
                          <div key={field} className="flex items-center bg-[#20262a] px-5 py-4 text-[15px] font-semibold text-white">
                            {field}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionFrame>
              </div>

              <SectionFrame title="Mensaje salida reporte pago">
                <textarea
                  value={state.paymentReport.outputMessage}
                  onChange={(event) => updatePaymentReportField('outputMessage', event.target.value)}
                  className="min-h-[120px] w-full rounded-[4px] border border-[#d7dfe8] px-4 py-3 text-[15px] text-[#24364b] outline-none"
                />
              </SectionFrame>
            </>
          ) : null}

          {activeTab === 'banners' ? (
            <section className="rounded-[2px] bg-white shadow-sm">
              <div className="flex justify-end px-6 py-5">
                <Button type="button" onClick={addBanner} className="h-[52px] rounded-[6px] bg-[#2f96f3] px-6 text-[16px] font-semibold text-white hover:bg-[#2487e0]">
                  <ImagePlus className="mr-2 h-5 w-5" />
                  Agregar Banner
                </Button>
              </div>
              <div className="min-h-[260px] px-6 pb-6">
                {state.banners.banners.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {state.banners.banners.map((banner) => (
                      <div key={banner} className="rounded-[8px] border border-[#d7dfe8] bg-[#f8fbff] p-6 text-[16px] text-[#374151]">
                        {banner}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {activeTab === 'design' ? (
            <div className="space-y-6">
              <section className="rounded-[2px] bg-white px-5 py-6 shadow-sm">
                <div className="mx-auto max-w-[760px] space-y-4">
                  <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <label className="pt-3 text-right text-[15px] text-[#374151]">Diseno login</label>
                    <div>
                      <select value={state.design.loginDesign} onChange={(event) => updateDesignField('loginDesign', event.target.value)} className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none">
                        <option>Login 1</option>
                        <option>Login 2</option>
                        <option>Login 3</option>
                      </select>
                      <p className="mt-2 text-[13px] text-[#7a8ca4]">
                        El Login 4 permite personalizar titulo, subtitulo, boton, color y posicion del formulario por subcuenta.
                      </p>
                    </div>

                    <label className="pt-3 text-right text-[15px] text-[#374151]">Diseno portal</label>
                    <select value={state.design.portalDesign} onChange={(event) => updateDesignField('portalDesign', event.target.value)} className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none">
                      <option>Diseno 1</option>
                      <option>Diseno 2</option>
                    </select>

                    <label className="pt-3 text-right text-[15px] text-[#374151]">Colores del diseno</label>
                    <select value={state.design.colorPalette} onChange={(event) => updateDesignField('colorPalette', event.target.value)} className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none">
                      <option>Rojo</option>
                      <option>Azul</option>
                      <option>Verde</option>
                    </select>

                    <label className="pt-3 text-right text-[15px] text-[#374151]">Imagen de fondo</label>
                    <div>
                      <select value={state.design.backgroundImage} onChange={(event) => updateDesignField('backgroundImage', event.target.value)} className="h-[48px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none">
                        <option>login-bg-15.jpg</option>
                        <option>login-bg-07.jpg</option>
                        <option>login-bg-04.jpg</option>
                      </select>
                      <p className="mt-2 text-[13px] text-[#24b8c2]">
                        Para subir nuevas imagenes debe subirlos al servidor ruta : /root/core_bn/app/admin/images/login-bg
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[#e3ebf4] bg-[#f8fbff] p-6">
                    <div className="grid gap-x-8 gap-y-4 xl:grid-cols-[170px_minmax(0,1fr)]">
                      <label className="pt-3 text-right text-[15px] text-[#374151]">Titulo acceso</label>
                      <input value={state.design.accessTitle} onChange={(event) => updateDesignField('accessTitle', event.target.value)} className="h-[44px] rounded-[6px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none" />

                      <label className="pt-3 text-right text-[15px] text-[#374151]">Subtitulo</label>
                      <div>
                        <input value={state.design.subtitle} onChange={(event) => updateDesignField('subtitle', event.target.value)} className="h-[44px] w-full rounded-[6px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none" />
                        <p className="mt-2 text-[13px] text-[#7a8ca4]">Solo aplica para Login 4.</p>
                      </div>

                      <label className="pt-3 text-right text-[15px] text-[#374151]">Texto boton</label>
                      <input value={state.design.buttonText} onChange={(event) => updateDesignField('buttonText', event.target.value)} className="h-[44px] rounded-[6px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none" />

                      <label className="pt-3 text-right text-[15px] text-[#374151]">Posicion formulario</label>
                      <select value={state.design.formPosition} onChange={(event) => updateDesignField('formPosition', event.target.value)} className="h-[44px] rounded-[6px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none">
                        <option>Izquierda</option>
                        <option>Centro</option>
                        <option>Derecha</option>
                      </select>

                      <label className="pt-3 text-right text-[15px] text-[#374151]">Intensidad fondo</label>
                      <select value={state.design.backgroundIntensity} onChange={(event) => updateDesignField('backgroundIntensity', event.target.value)} className="h-[44px] rounded-[6px] border border-[#d7dfe8] px-4 text-[15px] text-[#24364b] outline-none">
                        <option>Suave</option>
                        <option>Media</option>
                        <option>Alta</option>
                      </select>

                      <label className="pt-3 text-right text-[15px] text-[#374151]">Color principal</label>
                      <div>
                        <input type="color" value={state.design.primaryColor} onChange={(event) => updateDesignField('primaryColor', event.target.value)} className="h-[44px] w-full rounded-[6px] border border-[#d7dfe8] p-1" />
                        <p className="mt-2 text-[13px] text-[#7a8ca4]">Se usa en el boton y acentos del nuevo login.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <PortalLoginPreview
                title={state.design.accessTitle}
                subtitle={state.design.subtitle}
                buttonText={state.design.buttonText}
                primaryColor={state.design.primaryColor}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <PortalScreenPreview primaryColor={state.design.primaryColor} />
                <PortalScreenPreview primaryColor={state.design.primaryColor} />
              </div>

              <div className="pt-2">
                <Button type="button" variant="outline" onClick={saveDesignSection} className="h-[50px] rounded-full border-[#3399f4] px-6 text-[16px] font-medium text-[#1788eb] hover:bg-[#eff7ff]">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
