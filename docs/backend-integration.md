# Integracion Backend


## Estado actual

- La aplicacion compila con `npm run build`.
- No existe `tsconfig.json` ni script de `lint` o `typecheck`.
- Varias vistas de `Ajustes` operan sin backend y guardan estado local temporal.
- Los dashboards de `WispHub` y `MikroSystem` dependen del tema visual activo.

## Autenticacion y contexto

Origen actual:
- [AuthContext.tsx](C:/wamp64/www/BrandupNetwork/src/app/context/AuthContext.tsx)

Requisito backend:
- Exponer un endpoint o bootstrap payload con usuario autenticado.
- Incluir al menos:
  - `id`
  - `name`
  - `email`
  - `role`
  - `companyId`

Notas:
- `Dashboard.tsx` decide si usa dashboard tematico segun el rol.
- Si backend maneja permisos finos o feature flags, ese gate debe salir del
  frontend y venir desde la sesion.

## Tema visual WISPHUB / MIKROSYSTEM

Origen actual:
- [ViewThemeContext.tsx](C:/wamp64/www/BrandupNetwork/src/app/context/ViewThemeContext.tsx)
- [ViewThemeSelector.tsx](C:/wamp64/www/BrandupNetwork/src/app/components/ViewThemeSelector.tsx)
- [view-theme.ts](C:/wamp64/www/BrandupNetwork/src/app/lib/view-theme.ts)

Requisito backend:
- Opcionalmente persistir el tema visual por usuario o empresa.
- Si se desea persistencia real, el backend debe devolver y aceptar:
  - `viewTheme: "mikrosystem" | "wisphub"`

## Ajustes: pantallas que hoy usan persistencia local

Hook comun:
- [usePersistentState.ts](C:/wamp64/www/BrandupNetwork/src/app/hooks/usePersistentState.ts)

Pantallas actuales:
- [ImportClients.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/ImportClients.tsx)
- [MigrateCompany.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/MigrateCompany.tsx)
- [CronJobsManagement.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/CronJobsManagement.tsx)
- [MailServerSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/MailServerSettings.tsx)
- [CustomDomainsSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/CustomDomainsSettings.tsx)
- [PortalClientSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/PortalClientSettings.tsx)
- [ConfigurationTemplates.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/ConfigurationTemplates.tsx)

Interpretacion:
- `localStorage` es solo placeholder de experiencia.
- Cada formulario ya tiene un `shape` de estado listo para convertirse en DTO.
- El reemplazo backend ideal es:
  1. `GET` para hydrate inicial
  2. `PUT/PATCH` para persistencia
  3. `POST` para acciones puntuales

## Contratos sugeridos por modulo

### General

Pantalla:
- [GeneralSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/GeneralSettings.tsx)

Requiere:
- configuracion de empresa
- logos
- imagenes de login
- zona horaria
- flags de notificaciones

Acciones sugeridas:
- `GET /api/settings/general`
- `PUT /api/settings/general`
- `POST /api/settings/general/assets`

### Servidor de correo

Pantalla:
- [MailServerSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/MailServerSettings.tsx)

Requiere:
- datos SMTP/OAuth por empresa
- prueba de conexion
- solicitud de token OAuth

Acciones sugeridas:
- `GET /api/settings/mail-server`
- `PUT /api/settings/mail-server`
- `POST /api/settings/mail-server/test`
- `POST /api/settings/mail-server/oauth-token`

### Dominios personalizados

Pantalla:
- [CustomDomainsSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/CustomDomainsSettings.tsx)

Requiere:
- dominio admin
- dominio cliente
- estado SSL
- validacion DNS

Acciones sugeridas:
- `GET /api/settings/custom-domains`
- `PUT /api/settings/custom-domains`
- `POST /api/settings/custom-domains/validate`

### Portal cliente

Pantalla:
- [PortalClientSettings.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/PortalClientSettings.tsx)

Requiere:
- configuracion general del portal
- configuracion del formulario de reporte de pago
- banners
- configuracion visual del login y portal

Acciones sugeridas:
- `GET /api/settings/client-portal`
- `PUT /api/settings/client-portal/general`
- `PUT /api/settings/client-portal/payment-report`
- `PUT /api/settings/client-portal/design`
- `POST /api/settings/client-portal/banners`
- `DELETE /api/settings/client-portal/banners/:bannerId`

### Plantillas de configuracion

Pantalla:
- [ConfigurationTemplates.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/ConfigurationTemplates.tsx)

Requiere:
- catalogo de plantillas operativas
- alta/edicion de plantilla
- reglas de facturacion y notificaciones

Acciones sugeridas:
- `GET /api/settings/configuration-templates`
- `POST /api/settings/configuration-templates`
- `PUT /api/settings/configuration-templates/:templateId`

### Mensajes en factura

Pantalla:
- [InvoiceMessages.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/InvoiceMessages.tsx)

Requiere:
- listado paginado
- filtros
- CRUD

Acciones sugeridas:
- `GET /api/settings/invoice-messages`
- `POST /api/settings/invoice-messages`
- `PUT /api/settings/invoice-messages/:messageId`
- `DELETE /api/settings/invoice-messages/:messageId`

### Ubicaciones

Pantalla:
- [LocationsManagement.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/LocationsManagement.tsx)

Requiere:
- listado paginado
- totales por ubicacion
- CRUD

Acciones sugeridas:
- `GET /api/settings/locations`
- `POST /api/settings/locations`
- `PUT /api/settings/locations/:locationId`
- `DELETE /api/settings/locations/:locationId`

### Importar clientes

Pantalla:
- [ImportClients.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/ImportClients.tsx)

Requiere:
- descarga de plantilla
- carga de archivo CSV/XLSX
- importacion asincrona
- reporte de validaciones por fila

Acciones sugeridas:
- `GET /api/settings/import-clients/template`
- `POST /api/settings/import-clients/upload`
- `POST /api/settings/import-clients/run`
- `GET /api/settings/import-clients/jobs/:jobId`

### Migrar empresa

Pantalla:
- [MigrateCompany.tsx](C:/wamp64/www/BrandupNetwork/src/app/pages/MigrateCompany.tsx)

Requiere:
- carga de SQL/ZIP
- analisis temporal del backup
- resumen por modulo
- importacion controlada al tenant destino

Acciones sugeridas:
- `POST /api/settings/migrate/analyze`
- `POST /api/settings/migrate/run`
- `DELETE /api/settings/migrate/session`

## Breadcrumb y navegacion

Componente:
- [SettingsBreadcrumb.tsx](C:/wamp64/www/BrandupNetwork/src/app/components/SettingsBreadcrumb.tsx)

Convencion:
- `Inicio` siempre debe volver a `/dashboard`
- `Ajustes` siempre debe volver a `/settings`

Si backend quiere renderizado server-side o menus dinamicos:
- respetar esta semantica para no romper navegacion de retorno en ajustes.

## Prioridades recomendadas para backend

1. Autenticacion real y sesion con `companyId`.
2. Endpoints de `General`, `Servidor de correo`, `Portal cliente`.
3. CRUD de `Mensajes en factura` y `Ubicaciones`.
4. Jobs asincronos de `Importar clientes` y `Migrar empresa`.
5. Persistencia de preferencia visual `mikrosystem/wisphub`.

## Observaciones tecnicas

- El frontend aun necesita un script formal de `typecheck` y `lint`.
- La base actual compila, pero varias vistas antiguas conservan texto con
  encoding roto; se fueron limpiando las zonas refactorizadas.
- Si el backend define contratos finales distintos a los propuestos aqui, el
  frontend deberia centralizar DTOs y adapters en una carpeta `services/`.
