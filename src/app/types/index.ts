// Tipos globales de la plataforma BRANDUP NETWORK

export type UserRole = 'super_admin' | 'isp_admin' | 'cobranza' | 'soporte' | 'tecnico' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string; // null para super_admin
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  fiscalName: string;
  rfc: string;
  logo?: string;
  status: 'active' | 'suspended' | 'inactive';
  plan: string;
  createdAt: string;
  config: CompanyConfig;
}

export interface CompanyConfig {
  timezone: string;
  currency: string;
  graceDays: number;
  cutoffTime: string;
  paymentMethods: string[];
  billingDay: number;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'suspended' | 'overdue' | 'cancelled';
  planId: string;
  balance: number;
  lastPayment?: string;
  connectionDate: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Plan {
  id: string;
  companyId: string;
  name: string;
  speed: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'biweekly';
  description?: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issueDate?: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  folio: string;
}

export interface Payment {
  id: string;
  companyId: string;
  clientId: string;
  invoiceId?: string;
  amount: number;
  method: string;
  reference?: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Ticket {
  id: string;
  companyId: string;
  clientId: string;
  type: 'no_service' | 'intermittent' | 'billing' | 'installation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ServiceOrder {
  id: string;
  companyId: string;
  clientId: string;
  type: 'installation' | 'maintenance' | 'removal' | 'equipment_change';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  assignedTo?: string;
  notes?: string;
  evidence?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface NetworkDevice {
  id: string;
  companyId: string;
  name: string;
  type: 'router' | 'switch' | 'ap' | 'tower' | 'link';
  ip: string;
  location?: string;
  status: 'up' | 'down' | 'warning';
  uptime?: number;
  lastCheck: string;
}

export interface Voucher {
  id: string;
  companyId: string;
  code: string;
  duration: string;
  speed: string;
  status: 'available' | 'used' | 'expired';
  createdAt: string;
  usedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  companyId?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  activeCompanies?: number;
  totalClients?: number;
  overdueBalance?: number;
  openTickets?: number;
  networkUptime?: number;
  revenue?: number;
  activeClients?: number;
  suspendedClients?: number;
  monthlyRevenue?: number;
}