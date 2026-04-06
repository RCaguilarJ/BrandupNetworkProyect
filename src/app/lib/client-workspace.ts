import { MOCK_CLIENTS, MOCK_PLANS } from '../data/mockData';
import type { Client, Plan } from '../types';

export const CLIENT_WORKSPACE_STORAGE_KEY = 'brandup_client_workspaces_v1';
const MOCK_CLIENT_IDS = new Set(MOCK_CLIENTS.map((client) => client.id));

export interface ClientBillingSettings {
  template: string;
  type: string;
  paymentDay: string;
  createInvoice: string;
  taxType: string;
  graceDays: string;
  applyCutoff: string;
  slowdownMode: string;
  fixedDate: string;
  fixedCutoffDate: string;
  applyLateFee: boolean;
  applyReconnection: boolean;
  reactivateWithPartialPayment: boolean;
  taxes: [string, string, string];
}

export interface ClientNotificationSettings {
  newInvoiceNotice: string;
  screenNotice: string;
  remindersChannel: string;
  reminderOne: string;
  reminderTwo: string;
  reminderThree: string;
}

export interface ClientPersonalSettings {
  clientCode: string;
  portalPassword: string;
  identification: string;
  fullName: string;
  primaryAddress: string;
  location: string;
  landlinePhone: string;
  mobilePhone: string;
  email: string;
}

export interface ClientServiceSetup {
  router: string;
  excludeFirewall: string;
}

export interface ClientLogEntry {
  id: string;
  date: string;
  detail: string;
  operator: string;
}

export interface ClientWorkspaceData {
  id: string;
  companyId: string;
  status: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';
  createdAt: string;
  personal: ClientPersonalSettings;
  billing: ClientBillingSettings;
  notifications: ClientNotificationSettings;
  services: ClientServiceSetup;
  log: ClientLogEntry[];
}

export interface ClientDirectoryRecord {
  routeId: string;
  id: string;
  code: string;
  name: string;
  address: string;
  lastPayment: string;
  ip: string;
  serviceAddress: string;
  mac: string;
  paymentDay: string;
  currentDebt: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'suspended' | 'overdue' | 'cancelled';
}

const DEFAULT_BILLING: ClientBillingSettings = {
  template: '',
  type: 'Prepago (Adelantado)',
  paymentDay: '01',
  createInvoice: '5 Dias antes',
  taxType: 'Impuestos incluido',
  graceDays: '5 Dias',
  applyCutoff: '1 Mes vencido',
  slowdownMode: 'Desactivado',
  fixedDate: '',
  fixedCutoffDate: '',
  applyLateFee: false,
  applyReconnection: false,
  reactivateWithPartialPayment: false,
  taxes: ['10', '10', '10'],
};

const DEFAULT_NOTIFICATIONS: ClientNotificationSettings = {
  newInvoiceNotice: 'Desactivado',
  screenNotice: 'Desactivado',
  remindersChannel: 'Correo',
  reminderOne: '2 Dias Antes',
  reminderTwo: 'Desactivado',
  reminderThree: 'Desactivado',
};

const DEFAULT_SERVICES: ClientServiceSetup = {
  router: '',
  excludeFirewall: 'Ningun registro',
};

function createTimestamp() {
  return new Date().toISOString();
}

function formatLogDate(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function readStorage() {
  if (typeof window === 'undefined') {
    return [] as ClientWorkspaceData[];
  }

  try {
    const rawValue = window.localStorage.getItem(CLIENT_WORKSPACE_STORAGE_KEY);
    if (!rawValue) {
      return [] as ClientWorkspaceData[];
    }

    const parsedRecords = JSON.parse(rawValue) as ClientWorkspaceData[];
    const sanitizedRecords = parsedRecords.filter((record) => !MOCK_CLIENT_IDS.has(record.id));

    if (sanitizedRecords.length !== parsedRecords.length) {
      window.localStorage.setItem(
        CLIENT_WORKSPACE_STORAGE_KEY,
        JSON.stringify(sanitizedRecords),
      );
    }

    return sanitizedRecords;
  } catch {
    return [] as ClientWorkspaceData[];
  }
}

function writeStorage(records: ClientWorkspaceData[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    CLIENT_WORKSPACE_STORAGE_KEY,
    JSON.stringify(records),
  );
}

function getPlanName(planId: string) {
  return MOCK_PLANS.find((plan) => plan.id === planId)?.name ?? 'Plan sin asignar';
}

function getNextClientCode() {
  const storedCodes = readStorage().map((record) => Number(record.personal.clientCode) || 0);
  const maxStoredCode = storedCodes.length > 0 ? Math.max(...storedCodes) : 3712;
  return String(maxStoredCode + 1).padStart(6, '0');
}

function generatePortalPassword() {
  return Math.random().toString(36).slice(2, 8);
}

function buildLogEntry(detail: string, operator = 'admin'): ClientLogEntry {
  const timestamp = createTimestamp();

  return {
    id: `${timestamp}-${Math.random().toString(16).slice(2, 8)}`,
    date: formatLogDate(timestamp),
    detail,
    operator,
  };
}

export function createEmptyClientWorkspace(companyId = 'comp1'): ClientWorkspaceData {
  const clientCode = getNextClientCode();
  const createdAt = createTimestamp();

  return {
    id: `client-${Date.now()}`,
    companyId,
    status: 'ACTIVO',
    createdAt,
    personal: {
      clientCode,
      portalPassword: '',
      identification: '',
      fullName: '',
      primaryAddress: '',
      location: '',
      landlinePhone: '',
      mobilePhone: '',
      email: '',
    },
    billing: { ...DEFAULT_BILLING },
    notifications: { ...DEFAULT_NOTIFICATIONS },
    services: { ...DEFAULT_SERVICES },
    log: [],
  };
}

export function buildClientWorkspaceFromLegacy(client: Client): ClientWorkspaceData {
  const paymentDay = String(
    MOCK_PLANS.find((plan) => plan.id === client.planId)?.billingCycle === 'biweekly' ? 15 : 1,
  ).padStart(2, '0');

  return {
    id: client.id,
    companyId: client.companyId,
    status:
      client.status === 'suspended'
        ? 'SUSPENDIDO'
        : client.status === 'cancelled'
          ? 'RETIRADO'
          : 'ACTIVO',
    createdAt: client.connectionDate,
    personal: {
      clientCode: client.id.replace(/\D/g, '').padStart(6, '0').slice(-6) || getNextClientCode(),
      portalPassword: generatePortalPassword(),
      identification: client.fiscalId ?? '',
      fullName: client.name,
      primaryAddress: client.address,
      location: '',
      landlinePhone: '',
      mobilePhone: client.phone,
      email: client.email,
    },
    billing: {
      ...DEFAULT_BILLING,
      paymentDay,
    },
    notifications: { ...DEFAULT_NOTIFICATIONS },
    services: {
      ...DEFAULT_SERVICES,
      router: 'Router Principal',
    },
    log: [],
  };
}

export function getStoredClientWorkspace(id: string) {
  return readStorage().find((record) => record.id === id) ?? null;
}

export function getClientWorkspace(id: string) {
  return getStoredClientWorkspace(id);
}

export function saveClientWorkspace(record: ClientWorkspaceData) {
  const currentRecords = readStorage();
  const nextRecords = currentRecords.some((currentRecord) => currentRecord.id === record.id)
    ? currentRecords.map((currentRecord) => (currentRecord.id === record.id ? record : currentRecord))
    : [record, ...currentRecords];

  writeStorage(nextRecords);
}

export function ensureClientRegistration(
  draft: ClientWorkspaceData,
  operator = 'admin',
) {
  const timestamp = createTimestamp();
  const finalClientCode = draft.personal.clientCode.trim() || getNextClientCode();
  const finalPassword = draft.personal.portalPassword.trim() || generatePortalPassword();
  const nextRecord: ClientWorkspaceData = {
    ...draft,
    personal: {
      ...draft.personal,
      clientCode: finalClientCode,
      portalPassword: finalPassword,
    },
    createdAt: draft.createdAt || timestamp,
    log: [
      buildLogEntry(
        `Nuevo cliente registrado (${draft.personal.fullName || 'Cliente sin nombre'}) - Cliente ID: ${finalClientCode}`,
        operator,
      ),
      ...draft.log,
    ],
  };

  saveClientWorkspace(nextRecord);
  return nextRecord;
}

export function appendClientLog(
  record: ClientWorkspaceData,
  detail: string,
  operator = 'admin',
) {
  const nextRecord = {
    ...record,
    log: [buildLogEntry(detail, operator), ...record.log],
  };

  saveClientWorkspace(nextRecord);
  return nextRecord;
}

export function updateClientStatus(
  record: ClientWorkspaceData,
  status: ClientWorkspaceData['status'],
  operator = 'admin',
) {
  const nextRecord = {
    ...record,
    status,
    log: [
      buildLogEntry(`Estado actualizado a ${status} para ${record.personal.fullName}`, operator),
      ...record.log,
    ],
  };

  saveClientWorkspace(nextRecord);
  return nextRecord;
}

function getMergedRecords(companyId?: string) {
  const mergedRecords = readStorage();

  return companyId
    ? mergedRecords.filter((record) => record.companyId === companyId)
    : mergedRecords;
}

function getLegacyPlan(planName: string) {
  const normalizedPlan = planName.toLowerCase();
  return (
    MOCK_PLANS.find((plan) => plan.name.toLowerCase() === normalizedPlan) ??
    MOCK_PLANS[0]
  );
}

export function getClientDirectoryRecords(companyId?: string): ClientDirectoryRecord[] {
  return getMergedRecords(companyId).map((record) => {
    return {
      routeId: record.id,
      id: record.personal.clientCode,
      code: record.personal.clientCode,
      name: record.personal.fullName,
      address: record.personal.primaryAddress,
      lastPayment: '--',
      ip: '',
      serviceAddress: record.personal.primaryAddress,
      mac: '',
      paymentDay: record.billing.paymentDay,
      currentDebt: '$ 0.00',
      email: record.personal.email,
      phone: record.personal.mobilePhone || record.personal.landlinePhone,
      plan: 'Plan sin asignar',
      status:
        record.status === 'SUSPENDIDO'
          ? 'suspended'
          : record.status === 'RETIRADO'
            ? 'cancelled'
            : 'active',
    };
  });
}

export function getPlanOptions(): Plan[] {
  return MOCK_PLANS;
}
