import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

type CustomDomainsState = {
  adminDomain: string;
  clientDomain: string;
};

type DomainStatusRow = {
  domain: string;
  ssl: string;
  expiresAt: string;
};

const CUSTOM_DOMAINS_STORAGE_PREFIX = 'brandup_custom_domains_settings';
const SYSTEM_BASE_DOMAIN = 'desingsgdl.core.brandup.network';

function buildStorageKey(companyId?: string) {
  return `${CUSTOM_DOMAINS_STORAGE_PREFIX}:${companyId ?? 'global'}`;
}

function createDefaultState(): CustomDomainsState {
  return {
    adminDomain: '',
    clientDomain: '',
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
      ...(JSON.parse(rawValue) as Partial<CustomDomainsState>),
    };
  } catch {
    return fallback;
  }
}

function buildPreviewUrl(subpath: 'admin' | 'cliente', domainValue: string) {
  const baseDomain = domainValue.trim() || SYSTEM_BASE_DOMAIN;
  return `https://${baseDomain}/${subpath}/`;
}

function buildStatusRows(state: CustomDomainsState): DomainStatusRow[] {
  const rows: DomainStatusRow[] = [];

  if (state.adminDomain.trim()) {
    rows.push({
      domain: state.adminDomain.trim(),
      ssl: 'Pendiente',
      expiresAt: '-',
    });
  }

  if (state.clientDomain.trim()) {
    rows.push({
      domain: state.clientDomain.trim(),
      ssl: 'Pendiente',
      expiresAt: '-',
    });
  }

  return rows;
}

export default function CustomDomainsSettings() {
  const { user } = useAuth();
  const storageKey = useMemo(() => buildStorageKey(user?.companyId), [user?.companyId]);
  const [form, setForm] = useState<CustomDomainsState>(() => loadStoredState(storageKey));

  const adminPreview = buildPreviewUrl('admin', form.adminDomain);
  const clientPreview = buildPreviewUrl('cliente', form.clientDomain || form.adminDomain);
  const domainRows = buildStatusRows(form);

  function updateField(field: keyof CustomDomainsState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleValidate(field: keyof CustomDomainsState) {
    const value = form[field].trim();

    if (!value) {
      toast.warning('Debes capturar un dominio antes de validar.');
      return;
    }

    toast.info(`Validacion DNS de ${value} lista para integrarse con backend.`);
  }

  function handleSave() {
    localStorage.setItem(storageKey, JSON.stringify(form));
    toast.success('Dominios personalizados guardados.');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Dominios personalizados</h1>

        <SettingsBreadcrumb currentLabel="Dominios personalizados" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.9fr)_480px]">
        <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#20262a] px-6 py-4">
            <h2 className="text-[18px] font-semibold text-white">Marca blanca por dominio</h2>

            <Button
              type="button"
              onClick={handleSave}
              className="h-[50px] rounded-[6px] bg-[#3a92dd] px-5 text-[16px] font-semibold text-white hover:bg-[#2e84cf]"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </div>

          <div className="space-y-8 px-6 py-8">
            <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[260px_minmax(0,1fr)]">
              <label className="pt-3 text-right text-[15px] text-[#374151]">Dominio Admin</label>
              <div>
                <div className="flex">
                  <input
                    type="text"
                    value={form.adminDomain}
                    onChange={(event) => updateField('adminDomain', event.target.value)}
                    className="h-[50px] w-full rounded-l-[4px] border border-r-0 border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#d0d6de]"
                    placeholder="admin.tumarca.com"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidate('adminDomain')}
                    className="h-[50px] min-w-[100px] rounded-r-[4px] border border-[#cfd8e3] bg-white px-4 text-[16px] text-[#1f2933] transition hover:bg-[#f8fafc]"
                  >
                    Validar
                  </button>
                </div>
                <p className="mt-2 text-[14px] leading-8 text-[#ff9b26]">
                  Si lo completas y dejas vacío el dominio cliente, el sistema asumirá que quieres usar un solo dominio para ambas rutas.
                </p>
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[260px_minmax(0,1fr)]">
              <label className="pt-3 text-right text-[15px] text-[#374151]">Dominio Cliente</label>
              <div>
                <div className="flex">
                  <input
                    type="text"
                    value={form.clientDomain}
                    onChange={(event) => updateField('clientDomain', event.target.value)}
                    className="h-[50px] w-full rounded-l-[4px] border border-r-0 border-[#d7dfe8] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#d0d6de]"
                    placeholder="clientes.tumarca.com"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidate('clientDomain')}
                    className="h-[50px] min-w-[100px] rounded-r-[4px] border border-[#cfd8e3] bg-white px-4 text-[16px] text-[#1f2933] transition hover:bg-[#f8fafc]"
                  >
                    Validar
                  </button>
                </div>
                <p className="mt-2 text-[14px] leading-8 text-[#ff9b26]">
                  Si lo dejas vacío, el portal cliente usará el dominio admin personalizado. Si ambos quedan vacíos, se seguirá usando el dominio principal del sistema.
                </p>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#59c1f1] bg-[#d6f2fb] px-6 py-5 text-center text-[#135778]">
              <h3 className="text-[18px] font-semibold">Instrucciones de configuración:</h3>
              <ol className="mt-2 space-y-1 text-[16px] leading-8">
                <li>1. Vaya a su proveedor de DNS.</li>
                <li>2. Cree un registro CNAME con el nombre deseado (ej: <span className="rounded bg-[#ffe6ef] px-1 text-[#ff0068]">panel</span>).</li>
                <li>3. Apúntelo a: <span className="rounded bg-[#ffe6ef] px-1 text-[#ff0068]">{SYSTEM_BASE_DOMAIN}</span>.</li>
              </ol>
            </div>

            <div className="rounded-[6px] border border-[#7a8592] bg-[#d8dde3] px-6 py-5 text-center text-[17px] text-[#2a3a4d]">
              Valide el CNAME antes de guardar para que el alta sea completamente automática.
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
            <div className="border-b border-[#d8e0ea] px-6 py-4">
              <h2 className="text-[18px] font-medium text-[#425466]">Vista previa</h2>
            </div>

            <div className="space-y-6 px-6 py-6 text-[16px] text-[#1f2933]">
              <div>
                <p className="mb-2 text-[18px] font-semibold">Admin actual:</p>
                <code className="rounded bg-[#ffe9ef] px-2 py-1 text-[14px] text-[#ff1c61]">{adminPreview}</code>
              </div>

              <div>
                <p className="mb-2 text-[18px] font-semibold">Cliente actual:</p>
                <code className="rounded bg-[#ffe9ef] px-2 py-1 text-[14px] text-[#ff1c61]">{clientPreview}</code>
              </div>

              <p className="leading-8 text-[#2f3d4d]">
                Cuando no personalizas nada, el sistema conserva su dominio principal. Si personalizas solo Admin, también se usará para Cliente.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
            <div className="border-b border-[#d8e0ea] px-6 py-4">
              <h2 className="text-[18px] font-medium text-[#425466]">Estado actual</h2>
            </div>

            <div className="px-6 py-6">
              <div className="overflow-hidden border border-[#d7dfe8]">
                <div className="grid grid-cols-[1.6fr_0.9fr_1fr] border-b border-[#d7dfe8] bg-white text-[16px] font-medium text-[#3a4452]">
                  <div className="border-r border-[#d7dfe8] px-4 py-3">Dominio</div>
                  <div className="border-r border-[#d7dfe8] px-4 py-3">SSL</div>
                  <div className="px-4 py-3">Expira</div>
                </div>

                {domainRows.length === 0 ? (
                  <div className="px-4 py-6 text-[18px] text-[#7b8794]">
                    Aún no hay dominios personalizados vinculados.
                  </div>
                ) : (
                  domainRows.map((row) => (
                    <div
                      key={row.domain}
                      className="grid grid-cols-[1.6fr_0.9fr_1fr] border-b border-[#d7dfe8] text-[15px] text-[#3a4452] last:border-b-0"
                    >
                      <div className="border-r border-[#d7dfe8] px-4 py-3">{row.domain}</div>
                      <div className="border-r border-[#d7dfe8] px-4 py-3">{row.ssl}</div>
                      <div className="px-4 py-3">{row.expiresAt}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2 flex items-center gap-2 text-[#8d949d]">
                <span className="text-[24px]">‹</span>
                <div className="h-[14px] flex-1 rounded-full bg-[#8c8c8c]" />
                <span className="text-[24px]">›</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
