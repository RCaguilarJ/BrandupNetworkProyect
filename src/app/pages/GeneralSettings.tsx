import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  type GeneralSettingsData,
  type GeneralSettingsField,
  type GeneralSettingsLogoAsset,
} from '../types';
import logoPreview from '../../assets/1fe9c15b53c884f010789ae03712f9a257bcab54.png';
import { CircleHelp, FileImage, Save, Upload } from 'lucide-react';

/**
 * Devuelve la forma estable del módulo General.
 * La pantalla ya queda lista para consumir backend sin reestructurar JSX.
 */
function getGeneralSettingsMockData(): GeneralSettingsData {
  return {
    pageTitle: 'Ajustes generales',
    pageDescription: 'Módulo base de configuración general alineado con la referencia visual.',
    breadcrumb: ['Inicio', 'Ajustes', 'General'],
    companyPanel: {
      title: 'Datos de la empresa',
      fields: [
        { key: 'company_name', label: 'Empresa', value: 'TV SAT KABEL S.R.L.', type: 'text' },
        { key: 'company_address', label: 'Dirección', value: 'NUEVO CHIMBOTE', type: 'text' },
        { key: 'company_phone', label: 'Teléfonos', value: '952202858', type: 'text' },
        { key: 'company_identifier', label: 'Identificación', value: '253748753', type: 'text' },
      ],
      helperText: 'RUC,CUT,NIT,SAT,RUT,RTN',
      primaryActionLabel: 'Guardar cambios',
      primaryActionKey: 'save_company_settings',
    },
    basicConfigPanel: {
      title: 'Configuración básica',
      fields: [
        {
          key: 'timezone',
          label: 'Zona Horaria',
          value: 'America/Mexico_City',
          type: 'select',
          options: [
            { value: 'America/Mexico_City', label: 'America/Mexico_City' },
            { value: 'America/Bogota', label: 'America/Bogota' },
            { value: 'America/Lima', label: 'America/Lima' },
            { value: 'America/Santiago', label: 'America/Santiago' },
          ],
        },
        { key: 'backup_email', label: 'Email backup', value: 'santelfibraoptica@gmail.com', type: 'text' },
        { key: 'support_email', label: 'Email Soporte', value: 'santelfibraoptica@gmail.com', type: 'text' },
        {
          key: 'billing_email',
          label: 'Email Facturación',
          value: 'santelfibraoptica@gmail.com',
          type: 'text',
          description: '* Email remitente',
        },
      ],
      validationToggle: {
        key: 'validate_identity',
        label: 'Validar Cédula/DNI/Rut/Cuit',
        enabled: true,
        description: 'Activa una validación global de documentos fiscales/identidad.',
      },
      validationHelpText: 'Valida automáticamente identificaciones fiscales según el país configurado.',
      primaryActionLabel: 'Guardar cambios',
      primaryActionKey: 'save_basic_settings',
    },
    notificationsPanel: {
      title: 'Notificaciones del sistema',
      fields: [
        {
          key: 'router_down_email',
          label: 'Correo Emisor/Router Caído',
          value: '',
          type: 'text',
          description: 'Puede indicar varios correos',
        },
        {
          key: 'router_down_mobile',
          label: 'N° móvil Emisor/Router Caído',
          value: '',
          type: 'text',
          description: 'Puede indicar varios números',
        },
        {
          key: 'payment_report_email',
          label: 'Correo reporte pago',
          value: '',
          type: 'text',
          description: 'Puede indicar varios correos',
        },
      ],
      primaryActionLabel: 'Guardar cambios',
      primaryActionKey: 'save_notification_settings',
    },
    logosPanel: {
      title: 'Logo (.png)',
      assets: [
        {
          key: 'main_logo',
          label: 'Logo principal',
          imageUrl: logoPreview,
          uploadActionLabel: 'Subir Logo principal',
          maxSizeText: '*Máximo : 20M',
        },
        {
          key: 'invoice_logo',
          label: 'Logo Facturas & Recibo',
          imageUrl: logoPreview,
          uploadActionLabel: 'Subir Logo Facturas & Recibo',
          maxSizeText: '*Máximo : 20M',
          recommendationText: '* Se recomienda que el logo no debe pesar mas de 50kb y un ancho no mayor de 400px',
        },
      ],
    },
    loginImagePanel: {
      title: 'Imagen Login administrador',
      selectorLabel: 'seleccionar imagen',
      selectedImage: 'login-bg-17.jpg',
      availableImages: [
        { value: 'login-bg-17.jpg', label: 'login-bg-17.jpg' },
        { value: 'login-bg-18.jpg', label: 'login-bg-18.jpg' },
        { value: 'login-bg-19.jpg', label: 'login-bg-19.jpg' },
      ],
      uploadPathHelpText: 'Para subir nuevas imágenes debe subirlos al servidor ruta :/var/www/html/admin/images/login-bg',
      primaryActionLabel: 'Guardar cambios',
      primaryActionKey: 'save_login_image_settings',
    },
  };
}

/**
 * Renderiza un campo readonly con la misma semántica visual que luego usará backend.
 */
function renderField(field: GeneralSettingsField) {
  const baseClassName =
    'h-9 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none disabled:opacity-100';

  if (field.type === 'select') {
    return (
      <select value={field.value} disabled className={baseClassName}>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return <input value={field.value} disabled type={field.type} className={baseClassName} />;
}

/**
 * Mantiene un contenedor consistente para todos los bloques del módulo General.
 */
function GeneralPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-sm border-0 shadow-none ring-1 ring-black/5">
      <CardHeader className="bg-slate-800 px-4 py-3">
        <CardTitle className="text-sm font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-0">{children}</CardContent>
    </Card>
  );
}

/**
 * Reutiliza la acción principal con el estilo visual de la referencia.
 */
function SaveAction({ label }: { label: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-10 rounded-full border-blue-500 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
    >
      <Save className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

function LogoAssetCard({ asset }: { asset: GeneralSettingsLogoAsset }) {
  return (
    <div className="flex flex-col items-center justify-center py-7 text-center">
      <img src={asset.imageUrl} alt={asset.label} className="mb-4 max-h-20 object-contain" />
      <Button variant="outline" size="sm" className="h-9 gap-2">
        <Upload className="h-4 w-4" />
        {asset.uploadActionLabel}
      </Button>
      <p className="mt-3 text-xs text-red-500">{asset.maxSizeText}</p>
      {asset.recommendationText && <p className="mt-4 text-xs text-orange-500">{asset.recommendationText}</p>}
    </div>
  );
}

export default function GeneralSettings() {
  const data = getGeneralSettingsMockData();
  const identificationField = data.companyPanel.fields.find((field) => field.key === 'company_identifier');

  return (
    <div className="min-h-full bg-[#d3dce7] px-4 pb-6 pt-4 lg:px-6">
      <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[2.15rem] font-normal text-slate-900">{data.pageTitle}</h1>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          {data.breadcrumb.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              <span className={index === data.breadcrumb.length - 1 ? 'text-blue-600' : ''}>{item}</span>
              {index < data.breadcrumb.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GeneralPanel title={data.companyPanel.title}>
          <div className="px-5 py-4">
            <div className="space-y-3">
              {data.companyPanel.fields.map((field) => (
                <div key={field.key} className="grid items-start gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                  <label className="pt-2 text-right text-[14px] text-slate-800">{field.label}</label>
                  <div>
                    {renderField(field)}
                    {field.key === 'company_identifier' && data.companyPanel.helperText ? (
                      <p className="mt-1 text-xs text-slate-700">{data.companyPanel.helperText}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-200 px-5 py-3">
            <SaveAction label={data.companyPanel.primaryActionLabel} />
          </div>
        </GeneralPanel>

        <GeneralPanel title={data.basicConfigPanel.title}>
          <div className="px-5 py-4">
            <div className="space-y-3">
              {data.basicConfigPanel.fields.map((field) => (
                <div key={field.key} className="grid items-start gap-3 md:grid-cols-[260px_minmax(0,1fr)]">
                  <label className="pt-2 text-right text-[14px] text-slate-800">{field.label}</label>
                  <div>
                    {renderField(field)}
                    {field.description && <p className="mt-1 text-xs text-slate-700">{field.description}</p>}
                  </div>
                </div>
              ))}

              <div className="grid items-center gap-3 pt-4 md:grid-cols-[260px_minmax(0,1fr)]">
                <div className="flex items-center justify-end gap-1 text-[14px] text-slate-800">
                  <span>{data.basicConfigPanel.validationToggle.label}</span>
                  <CircleHelp className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`relative inline-flex h-7 w-11 items-center rounded-full ${
                      data.basicConfigPanel.validationToggle.enabled ? 'bg-cyan-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                        data.basicConfigPanel.validationToggle.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-200 px-5 py-3">
            <SaveAction label={data.basicConfigPanel.primaryActionLabel} />
          </div>
        </GeneralPanel>

        <GeneralPanel title={data.notificationsPanel.title}>
          <div className="px-5 py-4">
            <div className="space-y-3">
              {data.notificationsPanel.fields.map((field) => (
                <div key={field.key} className="grid items-start gap-3 md:grid-cols-[260px_minmax(0,1fr)]">
                  <label className="pt-2 text-right text-[14px] text-slate-800">{field.label}</label>
                  <div>
                    {renderField(field)}
                    {field.description && <p className="mt-1 text-xs text-slate-700">{field.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-200 px-5 py-3">
            <SaveAction label={data.notificationsPanel.primaryActionLabel} />
          </div>
        </GeneralPanel>

        <GeneralPanel title={data.logosPanel.title}>
          <div className="divide-y divide-slate-100 px-5">
            {data.logosPanel.assets.map((asset) => (
              <LogoAssetCard key={asset.key} asset={asset} />
            ))}
          </div>
        </GeneralPanel>

        <GeneralPanel title={data.loginImagePanel.title}>
          <div className="px-5 py-4">
            <div className="grid items-center gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
              <label className="text-right text-[14px] text-slate-800">{data.loginImagePanel.selectorLabel}</label>
              <select value={data.loginImagePanel.selectedImage} disabled className="h-9 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:opacity-100">
                {data.loginImagePanel.availableImages.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-4 text-xs text-cyan-600">{data.loginImagePanel.uploadPathHelpText}</p>

            <div className="mt-3 flex min-h-[390px] items-center justify-center rounded-sm bg-[#e5e5e5]">
              {data.loginImagePanel.previewImageUrl ? (
                <img src={data.loginImagePanel.previewImageUrl} alt="Preview login" className="max-h-[360px] object-contain" />
              ) : (
                <FileImage className="h-12 w-12 text-slate-400" />
              )}
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-200 px-5 py-3">
            <SaveAction label={data.loginImagePanel.primaryActionLabel} />
          </div>
        </GeneralPanel>
      </div>

      <div className="mt-4">
        <Link
          to="/settings"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Volver a Ajustes
        </Link>
      </div>
    </div>
  );
}
