import { createBrowserRouter, Navigate } from 'react-router';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyForm from './pages/CompanyForm';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import ClientsMap from './pages/ClientsMap';
import Plans from './pages/Plans';
import PlanForm from './pages/PlanForm';
import Billing from './pages/Billing';
import Tickets from './pages/Tickets';
import TicketForm from './pages/TicketForm';
import ServiceOrders from './pages/ServiceOrders';
import ServiceOrderForm from './pages/ServiceOrderForm';
import Monitoring from './pages/Monitoring';
import Hotspot from './pages/Hotspot';
import Radius from './pages/Radius';
import Suspensions from './pages/Suspensions';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import Settings from './pages/Settings';
import GeneralSettings from './pages/GeneralSettings';
import ServerManagement from './pages/ServerManagement';
import PaymentMethods from './pages/PaymentMethods';

// Billing subpages
import Invoices from './pages/billing/Invoices';
import PendingInvoices from './pages/billing/PendingInvoices';
import RegisterPayment from './pages/billing/RegisterPayment';
import CompletedPayments from './pages/billing/CompletedPayments';
import BillingStats from './pages/billing/BillingStats';
import OtherIncomeExpenses from './pages/billing/OtherIncomeExpenses';
import Promises from './pages/billing/Promises';

// Tickets subpages
import TodayTickets from './pages/tickets/TodayTickets';
import OverdueTickets from './pages/tickets/OverdueTickets';
import CompletedTickets from './pages/tickets/CompletedTickets';

// Support Calendar pages
import SupportCalendar from './pages/SupportCalendar';
import CalendarSettings from './pages/calendar/CalendarSettings';
import AppointmentForm from './pages/calendar/AppointmentForm';
import BookAppointment from './pages/calendar/BookAppointment';

// HOC para proteger rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('brandup_user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'companies', element: <Companies /> },
      { path: 'companies/new', element: <CompanyForm /> },
      { path: 'companies/:id/edit', element: <CompanyForm /> },
      { path: 'clients', element: <Clients /> },
      { path: 'clients/new', element: <ClientForm /> },
      { path: 'clients/:id/edit', element: <ClientForm /> },
      { path: 'clients/map', element: <ClientsMap /> },
      { path: 'plans', element: <Plans /> },
      { path: 'plans/new', element: <PlanForm /> },
      { path: 'plans/:id/edit', element: <PlanForm /> },
      { path: 'billing', element: <Billing /> },
      { path: 'billing/invoices', element: <Invoices /> },
      { path: 'billing/pending-invoices', element: <PendingInvoices /> },
      { path: 'billing/register-payment', element: <RegisterPayment /> },
      { path: 'billing/completed-payments', element: <CompletedPayments /> },
      { path: 'billing/stats', element: <BillingStats /> },
      { path: 'billing/other-income-expenses', element: <OtherIncomeExpenses /> },
      { path: 'billing/promises', element: <Promises /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'tickets/new', element: <TicketForm /> },
      { path: 'tickets/:id/edit', element: <TicketForm /> },
      { path: 'tickets/today', element: <TodayTickets /> },
      { path: 'tickets/in-progress', element: <OverdueTickets /> },
      { path: 'tickets/overdue', element: <Navigate to="/tickets/in-progress" replace /> },
      { path: 'tickets/completed', element: <CompletedTickets /> },
      { path: 'service-orders', element: <ServiceOrders /> },
      { path: 'service-orders/new', element: <ServiceOrderForm /> },
      { path: 'service-orders/:id/edit', element: <ServiceOrderForm /> },
      { path: 'monitoring', element: <Monitoring /> },
      { path: 'hotspot', element: <Hotspot /> },
      { path: 'radius', element: <Radius /> },
      { path: 'suspensions', element: <Suspensions /> },
      { path: 'reports', element: <Reports /> },
      { path: 'audit', element: <Audit /> },
      { path: 'settings', element: <Settings /> },
      { path: 'settings/general', element: <GeneralSettings /> },
      { path: 'settings/server', element: <ServerManagement /> },
      { path: 'payment-methods', element: <PaymentMethods /> },
      { path: 'support-calendar', element: <SupportCalendar /> },
      { path: 'support-calendar/settings', element: <CalendarSettings /> },
      { path: 'support-calendar/new', element: <AppointmentForm /> },
    ],
  },
  // Ruta pública para reservas de clientes
  {
    path: '/book-appointment/:companyId',
    element: <BookAppointment />
  }
]);
