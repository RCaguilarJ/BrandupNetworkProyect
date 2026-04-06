import { useMemo, useState } from 'react';
import {
  Camera,
  Facebook,
  KeyRound,
  Mail,
  Shield,
  Smartphone,
  Trash2,
  Twitter,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';

type ProfileTab = 'datos' | 'configuracion' | 'seguridad';

export default function ProfilePage() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const [activeTab, setActiveTab] = useState<ProfileTab>('datos');
  const [form, setForm] = useState({
    name: user?.name ?? 'Administrador DesingsGDL',
    email: user?.email ?? 'oscar90.aguilar@gmail.com',
    phone: '',
    facebook: '',
    twitter: '',
    timeout: '30',
  });

  const initials = useMemo(
    () =>
      (form.name || 'Usuario')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
    [form.name],
  );

  if (isWispHub) {
    return (
      <div className="min-h-full border-t-4 border-[#45bf63] bg-white px-3 pt-6 pb-7 [font-family:Trebuchet_MS,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
        <div className="mb-6 flex items-center gap-3 border-b border-[#d7dde5] pb-5">
          <User className="h-8 w-8 text-[#45bf63]" />
          <h1 className="text-[2rem] font-semibold text-[#13253c]">Mi cuenta</h1>
        </div>
        <div className="border border-[#d7dde5] bg-white p-4 text-[13px] text-[#6f8293]">
          Vista WispHub disponible. La paridad fina se esta concentrando en Mikrosystem.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#dbe6f2] px-6 pt-[18px] pb-7 text-[#25364b] [font-family:Open_Sans,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-[21px] font-normal text-[#24364b]">Mi cuenta</h1>
        <div className="pt-1 text-[12px] text-[#5f738a]">
          <span>Inicio</span>
          <span className="mx-1 text-[#9db0c3]">/</span>
          <span className="text-[#24364b]">Mi cuenta</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-[4px] border border-[#d6dee8] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="mx-auto inline-flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#009efb] text-[34px] font-bold text-white shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
              {initials || 'A'}
            </div>
            <h2 className="mt-4 text-[19px] font-semibold text-[#24364b]">
              {form.name}
            </h2>
            <p className="mt-1 text-[13px] text-[#7f92a6]">Administrador</p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <ActionMiniButton
                icon={<Facebook className="h-3.5 w-3.5" />}
                label="Facebook"
                onClick={() => toast.info('Vista previa de avatar desde Facebook')}
              />
              <ActionMiniButton
                icon={<Twitter className="h-3.5 w-3.5" />}
                label="Twitter"
                onClick={() => toast.info('Vista previa de avatar desde X / Twitter')}
              />
              <ActionMiniButton
                icon={<Camera className="h-3.5 w-3.5" />}
                label="Gravatar"
                onClick={() => toast.info('Vista previa de avatar desde Gravatar')}
              />
            </div>
          </div>

          <div className="border-t border-[#eef2f6] px-6 py-5 text-[13px]">
            <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={form.email} />
            <InfoRow icon={<Smartphone className="h-3.5 w-3.5" />} label="Telefono Movil" value={form.phone || 'No definido'} />
            <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Usuario" value="admin" last />
          </div>
        </aside>

        <section className="overflow-hidden rounded-[4px] border border-[#d6dee8] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
          <div className="border-b border-[#dbe3ec]">
            <div className="flex flex-wrap">
              <ProfileTabButton
                active={activeTab === 'datos'}
                onClick={() => setActiveTab('datos')}
                label="Mis datos"
              />
              <ProfileTabButton
                active={activeTab === 'configuracion'}
                onClick={() => setActiveTab('configuracion')}
                label="Configuracion"
              />
              <ProfileTabButton
                active={activeTab === 'seguridad'}
                onClick={() => setActiveTab('seguridad')}
                label="Seguridad"
              />
            </div>
          </div>

          {activeTab === 'datos' ? (
            <div className="space-y-5 px-6 py-6">
              <ProfileField
                label="Nombres Completos"
                icon={<User className="h-3.5 w-3.5" />}
                value={form.name}
                onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />
              <ProfileField
                label="Email"
                icon={<Mail className="h-3.5 w-3.5" />}
                type="email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              />
              <ProfileField
                label="Telefono Movil"
                icon={<Smartphone className="h-3.5 w-3.5" />}
                value={form.phone}
                onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              />
              <ProfileField
                label="Usuario Facebook"
                icon={<Facebook className="h-3.5 w-3.5" />}
                value={form.facebook}
                onChange={(value) => setForm((prev) => ({ ...prev, facebook: value }))}
              />
              <ProfileField
                label="Usuario X / Twitter"
                icon={<Twitter className="h-3.5 w-3.5" />}
                value={form.twitter}
                onChange={(value) => setForm((prev) => ({ ...prev, twitter: value }))}
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => toast.success('Datos de perfil actualizados localmente')}
                  className="inline-flex h-9 items-center rounded bg-[#00acac] px-4 text-[12px] font-semibold text-white"
                >
                  Actualizar datos
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Cambio de contrasena pendiente de backend')}
                  className="inline-flex h-9 items-center gap-2 rounded border border-[#d6dee8] bg-white px-4 text-[12px] font-semibold text-[#24364b]"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Cambiar contrasena
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === 'configuracion' ? (
            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#24364b]">
                  Desconectar por inactividad
                </label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={form.timeout}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, timeout: event.target.value }))
                  }
                  className="h-9 w-[50%] min-w-[180px] rounded border border-[#d6dee8] px-3 text-[13px] text-[#24364b] outline-none"
                />
                <p className="mt-2 text-[12px] text-[#7f92a6]">* minutos, 0 = Desactivado</p>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#24364b]">
                  Preferencias Tablas
                </label>
                <button
                  type="button"
                  onClick={() => toast.success('Preferencias locales eliminadas')}
                  className="inline-flex h-9 items-center gap-2 rounded border border-[#d6dee8] bg-white px-4 text-[12px] font-semibold text-[#24364b]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar preferencias
                </button>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Configuracion guardada localmente')}
                className="inline-flex h-9 items-center rounded bg-[#00acac] px-4 text-[12px] font-semibold text-white"
              >
                Guardar cambios
              </button>
            </div>
          ) : null}

          {activeTab === 'seguridad' ? (
            <div className="px-6 py-6">
              <div className="rounded border-t-[3px] border-[#009efb] bg-white">
                <div className="rounded border border-[#dbe4ee] bg-[#eef8ff] px-4 py-3 text-[13px] text-[#47657f]">
                  La verificacion en dos pasos protege tu acceso al panel. Cada operador decide si la activa o no desde esta misma pantalla.
                </div>

                <div className="space-y-4 pt-5 text-[13px] text-[#32465b]">
                  <p>
                    <b>Estado:</b> <span className="text-[#ff5b57]">Desactivado</span>
                  </p>
                  <p>Usa Google Authenticator o cualquier app compatible con TOTP.</p>
                  <button
                    type="button"
                    onClick={() => toast.info('Flujo 2FA listo para conectar al backend')}
                    className="inline-flex h-9 items-center gap-2 rounded bg-[#32a932] px-4 text-[12px] font-semibold text-white"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Configurar Google Authenticator
                  </button>

                  <div className="rounded border border-[#dbe4ee] bg-[#f8fafc] px-4 py-4">
                    <p className="text-[12px] text-[#5e748a]">
                      Códigos de respaldo
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap rounded border border-[#dbe4ee] bg-white p-3 text-[12px] leading-6 text-[#24364b]">
1234-5678
9876-5432
1122-3344
5566-7788
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function ProfileTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-r border-[#dbe3ec] px-5 py-3 text-[13px] font-semibold ${
        active ? 'bg-white text-[#24364b]' : 'bg-[#f7fafc] text-[#7b8da0]'
      }`}
    >
      {label}
    </button>
  );
}

function ActionMiniButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1 rounded border border-[#d6dee8] bg-white px-2.5 text-[10px] font-semibold text-[#32465b]"
    >
      {icon}
      {label}
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={`${last ? '' : 'mb-5'}`}>
      <p className="mb-1 flex items-center gap-1.5 text-[#7f92a6]">
        {icon}
        {label}
      </p>
      <p className="text-[#24364b]">{value}</p>
    </div>
  );
}

function ProfileField({
  label,
  icon,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-[#24364b]">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded border border-[#d6dee8] px-3 text-[13px] text-[#24364b] outline-none"
      />
    </div>
  );
}
