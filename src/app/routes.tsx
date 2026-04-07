import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientAnnouncements = lazy(() => import('./pages/ClientAnnouncements'));
const ClientContracts = lazy(() => import('./pages/ClientContracts'));
const ClientEmails = lazy(() => import('./pages/ClientEmails'));
const ClientInstallations = lazy(() => import('./pages/ClientInstallations'));
const ClientPushNotifications = lazy(() => import('./pages/ClientPushNotifications'));
const ClientForm = lazy(() => import('./pages/ClientForm'));
const ClientsMap = lazy(() => import('./pages/ClientsMap'));
const PlanForm = lazy(() => import('./pages/PlanForm'));
const Billing = lazy(() => import('./pages/Billing'));
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketForm = lazy(() => import('./pages/TicketForm'));
const Settings = lazy(() => import('./pages/Settings'));
const Tasks = lazy(() => import('./pages/Tasks'));
const PortalClientSettings = lazy(() => import('./pages/PortalClientSettings'));
const TemplateEditor = lazy(() => import('./pages/TemplateEditor'));
const ConfigurationTemplates = lazy(() => import('./pages/ConfigurationTemplates'));
const InvoiceMessages = lazy(() => import('./pages/InvoiceMessages'));
const ImportClients = lazy(() => import('./pages/ImportClients'));
const LocationsManagement = lazy(() => import('./pages/LocationsManagement'));
const MigrateCompany = lazy(() => import('./pages/MigrateCompany'));
const GeneralSettings = lazy(() => import('./pages/GeneralSettings'));
const CustomDomainsSettings = lazy(() => import('./pages/CustomDomainsSettings'));
const MailServerSettings = lazy(() => import('./pages/MailServerSettings'));
const ServerManagement = lazy(() => import('./pages/ServerManagement'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const RolesManagement = lazy(() => import('./pages/RolesManagement'));
const CurrenciesManagement = lazy(() => import('./pages/CurrenciesManagement'));
const ReceiptsManagement = lazy(() => import('./pages/ReceiptsManagement'));
const UnitsManagement = lazy(() => import('./pages/UnitsManagement'));
const IncidentsManagement = lazy(() => import('./pages/IncidentsManagement'));
const CronJobsManagement = lazy(() => import('./pages/CronJobsManagement'));
const ZonesManagement = lazy(() => import('./pages/ZonesManagement'));
const CustomFieldsManagement = lazy(() => import('./pages/CustomFieldsManagement'));
const WspTemplatesManagement = lazy(() => import('./pages/WspTemplatesManagement'));

const Invoices = lazy(() => import('./pages/billing/Invoices'));
const ElectronicBilling = lazy(() => import('./pages/billing/ElectronicBilling'));
const BillingAfip = lazy(() => import('./pages/billing/BillingAfip'));
const BillingIssuers = lazy(() => import('./pages/billing/BillingIssuers'));
const PendingInvoices = lazy(() => import('./pages/billing/PendingInvoices'));
const RegisterPayment = lazy(() => import('./pages/billing/RegisterPayment'));
const RegisterBulkPayments = lazy(() => import('./pages/billing/RegisterBulkPayments'));
const Transactions = lazy(() => import('./pages/billing/Transactions'));
const CompletedPayments = lazy(() => import('./pages/billing/CompletedPayments'));
const BillingStats = lazy(() => import('./pages/billing/BillingStats'));
const OtherIncomeExpenses = lazy(() => import('./pages/billing/OtherIncomeExpenses'));
const PortalPaymentReports = lazy(() => import('./pages/billing/PortalPaymentReports'));

const TodayTickets = lazy(() => import('./pages/tickets/TodayTickets'));
const OverdueTickets = lazy(() => import('./pages/tickets/OverdueTickets'));
const CompletedTickets = lazy(() => import('./pages/tickets/CompletedTickets'));

const BookAppointment = lazy(() => import('./pages/calendar/BookAppointment'));
const FichasHotspot = lazy(() => import('./pages/hotspot/FichasHotspot'));
const HotspotRouters = lazy(() => import('./pages/hotspot/HotspotRouters'));
const HotspotTemplates = lazy(() => import('./pages/hotspot/HotspotTemplates'));
const NetworkAdminOlt = lazy(() => import('./pages/network/NetworkAdminOlt'));
const NetworkBlacklist = lazy(() => import('./pages/network/NetworkBlacklist'));
const NetworkCoreBnOlt = lazy(() => import('./pages/network/NetworkCoreBnOlt'));
const NetworkIpv4 = lazy(() => import('./pages/network/NetworkIpv4'));
const NetworkMonitoring = lazy(() => import('./pages/network/NetworkMonitoring'));
const NetworkNapBoxes = lazy(() => import('./pages/network/NetworkNapBoxes'));
const NetworkRouterEdit = lazy(() => import('./pages/network/NetworkRouterEdit'));
const NetworkRouters = lazy(() => import('./pages/network/NetworkRouters'));
const NetworkSmartOlt = lazy(() => import('./pages/network/NetworkSmartOlt'));
const NetworkTraffic = lazy(() => import('./pages/network/NetworkTraffic'));
const NetworkTrapemn = lazy(() => import('./pages/network/NetworkTrapemn'));
const NetworkVisitedIps = lazy(() => import('./pages/network/NetworkVisitedIps'));
const MessagingChatWhatsapp = lazy(() => import('./pages/messaging/MessagingChatWhatsapp'));
const MessagingTelegram = lazy(() => import('./pages/messaging/MessagingTelegram'));
const MessagingSent = lazy(() => import('./pages/messaging/MessagingSent'));
const MessagingReceived = lazy(() => import('./pages/messaging/MessagingReceived'));
const WarehouseProductTypes = lazy(() => import('./pages/warehouse/WarehouseProductTypes'));
const WarehouseSuppliers = lazy(() => import('./pages/warehouse/WarehouseSuppliers'));
const WarehouseProducts = lazy(() => import('./pages/warehouse/WarehouseProducts'));
const ServicesInternet = lazy(() => import('./pages/services/ServicesInternet'));
const ServicesVoice = lazy(() => import('./pages/services/ServicesVoice'));
const ServicesCustom = lazy(() => import('./pages/services/ServicesCustom'));

function RouteLoader() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#d9e7f3] text-sm font-medium text-[#47617c]">
      Cargando vista...
    </div>
  );
}

function withSuspense(
  PageComponent: ComponentType,
  fallback?: ReactNode,
) {
  return (
    <Suspense fallback={fallback ?? <RouteLoader />}>
      <PageComponent />
    </Suspense>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = localStorage.getItem('brandup_user');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(Login, <RouteLoader />),
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
  },
  {
    element: (
      <ProtectedRoute>
        {withSuspense(MainLayout)}
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: withSuspense(Dashboard) },
      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'clients', element: withSuspense(Clients) },
      { path: 'clients/anuncios', element: withSuspense(ClientAnnouncements) },
      { path: 'clients/contratos', element: withSuspense(ClientContracts) },
      { path: 'clients/correos', element: withSuspense(ClientEmails) },
      { path: 'clients/instalaciones', element: withSuspense(ClientInstallations) },
      { path: 'clients/notificaciones-push', element: withSuspense(ClientPushNotifications) },
      { path: 'clients/new', element: withSuspense(ClientForm) },
      { path: 'users', element: <Navigate to="/clients" replace /> },
      { path: 'users/new', element: <Navigate to="/clients/new" replace /> },
      { path: 'clients/:id/edit', element: withSuspense(ClientForm) },
      { path: 'clients/map', element: withSuspense(ClientsMap) },
      { path: 'plans', element: <Navigate to="/plans/internet" replace /> },
      { path: 'plans/internet', element: withSuspense(ServicesInternet) },
      { path: 'plans/voz', element: withSuspense(ServicesVoice) },
      { path: 'plans/personalizado', element: withSuspense(ServicesCustom) },
      { path: 'plans/new', element: withSuspense(PlanForm) },
      { path: 'plans/:id/edit', element: withSuspense(PlanForm) },
      { path: 'billing', element: withSuspense(Billing) },
      { path: 'billing/invoices', element: withSuspense(Invoices) },
      { path: 'billing/facturas', element: <Navigate to="/billing/invoices" replace /> },
      { path: 'billing/electronic-billing', element: withSuspense(ElectronicBilling) },
      { path: 'billing/afip', element: withSuspense(BillingAfip) },
      { path: 'billing/facturasafip', element: <Navigate to="/billing/afip" replace /> },
      { path: 'billing/issuers', element: withSuspense(BillingIssuers) },
      { path: 'billing/emisores', element: <Navigate to="/billing/issuers" replace /> },
      { path: 'billing/apiget', element: <Navigate to="/billing/electronic-billing" replace /> },
      { path: 'billing/dte', element: <Navigate to="/billing/electronic-billing" replace /> },
      { path: 'billing/add-payment', element: <Navigate to="/billing/register-payment" replace /> },
      { path: 'billing/addpago', element: <Navigate to="/billing/register-payment" replace /> },
      { path: 'billing/bulk-payments', element: <Navigate to="/billing/register-bulk-payments" replace /> },
      { path: 'billing/addpagomasivo', element: <Navigate to="/billing/register-bulk-payments" replace /> },
      { path: 'billing/electronic-billing/issuers', element: <Navigate to="/billing/issuers" replace /> },
      { path: 'billing/electronic-billing/afip', element: <Navigate to="/billing/afip" replace /> },
      { path: 'billing/electronic-billing/sii', element: <Navigate to="/billing/electronic-billing" replace /> },
      { path: 'billing/pending-invoices', element: withSuspense(PendingInvoices) },
      { path: 'billing/register-payment', element: withSuspense(RegisterPayment) },
      { path: 'billing/register-bulk-payments', element: withSuspense(RegisterBulkPayments) },
      { path: 'billing/transactions', element: withSuspense(Transactions) },
      { path: 'billing/completed-payments', element: withSuspense(CompletedPayments) },
      { path: 'billing/stats', element: withSuspense(BillingStats) },
      { path: 'billing/other-income-expenses', element: withSuspense(OtherIncomeExpenses) },
      { path: 'billing/portal-payment-reports', element: withSuspense(PortalPaymentReports) },
      { path: 'tickets', element: withSuspense(Tickets) },
      { path: 'tickets/new', element: withSuspense(TicketForm) },
      { path: 'tickets/:id/edit', element: withSuspense(TicketForm) },
      { path: 'tickets/today', element: withSuspense(TodayTickets) },
      { path: 'tickets/in-progress', element: withSuspense(OverdueTickets) },
      { path: 'tickets/overdue', element: <Navigate to="/tickets/in-progress" replace /> },
      { path: 'tickets/completed', element: withSuspense(CompletedTickets) },
      { path: 'monitoring', element: <Navigate to="/network-management/routers" replace /> },
      { path: 'network-management', element: <Navigate to="/network-management/routers" replace /> },
      { path: 'network-management/routers', element: withSuspense(NetworkRouters) },
      { path: 'network-management/routers/:id/edit', element: withSuspense(NetworkRouterEdit) },
      { path: 'network-management/router', element: <Navigate to="/network-management/routers" replace /> },
      { path: 'network-management/smart-olt', element: withSuspense(NetworkSmartOlt) },
      { path: 'network-management/smartolt', element: <Navigate to="/network-management/smart-olt" replace /> },
      { path: 'network-management/admin-olt', element: withSuspense(NetworkAdminOlt) },
      { path: 'network-management/adminolt', element: <Navigate to="/network-management/admin-olt" replace /> },
      { path: 'network-management/corebn-olt', element: withSuspense(NetworkCoreBnOlt) },
      { path: 'network-management/corebn_olt', element: <Navigate to="/network-management/corebn-olt" replace /> },
      { path: 'network-management/redes-ipv4', element: withSuspense(NetworkIpv4) },
      { path: 'network-management/redipv4', element: <Navigate to="/network-management/redes-ipv4" replace /> },
      { path: 'network-management/monitoreo', element: withSuspense(NetworkMonitoring) },
      { path: 'network-management/emisores', element: <Navigate to="/network-management/monitoreo" replace /> },
      { path: 'network-management/cajas-nap', element: withSuspense(NetworkNapBoxes) },
      { path: 'network-management/nap', element: <Navigate to="/network-management/cajas-nap" replace /> },
      { path: 'network-management/trafico', element: withSuspense(NetworkTraffic) },
      { path: 'network-management/ips-visitadas', element: withSuspense(NetworkVisitedIps) },
      { path: 'network-management/ipvisitadas', element: <Navigate to="/network-management/ips-visitadas" replace /> },
      { path: 'network-management/monitor-blacklist', element: withSuspense(NetworkBlacklist) },
      { path: 'network-management/blacklist', element: <Navigate to="/network-management/monitor-blacklist" replace /> },
      { path: 'network-management/trapemn', element: withSuspense(NetworkTrapemn) },
      { path: 'hotspot', element: <Navigate to="/hotspot/fichas" replace /> },
      { path: 'hotspot/router', element: <Navigate to="/hotspot/routers" replace /> },
      { path: 'hotspot/templates', element: <Navigate to="/hotspot/plantillas" replace /> },
      { path: 'hotspot/fichas', element: withSuspense(FichasHotspot) },
      { path: 'hotspot/routers', element: withSuspense(HotspotRouters) },
      { path: 'hotspot/plantillas', element: withSuspense(HotspotTemplates) },
      { path: 'tasks', element: withSuspense(Tasks) },
      { path: 'warehouse', element: <Navigate to="/warehouse/tipos-productos" replace /> },
      { path: 'warehouse/almacen', element: <Navigate to="/warehouse/productos" replace /> },
      { path: 'warehouse/categorias', element: <Navigate to="/warehouse/tipos-productos" replace /> },
      { path: 'warehouse/proveedores-lista', element: <Navigate to="/warehouse/proveedores" replace /> },
      { path: 'warehouse/tipos-productos', element: withSuspense(WarehouseProductTypes) },
      { path: 'warehouse/proveedores', element: withSuspense(WarehouseSuppliers) },
      { path: 'warehouse/productos', element: withSuspense(WarehouseProducts) },
      { path: 'messaging', element: <Navigate to="/messaging/telegram" replace /> },
      { path: 'messaging/telegram', element: withSuspense(MessagingTelegram) },
      { path: 'messaging/w2', element: <Navigate to="/messaging/chat-whatsapp" replace /> },
      { path: 'messaging/sms/enviados', element: <Navigate to="/messaging/mensajes-enviados" replace /> },
      { path: 'messaging/sms/recibidos', element: <Navigate to="/messaging/mensajes-recibidos" replace /> },
      { path: 'messaging/chat-whatsapp', element: withSuspense(MessagingChatWhatsapp) },
      { path: 'messaging/mensajes-enviados', element: withSuspense(MessagingSent) },
      { path: 'messaging/mensajes-recibidos', element: withSuspense(MessagingReceived) },
      { path: 'settings', element: withSuspense(Settings) },
      { path: 'settings/general', element: withSuspense(GeneralSettings) },
      { path: 'settings/configuration-templates', element: withSuspense(ConfigurationTemplates) },
      { path: 'settings/invoice-messages', element: withSuspense(InvoiceMessages) },
      { path: 'settings/import-clients', element: withSuspense(ImportClients) },
      { path: 'settings/locations', element: withSuspense(LocationsManagement) },
      { path: 'settings/migrate', element: withSuspense(MigrateCompany) },
      { path: 'settings/client-portal', element: withSuspense(PortalClientSettings) },
      { path: 'settings/template-editor', element: withSuspense(TemplateEditor) },
      { path: 'settings/custom-domains', element: withSuspense(CustomDomainsSettings) },
      { path: 'settings/mail-server', element: withSuspense(MailServerSettings) },
      { path: 'settings/staff-management', element: withSuspense(StaffManagement) },
      { path: 'settings/users', element: withSuspense(UsersManagement) },
      { path: 'settings/roles', element: withSuspense(RolesManagement) },
      { path: 'settings/currencies', element: withSuspense(CurrenciesManagement) },
      { path: 'settings/receipts', element: withSuspense(ReceiptsManagement) },
      { path: 'settings/units', element: withSuspense(UnitsManagement) },
      { path: 'settings/incidents', element: withSuspense(IncidentsManagement) },
      { path: 'settings/cron-jobs', element: withSuspense(CronJobsManagement) },
      { path: 'settings/zones', element: withSuspense(ZonesManagement) },
      { path: 'settings/custom-fields', element: withSuspense(CustomFieldsManagement) },
      { path: 'settings/wsp-templates', element: withSuspense(WspTemplatesManagement) },
      { path: 'settings/server', element: withSuspense(ServerManagement) },
      { path: 'payment-methods', element: withSuspense(PaymentMethods) },
    ],
  },
  {
    path: '/book-appointment/:companyId',
    element: withSuspense(BookAppointment),
  },
]);
