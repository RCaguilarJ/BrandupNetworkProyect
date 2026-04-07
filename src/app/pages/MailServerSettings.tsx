import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { useAuth } from '../context/AuthContext';
import { sanitizeNumericValue } from '../lib/input-sanitizers';
import { CircleHelp, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

type MailServerSettingsState = {
  deliveryMode: string;
  authType: string;
  host: string;
  security: string;
  username: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  password: string;
  mailLogo: string;
  port: string;
  authenticationEnabled: string;
  sendingLimitType: string;
  emailLimit: string;
  signature: string;
};

const MAIL_SERVER_STORAGE_PREFIX = 'brandup_mail_server_settings';

function buildStorageKey(companyId?: string) {
  return `${MAIL_SERVER_STORAGE_PREFIX}:${companyId ?? 'global'}`;
}

function createDefaultSettings(): MailServerSettingsState {
  return {
    deliveryMode: 'SMTP personalizado',
    authType: 'Usuario y Contraseña',
    host: 'smtp.gmail.com',
    security: 'SSL',
    username: 'correo@gmail.com',
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    password: '••••',
    mailLogo: '',
    port: '465',
    authenticationEnabled: 'SI',
    sendingLimitType: 'Límite por día',
    emailLimit: '1000',
    signature: '',
  };
}

function loadStoredSettings(storageKey: string) {
  const fallback = createDefaultSettings();

  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
      return fallback;
    }

    return {
      ...fallback,
      ...(JSON.parse(rawValue) as Partial<MailServerSettingsState>),
    };
  } catch {
    return fallback;
  }
}

function FieldLabel({
  children,
  helper,
}: {
  children: React.ReactNode;
  helper?: boolean;
}) {
  return (
    <label className="flex items-center justify-end gap-1 pt-3 text-right text-[15px] text-[#374151]">
      <span>{children}</span>
      {helper ? <CircleHelp className="h-4 w-4 text-[#1f2933]" /> : null}
    </label>
  );
}

function InputBase(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-[48px] w-full rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c3cad3] ${props.className ?? ''}`}
    />
  );
}

function SelectBase(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-[48px] w-full rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none ${props.className ?? ''}`}
    />
  );
}

export default function MailServerSettings() {
  const { user } = useAuth();
  const storageKey = useMemo(() => buildStorageKey(user?.companyId), [user?.companyId]);
  const [form, setForm] = useState<MailServerSettingsState>(() => loadStoredSettings(storageKey));

  function updateField<K extends keyof MailServerSettingsState>(field: K, value: MailServerSettingsState[K]) {
    if (field === 'port' || field === 'emailLimit') {
      value = sanitizeNumericValue(String(value)) as MailServerSettingsState[K];
    }

    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    localStorage.setItem(storageKey, JSON.stringify(form));
    toast.success('Configuracion de correo guardada.');
  }

  function handleTest() {
    toast.info('La prueba de configuracion queda lista para conectarse con backend.');
  }

  function handleTokenRequest() {
    toast.info('La solicitud de token queda lista para integrarse con OAuth.');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Configuración correo</h1>

        <SettingsBreadcrumb currentLabel="Servidor de correo" />
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
        <div className="flex items-center gap-4 bg-[#20262a] px-6 py-4">
          <h2 className="text-[18px] font-semibold text-white">Datos del servidor correo</h2>
          <span className="text-[12px] font-medium text-[#f6a63c]">Alcance: Subcuenta #10</span>
        </div>

        <div className="space-y-6 px-5 py-6">
          <div className="rounded-[6px] border border-[#7ed1f5] bg-[#d9f1fb] px-6 py-4 text-center text-[17px] leading-8 text-[#215a75]">
            Cada subcuenta conserva su propio modo de envío, remitente, firma y validación de dominio. Agency siempre puede ver y configurar estos bloques aunque el cliente no los tenga habilitados.
          </div>

          <div className="rounded-[6px] border border-[#f4ad42] bg-[#fde3bd] px-6 py-4 text-center text-[17px] leading-8 text-[#915e11]">
            Esta vista muestra solo la configuración propia de la subcuenta. Si el cliente deja campos vacíos, el sistema aún puede usar el fallback operativo de Agency al momento de enviar, pero aquí no se exponen esos datos heredados.
          </div>

          <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[320px_minmax(0,1fr)]">
            <FieldLabel>Modo de envío</FieldLabel>
            <SelectBase
              value={form.deliveryMode}
              onChange={(event) => updateField('deliveryMode', event.target.value)}
            >
              <option>SMTP personalizado</option>
              <option>SMTP de sistema</option>
              <option>OAuth Gmail</option>
            </SelectBase>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Tipo de autenticación</FieldLabel>
                <SelectBase
                  value={form.authType}
                  onChange={(event) => updateField('authType', event.target.value)}
                >
                  <option>Usuario y Contraseña</option>
                  <option>OAuth 2.0</option>
                  <option>API Key</option>
                </SelectBase>
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Host/servidor</FieldLabel>
                <InputBase
                  value={form.host}
                  onChange={(event) => updateField('host', event.target.value)}
                />
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Seguridad</FieldLabel>
                <SelectBase
                  value={form.security}
                  onChange={(event) => updateField('security', event.target.value)}
                >
                  <option>SSL</option>
                  <option>TLS</option>
                  <option>STARTTLS</option>
                  <option>Ninguna</option>
                </SelectBase>
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Usuario/Correo</FieldLabel>
                <InputBase
                  value={form.username}
                  onChange={(event) => updateField('username', event.target.value)}
                />
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>ID Cliente</FieldLabel>
                <InputBase
                  value={form.clientId}
                  onChange={(event) => updateField('clientId', event.target.value)}
                />
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Secret Cliente</FieldLabel>
                <InputBase
                  value={form.clientSecret}
                  onChange={(event) => updateField('clientSecret', event.target.value)}
                />
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Refresh token</FieldLabel>
                <div className="space-y-3">
                  <InputBase
                    value={form.refreshToken}
                    onChange={(event) => updateField('refreshToken', event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleTokenRequest}
                    className="inline-flex h-[44px] items-center rounded-[4px] border border-[#d7dfe8] bg-white px-4 text-[15px] font-medium text-[#1f2933] transition hover:bg-[#f8fafc]"
                  >
                    <span className="mr-2 text-[26px] leading-none text-[#1f2933]">G</span>
                    Obtener Token
                  </button>
                </div>
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Contraseña</FieldLabel>
                <InputBase
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Puerto</FieldLabel>
                <InputBase
                  value={form.port}
                  onChange={(event) => updateField('port', event.target.value)}
                />
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel>Autentificación</FieldLabel>
                <SelectBase
                  value={form.authenticationEnabled}
                  onChange={(event) => updateField('authenticationEnabled', event.target.value)}
                >
                  <option>SI</option>
                  <option>NO</option>
                </SelectBase>
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel helper>Límite de envío</FieldLabel>
                <SelectBase
                  value={form.sendingLimitType}
                  onChange={(event) => updateField('sendingLimitType', event.target.value)}
                >
                  <option>Límite por día</option>
                  <option>Límite por hora</option>
                  <option>Sin límite</option>
                </SelectBase>
              </div>

              <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[168px_minmax(0,1fr)]">
                <FieldLabel helper>Límite de correos</FieldLabel>
                <div>
                  <InputBase
                    value={form.emailLimit}
                    onChange={(event) => updateField('emailLimit', event.target.value)}
                  />
                  <p className="mt-2 text-[13px] text-[#f59e0b]">Estado actual : 0 de {form.emailLimit || '0'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[220px_minmax(0,1fr)]">
            <FieldLabel helper>Logo correo</FieldLabel>
            <InputBase
              value={form.mailLogo}
              onChange={(event) => updateField('mailLogo', event.target.value)}
            />
          </div>

          <div className="border-t border-[#e5ebf2] pt-8">
            <h3 className="mb-5 text-[18px] font-medium uppercase text-[#374151]">FIRMA CORREO</h3>
            <textarea
              value={form.signature}
              onChange={(event) => updateField('signature', event.target.value)}
              className="min-h-[180px] w-full rounded-[4px] border border-[#d7dfe8] px-4 py-3 text-[15px] text-[#24364b] outline-none placeholder:text-[#c3cad3]"
              placeholder="Escribe aquí la firma HTML o texto del correo."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-[#e5ebf2] px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            className="h-[52px] rounded-full border-[#3399f4] px-7 text-[16px] font-medium text-[#1788eb] hover:bg-[#eff7ff]"
          >
            <Send className="mr-2 h-4 w-4" />
            Probar configuración
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            className="h-[52px] rounded-full border-[#3399f4] px-7 text-[16px] font-medium text-[#1788eb] hover:bg-[#eff7ff]"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </section>
    </div>
  );
}
