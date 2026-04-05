import { createBrowserRouter, Navigate } from 'react-router';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientAnnouncements from './pages/ClientAnnouncements';
import ClientContracts from './pages/ClientContracts';
import ClientEmails from './pages/ClientEmails';
import ClientInstallations from './pages/ClientInstallations';
import ClientPushNotifications from './pages/ClientPushNotifications';
import ClientForm from './pages/ClientForm';
import ClientsMap from './pages/ClientsMap';
import PlanForm from './pages/PlanForm';
import Billing from './pages/Billing';
import Tickets from './pages/Tickets';
import TicketForm from './pages/TicketForm';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import GeneralSettings from './pages/GeneralSettings';
import ServerManagement from './pages/ServerManagement';
import PaymentMethods from './pages/PaymentMethods';
import UsersManagement from './pages/UsersManagement';
import RolesManagement from './pages/RolesManagement';
import CurrenciesManagement from './pages/CurrenciesManagement';
import ReceiptsManagement from './pages/ReceiptsManagement';
import UnitsManagement from './pages/UnitsManagement';
import IncidentsManagement from './pages/IncidentsManagement';
import CronJobsManagement from './pages/CronJobsManagement';
import ZonesManagement from './pages/ZonesManagement';
import CustomFieldsManagement from './pages/CustomFieldsManagement';
import WspTemplatesManagement from './pages/WspTemplatesManagement';

// Billing subpages
import Invoices from './pages/billing/Invoices';
import ElectronicBilling from './pages/billing/ElectronicBilling';
import PendingInvoices from './pages/billing/PendingInvoices';
import RegisterPayment from './pages/billing/RegisterPayment';
import RegisterBulkPayments from './pages/billing/RegisterBulkPayments';
import Transactions from './pages/billing/Transactions';
import CompletedPayments from './pages/billing/CompletedPayments';
import BillingStats from './pages/billing/BillingStats';
import OtherIncomeExpenses from './pages/billing/OtherIncomeExpenses';

// Tickets subpages
import TodayTickets from './pages/tickets/TodayTickets';
import OverdueTickets from './pages/tickets/OverdueTickets';
import CompletedTickets from './pages/tickets/CompletedTickets';

import BookAppointment from './pages/calendar/BookAppointment';
import FichasHotspot from './pages/hotspot/FichasHotspot';
import HotspotRouters from './pages/hotspot/HotspotRouters';
import HotspotTemplates from './pages/hotspot/HotspotTemplates';
import NetworkAdminOlt from './pages/network/NetworkAdminOlt';
import NetworkBlacklist from './pages/network/NetworkBlacklist';
import NetworkIpv4 from './pages/network/NetworkIpv4';
import NetworkMonitoring from './pages/network/NetworkMonitoring';
import NetworkNapBoxes from './pages/network/NetworkNapBoxes';
import NetworkRouters from './pages/network/NetworkRouters';
import NetworkSmartOlt from './pages/network/NetworkSmartOlt';
import NetworkTraffic from './pages/network/NetworkTraffic';
import NetworkTrapemn from './pages/network/NetworkTrapemn';
import NetworkVisitedIps from './pages/network/NetworkVisitedIps';
import MessagingChatWhatsapp from './pages/messaging/MessagingChatWhatsapp';
import MessagingSent from './pages/messaging/MessagingSent';
import MessagingReceived from './pages/messaging/MessagingReceived';
import WarehouseProductTypes from './pages/warehouse/WarehouseProductTypes';
import WarehouseSuppliers from './pages/warehouse/WarehouseSuppliers';
import WarehouseProducts from './pages/warehouse/WarehouseProducts';
import ServicesInternet from './pages/services/ServicesInternet';
import ServicesVoice from './pages/services/ServicesVoice';
import ServicesCustom from './pages/services/ServicesCustom';

// HOC para proteger rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('brandup_user');
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'clients', element: <Clients /> },
      { path: 'clients/anuncios', element: <ClientAnnouncements /> },
      { path: 'clients/contratos', element: <ClientContracts /> },
      { path: 'clients/correos', element: <ClientEmails /> },
      { path: 'clients/instalaciones', element: <ClientInstallations /> },
      { path: 'clients/notificaciones-push', element: <ClientPushNotifications /> },
      { path: 'clients/new', element: <ClientForm /> },
      { path: 'clients/:id/edit', element: <ClientForm /> },
      { path: 'clients/map', element: <ClientsMap /> },
      { path: 'plans', element: <Navigate to="/plans/internet" replace /> },
      { path: 'plans/internet', element: <ServicesInternet /> },
      { path: 'plans/voz', element: <ServicesVoice /> },
      { path: 'plans/personalizado', element: <ServicesCustom /> },
      { path: 'plans/new', element: <PlanForm /> },
      { path: 'plans/:id/edit', element: <PlanForm /> },
      { path: 'billing', element: <Billing /> },
      { path: 'billing/invoices', element: <Invoices /> },
      { path: 'billing/electronic-billing', element: <ElectronicBilling /> },
      { path: 'billing/pending-invoices', element: <PendingInvoices /> },
      { path: 'billing/register-payment', element: <RegisterPayment /> },
      { path: 'billing/register-bulk-payments', element: <RegisterBulkPayments /> },
      { path: 'billing/transactions', element: <Transactions /> },
      { path: 'billing/completed-payments', element: <CompletedPayments /> },
      { path: 'billing/stats', element: <BillingStats /> },
      { path: 'billing/other-income-expenses', element: <OtherIncomeExpenses /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'tickets/new', element: <TicketForm /> },
      { path: 'tickets/:id/edit', element: <TicketForm /> },
      { path: 'tickets/today', element: <TodayTickets /> },
      { path: 'tickets/in-progress', element: <OverdueTickets /> },
      { path: 'tickets/overdue', element: <Navigate to="/tickets/in-progress" replace /> },
      { path: 'tickets/completed', element: <CompletedTickets /> },
      { path: 'monitoring', element: <Navigate to="/network-management/routers" replace /> },
      { path: 'network-management', element: <Navigate to="/network-management/routers" replace /> },
      { path: 'network-management/routers', element: <NetworkRouters /> },
      { path: 'network-management/smart-olt', element: <NetworkSmartOlt /> },
      { path: 'network-management/admin-olt', element: <NetworkAdminOlt /> },
      { path: 'network-management/redes-ipv4', element: <NetworkIpv4 /> },
      { path: 'network-management/monitoreo', element: <NetworkMonitoring /> },
      { path: 'network-management/cajas-nap', element: <NetworkNapBoxes /> },
      { path: 'network-management/trafico', element: <NetworkTraffic /> },
      { path: 'network-management/ips-visitadas', element: <NetworkVisitedIps /> },
      { path: 'network-management/monitor-blacklist', element: <NetworkBlacklist /> },
      { path: 'network-management/trapemn', element: <NetworkTrapemn /> },
      { path: 'hotspot', element: <Navigate to="/hotspot/fichas" replace /> },
      { path: 'hotspot/fichas', element: <FichasHotspot /> },
      { path: 'hotspot/routers', element: <HotspotRouters /> },
      { path: 'hotspot/plantillas', element: <HotspotTemplates /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'warehouse', element: <Navigate to="/warehouse/tipos-productos" replace /> },
      { path: 'warehouse/tipos-productos', element: <WarehouseProductTypes /> },
      { path: 'warehouse/proveedores', element: <WarehouseSuppliers /> },
      { path: 'warehouse/productos', element: <WarehouseProducts /> },
      { path: 'messaging', element: <Navigate to="/messaging/chat-whatsapp" replace /> },
      { path: 'messaging/chat-whatsapp', element: <MessagingChatWhatsapp /> },
      { path: 'messaging/mensajes-enviados', element: <MessagingSent /> },
      { path: 'messaging/mensajes-recibidos', element: <MessagingReceived /> },
      { path: 'settings', element: <Settings /> },
      { path: 'settings/general', element: <GeneralSettings /> },
      { path: 'settings/users', element: <UsersManagement /> },
      { path: 'settings/roles', element: <RolesManagement /> },
      { path: 'settings/currencies', element: <CurrenciesManagement /> },
      { path: 'settings/receipts', element: <ReceiptsManagement /> },
      { path: 'settings/units', element: <UnitsManagement /> },
      { path: 'settings/incidents', element: <IncidentsManagement /> },
      { path: 'settings/cron-jobs', element: <CronJobsManagement /> },
      { path: 'settings/zones', element: <ZonesManagement /> },
      { path: 'settings/custom-fields', element: <CustomFieldsManagement /> },
      { path: 'settings/wsp-templates', element: <WspTemplatesManagement /> },
      { path: 'settings/server', element: <ServerManagement /> },
      { path: 'payment-methods', element: <PaymentMethods /> },
    ],
  },
  // Ruta pública para reservas de clientes
  {
    path: '/book-appointment/:companyId',
    element: <BookAppointment />
  }
]);
