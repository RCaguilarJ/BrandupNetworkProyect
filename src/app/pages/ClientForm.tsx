import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Ban,
  BarChart3,
  Bell,
  Bold,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  Italic,
  List,
  ListOrdered,
  Mail,
  MapPin,
  Monitor,
  NotebookText,
  Plus,
  Receipt,
  RefreshCw,
  Reply,
  Router,
  Search,
  Save,
  Settings2,
  Share2,
  Smartphone,
  SquarePen,
  Ticket,
  TextQuote,
  Trash2,
  Underline,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import type { JSX } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  sanitizeDecimalValue,
  sanitizeLettersValue,
  sanitizeNumericValue,
} from '../lib/input-sanitizers';
import {
  appendClientLog,
  createEmptyClientWorkspace,
  ensureClientRegistration,
  getClientWorkspace,
  updateClientStatus,
  type ClientBillingSettings,
  type ClientNotificationSettings,
  type ClientServiceSetup,
  type ClientWorkspaceData,
} from '../lib/client-workspace';

type WizardStepId = 'personal' | 'billing' | 'services';
type ClientMainTab =
  | 'summary'
  | 'services'
  | 'billing'
  | 'tickets'
  | 'emails'
  | 'documents'
  | 'statistics'
  | 'log';
type BillingDetailTab = 'invoices' | 'config' | 'transactions' | 'balances';

interface WizardStep {
  id: WizardStepId;
  number: number;
  title: string;
  subtitle: string;
}

interface EmptyTableCardProps {
  title: string;
  columns: string[];
  actionLabel?: string;
  searchPlaceholder?: string;
}

interface TimelineCardProps {
  colorClassName: string;
  title: string;
  detail: string;
}

interface BillingTableColumn<Row> {
  key: string;
  header: string;
  label: string;
  width?: string;
  render: (row: Row) => JSX.Element | string;
  searchValue: (row: Row) => string;
}

interface BillingActionButton {
  label: string;
  onClick?: () => void;
}

interface BillingDataTableProps<Row> {
  columns: BillingTableColumn<Row>[];
  rows: Row[];
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  toolbarExtras?: JSX.Element;
  actionButtons?: BillingActionButton[];
  columnMenuOpen: boolean;
  onToggleColumnMenu: () => void;
  columnMenuRef: { current: HTMLDivElement | null };
  exportMenuOpen: boolean;
  onToggleExportMenu: () => void;
  exportMenuRef: { current: HTMLDivElement | null };
  onPrint: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  showExportButton?: boolean;
  visibleColumnKeys: string[];
  onToggleColumn: (key: string) => void;
  summary: string;
  currentPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  emptyMessage?: string;
}

const wizardSteps: WizardStep[] = [
  { id: 'personal', number: 1, title: 'Datos personales', subtitle: 'Nombre, direccion, telefonos' },
  { id: 'billing', number: 2, title: 'Facturacion y Notificaciones', subtitle: 'Dia de pago, Corte, aviso' },
  { id: 'services', number: 3, title: 'Servicios', subtitle: 'Queues, PPPoE, Hotspot, etc.' },
];

const locationOptions = ['Seleccionar Ubicacion', 'Centro', 'Lomas', 'Norte', 'Sur', 'Cumbres'];
const routerOptions = ['Seleccionar Router', 'Router Principal', 'Torre Norte', 'Torre Centro', 'Torre Sur'];
const billingTemplateOptions = ['Seleccionar plantilla', 'Plantilla estandar', 'Plantilla prepago', 'Plantilla corporativa'];
const billingTypeOptions = ['Prepago (Adelantado)', 'Pospago'];
const paymentDayOptions = ['01', '05', '10', '15', '20', '25'];
const createInvoiceOptions = ['5 Dias antes', '3 Dias antes', '1 Dia antes', 'El mismo dia'];
const taxTypeOptions = ['Impuestos incluido', 'Impuestos separado'];
const graceDayOptions = ['0 Dias', '3 Dias', '5 Dias', '10 Dias'];
const cutoffOptions = ['1 Mes vencido', 'Corte inmediato', 'Con 5 dias de gracia'];
const slowdownOptions = ['Desactivado', 'Activado'];
const notificationToggleOptions = ['Desactivado', 'Correo', 'SMS'];
const reminderOptions = ['2 Dias Antes', '1 Dia Antes', 'El mismo dia', 'Desactivado'];
const statisticsDateRange = ['25/03/2026', '09/04/2026'] as const;

function pageInputClassName(extraClassName = '') {
  return `h-[40px] w-full rounded-[4px] border border-[#cfd7e2] bg-white px-3 text-[14px] leading-[1.4] text-[#333333] outline-none placeholder:text-[#b7c2cf] ${extraClassName}`;
}

function pageSelectClassName(extraClassName = '') {
  return `${pageInputClassName(extraClassName)} appearance-none pr-8`;
}

function pageFormRowClassName(
  size: 'wide' | 'medium' | 'compact' = 'wide',
  align: 'center' | 'start' = 'center',
) {
  const sizeClassName =
    size === 'wide'
      ? 'md:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]'
      : size === 'medium'
        ? 'md:grid-cols-[170px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)]'
        : 'md:grid-cols-[155px_minmax(0,1fr)] lg:grid-cols-[175px_minmax(0,1fr)]';

  return `grid gap-3 sm:gap-4 lg:gap-5 ${sizeClassName} ${
    align === 'start' ? 'md:items-start' : 'md:items-center'
  }`;
}

function pageFormLabelClassName(extraClassName = '') {
  return `text-left md:text-right leading-[1.5] ${extraClassName}`;
}

function controlA11yProps(label: string) {
  return {
    'aria-label': label,
    title: label,
  } as const;
}

function sanitizeDateLikeValue(value: string) {
  return value.replace(/[^0-9/\-:\s]/g, '');
}

function deriveInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'CA'
  );
}

function readNumericPrefix(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function parseCurrencyInput(value: string) {
  const normalized = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getNextPaymentDate(paymentDay: string) {
  const now = new Date();
  const day = Math.max(1, Math.min(28, Number(paymentDay) || 1));
  const nextDate = new Date(now.getFullYear(), now.getMonth(), day, 4, 30, 0);

  if (nextDate < now) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatBs(value: number) {
  return `Bs.${value.toFixed(2)}`;
}

function createInvoiceLine(
  id: string,
  description = '',
  price = '0',
  taxPercent = '0',
  quantity = '1',
): BillingInvoiceLineForm {
  return { id, description, price, taxPercent, quantity };
}

function calculateInvoiceLineTotals(line: BillingInvoiceLineForm) {
  const quantity = Math.max(1, parseCurrencyInput(line.quantity));
  const unitPrice = Math.max(0, parseCurrencyInput(line.price));
  const taxPercent = Math.max(0, parseCurrencyInput(line.taxPercent));
  const total = unitPrice * quantity;

  if (taxPercent <= 0) {
    return {
      subtotal: total,
      tax: 0,
      total,
    };
  }

  const subtotal = total / (1 + taxPercent / 100);
  const tax = total - subtotal;

  return { subtotal, tax, total };
}

function getNextInvoiceNumber(rows: ClientInvoiceRow[]) {
  const maxValue = rows.reduce((max, row) => {
    const parsed = Number.parseInt(row.invoiceNumber, 10);
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return String(maxValue + 1).padStart(8, '0');
}

function getNextFiscalNumber(rows: ClientInvoiceRow[]) {
  const maxValue = rows.reduce((max, row) => {
    const parsed = Number.parseInt(row.fiscalNumber, 10);
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return String(maxValue + 1);
}

function getNotificationTimeline(billing: ClientBillingSettings, notifications: ClientNotificationSettings) {
  const paymentDate = getNextPaymentDate(billing.paymentDay);
  const invoiceDate = addDays(paymentDate, -readNumericPrefix(billing.createInvoice));
  const cutoffDate = addDays(paymentDate, readNumericPrefix(billing.graceDays));
  const reminderOneDate = addDays(paymentDate, -readNumericPrefix(notifications.reminderOne));

  return { paymentDate, invoiceDate, cutoffDate, reminderOneDate };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`;
}

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getBillingExportHeaders(rows: Record<string, string>[], fallbackHeaders: string[]) {
  if (rows.length > 0) {
    return Object.keys(rows[0]);
  }

  return fallbackHeaders;
}

function openBillingPrintPreview(
  title: string,
  rows: Record<string, string>[],
  fallbackHeaders: string[],
  asPdf = false,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const headers = getBillingExportHeaders(rows, fallbackHeaders);
  const bodyRows =
    rows.length > 0
      ? rows
      : [Object.fromEntries(headers.map((header) => [header, '']))];

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #23384d; }
        h1 { font-size: 18px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #d7e0ea; padding: 8px 10px; text-align: left; }
        th { background: #f5f7fa; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${bodyRows
            .map(
              (row) =>
                `<tr>${headers
                  .map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`)
                  .join('')}</tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </body>
  </html>`;

  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
    if (asPdf) {
      printWindow.close();
    }
  }, 250);
}

function exportBillingRowsToCsv(
  filename: string,
  rows: Record<string, string>[],
  fallbackHeaders: string[],
) {
  const headers = getBillingExportHeaders(rows, fallbackHeaders);
  const csvLines = [
    headers.map((header) => escapeCsvValue(header)).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header] ?? '')).join(','),
    ),
  ];

  downloadBlob(filename, `\uFEFF${csvLines.join('\n')}`, 'text/csv;charset=utf-8;');
}

function exportBillingRowsToExcel(
  filename: string,
  title: string,
  rows: Record<string, string>[],
  fallbackHeaders: string[],
) {
  const headers = getBillingExportHeaders(rows, fallbackHeaders);
  const tableRows =
    rows.length > 0
      ? rows
      : [Object.fromEntries(headers.map((header) => [header, '']))];

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body>
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows
            .map(
              (row) =>
                `<tr>${headers
                  .map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`)
                  .join('')}</tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </body>
  </html>`;

  downloadBlob(filename, html, 'application/vnd.ms-excel;charset=utf-8;');
}

function EmptyTableCard({
  title,
  columns,
  actionLabel,
  searchPlaceholder = 'Buscar...',
}: EmptyTableCardProps) {
  return (
    <section className="rounded border border-[#d7e0ea] bg-white">
      <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">{title}</header>
      <div className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              {...controlA11yProps('Cantidad de registros')}
            >
              <option>15</option>
            </select>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#30465f]"
              {...controlA11yProps('Vista de lista')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#30465f]"
              {...controlA11yProps('Capturar imagen')}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            {actionLabel ? (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-2 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] font-semibold text-[#24364b]"
                {...controlA11yProps(actionLabel)}
              >
                <Plus className="h-3.5 w-3.5" />
                {actionLabel}
              </button>
            ) : null}
          </div>

          <div className="relative w-full sm:w-[230px]">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded border border-[#d7e0ea] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
              {...controlA11yProps(searchPlaceholder)}
            />
            <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a0aebe]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px] text-[#24364b]">
            <thead>
              <tr className="bg-white">
                {columns.map((column) => (
                  <th key={column} className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="border border-[#d7e0ea] px-4 py-8 text-center text-[13px] text-[#7d8da1]">
                  Ningun registro disponible
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#6e8197] sm:flex-row sm:items-center sm:justify-between">
          <span>Mostrando 0 registros</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              {...controlA11yProps('Pagina anterior')}
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              {...controlA11yProps('Pagina siguiente')}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

type ClientInvoiceRow = {
  invoiceNumber: string;
  fiscalNumber: string;
  issuedAt: string;
  dueAt: string;
  status: 'PAGADO' | 'VENCIDO' | 'PENDIENTE';
  total: string;
  tax: string;
  invoiceType: string;
  paid: string;
  paidAt: string;
  paymentMethod: string;
  actionSet: 'paid' | 'expired' | 'pending';
};

type ClientTransactionRow = {
  id: string;
  invoiceNumber: string;
  paidAt: string;
  totalPaid: string;
  commission: string;
  balance: string;
  transactionNumber: string;
  paymentMethod: string;
  operator: string;
};

type ClientBalanceRow = {
  id: string;
  sourceInvoice: string;
  targetInvoice: string;
  amount: string;
  date: string;
  description: string;
  status: string;
};

type BillingInvoiceLineForm = {
  id: string;
  description: string;
  price: string;
  taxPercent: string;
  quantity: string;
};

type ClientTicketRow = {
  number: string;
  department: string;
  subject: string;
  technician: string;
  date: string;
  status: string;
  openedBy: string;
  lastReply: string;
  actionSet: 'open' | 'closed';
};

type TicketFormState = {
  client: string;
  department: string;
  technician: string;
  subject: string;
  applicantName: string;
  visitDate: string;
  shift: string;
  scheduledFrom: string;
  sendEmail: boolean;
  attachmentName: string;
  detail: string;
};

type ClientContractRow = {
  number: string;
  externalNumber: string;
  title: string;
  createdAt: string;
  startAt: string;
  endAt: string;
  duration: string;
  signedAt: string;
  status: 'ACTIVO' | 'INACTIVO';
};

type ClientPdfDocumentRow = {
  createdBy: string;
  title: string;
  description: string;
  fileName: string;
  date: string;
};

type ClientStatisticsHistoryRow = {
  id: string;
  connectedAt: string;
  disconnectedAt: string;
  duration: string;
  download: string;
  upload: string;
  ipv4: string;
  mac: string;
  routerIp: string;
};

type ClientLogTableRow = {
  id: string;
  date: string;
  detail: string;
  changes: string;
  operator: string;
};

const billingInvoiceRows: ClientInvoiceRow[] = [
  { invoiceNumber: '00002370', fiscalNumber: '2120', issuedAt: '28/03/2026', dueAt: '27/07/2026', status: 'PAGADO', total: 'Bs. 1,00', tax: 'Bs. 0,00', invoiceType: 'SERVICIOS', paid: 'Bs. 1,00', paidAt: '08/04/2026', paymentMethod: 'NetisPay', actionSet: 'paid' },
  { invoiceNumber: '00002362', fiscalNumber: '2114', issuedAt: '10/03/2026', dueAt: '10/06/2026', status: 'PAGADO', total: 'Bs. 15,00', tax: 'Bs. 0,76', invoiceType: 'SERVICIOS', paid: 'Bs. 15,00', paidAt: '05/04/2026', paymentMethod: 'Sistema Nuevo', actionSet: 'paid' },
  { invoiceNumber: '00002360', fiscalNumber: '2112', issuedAt: '06/03/2026', dueAt: '15/05/2026', status: 'PAGADO', total: 'Bs. 25,00', tax: 'Bs. 0,76', invoiceType: 'SERVICIOS', paid: 'Bs. 25,00', paidAt: '05/04/2026', paymentMethod: 'Sistema Nuevo', actionSet: 'paid' },
  { invoiceNumber: '00002358', fiscalNumber: '2108', issuedAt: '25/02/2026', dueAt: '15/04/2026', status: 'PAGADO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 550,00', paidAt: '05/04/2026', paymentMethod: 'Sistema Nuevo', actionSet: 'paid' },
  { invoiceNumber: '00002357', fiscalNumber: '2110', issuedAt: '25/02/2026', dueAt: '16/03/2026', status: 'VENCIDO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 0,00', paidAt: '00/00/0000', paymentMethod: '', actionSet: 'expired' },
  { invoiceNumber: '00002352', fiscalNumber: '2104', issuedAt: '11/02/2026', dueAt: '15/02/2026', status: 'VENCIDO', total: 'Bs. 0,20', tax: 'Bs. 0,00', invoiceType: 'SERVICIOS', paid: 'Bs. 0,00', paidAt: '10/03/2026', paymentMethod: 'Banco BHD', actionSet: 'expired' },
  { invoiceNumber: '00002348', fiscalNumber: '2100', issuedAt: '26/01/2026', dueAt: '15/01/2026', status: 'VENCIDO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 0,00', paidAt: '00/00/0000', paymentMethod: '', actionSet: 'expired' },
  { invoiceNumber: '00002346', fiscalNumber: '2098', issuedAt: '01/07/2025', dueAt: '15/07/2025', status: 'VENCIDO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 0,00', paidAt: '00/00/0000', paymentMethod: '', actionSet: 'expired' },
  { invoiceNumber: '00002344', fiscalNumber: '2096', issuedAt: '01/06/2025', dueAt: '15/06/2025', status: 'VENCIDO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 0,00', paidAt: '00/00/0000', paymentMethod: '', actionSet: 'expired' },
  { invoiceNumber: '00002342', fiscalNumber: '2094', issuedAt: '01/05/2025', dueAt: '15/05/2025', status: 'VENCIDO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 0,00', paidAt: '00/00/0000', paymentMethod: '', actionSet: 'expired' },
  { invoiceNumber: '00002284', fiscalNumber: '2036', issuedAt: '01/04/2025', dueAt: '15/04/2025', status: 'PAGADO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 550,00', paidAt: '08/04/2025', paymentMethod: 'Depósito bancario', actionSet: 'paid' },
  { invoiceNumber: '00002223', fiscalNumber: '1975', issuedAt: '01/03/2025', dueAt: '15/03/2025', status: 'PAGADO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 550,00', paidAt: '05/03/2025', paymentMethod: 'Efectivo', actionSet: 'paid' },
  { invoiceNumber: '00002165', fiscalNumber: '1917', issuedAt: '01/02/2025', dueAt: '15/02/2025', status: 'PAGADO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 550,00', paidAt: '16/02/2025', paymentMethod: 'Depósito bancario', actionSet: 'paid' },
  { invoiceNumber: '00002107', fiscalNumber: '1859', issuedAt: '01/01/2025', dueAt: '15/01/2025', status: 'PAGADO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 550,00', paidAt: '05/01/2025', paymentMethod: 'Depósito bancario', actionSet: 'paid' },
  { invoiceNumber: '00002049', fiscalNumber: '1801', issuedAt: '01/12/2024', dueAt: '15/12/2024', status: 'PAGADO', total: 'Bs. 550,00', tax: 'Bs. 7,63', invoiceType: 'SERVICIOS', paid: 'Bs. 550,00', paidAt: '12/12/2024', paymentMethod: 'Depósito bancario', actionSet: 'paid' },
];

const billingTransactionRows: ClientTransactionRow[] = [
  { id: 'TX-001', invoiceNumber: '00002370', paidAt: '08/04/2026', totalPaid: 'Bs. 1,00', commission: 'Bs. 0,00', balance: 'Bs. 0,00', transactionNumber: 'NET-82311', paymentMethod: 'NetisPay', operator: 'Sistema' },
  { id: 'TX-002', invoiceNumber: '00002362', paidAt: '05/04/2026', totalPaid: 'Bs. 15,00', commission: 'Bs. 0,00', balance: 'Bs. 0,00', transactionNumber: 'SYS-21014', paymentMethod: 'Sistema Nuevo', operator: 'ADMIN' },
  { id: 'TX-003', invoiceNumber: '00002358', paidAt: '05/04/2026', totalPaid: 'Bs. 550,00', commission: 'Bs. 0,00', balance: 'Bs. 0,00', transactionNumber: 'SYS-21008', paymentMethod: 'Sistema Nuevo', operator: 'ADMIN' },
];

const billingBalanceRows: ClientBalanceRow[] = [
  {
    id: '5',
    sourceInvoice: '00002362',
    targetInvoice: '00000000',
    amount: 'Bs. 300,00',
    date: '11/03/2026',
    description: 'Saldo generado Automático',
    status: '',
  },
];

const ticketRowsSeed: ClientTicketRow[] = [
  { number: '0000072', department: 'VENTAS', subject: 'Solicitud de upgrade', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000071', department: 'SOPORTE TÉCNICO', subject: 'Validar ONU sin internet', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000070', department: 'SOPORTE TÉCNICO', subject: 'Cliente sin navegación', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000069', department: 'SOPORTE TÉCNICO', subject: 'Revisión de potencia', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000068', department: 'SOPORTE TÉCNICO', subject: 'Intermitencia en enlace', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000067', department: 'SOPORTE TÉCNICO', subject: 'Cambio de clave portal', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000066', department: 'SOPORTE TÉCNICO', subject: 'Router sin respuesta', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000065', department: 'SOPORTE TÉCNICO', subject: 'Actualización de equipo', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000063', department: 'SOPORTE TÉCNICO', subject: 'Consulta de corte', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000061', department: 'SOPORTE TÉCNICO', subject: 'Sin acceso al portal', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000056', department: 'SOPORTE TÉCNICO', subject: 'Normalización de servicio', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'admin', lastReply: 'Hace 25 días', actionSet: 'open' },
  { number: '0000055', department: 'SOPORTE TÉCNICO', subject: 'Cliente sin PPPoE', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'api', lastReply: 'Hace 1 mes', actionSet: 'closed' },
  { number: '0000054', department: 'SOPORTE TÉCNICO', subject: 'Revisión de acometida', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'api', lastReply: 'Hace 1 mes', actionSet: 'closed' },
  { number: '0000053', department: 'SOPORTE TÉCNICO', subject: 'Activación pendiente', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'api', lastReply: 'Hace 1 mes', actionSet: 'closed' },
  { number: '0000052', department: 'SOPORTE TÉCNICO', subject: 'Router fuera de línea', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'api', lastReply: 'Hace 1 mes', actionSet: 'closed' },
  { number: '0000051', department: 'SOPORTE TÉCNICO', subject: 'Seguimiento visita técnica', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'api', lastReply: 'Hace 1 mes', actionSet: 'closed' },
  { number: '0000050', department: 'SOPORTE TÉCNICO', subject: 'Ajuste de perfil PPP', technician: 'Sin asignar', date: '09/04/2026', status: 'ABIERTO', openedBy: 'api', lastReply: 'Hace 1 mes', actionSet: 'closed' },
];

const contractRowsSeed: ClientContractRow[] = [
  {
    number: '00000002',
    externalNumber: '',
    title: 'Contrato 2019',
    createdAt: '05/08/2019 16:25:50',
    startAt: '28/05/2019',
    endAt: '27/11/2020',
    duration: '18 Meses',
    signedAt: '05/08/2019',
    status: 'ACTIVO',
  },
];

const pdfDocumentRowsSeed: ClientPdfDocumentRow[] = [];

const statisticsHistoryRowsSeed: ClientStatisticsHistoryRow[] = [];

function InvoiceStatusBadge({ status }: { status: ClientInvoiceRow['status'] }) {
  return (
    <span className={`inline-flex rounded px-2 py-[3px] text-[10px] font-semibold text-white ${
      status === 'PAGADO' ? 'bg-[#11b8aa]' : status === 'PENDIENTE' ? 'bg-[#f59e0b]' : 'bg-[#ff5b5b]'
    }`}>
      {status}
    </span>
  );
}

function InvoiceActions({ variant }: { variant: ClientInvoiceRow['actionSet'] }) {
  const icons = variant === 'paid'
    ? [<FileText key="file" className="h-4 w-4" />, <X key="close" className="h-4 w-4" />, <SquarePen key="edit" className="h-4 w-4" />, <Share2 key="share" className="h-4 w-4" />]
    : variant === 'pending'
      ? [<Check key="check" className="h-4 w-4" />, <SquarePen key="edit" className="h-4 w-4" />, <FileText key="file" className="h-4 w-4" />, <Share2 key="share" className="h-4 w-4" />]
      : [<Check key="check" className="h-4 w-4" />, <SquarePen key="edit" className="h-4 w-4" />, <FileText key="file" className="h-4 w-4" />, <Trash2 key="delete" className="h-4 w-4" />, <Ban key="ban" className="h-4 w-4" />, <Share2 key="share" className="h-4 w-4" />];

  return (
    <div className="flex items-center gap-1 text-[#23384d]">
      {icons.map((icon, index) => (
        <button
          key={`${variant}-action-${index}`}
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center"
          {...controlA11yProps(`Accion factura ${index + 1}`)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

const billingInvoiceColumns: BillingTableColumn<ClientInvoiceRow>[] = [
  { key: 'invoiceNumber', header: 'N° FACTURA', label: 'N° Factura', width: '92px', render: (row) => row.invoiceNumber, searchValue: (row) => row.invoiceNumber },
  { key: 'fiscalNumber', header: 'N° FISCAL', label: 'N° Fiscal', width: '88px', render: (row) => row.fiscalNumber, searchValue: (row) => row.fiscalNumber },
  { key: 'issuedAt', header: 'EMITIDO', label: 'Emitido', width: '120px', render: (row) => row.issuedAt, searchValue: (row) => row.issuedAt },
  { key: 'dueAt', header: 'VENCIMIENTO', label: 'Vencimiento', width: '120px', render: (row) => row.dueAt, searchValue: (row) => row.dueAt },
  { key: 'status', header: 'ESTADO', label: 'Estado', width: '66px', render: (row) => <InvoiceStatusBadge status={row.status} />, searchValue: (row) => row.status },
  { key: 'total', header: 'TOTAL', label: 'Total', width: '84px', render: (row) => row.total, searchValue: (row) => row.total },
  { key: 'tax', header: 'IMPUESTO', label: 'Impuesto', width: '84px', render: (row) => row.tax, searchValue: (row) => row.tax },
  { key: 'invoiceType', header: 'TIPO', label: 'Tipo', width: '110px', render: (row) => <span className="text-[10px] text-[#f59e0b]">{row.invoiceType}</span>, searchValue: (row) => row.invoiceType },
  { key: 'paid', header: 'PAGADO', label: 'Pagado', width: '118px', render: (row) => row.paid, searchValue: (row) => row.paid },
  { key: 'paidAt', header: 'FECHA PAGO', label: 'Fecha Pago', width: '130px', render: (row) => row.paidAt, searchValue: (row) => row.paidAt },
  { key: 'paymentMethod', header: 'FORMA PAGO', label: 'Forma Pago', width: '210px', render: (row) => row.paymentMethod, searchValue: (row) => row.paymentMethod },
  { key: 'actions', header: 'ACCIONES', label: 'Acciones', width: '128px', render: (row) => <InvoiceActions variant={row.actionSet} />, searchValue: () => '' },
];

const billingTransactionColumns: BillingTableColumn<ClientTransactionRow>[] = [
  { key: 'id', header: 'ID', label: 'ID', width: '90px', render: (row) => row.id, searchValue: (row) => row.id },
  { key: 'invoiceNumber', header: 'N° FACTURA', label: 'N° Factura', width: '100px', render: (row) => row.invoiceNumber, searchValue: (row) => row.invoiceNumber },
  { key: 'paidAt', header: 'FECHA PAGO', label: 'Fecha Pago', width: '120px', render: (row) => row.paidAt, searchValue: (row) => row.paidAt },
  { key: 'totalPaid', header: 'TOTAL PAGADO', label: 'Total Pagado', width: '120px', render: (row) => row.totalPaid, searchValue: (row) => row.totalPaid },
  { key: 'commission', header: 'COMISION', label: 'Comision', width: '96px', render: (row) => row.commission, searchValue: (row) => row.commission },
  { key: 'balance', header: 'SALDO', label: 'Saldo', width: '96px', render: (row) => row.balance, searchValue: (row) => row.balance },
  { key: 'transactionNumber', header: 'N° TRANSACCION', label: 'N° Transaccion', width: '138px', render: (row) => row.transactionNumber, searchValue: (row) => row.transactionNumber },
  { key: 'paymentMethod', header: 'FORMA PAGO', label: 'Forma Pago', width: '150px', render: (row) => row.paymentMethod, searchValue: (row) => row.paymentMethod },
  { key: 'operator', header: 'OPERADOR', label: 'Operador', width: '110px', render: (row) => row.operator, searchValue: (row) => row.operator },
];

const billingBalanceColumns: BillingTableColumn<ClientBalanceRow>[] = [
  { key: 'id', header: 'ID', label: 'ID', width: '80px', render: (row) => row.id, searchValue: (row) => row.id },
  {
    key: 'sourceInvoice',
    header: 'FACTURA ORIGEN',
    label: 'Factura Origen',
    width: '150px',
    render: (row) => row.sourceInvoice,
    searchValue: (row) => row.sourceInvoice,
  },
  {
    key: 'targetInvoice',
    header: 'FACTURA DESTINO',
    label: 'Factura Destino',
    width: '150px',
    render: (row) => row.targetInvoice,
    searchValue: (row) => row.targetInvoice,
  },
  {
    key: 'amount',
    header: 'MONTO',
    label: 'Monto',
    width: '130px',
    render: (row) => row.amount,
    searchValue: (row) => row.amount,
  },
  { key: 'date', header: 'FECHA', label: 'Fecha', width: '170px', render: (row) => row.date, searchValue: (row) => row.date },
  {
    key: 'description',
    header: 'DESCRIPCIÓN',
    label: 'Descripción',
    width: '520px',
    render: (row) => row.description,
    searchValue: (row) => row.description,
  },
  {
    key: 'status',
    header: 'ESTADO',
    label: 'Estado',
    width: '170px',
    render: (row) => row.status,
    searchValue: (row) => row.status,
  },
];

function TicketDepartmentBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-[4px] px-2 py-[3px] text-[10px] font-semibold ${
        value === 'VENTAS' ? 'bg-[#18b87c] text-white' : 'bg-[#2196f3] text-[#0f2942]'
      }`}
    >
      {value}
    </span>
  );
}

function TicketActions({ variant }: { variant: ClientTicketRow['actionSet'] }) {
  const icons =
    variant === 'open'
      ? [<Trash2 key="delete" className="h-4 w-4" />, <SquarePen key="edit" className="h-4 w-4" />, <X key="close" className="h-4 w-4" />]
      : [<Trash2 key="delete" className="h-4 w-4" />, <SquarePen key="edit" className="h-4 w-4" />, <X key="close" className="h-4 w-4" />];

  return (
    <div className="flex items-center gap-1 text-[#23384d]">
      {icons.map((icon, index) => (
        <button
          key={`${variant}-ticket-action-${index}`}
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center"
          {...controlA11yProps(`Accion ticket ${index + 1}`)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function ContractStatusBadge({ status }: { status: ClientContractRow['status'] }) {
  return (
    <span className="inline-flex rounded bg-[#11b8aa] px-2 py-[3px] text-[10px] font-semibold text-white">
      {status}
    </span>
  );
}

function ContractActions() {
  const icons = [
    <Mail key="mail" className="h-4 w-4" />,
    <SquarePen key="edit" className="h-4 w-4" />,
    <Trash2 key="delete" className="h-4 w-4" />,
  ];

  return (
    <div className="flex items-center gap-1 text-[#23384d]">
      {icons.map((icon, index) => (
        <button
          key={`contract-action-${index}`}
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center"
          {...controlA11yProps(`Accion contrato ${index + 1}`)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

const ticketColumns: BillingTableColumn<ClientTicketRow>[] = [
  { key: 'number', header: 'N°', label: 'N°', width: '92px', render: (row) => row.number, searchValue: (row) => row.number },
  {
    key: 'department',
    header: 'DEPARTAMENTO',
    label: 'Departamento',
    width: '170px',
    render: (row) => <TicketDepartmentBadge value={row.department} />,
    searchValue: (row) => row.department,
  },
  { key: 'subject', header: 'ASUNTO', label: 'Asunto', width: '250px', render: (row) => row.subject, searchValue: (row) => row.subject },
  { key: 'technician', header: 'TÉCNICO', label: 'Técnico', width: '120px', render: (row) => row.technician, searchValue: (row) => row.technician },
  { key: 'date', header: 'FECHA', label: 'Fecha', width: '120px', render: (row) => row.date, searchValue: (row) => row.date },
  { key: 'status', header: 'ESTADO', label: 'Estado', width: '110px', render: (row) => row.status, searchValue: (row) => row.status },
  { key: 'openedBy', header: 'ABIERTO POR', label: 'Abierto Por', width: '120px', render: (row) => row.openedBy, searchValue: (row) => row.openedBy },
  { key: 'lastReply', header: 'ÚLTIMA RSPTA.', label: 'Última Rspta.', width: '140px', render: (row) => row.lastReply, searchValue: (row) => row.lastReply },
  { key: 'actions', header: 'ACCIONES', label: 'Acciones', width: '96px', render: (row) => <TicketActions variant={row.actionSet} />, searchValue: () => '' },
];

const contractColumns: BillingTableColumn<ClientContractRow>[] = [
  { key: 'number', header: 'N°', label: 'N°', width: '92px', render: (row) => row.number, searchValue: (row) => row.number },
  { key: 'externalNumber', header: 'N° EXTERNO', label: 'N° Externo', width: '140px', render: (row) => row.externalNumber, searchValue: (row) => row.externalNumber },
  { key: 'title', header: 'TITULO', label: 'Titulo', width: '190px', render: (row) => row.title, searchValue: (row) => row.title },
  { key: 'createdAt', header: 'CREADO', label: 'Creado', width: '180px', render: (row) => row.createdAt, searchValue: (row) => row.createdAt },
  { key: 'startAt', header: 'INICIO', label: 'Inicio', width: '140px', render: (row) => row.startAt, searchValue: (row) => row.startAt },
  { key: 'endAt', header: 'FINALIZA', label: 'Finaliza', width: '140px', render: (row) => row.endAt, searchValue: (row) => row.endAt },
  { key: 'duration', header: 'DURACION', label: 'Duracion', width: '130px', render: (row) => row.duration, searchValue: (row) => row.duration },
  { key: 'signedAt', header: 'FIRMADO', label: 'Firmado', width: '130px', render: (row) => row.signedAt, searchValue: (row) => row.signedAt },
  { key: 'status', header: 'ESTADO', label: 'Estado', width: '92px', render: (row) => <ContractStatusBadge status={row.status} />, searchValue: (row) => row.status },
  { key: 'actions', header: 'ACCIONES', label: 'Acciones', width: '90px', render: () => <ContractActions />, searchValue: () => '' },
];

const pdfDocumentColumns: BillingTableColumn<ClientPdfDocumentRow>[] = [
  { key: 'createdBy', header: 'CREADO POR', label: 'Creado Por', width: '170px', render: (row) => row.createdBy, searchValue: (row) => row.createdBy },
  { key: 'title', header: 'TITULO', label: 'Titulo', width: '220px', render: (row) => row.title, searchValue: (row) => row.title },
  { key: 'description', header: 'DESCRIPCION', label: 'Descripcion', width: '330px', render: (row) => row.description, searchValue: (row) => row.description },
  { key: 'fileName', header: 'ARCHIVO', label: 'Archivo', width: '180px', render: (row) => row.fileName, searchValue: (row) => row.fileName },
  { key: 'date', header: 'FECHA', label: 'Fecha', width: '150px', render: (row) => row.date, searchValue: (row) => row.date },
];

const statisticsHistoryColumns: BillingTableColumn<ClientStatisticsHistoryRow>[] = [
  { key: 'id', header: '#', label: '#', width: '48px', render: (row) => row.id, searchValue: (row) => row.id },
  { key: 'connectedAt', header: 'CONECTADO', label: 'Conectado', width: '170px', render: (row) => row.connectedAt, searchValue: (row) => row.connectedAt },
  { key: 'disconnectedAt', header: 'DESCONECTADO', label: 'Desconectado', width: '170px', render: (row) => row.disconnectedAt, searchValue: (row) => row.disconnectedAt },
  { key: 'duration', header: 'TIEMPO', label: 'Tiempo', width: '120px', render: (row) => row.duration, searchValue: (row) => row.duration },
  { key: 'download', header: 'DESCARGA', label: 'Descarga', width: '120px', render: (row) => row.download, searchValue: (row) => row.download },
  { key: 'upload', header: 'SUBIDA', label: 'Subida', width: '120px', render: (row) => row.upload, searchValue: (row) => row.upload },
  { key: 'ipv4', header: 'IPV4', label: 'IPV4', width: '110px', render: (row) => row.ipv4, searchValue: (row) => row.ipv4 },
  { key: 'mac', header: 'MAC', label: 'MAC', width: '130px', render: (row) => row.mac, searchValue: (row) => row.mac },
  { key: 'routerIp', header: 'IP ROUTER', label: 'IP Router', width: '140px', render: (row) => row.routerIp, searchValue: (row) => row.routerIp },
];

const clientLogColumns: BillingTableColumn<ClientLogTableRow>[] = [
  { key: 'date', header: 'FECHA', label: 'Fecha', width: '180px', render: (row) => row.date, searchValue: (row) => row.date },
  { key: 'detail', header: 'DETALLE', label: 'Detalle', width: '390px', render: (row) => row.detail, searchValue: (row) => row.detail },
  { key: 'changes', header: 'CAMBIOS', label: 'Cambios', width: '320px', render: (row) => row.changes, searchValue: (row) => row.changes },
  { key: 'operator', header: 'OPERADOR', label: 'Operador', width: '160px', render: (row) => row.operator, searchValue: (row) => row.operator },
];

function filterBillingRows<Row>(
  rows: Row[],
  columns: BillingTableColumn<Row>[],
  searchTerm: string,
) {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return rows;
  }

  return rows.filter((row) =>
    columns.some((column) => column.searchValue(row).toLowerCase().includes(query)),
  );
}

function toggleBillingColumnKey(current: string[], columnKey: string) {
  if (current.includes(columnKey)) {
    return current.length === 1 ? current : current.filter((key) => key !== columnKey);
  }

  return [...current, columnKey];
}

function BillingDataTable<Row>({
  columns,
  rows,
  pageSize,
  onPageSizeChange,
  searchTerm,
  onSearchTermChange,
  toolbarExtras,
  actionButtons,
  columnMenuOpen,
  onToggleColumnMenu,
  columnMenuRef,
  exportMenuOpen,
  onToggleExportMenu,
  exportMenuRef,
  onPrint,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  showExportButton = true,
  visibleColumnKeys,
  onToggleColumn,
  summary,
  currentPage,
  onPrevPage,
  onNextPage,
  canGoPrev,
  canGoNext,
  emptyMessage = 'Ningun registro disponible',
}: BillingDataTableProps<Row>) {
  const visibleColumns = columns.filter((column) => visibleColumnKeys.includes(column.key));
  const safeVisibleColumns = visibleColumns.length > 0 ? visibleColumns : columns;

  return (
    <section className="rounded border border-[#d7e0ea] bg-white">
      <div className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex items-stretch overflow-visible rounded-[4px] border border-[#cfd7e2] bg-white align-middle">
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="h-8 min-w-[54px] appearance-none border-0 border-r border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                {...controlA11yProps('Cantidad de registros')}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div className="relative" ref={columnMenuRef}>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center border-0 bg-white text-[#30465f]"
                  onClick={onToggleColumnMenu}
                  {...controlA11yProps('Vista de lista')}
                >
                  <List className="h-3.5 w-3.5" />
                </button>

                {columnMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[190px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                    <div className="max-h-[260px] overflow-y-auto py-2">
                      {columns.map((column) => (
                        <label
                          key={column.key}
                          className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumnKeys.includes(column.key)}
                            onChange={() => onToggleColumn(column.key)}
                            className="h-[13px] w-[13px] accent-[#2f3033]"
                          />
                          <span>{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {showExportButton ? (
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#cfd7e2] bg-white text-[#30465f]"
                  onClick={onToggleExportMenu}
                  {...controlA11yProps('Guardar y exportar')}
                >
                  <Save className="h-3.5 w-3.5" />
                </button>

                {exportMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[190px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                    <div className="py-2">
                      <button type="button" onClick={onPrint} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                        Imprimir
                      </button>
                      <button type="button" onClick={onExportCsv} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                        Exportar CSV
                      </button>
                      <button type="button" onClick={onExportExcel} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                        Exportar a Excel
                      </button>
                      <button type="button" onClick={onExportPdf} className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]">
                        Exportar a PDF
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {toolbarExtras}

            {(actionButtons ?? []).map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={button.onClick}
                className="inline-flex h-8 items-center gap-2 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] font-semibold text-[#24364b]"
                {...controlA11yProps(button.label)}
              >
                <Plus className="h-3.5 w-3.5" />
                {button.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[270px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Buscar..."
              className="h-8 w-full rounded border border-[#d7e0ea] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
              {...controlA11yProps('Buscar en facturacion')}
            />
            <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a0aebe]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px] text-[#24364b]">
            <thead>
              <tr className="bg-white">
                {safeVisibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className="border border-[#d7e0ea] px-2 py-2 text-left font-semibold"
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={safeVisibleColumns.length} className="border border-[#d7e0ea] px-4 py-8 text-center text-[13px] text-[#7d8da1]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={`billing-row-${index}`} className={index % 2 === 0 ? 'bg-[#fbfcfd]' : 'bg-white'}>
                    {safeVisibleColumns.map((column) => (
                      <td key={column.key} className="border border-[#d7e0ea] px-2 py-2 align-middle">
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#6e8197] sm:flex-row sm:items-center sm:justify-between">
          <span>{summary}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={!canGoPrev}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7] disabled:cursor-not-allowed disabled:opacity-60"
              {...controlA11yProps('Pagina anterior')}
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            {rows.length > 0 ? (
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#2f93e4] text-[12px] font-semibold text-white"
                {...controlA11yProps(`Pagina ${currentPage}`)}
              >
                {currentPage}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onNextPage}
              disabled={!canGoNext}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7] disabled:cursor-not-allowed disabled:opacity-60"
              {...controlA11yProps('Pagina siguiente')}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface BillingInvoiceDialogProps {
  title: string;
  loading: boolean;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  issueDate: string;
  onIssueDateChange: (value: string) => void;
  lines: BillingInvoiceLineForm[];
  onLineChange: (
    lineId: string,
    field: keyof Omit<BillingInvoiceLineForm, 'id'>,
    value: string,
  ) => void;
  onAddLine: () => void;
  onRemoveLine?: (lineId: string) => void;
  onAddProducts?: () => void;
  summaryItems: Array<{ label: string; value: string; symbol?: string }>;
  totalLabel: string;
  onClose: () => void;
  onSubmit: () => void;
}

interface TicketDialogProps {
  loading: boolean;
  values: TicketFormState;
  onFieldChange: <Field extends keyof TicketFormState>(field: Field, value: TicketFormState[Field]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function BillingInvoiceDialog({
  title,
  loading,
  dueDate,
  onDueDateChange,
  issueDate,
  onIssueDateChange,
  lines,
  onLineChange,
  onAddLine,
  onRemoveLine,
  onAddProducts,
  summaryItems,
  totalLabel,
  onClose,
  onSubmit,
}: BillingInvoiceDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(31,37,44,0.55)] px-4 py-8">
      <div className="w-full max-w-[900px] overflow-hidden rounded-[4px] border border-[#c7d2de] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-center justify-between border-b border-[#d7e0ea] bg-[#f7f9fb] px-4 py-3">
          <h3 className="text-[18px] font-semibold text-[#3b454e]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-[#6a7177]"
            {...controlA11yProps(`Cerrar ${title}`)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-4 py-10 text-[#51687f]">
            <RefreshCw className="h-10 w-10 animate-spin" />
            <div className="text-[16px] font-semibold text-[#334b63]">Cargando factura...</div>
          </div>
        ) : (
        <div className="space-y-5 px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <span className="min-w-[95px] text-right text-[14px] text-[#4d5b68]">Vencimiento</span>
              <input
                value={dueDate}
                onChange={(event) => onDueDateChange(sanitizeDateLikeValue(event.target.value))}
                className="h-8 w-[140px] rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                {...controlA11yProps('Fecha de vencimiento')}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="min-w-[95px] text-right text-[14px] text-[#4d5b68]">Fecha</span>
              <input
                value={issueDate}
                onChange={(event) => onIssueDateChange(sanitizeDateLikeValue(event.target.value))}
                className="h-8 w-[140px] rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                {...controlA11yProps('Fecha de factura')}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px] text-[#334b63]">
              <thead>
                <tr className="bg-[#eef3f7] text-[#0c5a68]">
                  <th className="border-b border-[#d7e0ea] px-3 py-3 text-left font-semibold">Descripción</th>
                  <th className="border-b border-[#d7e0ea] px-2 py-3 text-left font-semibold">
                    {onAddProducts ? (
                      <button
                        type="button"
                        onClick={onAddProducts}
                        className="inline-flex h-8 items-center gap-2 rounded border border-[#c5d0db] bg-white px-3 text-[13px] font-semibold text-[#334b63]"
                        {...controlA11yProps('Agregar productos')}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar Productos
                      </button>
                    ) : null}
                  </th>
                  <th className="border-b border-[#d7e0ea] px-2 py-3 text-left font-semibold">Precio</th>
                  <th className="border-b border-[#d7e0ea] px-2 py-3 text-left font-semibold">Imp %</th>
                  <th className="border-b border-[#d7e0ea] px-2 py-3 text-left font-semibold">Cant.</th>
                  <th className="border-b border-[#d7e0ea] px-2 py-3 text-left font-semibold">Total</th>
                  {onRemoveLine ? (
                    <th className="border-b border-[#d7e0ea] px-2 py-3 text-left font-semibold" />
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const lineTotals = calculateInvoiceLineTotals(line);

                  return (
                    <tr key={line.id}>
                      <td className="border-b border-[#edf2f7] px-3 py-3">
                        <input
                          value={line.description}
                          onChange={(event) => onLineChange(line.id, 'description', event.target.value)}
                          className="h-9 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                          placeholder="Descripción"
                          {...controlA11yProps('Descripcion del item')}
                        />
                      </td>
                      <td className="border-b border-[#edf2f7] px-2 py-3" />
                      <td className="border-b border-[#edf2f7] px-2 py-3">
                        <input
                          value={line.price}
                          onChange={(event) =>
                            onLineChange(line.id, 'price', sanitizeDecimalValue(event.target.value))
                          }
                          inputMode="decimal"
                          className="h-9 w-full min-w-[70px] rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                          {...controlA11yProps('Precio del item')}
                        />
                      </td>
                      <td className="border-b border-[#edf2f7] px-2 py-3">
                        <input
                          value={line.taxPercent}
                          onChange={(event) =>
                            onLineChange(line.id, 'taxPercent', sanitizeDecimalValue(event.target.value))
                          }
                          inputMode="decimal"
                          className="h-9 w-full min-w-[52px] rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                          {...controlA11yProps('Impuesto del item')}
                        />
                      </td>
                      <td className="border-b border-[#edf2f7] px-2 py-3">
                        <input
                          value={line.quantity}
                          onChange={(event) =>
                            onLineChange(line.id, 'quantity', sanitizeDecimalValue(event.target.value))
                          }
                          inputMode="decimal"
                          className="h-9 w-full min-w-[50px] rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                          {...controlA11yProps('Cantidad del item')}
                        />
                      </td>
                      <td className="border-b border-[#edf2f7] px-2 py-3">
                        <div className="flex h-9 min-w-[116px] items-center rounded border border-[#cfd7e2] bg-[#eef3f7] px-3 text-[14px] text-[#4d5b68]">
                          {formatBs(lineTotals.total)}
                        </div>
                      </td>
                      {onRemoveLine ? (
                        <td className="border-b border-[#edf2f7] px-2 py-3">
                          <button
                            type="button"
                            onClick={() => onRemoveLine(line.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#6a7177]"
                            {...controlA11yProps('Eliminar linea')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={onAddLine}
            className="inline-flex h-8 items-center gap-2 rounded border border-[#c5d0db] bg-white px-3 text-[13px] font-semibold text-[#334b63]"
            {...controlA11yProps('Agregar linea')}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Línea
          </button>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_216px]">
            <div className="grid gap-4 bg-[#f5f7fa] px-5 py-4 md:grid-cols-[repeat(7,auto)] md:items-center md:justify-start">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div>
                    <div className="text-[12px] uppercase text-[#4d5b68]">{item.label}</div>
                    <div className="mt-1 text-[16px] font-semibold text-[#374151]">{item.value}</div>
                  </div>
                  {item.symbol ? <span className="text-[20px] font-semibold text-[#3f4650]">{item.symbol}</span> : null}
                </div>
              ))}
            </div>

            <div className="flex min-h-[78px] items-center justify-between bg-[#323841] px-5 py-4 text-white">
              <span className="text-[18px]">TOTAL</span>
              <span className="text-[34px] font-semibold leading-none">{totalLabel}</span>
            </div>
          </div>
        </div>
        )}

        <div className="flex justify-end border-t border-[#d7e0ea] px-4 py-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-full border border-[#1d8ff2] px-6 text-[15px] font-semibold text-[#1d8ff2]"
            {...controlA11yProps('Crear factura')}
          >
            Crear Factura
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketDialog({
  loading,
  values,
  onFieldChange,
  onClose,
  onSubmit,
}: TicketDialogProps) {
  const toolbarButtons = [
    <Bold key="bold" className="h-4 w-4" />,
    <Italic key="italic" className="h-4 w-4" />,
    <Underline key="underline" className="h-4 w-4" />,
    <TextQuote key="quote" className="h-4 w-4" />,
    <List key="list" className="h-4 w-4" />,
    <ListOrdered key="ordered" className="h-4 w-4" />,
    <AlignLeft key="left" className="h-4 w-4" />,
    <AlignCenter key="center" className="h-4 w-4" />,
    <AlignRight key="right" className="h-4 w-4" />,
    <AlignJustify key="justify" className="h-4 w-4" />,
    <Reply key="reply" className="h-4 w-4" />,
    <FileUp key="file" className="h-4 w-4" />,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(31,37,44,0.55)] px-4 py-8">
      <div className="w-full max-w-[900px] overflow-hidden rounded-[4px] border border-[#c7d2de] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-center justify-between border-b border-[#d7e0ea] bg-[#f7f9fb] px-4 py-3">
          <h3 className="text-[18px] font-semibold text-[#3b454e]">Nuevo Ticket</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-[#6a7177]"
            {...controlA11yProps('Cerrar Nuevo Ticket')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4 py-10 text-[#51687f]">
            <RefreshCw className="h-10 w-10 animate-spin" />
            <div className="text-[16px] font-semibold text-[#334b63]">Cargando ticket...</div>
          </div>
        ) : (
          <>
            <div className="space-y-4 px-4 py-4">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-[13px] text-[#4a5562]">
                    Cliente
                    <select
                      value={values.client}
                      onChange={(event) => onFieldChange('client', event.target.value)}
                      className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                      {...controlA11yProps('Cliente del ticket')}
                    >
                      <option>Cliente Mikrowisp</option>
                    </select>
                  </label>
                  <label className="block text-[13px] text-[#4a5562]">
                    Técnico
                    <select
                      value={values.technician}
                      onChange={(event) => onFieldChange('technician', event.target.value)}
                      className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                      {...controlA11yProps('Tecnico del ticket')}
                    >
                      <option>Sin asignar</option>
                      <option>Soporte 1</option>
                      <option>Soporte 2</option>
                    </select>
                  </label>
                  <label className="block text-[13px] text-[#4a5562]">
                    Nombre solicitante
                    <input
                      value={values.applicantName}
                      onChange={(event) => onFieldChange('applicantName', event.target.value)}
                      className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                      {...controlA11yProps('Nombre solicitante')}
                    />
                  </label>
                  <label className="block text-[13px] text-[#4a5562]">
                    Agendado desde
                    <select
                      value={values.scheduledFrom}
                      onChange={(event) => onFieldChange('scheduledFrom', event.target.value)}
                      className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                      {...controlA11yProps('Agendado desde')}
                    >
                      <option>Oficina</option>
                      <option>Portal cliente</option>
                      <option>Call center</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block text-[13px] text-[#4a5562]">
                    Departamento
                    <select
                      value={values.department}
                      onChange={(event) => onFieldChange('department', event.target.value)}
                      className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                      {...controlA11yProps('Departamento del ticket')}
                    >
                      <option>Soporte técnico</option>
                      <option>Ventas</option>
                    </select>
                  </label>
                  <label className="block text-[13px] text-[#4a5562]">
                    Asunto del ticket
                    <input
                      value={values.subject}
                      onChange={(event) => onFieldChange('subject', event.target.value)}
                      className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                      {...controlA11yProps('Asunto del ticket')}
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
                    <label className="block text-[13px] text-[#4a5562]">
                      Fecha visita
                      <input
                        value={values.visitDate}
                        onChange={(event) => onFieldChange('visitDate', sanitizeDateLikeValue(event.target.value))}
                        className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                        {...controlA11yProps('Fecha visita')}
                      />
                    </label>
                    <label className="block text-[13px] text-[#4a5562]">
                      Turno
                      <select
                        value={values.shift}
                        onChange={(event) => onFieldChange('shift', event.target.value)}
                        className="mt-2 h-8 w-full rounded border border-[#cfd7e2] px-3 text-[14px] text-[#334b63] outline-none"
                        {...controlA11yProps('Turno de visita')}
                      >
                        <option>Turno tarde</option>
                        <option>Turno mañana</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-[13px] text-[#4a5562]">Enviar email al cliente</span>
                <button
                  type="button"
                  onClick={() => onFieldChange('sendEmail', !values.sendEmail)}
                  className={`relative h-7 w-[46px] rounded-full transition ${values.sendEmail ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                  {...controlA11yProps('Enviar email al cliente')}
                >
                  <span
                    className={`absolute top-[2px] h-6 w-6 rounded-full bg-white transition ${values.sendEmail ? 'left-[20px]' : 'left-[2px]'}`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-[13px] text-[#4a5562]">Archivo Adjunto</label>
                <div className="mt-2 flex items-center gap-3 text-[13px] text-[#4a5562]">
                  <label className="inline-flex h-8 cursor-pointer items-center rounded border border-[#cfd7e2] bg-white px-3 text-[13px] text-[#334b63]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) =>
                        onFieldChange('attachmentName', event.target.files?.[0]?.name || '')
                      }
                    />
                    Choose File
                  </label>
                  <span>{values.attachmentName || 'No file chosen'}</span>
                </div>
              </div>

              <div className="rounded border border-[#d7e0ea] bg-white">
                <div className="flex flex-wrap items-center gap-1 border-b border-[#d7e0ea] bg-[#f5f7fa] px-3 py-2">
                  <button type="button" className="inline-flex h-8 items-center gap-2 rounded border border-[#cfd7e2] bg-white px-3 text-[13px] text-[#334b63]" {...controlA11yProps('Formato texto normal')}>
                    A Texto normal
                  </button>
                  {toolbarButtons.map((icon, index) => (
                    <button
                      key={`ticket-toolbar-${index}`}
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#334b63]"
                      {...controlA11yProps(`Herramienta del editor ${index + 1}`)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <textarea
                  value={values.detail}
                  onChange={(event) => onFieldChange('detail', event.target.value)}
                  className="min-h-[180px] w-full resize-none px-4 py-3 text-[14px] text-[#334b63] outline-none"
                  placeholder="Ingrese detalles del ticket"
                  {...controlA11yProps('Detalle del ticket')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#d7e0ea] px-4 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center rounded border border-[#cfd7e2] bg-white px-4 text-[14px] text-[#334b63]"
                {...controlA11yProps('Cerrar nuevo ticket')}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-10 items-center rounded bg-[#2f93e4] px-4 text-[14px] font-semibold text-white"
                {...controlA11yProps('Abrir ticket')}
              >
                Abrir ticket
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TimelineCard({ colorClassName, title, detail }: TimelineCardProps) {
  return (
    <div className={`rounded px-4 py-3 text-[12px] text-white ${colorClassName}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-white/90">{detail}</div>
    </div>
  );
}

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const initialDraft = useMemo(() => {
    if (isEditing && id) {
      return getClientWorkspace(id);
    }

    return createEmptyClientWorkspace(user?.companyId ?? 'comp1');
  }, [id, isEditing, user?.companyId]);

  const [draft, setDraft] = useState<ClientWorkspaceData | null>(initialDraft);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ClientMainTab>('summary');
  const [activeBillingTab, setActiveBillingTab] = useState<BillingDetailTab>('invoices');
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const billingColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const billingExportMenuRef = useRef<HTMLDivElement | null>(null);
  const [billingPageSize, setBillingPageSize] = useState(15);
  const [billingCurrentPage, setBillingCurrentPage] = useState(1);
  const [billingSearchTerm, setBillingSearchTerm] = useState('');
  const [billingColumnMenuOpen, setBillingColumnMenuOpen] = useState(false);
  const [billingExportMenuOpen, setBillingExportMenuOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState<'free' | 'service' | null>(null);
  const [billingDialogLoading, setBillingDialogLoading] = useState(false);
  const billingDialogTimerRef = useRef<number | null>(null);
  const ticketColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const ticketDialogTimerRef = useRef<number | null>(null);
  const contractColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const contractExportMenuRef = useRef<HTMLDivElement | null>(null);
  const pdfDocumentColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const pdfDocumentExportMenuRef = useRef<HTMLDivElement | null>(null);
  const statisticsHistoryColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const statisticsHistoryExportMenuRef = useRef<HTMLDivElement | null>(null);
  const logColumnMenuRef = useRef<HTMLDivElement | null>(null);
  const logExportMenuRef = useRef<HTMLDivElement | null>(null);
  const [clientInvoiceRows, setClientInvoiceRows] = useState<ClientInvoiceRow[]>(billingInvoiceRows);
  const [ticketRows, setTicketRows] = useState<ClientTicketRow[]>(ticketRowsSeed);
  const [contractRows] = useState<ClientContractRow[]>(contractRowsSeed);
  const [pdfDocumentRows] = useState<ClientPdfDocumentRow[]>(pdfDocumentRowsSeed);
  const [statisticsHistoryRows] = useState<ClientStatisticsHistoryRow[]>(statisticsHistoryRowsSeed);
  const [ticketPageSize, setTicketPageSize] = useState(15);
  const [ticketCurrentPage, setTicketCurrentPage] = useState(1);
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketColumnMenuOpen, setTicketColumnMenuOpen] = useState(false);
  const [ticketVisibleColumnKeys, setTicketVisibleColumnKeys] = useState<string[]>(
    ticketColumns.map((column) => column.key),
  );
  const [contractPageSize, setContractPageSize] = useState(15);
  const [contractCurrentPage, setContractCurrentPage] = useState(1);
  const [contractSearchTerm, setContractSearchTerm] = useState('');
  const [contractColumnMenuOpen, setContractColumnMenuOpen] = useState(false);
  const [contractVisibleColumnKeys, setContractVisibleColumnKeys] = useState<string[]>(
    contractColumns.map((column) => column.key),
  );
  const [pdfDocumentPageSize, setPdfDocumentPageSize] = useState(15);
  const [pdfDocumentCurrentPage, setPdfDocumentCurrentPage] = useState(1);
  const [pdfDocumentSearchTerm, setPdfDocumentSearchTerm] = useState('');
  const [pdfDocumentColumnMenuOpen, setPdfDocumentColumnMenuOpen] = useState(false);
  const [pdfDocumentVisibleColumnKeys, setPdfDocumentVisibleColumnKeys] = useState<string[]>(
    pdfDocumentColumns.map((column) => column.key),
  );
  const [statisticsHistoryPageSize, setStatisticsHistoryPageSize] = useState(15);
  const [statisticsHistoryCurrentPage, setStatisticsHistoryCurrentPage] = useState(1);
  const [statisticsHistorySearchTerm, setStatisticsHistorySearchTerm] = useState('');
  const [statisticsHistoryColumnMenuOpen, setStatisticsHistoryColumnMenuOpen] = useState(false);
  const [statisticsHistoryVisibleColumnKeys, setStatisticsHistoryVisibleColumnKeys] = useState<string[]>(
    statisticsHistoryColumns.map((column) => column.key),
  );
  const [logPageSize, setLogPageSize] = useState(15);
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logColumnMenuOpen, setLogColumnMenuOpen] = useState(false);
  const [logVisibleColumnKeys, setLogVisibleColumnKeys] = useState<string[]>(
    clientLogColumns.map((column) => column.key),
  );
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketDialogLoading, setTicketDialogLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketFormState>({
    client: 'Cliente Mikrowisp',
    department: 'Soporte técnico',
    technician: 'Sin asignar',
    subject: '',
    applicantName: '',
    visitDate: formatDate(new Date()),
    shift: 'Turno tarde',
    scheduledFrom: 'Oficina',
    sendEmail: true,
    attachmentName: '',
    detail: '',
  });
  const [invoiceVisibleColumnKeys, setInvoiceVisibleColumnKeys] = useState<string[]>(
    billingInvoiceColumns.map((column) => column.key),
  );
  const [transactionVisibleColumnKeys, setTransactionVisibleColumnKeys] = useState<string[]>(
    billingTransactionColumns.map((column) => column.key),
  );
  const [balanceVisibleColumnKeys, setBalanceVisibleColumnKeys] = useState<string[]>(
    billingBalanceColumns.map((column) => column.key),
  );
  const [freeInvoiceDueDate, setFreeInvoiceDueDate] = useState(formatDate(new Date()));
  const [freeInvoiceIssueDate, setFreeInvoiceIssueDate] = useState(formatDate(new Date()));
  const [freeInvoiceLines, setFreeInvoiceLines] = useState<BillingInvoiceLineForm[]>([
    createInvoiceLine('free-1'),
  ]);
  const [serviceInvoiceDueDate, setServiceInvoiceDueDate] = useState(formatDate(addMonths(new Date(), 4)));
  const [serviceInvoiceIssueDate, setServiceInvoiceIssueDate] = useState(formatDate(new Date()));
  const [serviceInvoiceLines, setServiceInvoiceLines] = useState<BillingInvoiceLineForm[]>([
    createInvoiceLine('service-1', '2/300k', '500', '0', '1'),
    createInvoiceLine('service-2', 'Internet de 3Mbps', '1', '18', '1'),
  ]);

  useEffect(() => {
    if (isEditing && id && !initialDraft) {
      toast.error('No se encontro el cliente solicitado');
      navigate('/clients', { replace: true });
    }
  }, [id, initialDraft, isEditing, navigate]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (billingColumnMenuRef.current && !billingColumnMenuRef.current.contains(target)) {
        setBillingColumnMenuOpen(false);
      }

      if (billingExportMenuRef.current && !billingExportMenuRef.current.contains(target)) {
        setBillingExportMenuOpen(false);
      }

      if (ticketColumnMenuRef.current && !ticketColumnMenuRef.current.contains(target)) {
        setTicketColumnMenuOpen(false);
      }

      if (contractColumnMenuRef.current && !contractColumnMenuRef.current.contains(target)) {
        setContractColumnMenuOpen(false);
      }

      if (pdfDocumentColumnMenuRef.current && !pdfDocumentColumnMenuRef.current.contains(target)) {
        setPdfDocumentColumnMenuOpen(false);
      }

      if (
        statisticsHistoryColumnMenuRef.current &&
        !statisticsHistoryColumnMenuRef.current.contains(target)
      ) {
        setStatisticsHistoryColumnMenuOpen(false);
      }

      if (logColumnMenuRef.current && !logColumnMenuRef.current.contains(target)) {
        setLogColumnMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [
    contractColumnMenuRef,
    logColumnMenuRef,
    pdfDocumentColumnMenuRef,
    statisticsHistoryColumnMenuRef,
    ticketColumnMenuRef,
  ]);

  useEffect(() => {
    return () => {
      if (billingDialogTimerRef.current) {
        window.clearTimeout(billingDialogTimerRef.current);
      }

      if (ticketDialogTimerRef.current) {
        window.clearTimeout(ticketDialogTimerRef.current);
      }
    };
  }, []);

  const schedule = useMemo(() => {
    if (!draft) {
      return null;
    }

    return getNotificationTimeline(draft.billing, draft.notifications);
  }, [draft]);

  const filteredInvoiceRows = useMemo(
    () => filterBillingRows(clientInvoiceRows, billingInvoiceColumns, billingSearchTerm),
    [billingSearchTerm, clientInvoiceRows],
  );
  const filteredTransactionRows = useMemo(
    () => filterBillingRows(billingTransactionRows, billingTransactionColumns, billingSearchTerm),
    [billingSearchTerm],
  );
  const filteredBalanceRows = useMemo(
    () => filterBillingRows(billingBalanceRows, billingBalanceColumns, billingSearchTerm),
    [billingSearchTerm],
  );

  const activeBillingColumns = useMemo(() => {
    switch (activeBillingTab) {
      case 'transactions':
        return billingTransactionColumns;
      case 'balances':
        return billingBalanceColumns;
      case 'config':
        return [] as BillingTableColumn<never>[];
      case 'invoices':
      default:
        return billingInvoiceColumns;
    }
  }, [activeBillingTab]);

  const activeBillingVisibleColumnKeys = useMemo(() => {
    switch (activeBillingTab) {
      case 'transactions':
        return transactionVisibleColumnKeys;
      case 'balances':
        return balanceVisibleColumnKeys;
      case 'config':
        return [];
      case 'invoices':
      default:
        return invoiceVisibleColumnKeys;
    }
  }, [activeBillingTab, balanceVisibleColumnKeys, invoiceVisibleColumnKeys, transactionVisibleColumnKeys]);

  const activeBillingRows = useMemo(() => {
    switch (activeBillingTab) {
      case 'transactions':
        return filteredTransactionRows;
      case 'balances':
        return filteredBalanceRows;
      case 'config':
        return [] as never[];
      case 'invoices':
      default:
        return filteredInvoiceRows;
    }
  }, [activeBillingTab, filteredBalanceRows, filteredInvoiceRows, filteredTransactionRows]);

  const activeBillingVisibleColumns = useMemo(() => {
    const filtered = activeBillingColumns.filter((column) =>
      activeBillingVisibleColumnKeys.includes(column.key),
    );

    return filtered.length > 0 ? filtered : activeBillingColumns;
  }, [activeBillingColumns, activeBillingVisibleColumnKeys]);

  const billingTotalPages = Math.max(1, Math.ceil(activeBillingRows.length / billingPageSize));
  const safeBillingCurrentPage = Math.min(billingCurrentPage, billingTotalPages);
  const paginatedBillingRows = useMemo(() => {
    const startIndex = (safeBillingCurrentPage - 1) * billingPageSize;
    return activeBillingRows.slice(startIndex, startIndex + billingPageSize);
  }, [activeBillingRows, billingPageSize, safeBillingCurrentPage]);

  const billingSummary =
    activeBillingRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeBillingCurrentPage - 1) * billingPageSize + 1} al ${Math.min(
          safeBillingCurrentPage * billingPageSize,
          activeBillingRows.length,
        )} de un total de ${activeBillingRows.length}`;

  const billingExportHeaders = activeBillingVisibleColumns.map((column) => column.header);
  const billingExportRows = activeBillingRows.map((row) =>
    Object.fromEntries(
      activeBillingVisibleColumns.map((column) => [column.header, column.searchValue(row)]),
    ),
  );

  const freeInvoiceTotals = useMemo(() => {
    return freeInvoiceLines.reduce(
      (accumulator, line) => {
        const lineTotals = calculateInvoiceLineTotals(line);
        return {
          subtotal: accumulator.subtotal + lineTotals.subtotal,
          tax: accumulator.tax + lineTotals.tax,
          total: accumulator.total + lineTotals.total,
        };
      },
      { subtotal: 0, tax: 0, total: 0 },
    );
  }, [freeInvoiceLines]);

  const serviceInvoiceTotals = useMemo(() => {
    return serviceInvoiceLines.reduce(
      (accumulator, line) => {
        const lineTotals = calculateInvoiceLineTotals(line);
        return {
          subtotal: accumulator.subtotal + lineTotals.subtotal,
          tax: accumulator.tax + lineTotals.tax,
          total: accumulator.total + lineTotals.total,
        };
      },
      { subtotal: 0, tax: 0, total: 0 },
    );
  }, [serviceInvoiceLines]);

  const filteredTicketRows = useMemo(
    () => filterBillingRows(ticketRows, ticketColumns, ticketSearchTerm),
    [ticketRows, ticketSearchTerm],
  );

  const ticketTotalPages = Math.max(1, Math.ceil(filteredTicketRows.length / ticketPageSize));
  const safeTicketCurrentPage = Math.min(ticketCurrentPage, ticketTotalPages);
  const paginatedTicketRows = useMemo(() => {
    const startIndex = (safeTicketCurrentPage - 1) * ticketPageSize;
    return filteredTicketRows.slice(startIndex, startIndex + ticketPageSize);
  }, [filteredTicketRows, safeTicketCurrentPage, ticketPageSize]);

  const ticketSummary =
    filteredTicketRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeTicketCurrentPage - 1) * ticketPageSize + 1} al ${Math.min(
          safeTicketCurrentPage * ticketPageSize,
          filteredTicketRows.length,
        )} de un total de ${filteredTicketRows.length}`;

  const filteredContractRows = useMemo(
    () => filterBillingRows(contractRows, contractColumns, contractSearchTerm),
    [contractRows, contractSearchTerm],
  );
  const contractTotalPages = Math.max(1, Math.ceil(filteredContractRows.length / contractPageSize));
  const safeContractCurrentPage = Math.min(contractCurrentPage, contractTotalPages);
  const paginatedContractRows = useMemo(() => {
    const startIndex = (safeContractCurrentPage - 1) * contractPageSize;
    return filteredContractRows.slice(startIndex, startIndex + contractPageSize);
  }, [contractPageSize, filteredContractRows, safeContractCurrentPage]);
  const contractSummary =
    filteredContractRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeContractCurrentPage - 1) * contractPageSize + 1} al ${Math.min(
          safeContractCurrentPage * contractPageSize,
          filteredContractRows.length,
        )} de un total de ${filteredContractRows.length}`;

  const filteredPdfDocumentRows = useMemo(
    () => filterBillingRows(pdfDocumentRows, pdfDocumentColumns, pdfDocumentSearchTerm),
    [pdfDocumentRows, pdfDocumentSearchTerm],
  );
  const pdfDocumentTotalPages = Math.max(
    1,
    Math.ceil(filteredPdfDocumentRows.length / pdfDocumentPageSize),
  );
  const safePdfDocumentCurrentPage = Math.min(pdfDocumentCurrentPage, pdfDocumentTotalPages);
  const paginatedPdfDocumentRows = useMemo(() => {
    const startIndex = (safePdfDocumentCurrentPage - 1) * pdfDocumentPageSize;
    return filteredPdfDocumentRows.slice(startIndex, startIndex + pdfDocumentPageSize);
  }, [filteredPdfDocumentRows, pdfDocumentPageSize, safePdfDocumentCurrentPage]);
  const pdfDocumentSummary =
    filteredPdfDocumentRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safePdfDocumentCurrentPage - 1) * pdfDocumentPageSize + 1} al ${Math.min(
          safePdfDocumentCurrentPage * pdfDocumentPageSize,
          filteredPdfDocumentRows.length,
        )} de un total de ${filteredPdfDocumentRows.length}`;

  const filteredStatisticsHistoryRows = useMemo(
    () =>
      filterBillingRows(
        statisticsHistoryRows,
        statisticsHistoryColumns,
        statisticsHistorySearchTerm,
      ),
    [statisticsHistoryRows, statisticsHistorySearchTerm],
  );
  const statisticsHistoryTotalPages = Math.max(
    1,
    Math.ceil(filteredStatisticsHistoryRows.length / statisticsHistoryPageSize),
  );
  const safeStatisticsHistoryCurrentPage = Math.min(
    statisticsHistoryCurrentPage,
    statisticsHistoryTotalPages,
  );
  const paginatedStatisticsHistoryRows = useMemo(() => {
    const startIndex = (safeStatisticsHistoryCurrentPage - 1) * statisticsHistoryPageSize;
    return filteredStatisticsHistoryRows.slice(
      startIndex,
      startIndex + statisticsHistoryPageSize,
    );
  }, [
    filteredStatisticsHistoryRows,
    safeStatisticsHistoryCurrentPage,
    statisticsHistoryPageSize,
  ]);
  const statisticsHistorySummary =
    filteredStatisticsHistoryRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeStatisticsHistoryCurrentPage - 1) * statisticsHistoryPageSize + 1} al ${Math.min(
          safeStatisticsHistoryCurrentPage * statisticsHistoryPageSize,
          filteredStatisticsHistoryRows.length,
        )} de un total de ${filteredStatisticsHistoryRows.length}`;

  const clientLogRows = useMemo<ClientLogTableRow[]>(
    () =>
      (draft?.log ?? []).map((entry) => ({
        id: entry.id,
        date: entry.date,
        detail: entry.detail,
        changes: 'Sin cambios registrados',
        operator: entry.operator,
      })),
    [draft?.log],
  );
  const filteredLogRows = useMemo(
    () => filterBillingRows(clientLogRows, clientLogColumns, logSearchTerm),
    [clientLogRows, logSearchTerm],
  );
  const logTotalPages = Math.max(1, Math.ceil(filteredLogRows.length / logPageSize));
  const safeLogCurrentPage = Math.min(logCurrentPage, logTotalPages);
  const paginatedLogRows = useMemo(() => {
    const startIndex = (safeLogCurrentPage - 1) * logPageSize;
    return filteredLogRows.slice(startIndex, startIndex + logPageSize);
  }, [filteredLogRows, logPageSize, safeLogCurrentPage]);
  const logSummary =
    filteredLogRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de ${(safeLogCurrentPage - 1) * logPageSize + 1} al ${Math.min(
          safeLogCurrentPage * logPageSize,
          filteredLogRows.length,
        )} de un total de ${filteredLogRows.length}`;

  function updatePersonalField<Field extends keyof ClientWorkspaceData['personal']>(
    field: Field,
    value: ClientWorkspaceData['personal'][Field],
  ) {
    const nextValue =
      typeof value === 'string' && field === 'fullName'
        ? sanitizeLettersValue(value)
        : value;

    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            personal: {
              ...currentDraft.personal,
              [field]: nextValue,
            },
          }
        : currentDraft,
    );
  }

  function updatePersonalNumericField(
    field: 'clientCode' | 'identification' | 'landlinePhone' | 'mobilePhone',
    value: string,
  ) {
    updatePersonalField(field, sanitizeNumericValue(value));
  }

  function updateBillingField<Field extends keyof ClientBillingSettings>(
    field: Field,
    value: ClientBillingSettings[Field],
  ) {
    const nextValue =
      typeof value === 'string' &&
      (field === 'fixedDate' || field === 'fixedCutoffDate')
        ? sanitizeDateLikeValue(value)
        : value;

    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            billing: {
              ...currentDraft.billing,
              [field]: nextValue,
            },
          }
        : currentDraft,
    );
  }

  function updateNotificationField<Field extends keyof ClientNotificationSettings>(
    field: Field,
    value: ClientNotificationSettings[Field],
  ) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            notifications: {
              ...currentDraft.notifications,
              [field]: value,
            },
          }
        : currentDraft,
    );
  }

  function updateServiceField<Field extends keyof ClientServiceSetup>(
    field: Field,
    value: ClientServiceSetup[Field],
  ) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            services: {
              ...currentDraft.services,
              [field]: value,
            },
          }
        : currentDraft,
    );
  }

  function getStepValidationErrors(
    stepId: WizardStepId,
    currentDraft: ClientWorkspaceData,
  ) {
    if (stepId === 'personal') {
      const missingFields: string[] = [];

      if (!currentDraft.personal.identification.trim()) {
        missingFields.push('N° Identificación');
      }
      if (!currentDraft.personal.fullName.trim()) {
        missingFields.push('Nombre Completo');
      }
      if (!currentDraft.personal.primaryAddress.trim()) {
        missingFields.push('Dirección principal');
      }
      if (!currentDraft.personal.location.trim()) {
        missingFields.push('Ubicación');
      }
      if (!currentDraft.personal.landlinePhone.trim()) {
        missingFields.push('Teléfono fijo');
      }
      if (!currentDraft.personal.mobilePhone.trim()) {
        missingFields.push('Teléfono móvil');
      }
      if (!currentDraft.personal.email.trim()) {
        missingFields.push('E-mail');
      }

      return missingFields;
    }

    if (stepId === 'billing') {
      const missingFields: string[] = [];

      if (!currentDraft.billing.type.trim()) {
        missingFields.push('Tipo de facturación');
      }
      if (!currentDraft.billing.paymentDay.trim()) {
        missingFields.push('Día de pago');
      }
      if (!currentDraft.billing.createInvoice.trim()) {
        missingFields.push('Crear factura');
      }
      if (!currentDraft.billing.taxType.trim()) {
        missingFields.push('Tipo impuesto');
      }
      if (!currentDraft.billing.graceDays.trim()) {
        missingFields.push('Días de gracia');
      }
      if (!currentDraft.billing.applyCutoff.trim()) {
        missingFields.push('Aplicar corte');
      }
      if (!currentDraft.notifications.newInvoiceNotice.trim()) {
        missingFields.push('Aviso nueva factura');
      }
      if (!currentDraft.notifications.screenNotice.trim()) {
        missingFields.push('Aviso en pantalla');
      }
      if (!currentDraft.notifications.remindersChannel.trim()) {
        missingFields.push('Recordatorios de pago');
      }

      return missingFields;
    }

    if (stepId === 'services') {
      const missingFields: string[] = [];

      if (!currentDraft.services.router.trim()) {
        missingFields.push('Router');
      }

      return missingFields;
    }

    return [];
  }

  function showStepValidationError(stepId: WizardStepId, errors: string[]) {
    if (errors.length === 0) {
      return;
    }

    const stepTitle = wizardSteps.find((step) => step.id === stepId)?.title ?? 'la etapa actual';
    toast.error(`Completa los campos obligatorios de ${stepTitle}: ${errors.join(', ')}`);
  }

  function validateStep(stepId: WizardStepId, currentDraft: ClientWorkspaceData) {
    const errors = getStepValidationErrors(stepId, currentDraft);

    if (errors.length > 0) {
      showStepValidationError(stepId, errors);
      return false;
    }

    return true;
  }

  function handleStepChange(nextStepIndex: number) {
    if (!draft) {
      return;
    }

    if (nextStepIndex <= activeStepIndex) {
      setActiveStepIndex(nextStepIndex);
      return;
    }

    for (let index = 0; index < nextStepIndex; index += 1) {
      const step = wizardSteps[index];
      if (!validateStep(step.id, draft)) {
        setActiveStepIndex(index);
        return;
      }
    }

    setActiveStepIndex(nextStepIndex);
  }

  function handleGoNext() {
    if (!draft) {
      return;
    }

    const currentStep = wizardSteps[activeStepIndex];
    if (!validateStep(currentStep.id, draft)) {
      return;
    }

    setActiveStepIndex((currentStepIndex) =>
      Math.min(currentStepIndex + 1, wizardSteps.length - 1),
    );
  }

  function handleRegisterClient() {
    if (!draft) {
      return;
    }

    for (let index = 0; index < wizardSteps.length; index += 1) {
      const step = wizardSteps[index];
      if (!validateStep(step.id, draft)) {
        setActiveStepIndex(index);
        return;
      }
    }

    const registeredClient = ensureClientRegistration(
      draft,
      user?.name ?? 'admin',
    );
    setDraft(registeredClient);
    toast.success('Cliente registrado correctamente');
    navigate(`/clients/${registeredClient.id}/edit`, {
      replace: true,
    });
  }

  function handleSavePersonalChanges() {
    if (!draft) {
      return;
    }

    const nextRecord = appendClientLog(
      draft,
      `Datos del cliente actualizados para ${draft.personal.fullName}`,
      user?.name ?? 'admin',
    );
    setDraft(nextRecord);
    toast.success('Datos guardados');
  }

  function handleSaveBillingChanges() {
    if (!draft) {
      return;
    }

    const nextRecord = appendClientLog(
      draft,
      `Configuracion de facturacion actualizada para ${draft.personal.fullName}`,
      user?.name ?? 'admin',
    );
    setDraft(nextRecord);
    toast.success('Configuracion guardada');
  }

  function toggleActiveBillingColumn(columnKey: string) {
    if (activeBillingTab === 'transactions') {
      setTransactionVisibleColumnKeys((current) =>
        toggleBillingColumnKey(current, columnKey),
      );
      return;
    }

    if (activeBillingTab === 'balances') {
      setBalanceVisibleColumnKeys((current) =>
        toggleBillingColumnKey(current, columnKey),
      );
      return;
    }

    setInvoiceVisibleColumnKeys((current) => toggleBillingColumnKey(current, columnKey));
  }

  function getBillingExportTitle() {
    switch (activeBillingTab) {
      case 'transactions':
        return 'Transacciones del cliente';
      case 'balances':
        return 'Saldos del cliente';
      case 'invoices':
      default:
        return 'Facturas del cliente';
    }
  }

  function getBillingExportFilename(extension: string) {
    const tabKey =
      activeBillingTab === 'transactions'
        ? 'transacciones'
        : activeBillingTab === 'balances'
          ? 'saldos'
          : 'facturas';

    return `cliente-${draft?.personal.clientCode || '000000'}-${tabKey}.${extension}`;
  }

  function handleBillingPrint() {
    openBillingPrintPreview(
      getBillingExportTitle(),
      billingExportRows,
      billingExportHeaders,
    );
    setBillingExportMenuOpen(false);
  }

  function handleBillingExportCsv() {
    exportBillingRowsToCsv(
      getBillingExportFilename('csv'),
      billingExportRows,
      billingExportHeaders,
    );
    setBillingExportMenuOpen(false);
  }

  function handleBillingExportExcel() {
    exportBillingRowsToExcel(
      getBillingExportFilename('xls'),
      getBillingExportTitle(),
      billingExportRows,
      billingExportHeaders,
    );
    setBillingExportMenuOpen(false);
  }

  function handleBillingExportPdf() {
    openBillingPrintPreview(
      `${getBillingExportTitle()} - PDF`,
      billingExportRows,
      billingExportHeaders,
      true,
    );
    setBillingExportMenuOpen(false);
  }

  function handleFreeInvoiceLineChange(
    lineId: string,
    field: keyof Omit<BillingInvoiceLineForm, 'id'>,
    value: string,
  ) {
    setFreeInvoiceLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, [field]: value } : line)),
    );
  }

  function handleServiceInvoiceLineChange(
    lineId: string,
    field: keyof Omit<BillingInvoiceLineForm, 'id'>,
    value: string,
  ) {
    setServiceInvoiceLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, [field]: value } : line)),
    );
  }

  function appendInvoiceRow(
    invoiceType: string,
    dueDate: string,
    issuedAt: string,
    totals: { tax: number; total: number },
  ) {
    setClientInvoiceRows((current) => [
      {
        invoiceNumber: getNextInvoiceNumber(current),
        fiscalNumber: getNextFiscalNumber(current),
        issuedAt,
        dueAt: dueDate,
        status: 'PENDIENTE',
        total: formatBs(totals.total),
        tax: formatBs(totals.tax),
        invoiceType,
        paid: 'Bs. 0,00',
        paidAt: '00/00/0000',
        paymentMethod: '',
        actionSet: 'pending',
      },
      ...current,
    ]);
    setBillingCurrentPage(1);
  }

  function openBillingDialogWithReload(dialog: 'free' | 'service') {
    if (billingDialogTimerRef.current) {
      window.clearTimeout(billingDialogTimerRef.current);
      billingDialogTimerRef.current = null;
    }

    setBillingDialogOpen(dialog);
    setBillingDialogLoading(true);
    billingDialogTimerRef.current = window.setTimeout(() => {
      setBillingDialogLoading(false);
      billingDialogTimerRef.current = null;
    }, 450);
  }

  function closeBillingDialog() {
    if (billingDialogTimerRef.current) {
      window.clearTimeout(billingDialogTimerRef.current);
      billingDialogTimerRef.current = null;
    }

    setBillingDialogLoading(false);
    setBillingDialogOpen(null);
  }

  function handleCreateFreeInvoice() {
    setFreeInvoiceDueDate(formatDate(new Date()));
    setFreeInvoiceIssueDate(formatDate(new Date()));
    setFreeInvoiceLines([createInvoiceLine(`free-${Date.now()}`)]);
    openBillingDialogWithReload('free');
  }

  function handleCreateServiceInvoice() {
    setServiceInvoiceDueDate(formatDate(addMonths(new Date(), 4)));
    setServiceInvoiceIssueDate(formatDate(new Date()));
    setServiceInvoiceLines([
      createInvoiceLine(`service-${Date.now()}-1`, '2/300k', '500', '0', '1'),
      createInvoiceLine(`service-${Date.now()}-2`, 'Internet de 3Mbps', '1', '18', '1'),
    ]);
    openBillingDialogWithReload('service');
  }

  function handleAddFreeInvoiceLine() {
    setFreeInvoiceLines((current) => [...current, createInvoiceLine(`free-${Date.now()}-${current.length + 1}`)]);
  }

  function handleAddServiceInvoiceLine() {
    setServiceInvoiceLines((current) => [
      ...current,
      createInvoiceLine(`service-${Date.now()}-${current.length + 1}`),
    ]);
  }

  function handleAddInvoiceProducts() {
    toast.success('Selector de productos pendiente de conectar');
  }

  function handleAddBalance() {
    toast.success('Agregar saldo listo para captura');
  }

  function toggleTicketColumn(columnKey: string) {
    setTicketVisibleColumnKeys((current) => toggleBillingColumnKey(current, columnKey));
  }

  function toggleContractColumn(columnKey: string) {
    setContractVisibleColumnKeys((current) => toggleBillingColumnKey(current, columnKey));
  }

  function togglePdfDocumentColumn(columnKey: string) {
    setPdfDocumentVisibleColumnKeys((current) => toggleBillingColumnKey(current, columnKey));
  }

  function toggleStatisticsHistoryColumn(columnKey: string) {
    setStatisticsHistoryVisibleColumnKeys((current) =>
      toggleBillingColumnKey(current, columnKey),
    );
  }

  function toggleLogColumn(columnKey: string) {
    setLogVisibleColumnKeys((current) => toggleBillingColumnKey(current, columnKey));
  }

  function handleCreateContract() {
    toast.success('Nuevo contrato listo para captura');
  }

  function handleCreatePdfDocument() {
    toast.success('Nuevo documento listo para captura');
  }

  function handleAddClientNote() {
    toast.success('Nueva nota lista para captura');
  }

  function handleOpenVisitedSites() {
    toast.success('Sitios visitados de hoy listos para consulta');
  }

  function updateTicketFormField<Field extends keyof TicketFormState>(
    field: Field,
    value: TicketFormState[Field],
  ) {
    setTicketForm((current) => ({ ...current, [field]: value }));
  }

  function openTicketDialogWithReload() {
    if (ticketDialogTimerRef.current) {
      window.clearTimeout(ticketDialogTimerRef.current);
      ticketDialogTimerRef.current = null;
    }

    setTicketDialogOpen(true);
    setTicketDialogLoading(true);
    ticketDialogTimerRef.current = window.setTimeout(() => {
      setTicketDialogLoading(false);
      ticketDialogTimerRef.current = null;
    }, 450);
  }

  function closeTicketDialog() {
    if (ticketDialogTimerRef.current) {
      window.clearTimeout(ticketDialogTimerRef.current);
      ticketDialogTimerRef.current = null;
    }

    setTicketDialogLoading(false);
    setTicketDialogOpen(false);
  }

  function handleCreateTicket() {
    setTicketForm({
      client: draft?.personal.fullName || 'Cliente Mikrowisp',
      department: 'Soporte técnico',
      technician: 'Sin asignar',
      subject: '',
      applicantName: '',
      visitDate: formatDate(new Date()),
      shift: 'Turno tarde',
      scheduledFrom: 'Oficina',
      sendEmail: true,
      attachmentName: '',
      detail: '',
    });
    openTicketDialogWithReload();
  }

  function handleSubmitTicket() {
    if (!ticketForm.subject.trim()) {
      toast.error('Completa el asunto del ticket');
      return;
    }

    setTicketRows((current) => [
      {
        number: String(
          current.reduce((max, row) => Math.max(max, Number.parseInt(row.number, 10) || 0), 0) + 1,
        ).padStart(7, '0'),
        department: ticketForm.department.toUpperCase(),
        subject: ticketForm.subject.trim(),
        technician: ticketForm.technician,
        date: ticketForm.visitDate,
        status: 'ABIERTO',
        openedBy: user?.name?.toLowerCase() || 'admin',
        lastReply: 'Ahora mismo',
        actionSet: 'open',
      },
      ...current,
    ]);
    setTicketCurrentPage(1);
    closeTicketDialog();
    toast.success('Ticket creado');
  }

  function handleRemoveServiceInvoiceLine(lineId: string) {
    setServiceInvoiceLines((current) =>
      current.length === 1 ? current : current.filter((line) => line.id !== lineId),
    );
  }

  function handleSubmitFreeInvoice() {
    const hasDescription = freeInvoiceLines.some((line) => line.description.trim());
    if (!hasDescription) {
      toast.error('Agrega al menos una descripcion para la factura libre');
      return;
    }

    appendInvoiceRow('LIBRE', freeInvoiceDueDate, freeInvoiceIssueDate, freeInvoiceTotals);
    closeBillingDialog();
    toast.success('Factura libre creada');
  }

  function handleSubmitServiceInvoice() {
    const hasDescription = serviceInvoiceLines.some((line) => line.description.trim());
    if (!hasDescription) {
      toast.error('Agrega al menos un servicio antes de crear la factura');
      return;
    }

    appendInvoiceRow('SERVICIOS', serviceInvoiceDueDate, serviceInvoiceIssueDate, serviceInvoiceTotals);
    closeBillingDialog();
    toast.success('Factura de servicios creada');
  }

  function handleBillingTabChange(tab: BillingDetailTab) {
    setActiveBillingTab(tab);
    setBillingCurrentPage(1);
    setBillingSearchTerm('');
    setBillingColumnMenuOpen(false);
    setBillingExportMenuOpen(false);
    closeBillingDialog();
  }

  function handleToolStatusChange(
    status: ClientWorkspaceData['status'],
  ) {
    if (!draft) {
      return;
    }

    const nextRecord = updateClientStatus(
      draft,
      status,
      user?.name ?? 'admin',
    );
    setDraft(nextRecord);
    toast.success(`Cliente ${status.toLowerCase()}`);
    setShowToolsMenu(false);
  }

  if (!draft) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#d9e7f3] text-sm font-medium text-[#47617c]">
        Cargando cliente...
      </div>
    );
  }

  const initials = deriveInitials(draft.personal.fullName);
  const breadcrumbAction = isEditing ? 'Editar usuario' : 'Nuevo cliente';
  const scheduleCards = schedule
    ? [
        {
          colorClassName: 'bg-[#3395ea]',
          title: formatDate(schedule.paymentDate),
          detail: 'Dia de Pago',
        },
        {
          colorClassName: 'bg-[#f5a623]',
          title: formatDateTime(schedule.invoiceDate),
          detail: 'Crear & Enviar Factura',
        },
        {
          colorClassName: 'bg-[#1db2a3]',
          title: draft.notifications.screenNotice,
          detail: 'Aviso en pantalla',
        },
        {
          colorClassName: 'bg-[#6b4fc0]',
          title:
            draft.notifications.remindersChannel === 'SMS'
              ? formatDateTime(schedule.reminderOneDate)
              : 'Desactivado',
          detail: 'Aviso SMS',
        },
        {
          colorClassName: 'bg-[#e45656]',
          title: formatDateTime(schedule.cutoffDate),
          detail: 'Proximo Corte de Servicios',
        },
        {
          colorClassName: 'bg-[#2f73b9]',
          title: '$0.00',
          detail: 'Deuda Actual',
        },
        {
          colorClassName: 'bg-[#c44ea4]',
          title: '$0.00',
          detail: 'Saldos',
        },
      ]
    : [];

  const mainTabs: Array<{
    id: ClientMainTab;
    label: string;
    icon: JSX.Element;
  }> = [
    {
      id: 'summary',
      label: 'Resumen',
      icon: <UserRound className="h-3.5 w-3.5" />,
    },
    {
      id: 'services',
      label: 'Servicios',
      icon: <Router className="h-3.5 w-3.5" />,
    },
    {
      id: 'billing',
      label: 'Facturacion',
      icon: <Receipt className="h-3.5 w-3.5" />,
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: <Ticket className="h-3.5 w-3.5" />,
    },
    {
      id: 'emails',
      label: 'Email & SMS',
      icon: <Mail className="h-3.5 w-3.5" />,
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    {
      id: 'statistics',
      label: 'Estadisticas',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
    },
    {
      id: 'log',
      label: 'Log',
      icon: <NotebookText className="h-3.5 w-3.5" />,
    },
  ];

  const billingTabs: Array<{
    id: BillingDetailTab;
    label: string;
  }> = [
    { id: 'invoices', label: 'Facturas' },
    { id: 'config', label: 'Configuracion' },
    { id: 'transactions', label: 'Transacciones' },
    { id: 'balances', label: 'Saldos' },
  ];

  const currentStep = wizardSteps[activeStepIndex];

  if (!isEditing) {
    return (
      <div className="min-h-full bg-[#d9e7f3] px-3 py-4 text-[#223448] sm:px-4 lg:px-6 lg:py-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#223448]">
              Nuevo Cliente
            </h1>
          </div>
          <div className="text-left text-[12px] text-[#58708b] md:text-right">
            Inicio <span className="px-1">/</span> Usuarios{' '}
            <span className="px-1">/</span>{' '}
            <span className="text-[#2f93e4]">Nuevo cliente</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-[3px] border border-[#d7e0ea] bg-white">
          <div className="grid grid-cols-1 border-b border-[#d7e0ea] md:grid-cols-3">
            {wizardSteps.map((step, stepIndex) => {
              const isActive = currentStep.id === step.id;
              const isComplete = activeStepIndex > stepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepChange(stepIndex)}
                  className={`flex min-h-[76px] items-start gap-3 px-5 py-4 text-left ${isActive ? 'bg-[#3395ea] text-white' : 'bg-white text-[#1d2d42]'}`}
                  {...controlA11yProps(step.title)}
                >
                  <span
                    className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${isActive ? 'bg-[#1f6cb3] text-white' : 'bg-[#dbe4ec] text-[#24364b]'}`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold leading-5">
                      {step.title}
                    </span>
                    <span
                      className={`block pt-0.5 text-[12px] leading-4 ${isActive ? 'text-white/80' : 'text-[#6f859c]'}`}
                    >
                      {step.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-5 text-[13px] text-[#333333] sm:px-6">
            {currentStep.id === 'personal' ? (
              <div className="mx-auto max-w-[1180px] space-y-5">
                <div className={pageFormRowClassName('wide', 'start')}>
                  <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#3c536d]')}>
                    ID cliente
                  </label>
                  <div>
                    <input
                      value={draft.personal.clientCode}
                      onChange={(event) =>
                        updatePersonalNumericField('clientCode', event.target.value)
                      }
                      placeholder="100"
                      inputMode="numeric"
                      className={pageInputClassName()}
                      {...controlA11yProps('ID cliente')}
                    />
                    <p className="mt-1.5 text-[12px] text-[#e08d42]">
                      Dejar en blanco para que sea automatico.
                    </p>
                  </div>
                </div>

                <div className={pageFormRowClassName('wide', 'start')}>
                  <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Contraseña Portal
                  </label>
                  <div>
                    <div className="relative">
                      <input
                        type={showPortalPassword ? 'text' : 'password'}
                        value={draft.personal.portalPassword}
                        onChange={(event) =>
                          updatePersonalField(
                            'portalPassword',
                            event.target.value,
                          )
                        }
                        placeholder="4243Tdp"
                        className={pageInputClassName('pr-10')}
                        {...controlA11yProps('Contrasena portal')}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPortalPassword((current) => !current)
                        }
                        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded p-1 text-[#7f92a7] transition hover:bg-[#eef3f8] hover:text-[#405468]"
                        aria-label={
                          showPortalPassword
                            ? 'Ocultar contrasena portal'
                            : 'Mostrar contrasena portal'
                        }
                        title={
                          showPortalPassword
                            ? 'Ocultar contrasena portal'
                            : 'Mostrar contrasena portal'
                        }
                      >
                        {showPortalPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[12px] text-[#e08d42]">
                      Dejar en blanco para que sea automatico.
                    </p>
                  </div>
                </div>

                <div className={pageFormRowClassName('wide', 'start')}>
                  <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#3c536d]')}>
                    N° Identificacion
                  </label>
                  <div>
                    <input
                      value={draft.personal.identification}
                      onChange={(event) =>
                        updatePersonalNumericField(
                          'identification',
                          event.target.value,
                        )
                      }
                      placeholder="223456634"
                      inputMode="numeric"
                      className={`${pageInputClassName()} max-w-[280px]`}
                      {...controlA11yProps('Numero de identificacion')}
                    />
                    <p className="mt-1.5 text-[12px] uppercase tracking-[0.02em] text-[#e08d42]">
                      Cedula, DNI, RUC, CUIT, NIT, SAT, RUT, RTN, etc.
                    </p>
                  </div>
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Nombre Completo <span className="text-[#e16b5f]">*</span>
                  </label>
                  <input
                    value={draft.personal.fullName}
                    onChange={(event) =>
                      updatePersonalField('fullName', event.target.value)
                    }
                    placeholder="Carlos Miguel Santana castro"
                    inputMode="text"
                    pattern="[A-Za-zÀ-ÿ\\s'-]+"
                    className={pageInputClassName()}
                    {...controlA11yProps('Nombre completo')}
                  />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Direccion principal
                  </label>
                    <input
                      value={draft.personal.primaryAddress}
                    onChange={(event) =>
                      updatePersonalField(
                        'primaryAddress',
                        event.target.value,
                      )
                    }
                      placeholder="Av. urios 4453"
                      className={pageInputClassName()}
                      {...controlA11yProps('Direccion principal')}
                    />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Ubicacion
                  </label>
                  <select
                    value={
                      draft.personal.location || locationOptions[0]
                    }
                    onChange={(event) =>
                      updatePersonalField(
                        'location',
                        event.target.value === locationOptions[0]
                          ? ''
                          : event.target.value,
                      )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Ubicacion')}
                  >
                    {locationOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Telefono fijo
                  </label>
                    <input
                      value={draft.personal.landlinePhone}
                    onChange={(event) =>
                      updatePersonalNumericField(
                        'landlinePhone',
                        event.target.value,
                      )
                    }
                      placeholder="564567"
                      inputMode="numeric"
                      className={pageInputClassName()}
                      {...controlA11yProps('Telefono fijo')}
                    />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    Telefono Movil
                  </label>
                    <input
                      value={draft.personal.mobilePhone}
                    onChange={(event) =>
                      updatePersonalNumericField(
                        'mobilePhone',
                        event.target.value,
                      )
                    }
                      placeholder="9876526478"
                      inputMode="numeric"
                      className={pageInputClassName()}
                      {...controlA11yProps('Telefono movil')}
                    />
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#3c536d]')}>
                    E-mail
                  </label>
                    <input
                      value={draft.personal.email}
                    onChange={(event) =>
                      updatePersonalField('email', event.target.value)
                    }
                      placeholder="jorge@correo.com"
                      className={pageInputClassName()}
                      {...controlA11yProps('E-mail')}
                    />
                </div>
              </div>
            ) : null}

            {currentStep.id === 'billing' ? (
              <div className="mx-auto max-w-[1560px] space-y-4">
                <div className={`mx-auto w-full max-w-[620px] ${pageFormRowClassName('medium')}`}>
                  <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                    Cargar desde plantilla
                  </label>
                  <select
                    value={draft.billing.template || billingTemplateOptions[0]}
                    onChange={(event) =>
                      updateBillingField(
                        'template',
                        event.target.value === billingTemplateOptions[0]
                          ? ''
                          : event.target.value,
                      )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Cargar desde plantilla')}
                  >
                    {billingTemplateOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <section className="overflow-hidden rounded-[3px] border border-[#d7e0ea] bg-white">
                    <header className="flex items-center gap-2 border-b border-[#d7e0ea] bg-[#f5f7fa] px-[15px] py-[10px] text-[12px] font-semibold text-[#2a3d53]">
                      <Receipt className="h-3.5 w-3.5 text-[#51687f]" />
                      Facturación
                    </header>
                    <div className="space-y-4 p-[15px]">
                      {[
                        ['Tipo', 'type', billingTypeOptions],
                        ['Día pago', 'paymentDay', paymentDayOptions],
                        ['Crear Factura', 'createInvoice', createInvoiceOptions],
                        ['Tipo impuesto', 'taxType', taxTypeOptions],
                      ].map(([label, key, options], index) => (
                        <div key={`wizard-billing-${index}`} className={pageFormRowClassName('medium')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                            {label}
                          </label>
                          <select
                            value={draft.billing[key as keyof ClientBillingSettings] as string}
                            onChange={(event) =>
                              updateBillingField(
                                key as keyof ClientBillingSettings,
                                event.target.value as never,
                              )
                            }
                            className={pageSelectClassName()}
                            {...controlA11yProps(String(label))}
                          >
                            {(options as string[]).map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ))}

                      <div className={pageFormRowClassName('medium', 'start')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Días de gracia
                        </label>
                        <div>
                          <select
                            value={draft.billing.graceDays}
                            onChange={(event) =>
                              updateBillingField('graceDays', event.target.value)
                            }
                            className={pageSelectClassName()}
                            {...controlA11yProps('Dias de gracia')}
                          >
                            {graceDayOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-[#ee9747]">
                            *días tolerancia para aplicar corte
                          </p>
                        </div>
                      </div>

                      <div className={pageFormRowClassName('medium')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Aplicar Corte
                        </label>
                        <select
                          value={draft.billing.applyCutoff}
                          onChange={(event) =>
                            updateBillingField(
                              'applyCutoff',
                              event.target.value,
                            )
                          }
                          className={pageSelectClassName()}
                          {...controlA11yProps('Aplicar Corte')}
                        >
                          {cutoffOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className={pageFormRowClassName('medium')}>
                        <label className={`flex items-center gap-2 md:justify-end ${pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}`}>
                          Fecha Fija
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#485d73]">
                            <CircleHelp className="h-3 w-3" />
                          </span>
                        </label>
                        <div className="grid grid-cols-[minmax(0,1fr)_31px]">
                          <input
                            value={draft.billing.fixedDate}
                            onChange={(event) =>
                              updateBillingField(
                                'fixedDate',
                                event.target.value,
                              )
                            }
                            placeholder="Automático"
                            className={`${pageInputClassName('rounded-r-none bg-[#f8fafc] text-[#a4b1bf]')} rounded-r-none`}
                            aria-label="Fecha Fija"
                            title="Fecha Fija"
                          />
                          <button
                            type="button"
                            className="inline-flex h-[31px] items-center justify-center rounded-r-[3px] border border-l-0 border-[#cfd7e2] bg-[#edf2f6] text-[#55697d]"
                            aria-label="Limpiar fecha fija"
                            title="Limpiar fecha fija"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {[
                        ['Aplicar Mora', 'applyLateFee'],
                        ['Aplicar Reconexión', 'applyReconnection'],
                        ['Reactivar con pago parcial', 'reactivateWithPartialPayment'],
                      ].map(([label, key], index) => (
                        <div key={`wizard-toggle-${index}`} className={pageFormRowClassName('medium', 'start')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[6px]')}>
                            {label}
                          </label>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                updateBillingField(
                                  key as keyof ClientBillingSettings,
                                  !(draft.billing[
                                    key as keyof ClientBillingSettings
                                  ] as boolean) as never,
                                )
                              }
                              className={`relative h-6 w-[40px] rounded-full transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                              {...controlA11yProps(String(label))}
                            >
                              <span
                                className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'left-[18px]' : 'left-[2px]'}`}
                              />
                            </button>
                            {index === 2 ? (
                              <p className="mt-1 max-w-[300px] text-[11px] text-[#ee9747]">
                                * Desactivado por defecto. Solo reactivará cuando la factura quede saldada.
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}

                      <div className="pt-1 text-center">
                        <div className="text-[18px] font-semibold text-[#24364b]">
                          Otros Impuestos
                        </div>
                        <p className="mt-1 text-[11px] text-[#61768d]">
                          Estos impuestos serán agregados al total de la factura
                        </p>
                      </div>

                      {draft.billing.taxes.map((taxValue, taxIndex) => (
                        <div key={`wizard-tax-${taxIndex}`} className={pageFormRowClassName('medium', 'start')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>{`Impuesto #${taxIndex + 1} (%)`}</label>
                          <div>
                            <input
                              value={taxValue}
                              onChange={(event) => {
                                const nextTaxes = [...draft.billing.taxes] as ClientBillingSettings['taxes'];
                                nextTaxes[taxIndex] = sanitizeDecimalValue(event.target.value);
                                updateBillingField('taxes', nextTaxes);
                              }}
                              inputMode="decimal"
                              className={pageInputClassName()}
                              placeholder="0"
                              {...controlA11yProps(`Impuesto ${taxIndex + 1} porcentaje`)}
                            />
                            <p className="mt-1 text-[11px] text-[#24364b]">
                              * Dejar en 0 (cero) para quedar deshabilitado
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-[3px] border border-[#d7e0ea] bg-white">
                    <header className="flex items-center gap-2 border-b border-[#d7e0ea] bg-[#f5f7fa] px-[15px] py-[10px] text-[12px] font-semibold text-[#2a3d53]">
                      <Bell className="h-3.5 w-3.5 text-[#51687f]" />
                      Notificaciones
                    </header>
                    <div className="space-y-4 p-[15px]">
                      <div className={pageFormRowClassName('medium')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Aviso nueva factura
                        </label>
                        <select
                          value={draft.notifications.newInvoiceNotice}
                          onChange={(event) =>
                            updateNotificationField(
                              'newInvoiceNotice',
                              event.target.value,
                            )
                          }
                          className={pageSelectClassName()}
                          {...controlA11yProps('Aviso nueva factura')}
                        >
                          {notificationToggleOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className={pageFormRowClassName('medium', 'start')}>
                        <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                          Aviso en Pantalla
                        </label>
                        <div>
                          <select
                            value={draft.notifications.screenNotice}
                            onChange={(event) =>
                              updateNotificationField(
                                'screenNotice',
                                event.target.value,
                              )
                            }
                            className={pageSelectClassName()}
                            {...controlA11yProps('Aviso en Pantalla')}
                          >
                            {notificationToggleOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-[#ee9747]">
                            * Aviso solo en páginas HTTP
                          </p>
                        </div>
                      </div>

                      {[
                        ['Recordatorios de pago', 'remindersChannel', ['Correo', 'SMS', 'Desactivado']],
                        ['Recordatorio #1', 'reminderOne', reminderOptions],
                        ['Recordatorio #2', 'reminderTwo', reminderOptions],
                        ['Recordatorio #3', 'reminderThree', reminderOptions],
                      ].map(([label, key, options], index) => (
                        <div key={`wizard-notification-${index}`} className={pageFormRowClassName('medium', 'start')}>
                          <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                            {label}
                          </label>
                          <div>
                            <select
                              value={draft.notifications[key as keyof ClientNotificationSettings] as string}
                              onChange={(event) =>
                                updateNotificationField(
                                  key as keyof ClientNotificationSettings,
                                  event.target.value as never,
                                )
                              }
                            className={pageSelectClassName()}
                            {...controlA11yProps(String(label))}
                          >
                              {(options as string[]).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                            {key === 'reminderThree' ? (
                              <p className="mt-1 text-[11px] text-[#ee9747]">
                                * Días antes/después del vencimiento de una factura
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {currentStep.id === 'services' ? (
              <div className="mx-auto max-w-[1560px] pt-1">
                <div className="mx-auto max-w-[620px] space-y-4">
                  <div className={pageFormRowClassName('medium')}>
                    <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                      Router
                  </label>
                  <select
                    value={draft.services.router || routerOptions[0]}
                    onChange={(event) =>
                      updateServiceField(
                        'router',
                        event.target.value === routerOptions[0]
                          ? ''
                          : event.target.value,
                      )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Router')}
                  >
                    {routerOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className={pageFormRowClassName('medium')}>
                  <label className={pageFormLabelClassName('text-[12px] text-[#333333] md:py-[8px]')}>
                    Excluir Firewall
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateServiceField(
                        'excludeFirewall',
                        draft.services.excludeFirewall === 'Activado'
                          ? 'Desactivado'
                          : 'Activado',
                      )
                    }
                    className={`relative h-6 w-[40px] rounded-full transition ${draft.services.excludeFirewall === 'Activado' ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                    {...controlA11yProps('Excluir Firewall')}
                  >
                    <span
                      className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${draft.services.excludeFirewall === 'Activado' ? 'left-[18px]' : 'left-[2px]'}`}
                    />
                  </button>
                </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={`border-t border-[#d7e0ea] px-4 py-4 sm:px-6 ${activeStepIndex < wizardSteps.length - 1 ? 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4' : 'flex justify-center'}`}>
            {activeStepIndex < wizardSteps.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveStepIndex((currentIndex) =>
                      Math.max(0, currentIndex - 1),
                    )
                  }
                  disabled={activeStepIndex === 0}
                  className="inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-[#cfd7e2] bg-white px-6 text-[14px] text-[#7b8da3] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  {...controlA11yProps('Anterior')}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={handleGoNext}
                  className="inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-[#cfd7e2] bg-white px-6 text-[14px] font-semibold text-[#24364b] sm:w-auto"
                  {...controlA11yProps('Siguiente')}
                >
                  Siguiente
                </button>
              </>
            ) : (
                <button
                  type="button"
                  onClick={handleRegisterClient}
                  className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-[#2f93e4] px-6 text-[14px] font-semibold text-white"
                  {...controlA11yProps('Registrar Cliente')}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Registrar Cliente
                </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#d9e7f3] px-3 py-4 text-[#223448] sm:px-4 lg:px-6 lg:py-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f35f93] text-[20px] font-semibold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#223448]">
              {draft.personal.fullName || 'Cliente sin nombre'}{' '}
              <span className="text-[18px] font-normal text-[#5f7d98]">
                (#{draft.personal.clientCode})
              </span>
            </h1>
          </div>
        </div>

        <div className="text-left text-[12px] text-[#58708b] md:text-right">
          Inicio <span className="px-1">/</span> Lista usuarios
          (Activos) <span className="px-1">/</span>{' '}
          <span className="text-[#2f93e4]">{breadcrumbAction}</span>
        </div>
      </div>

      <section className="rounded border border-[#d7e0ea] bg-white">
        <div className="relative bg-[#1f252c] px-2 py-0">
          <div className="flex flex-wrap items-center gap-0">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 px-4 text-[12px] font-semibold ${isActive ? 'bg-white text-[#23384d]' : 'text-white'}`}
                {...controlA11yProps(tab.label)}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowToolsMenu((currentValue) => !currentValue)}
            className={`inline-flex h-10 items-center justify-center px-4 sm:ml-2 ${showToolsMenu ? 'bg-white text-[#23384d]' : 'text-white'}`}
            {...controlA11yProps('Abrir herramientas')}
          >
            <Wrench className="h-4 w-4" />
          </button>

          <div className="ml-auto flex w-full items-center justify-end gap-2 py-2 pr-2 sm:w-auto sm:py-0">
            <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f93e4] text-white" {...controlA11yProps('Pestana anterior')}>
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f93e4] text-white" {...controlA11yProps('Pestana siguiente')}>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          </div>

          {showToolsMenu ? (
            <div className="absolute right-3 top-[calc(100%+0.5rem)] z-20 w-[min(270px,calc(100vw-2rem))] rounded border border-[#d1d8df] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.16)] sm:right-14 sm:top-12">
              <div className="flex items-center justify-between border-b border-[#e3e8ee] px-4 py-3 text-[14px] font-semibold text-[#334b64]">
                <span>Herramientas</span>
                <button type="button" onClick={() => setShowToolsMenu(false)} className="text-[#6d8097]" {...controlA11yProps('Cerrar herramientas')}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <label className="mb-1 block text-[12px] text-[#4d6278]">
                    Seleccionar servicio
                  </label>
                  <select className={pageSelectClassName()} {...controlA11yProps('Seleccionar servicio')}>
                    <option>{draft.services.router || 'No hay ningun servicio...'}</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    ['Ver Antena', <Router className="h-3.5 w-3.5" key="router" />],
                    ['Trafico mikrotik', <BarChart3 className="h-3.5 w-3.5" key="traffic" />],
                    ['Ping Mikrotik', <Monitor className="h-3.5 w-3.5" key="ping" />],
                    ['Graficos Mikrotik', <BarChart3 className="h-3.5 w-3.5" key="chart" />],
                    ['Portal cliente', <UserRound className="h-3.5 w-3.5" key="portal" />],
                    ['Mail Bienvenida', <Mail className="h-3.5 w-3.5" key="mail" />],
                    ['¿Como llegar?', <MapPin className="h-3.5 w-3.5" key="map" />],
                    ['Enviar SMS', <Smartphone className="h-3.5 w-3.5" key="sms" />],
                  ].map(([label, icon], toolIndex) => (
                    <button key={`tool-${toolIndex}`} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded border border-[#cfd7e2] text-[12px] text-[#24364b]" {...controlA11yProps(String(label))}>
                      {icon as JSX.Element}
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleToolStatusChange('SUSPENDIDO')}
                    className="inline-flex h-10 items-center justify-center rounded bg-[#f5a623] text-[12px] font-semibold text-white"
                    {...controlA11yProps('Suspender')}
                  >
                    SUSPENDER
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolStatusChange('RETIRADO')}
                    className="inline-flex h-10 items-center justify-center rounded bg-[#ef5c5c] text-[12px] font-semibold text-white"
                    {...controlA11yProps('Retirar cliente')}
                  >
                    RETIRAR cliente
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative p-4">
          {activeTab === 'summary' ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.9fr)]">
              <section className="border-r border-[#e4ebf1] pr-0 xl:pr-5">
                <div className="mb-4 flex items-center gap-2 text-[18px] text-[#24364b]">
                  <ChevronRight className="h-4 w-4" />
                  <h2>Datos del cliente</h2>
                </div>

                <div className={pageFormRowClassName()}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                    Estado
                  </label>
                  <div>
                    <span className={`inline-flex rounded px-3 py-1 text-[12px] font-semibold text-white ${draft.status === 'ACTIVO' ? 'bg-[#11b981]' : draft.status === 'SUSPENDIDO' ? 'bg-[#f5a623]' : 'bg-[#ef5c5c]'}`}>
                      {draft.status}
                    </span>
                  </div>
                </div>

                <div className={`mt-4 ${pageFormRowClassName()}`}>
                  <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                    Conectado al Router(s)
                  </label>
                  <div className="text-[13px] text-[#526b84]">
                    {draft.services.router || 'Sin router asignado'}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    ['ID', 'clientCode'],
                    ['Contraseña', 'portalPassword'],
                    ['Cliente', 'fullName'],
                    ['Direccion Principal', 'primaryAddress'],
                    ['Telefono fijo', 'landlinePhone'],
                    ['Telefono Movil', 'mobilePhone'],
                    ['E-mail', 'email'],
                  ].map(([label, key]) => (
                    <div key={key} className={pageFormRowClassName()}>
                      <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                        {label}
                      </label>
                      <input
                        value={draft.personal[key as keyof ClientWorkspaceData['personal']] as string}
                        onChange={(event) =>
                          key === 'clientCode' || key === 'landlinePhone' || key === 'mobilePhone'
                            ? updatePersonalNumericField(
                                key as 'clientCode' | 'landlinePhone' | 'mobilePhone',
                                event.target.value,
                              )
                            : updatePersonalField(
                                key as keyof ClientWorkspaceData['personal'],
                                event.target.value as never,
                              )
                        }
                        inputMode={
                          key === 'clientCode' || key === 'landlinePhone' || key === 'mobilePhone'
                            ? 'numeric'
                            : key === 'fullName'
                              ? 'text'
                              : undefined
                        }
                        pattern={key === 'fullName' ? "[A-Za-zÀ-ÿ\\s'-]+" : undefined}
                        className={pageInputClassName(key === 'clientCode' || key === 'portalPassword' ? 'max-w-[160px]' : '')}
                        {...controlA11yProps(String(label))}
                      />
                    </div>
                  ))}

                  <div className={pageFormRowClassName('wide', 'start')}>
                    <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] md:text-[14px] text-[#415970]')}>
                      N° Identificacion
                    </label>
                    <div>
                      <input
                        value={draft.personal.identification}
                        onChange={(event) =>
                          updatePersonalNumericField(
                            'identification',
                            event.target.value,
                          )
                        }
                        inputMode="numeric"
                        className={`${pageInputClassName()} max-w-[180px]`}
                        {...controlA11yProps('Numero de identificacion')}
                      />
                      <p className="mt-1 text-[11px] uppercase tracking-[0.02em] text-[#5b748c]">
                        Cedula, DNI, RUC, CUIT, NIT, SAT, RUT, RTN, etc.
                      </p>
                    </div>
                  </div>

                  <div className={pageFormRowClassName()}>
                    <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                      Ubicacion
                    </label>
                  <select
                    value={draft.personal.location || locationOptions[0]}
                      onChange={(event) =>
                        updatePersonalField(
                          'location',
                          event.target.value === locationOptions[0]
                            ? ''
                            : event.target.value,
                        )
                    }
                    className={pageSelectClassName()}
                    {...controlA11yProps('Ubicacion')}
                  >
                      {locationOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSavePersonalChanges}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2f93e4] px-6 text-[13px] font-semibold text-[#2f93e4]"
                    {...controlA11yProps('Guardar datos')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Guardar datos
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2 text-[18px] text-[#24364b]">
                  <ChevronRight className="h-4 w-4" />
                  <h2>Resumen Notificaciones</h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {scheduleCards.map((card) => (
                    <TimelineCard key={`${card.title}-${card.detail}`} {...card} />
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === 'services' ? (
            <div className="space-y-5">
              <EmptyTableCard title="Servicios de Internet" columns={['ID', 'PLAN', 'COSTO', 'IP', 'ROUTER', 'INSTALADO', 'DIRECCION', 'ESTADO', 'ACCIONES']} actionLabel="Nueva" />
              <EmptyTableCard title="Equipos Asignados" columns={['ID', 'N° SERIE', 'N° MAC', 'EQUIPO', 'FECHA', 'ESTADO', 'ACCIONES']} />
              <EmptyTableCard title="Servicios Voip" columns={['ID', 'PLAN', 'SIP SERVER', 'SIP USER', 'AUTHENTICATE ID', 'N° TELEFONO', 'COSTO', 'INSTALADO', 'NOTAS', 'ACCIONES']} actionLabel="Nueva" />
              <EmptyTableCard title="Productos y otros Servicios Recurrentes" columns={['ID', 'PRODUCTO', 'MONTO', 'N° SERIE', 'N° MAC', 'FECHA INICIO', 'N° CUOTAS', 'ESTADO', 'ACCIONES']} actionLabel="Nuevo" />
              <EmptyTableCard title="Productos y Otros Servicios" columns={['ID', 'PRODUCTO', 'MONTO', 'N° SERIE', 'N° MAC', 'FECHA INICIO', 'FACTURA', 'ESTADO', 'ACCIONES']} />
            </div>
          ) : null}

          {activeTab === 'billing' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-b border-[#d7e0ea] pb-1">
                {billingTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleBillingTabChange(tab.id)}
                    className={`inline-flex h-9 items-center gap-2 border border-b-0 px-4 text-[12px] ${activeBillingTab === tab.id ? 'bg-white font-semibold text-[#24364b]' : 'bg-[#f5f7fa] text-[#6b8198]'}`}
                    {...controlA11yProps(tab.label)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeBillingTab === 'invoices' ? (
                <BillingDataTable
                  columns={billingInvoiceColumns}
                  rows={paginatedBillingRows as ClientInvoiceRow[]}
                  pageSize={billingPageSize}
                  onPageSizeChange={(value) => {
                    setBillingPageSize(value);
                    setBillingCurrentPage(1);
                  }}
                  searchTerm={billingSearchTerm}
                  onSearchTermChange={(value) => {
                    setBillingSearchTerm(value);
                    setBillingCurrentPage(1);
                  }}
                  actionButtons={[
                    { label: 'Factura Libre', onClick: handleCreateFreeInvoice },
                    { label: 'Factura de servicios', onClick: handleCreateServiceInvoice },
                  ]}
                  columnMenuOpen={billingColumnMenuOpen}
                  onToggleColumnMenu={() => {
                    setBillingColumnMenuOpen((current) => !current);
                    setBillingExportMenuOpen(false);
                  }}
                  columnMenuRef={billingColumnMenuRef}
                  exportMenuOpen={billingExportMenuOpen}
                  onToggleExportMenu={() => {
                    setBillingExportMenuOpen((current) => !current);
                    setBillingColumnMenuOpen(false);
                  }}
                  exportMenuRef={billingExportMenuRef}
                  onPrint={handleBillingPrint}
                  onExportCsv={handleBillingExportCsv}
                  onExportExcel={handleBillingExportExcel}
                  onExportPdf={handleBillingExportPdf}
                  visibleColumnKeys={activeBillingVisibleColumnKeys}
                  onToggleColumn={toggleActiveBillingColumn}
                  summary={billingSummary}
                  currentPage={safeBillingCurrentPage}
                  onPrevPage={() => setBillingCurrentPage((current) => Math.max(1, current - 1))}
                  onNextPage={() =>
                    setBillingCurrentPage((current) => Math.min(billingTotalPages, current + 1))
                  }
                  canGoPrev={safeBillingCurrentPage > 1}
                  canGoNext={safeBillingCurrentPage < billingTotalPages}
                />
              ) : null}

              {activeBillingTab === 'config' ? (
                <div className="space-y-5">
                  <div className={`w-full max-w-[520px] ${pageFormRowClassName()}`}>
                    <label className={pageFormLabelClassName('text-[13px] md:text-[14px] text-[#415970]')}>
                      Configurar utilizando plantilla
                    </label>
                    <select
                      value={draft.billing.template || billingTemplateOptions[0]}
                      onChange={(event) =>
                        updateBillingField(
                          'template',
                          event.target.value === billingTemplateOptions[0] ? '' : event.target.value,
                        )
                      }
                      className={pageSelectClassName()}
                      {...controlA11yProps('Plantilla de facturacion')}
                    >
                      {billingTemplateOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <section className="rounded border border-[#d7e0ea] bg-white">
                      <header className="bg-[#0f9488] px-4 py-3 text-[13px] font-semibold text-white">
                        Facturacion
                      </header>
                      <div className="space-y-4 p-4">
                        {[
                          ['Tipo', 'type', billingTypeOptions],
                          ['Dia pago', 'paymentDay', paymentDayOptions],
                          ['Crear Factura', 'createInvoice', createInvoiceOptions],
                          ['Tipo impuesto', 'taxType', taxTypeOptions],
                          ['Dias de gracia', 'graceDays', graceDayOptions],
                          ['Aplicar Corte', 'applyCutoff', cutoffOptions],
                          ['Bajar Velocidad', 'slowdownMode', slowdownOptions],
                        ].map(([label, key, options], index) => (
                          <div key={`config-billing-${index}`} className={pageFormRowClassName('medium')}>
                            <label className={pageFormLabelClassName('text-[13px] text-[#40576f]')}>
                              {label}
                            </label>
                            <select
                              value={draft.billing[key as keyof ClientBillingSettings] as string}
                              onChange={(event) =>
                                updateBillingField(
                                  key as keyof ClientBillingSettings,
                                  event.target.value as never,
                                )
                              }
                              className={pageSelectClassName()}
                              {...controlA11yProps(String(label))}
                            >
                              {(options as string[]).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        ))}

                        {[
                          ['Fecha Fija', 'fixedDate'],
                          ['Corte Fijo Programado', 'fixedCutoffDate'],
                        ].map(([label, key], index) => (
                          <div key={`config-fixed-${index}`} className={pageFormRowClassName('medium')}>
                            <label className={`flex items-center gap-2 md:justify-end ${pageFormLabelClassName('text-[13px] text-[#40576f]')}`}>
                              {label} <CircleHelp className="h-3.5 w-3.5 text-[#67809a]" />
                            </label>
                            <div className="grid grid-cols-[minmax(0,1fr)_40px]">
                              <input
                                value={draft.billing[key as keyof ClientBillingSettings] as string}
                                onChange={(event) =>
                                  updateBillingField(
                                    key as keyof ClientBillingSettings,
                                    event.target.value as never,
                                  )
                                }
                                placeholder="Automatico"
                                className={pageInputClassName('rounded-r-none')}
                                {...controlA11yProps(String(label))}
                              />
                              <button type="button" className="inline-flex h-8 items-center justify-center rounded-r border border-l-0 border-[#cfd7e2] bg-[#eef3f7] text-[#4c5f74]" {...controlA11yProps(`Configurar ${String(label)}`)}>
                                <Settings2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {[
                          ['Aplicar Mora', 'applyLateFee'],
                          ['Aplicar Reconexion', 'applyReconnection'],
                          ['Reactivar con pago parcial', 'reactivateWithPartialPayment'],
                        ].map(([label, key], index) => (
                          <div key={`config-toggle-${index}`} className={pageFormRowClassName('medium', 'start')}>
                            <label className={pageFormLabelClassName('pt-1 text-[13px] text-[#40576f]')}>
                              {label}
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateBillingField(
                                  key as keyof ClientBillingSettings,
                                  !(draft.billing[key as keyof ClientBillingSettings] as boolean) as never,
                                )
                              }
                              className={`relative h-7 w-13 rounded-full transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'bg-[#2f93e4]' : 'bg-[#c8ced5]'}`}
                              {...controlA11yProps(String(label))}
                            >
                              <span className={`absolute top-[2px] h-6 w-6 rounded-full bg-white transition ${(draft.billing[key as keyof ClientBillingSettings] as boolean) ? 'left-[26px]' : 'left-[2px]'}`} />
                            </button>
                          </div>
                        ))}

                        <div className="pt-2 text-center text-[14px] font-semibold text-[#233549]">
                          Otros Impuestos
                        </div>
                        {draft.billing.taxes.map((taxValue, taxIndex) => (
                          <div key={`config-tax-${taxIndex}`} className={pageFormRowClassName('medium', 'start')}>
                            <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] text-[#40576f]')}>{`Impuesto #${taxIndex + 1} (%)`}</label>
                            <div>
                              <input
                                value={taxValue}
                                onChange={(event) => {
                                  const nextTaxes = [...draft.billing.taxes] as ClientBillingSettings['taxes'];
                                  nextTaxes[taxIndex] = sanitizeDecimalValue(event.target.value);
                                  updateBillingField('taxes', nextTaxes);
                                }}
                                inputMode="decimal"
                                className={pageInputClassName()}
                                placeholder="0"
                                {...controlA11yProps(`Impuesto ${taxIndex + 1} porcentaje`)}
                              />
                              <p className="mt-1 text-[11px] text-[#24364b]">
                                * Dejar en 0 (cero) para quedar deshabilitado
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={handleSaveBillingChanges}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2f93e4] px-6 text-[13px] font-semibold text-[#2f93e4]"
                            {...controlA11yProps('Guardar cambios de facturacion')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Guardar cambios
                          </button>
                        </div>

                        {schedule ? (
                          <div className="grid gap-3 pt-4 sm:grid-cols-2">
                            <div className="rounded bg-[#fff3b3] px-4 py-4 text-center text-[13px] text-[#6d5d1d]">
                              Dia de pago: <span className="font-semibold">{formatDate(schedule.paymentDate)}</span>
                            </div>
                            <div className="rounded bg-[#f8c4c4] px-4 py-4 text-center text-[13px] text-[#803535]">
                              Dia de corte: <span className="font-semibold">{formatDateTime(schedule.cutoffDate)}</span>
                            </div>
                            <div className="rounded bg-[#c7edf8] px-4 py-4 text-center text-[13px] text-[#245b73]">
                              Crear factura: <span className="font-semibold">{formatDateTime(schedule.invoiceDate)}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="rounded border border-[#d7e0ea] bg-white">
                      <header className="bg-[#0f9488] px-4 py-3 text-[13px] font-semibold text-white">
                        Notificaciones
                      </header>
                      <div className="space-y-4 p-4">
                        {[
                          ['Aviso nueva factura', 'newInvoiceNotice', notificationToggleOptions],
                          ['Aviso en Pantalla', 'screenNotice', notificationToggleOptions],
                          ['Recordatorios de pago', 'remindersChannel', ['Correo', 'SMS', 'Desactivado']],
                          ['Recordatorio #1', 'reminderOne', reminderOptions],
                          ['Recordatorio #2', 'reminderTwo', reminderOptions],
                          ['Recordatorio #3', 'reminderThree', reminderOptions],
                        ].map(([label, key, options], index) => (
                          <div key={`config-notification-${index}`} className={pageFormRowClassName('medium', 'start')}>
                            <label className={pageFormLabelClassName('pt-0 md:pt-2 text-[13px] text-[#40576f]')}>
                              {label}
                            </label>
                            <select
                              value={draft.notifications[key as keyof ClientNotificationSettings] as string}
                              onChange={(event) =>
                                updateNotificationField(
                                  key as keyof ClientNotificationSettings,
                                  event.target.value as never,
                                )
                              }
                              className={pageSelectClassName()}
                              {...controlA11yProps(String(label))}
                            >
                              {(options as string[]).map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        ))}

                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={handleSaveBillingChanges}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2f93e4] px-6 text-[13px] font-semibold text-[#2f93e4]"
                            {...controlA11yProps('Guardar cambios de notificaciones')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Guardar cambios
                          </button>
                        </div>

                        {schedule ? (
                          <div className="grid gap-3 pt-4 sm:grid-cols-2">
                            <div className="rounded bg-[#b4d0f0] px-4 py-4 text-center text-[13px] text-[#27496b]">
                              Aviso pantalla: <span className="font-semibold">{draft.notifications.screenNotice}</span>{' '}
                              {formatDateTime(schedule.paymentDate)}
                            </div>
                            <div className="rounded bg-[#a6e0de] px-4 py-4 text-center text-[13px] text-[#24615d]">
                              Recordatorio #1: <span className="font-semibold">{formatDateTime(schedule.reminderOneDate)}</span>
                            </div>
                            <div className="rounded bg-[#d9efb7] px-4 py-4 text-center text-[13px] text-[#587337]">
                              Recordatorio #2: <span className="font-semibold">{draft.notifications.reminderTwo}</span>
                            </div>
                            <div className="rounded bg-[#e7edf3] px-4 py-4 text-center text-[13px] text-[#607488]">
                              Recordatorio #3: <span className="font-semibold">{draft.notifications.reminderThree}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}

              {activeBillingTab === 'transactions' ? (
                <BillingDataTable
                  columns={billingTransactionColumns}
                  rows={paginatedBillingRows as ClientTransactionRow[]}
                  pageSize={billingPageSize}
                  onPageSizeChange={(value) => {
                    setBillingPageSize(value);
                    setBillingCurrentPage(1);
                  }}
                  searchTerm={billingSearchTerm}
                  onSearchTermChange={(value) => {
                    setBillingSearchTerm(value);
                    setBillingCurrentPage(1);
                  }}
                  columnMenuOpen={billingColumnMenuOpen}
                  onToggleColumnMenu={() => {
                    setBillingColumnMenuOpen((current) => !current);
                    setBillingExportMenuOpen(false);
                  }}
                  columnMenuRef={billingColumnMenuRef}
                  exportMenuOpen={billingExportMenuOpen}
                  onToggleExportMenu={() => {
                    setBillingExportMenuOpen((current) => !current);
                    setBillingColumnMenuOpen(false);
                  }}
                  exportMenuRef={billingExportMenuRef}
                  onPrint={handleBillingPrint}
                  onExportCsv={handleBillingExportCsv}
                  onExportExcel={handleBillingExportExcel}
                  onExportPdf={handleBillingExportPdf}
                  visibleColumnKeys={activeBillingVisibleColumnKeys}
                  onToggleColumn={toggleActiveBillingColumn}
                  summary={billingSummary}
                  currentPage={safeBillingCurrentPage}
                  onPrevPage={() => setBillingCurrentPage((current) => Math.max(1, current - 1))}
                  onNextPage={() =>
                    setBillingCurrentPage((current) => Math.min(billingTotalPages, current + 1))
                  }
                  canGoPrev={safeBillingCurrentPage > 1}
                  canGoNext={safeBillingCurrentPage < billingTotalPages}
                />
              ) : null}

              {activeBillingTab === 'balances' ? (
                <BillingDataTable
                  columns={billingBalanceColumns}
                  rows={paginatedBillingRows as ClientBalanceRow[]}
                  pageSize={billingPageSize}
                  onPageSizeChange={(value) => {
                    setBillingPageSize(value);
                    setBillingCurrentPage(1);
                  }}
                  searchTerm={billingSearchTerm}
                  onSearchTermChange={(value) => {
                    setBillingSearchTerm(value);
                    setBillingCurrentPage(1);
                  }}
                  actionButtons={[{ label: 'Agregar saldo', onClick: handleAddBalance }]}
                  columnMenuOpen={billingColumnMenuOpen}
                  onToggleColumnMenu={() => {
                    setBillingColumnMenuOpen((current) => !current);
                    setBillingExportMenuOpen(false);
                  }}
                  columnMenuRef={billingColumnMenuRef}
                  exportMenuOpen={billingExportMenuOpen}
                  onToggleExportMenu={() => {
                    setBillingExportMenuOpen((current) => !current);
                    setBillingColumnMenuOpen(false);
                  }}
                  exportMenuRef={billingExportMenuRef}
                  onPrint={handleBillingPrint}
                  onExportCsv={handleBillingExportCsv}
                  onExportExcel={handleBillingExportExcel}
                  onExportPdf={handleBillingExportPdf}
                  showExportButton={false}
                  visibleColumnKeys={activeBillingVisibleColumnKeys}
                  onToggleColumn={toggleActiveBillingColumn}
                  summary={billingSummary}
                  currentPage={safeBillingCurrentPage}
                  onPrevPage={() => setBillingCurrentPage((current) => Math.max(1, current - 1))}
                  onNextPage={() =>
                    setBillingCurrentPage((current) => Math.min(billingTotalPages, current + 1))
                  }
                  canGoPrev={safeBillingCurrentPage > 1}
                  canGoNext={safeBillingCurrentPage < billingTotalPages}
                />
              ) : null}
            </div>
          ) : null}

          {activeTab === 'tickets' ? (
            <BillingDataTable
              columns={ticketColumns}
              rows={paginatedTicketRows}
              pageSize={ticketPageSize}
              onPageSizeChange={(value) => {
                setTicketPageSize(value);
                setTicketCurrentPage(1);
              }}
              searchTerm={ticketSearchTerm}
              onSearchTermChange={(value) => {
                setTicketSearchTerm(value);
                setTicketCurrentPage(1);
              }}
              actionButtons={[{ label: 'Nuevo', onClick: handleCreateTicket }]}
              columnMenuOpen={ticketColumnMenuOpen}
              onToggleColumnMenu={() => setTicketColumnMenuOpen((current) => !current)}
              columnMenuRef={ticketColumnMenuRef}
              exportMenuOpen={false}
              onToggleExportMenu={() => undefined}
              exportMenuRef={{ current: null }}
              onPrint={() => undefined}
              onExportCsv={() => undefined}
              onExportExcel={() => undefined}
              onExportPdf={() => undefined}
              showExportButton={false}
              visibleColumnKeys={ticketVisibleColumnKeys}
              onToggleColumn={toggleTicketColumn}
              summary={ticketSummary}
              currentPage={safeTicketCurrentPage}
              onPrevPage={() => setTicketCurrentPage((current) => Math.max(1, current - 1))}
              onNextPage={() =>
                setTicketCurrentPage((current) => Math.min(ticketTotalPages, current + 1))
              }
              canGoPrev={safeTicketCurrentPage > 1}
              canGoNext={safeTicketCurrentPage < ticketTotalPages}
            />
          ) : null}

          {activeTab === 'emails' ? (
            <div className="space-y-5">
              <EmptyTableCard title="Correo Enviados" columns={['ID', 'ASUNTO', 'FECHA', 'REMITENTE', 'DESTINO', 'ESTADO', 'LOG', 'ACCIONES']} actionLabel="Nuevo correo" />
              <EmptyTableCard title="Mensajes de texto" columns={['ID', 'MENSAJE', 'ESTADO', '# DESTINO', 'FECHA ENVIO', 'ACCIONES']} actionLabel="Nuevo sms" />
            </div>
          ) : null}

          {activeTab === 'documents' ? (
            <div className="space-y-5">
              <section className="rounded border border-[#d7e0ea] bg-white">
                <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                  Contratos
                </header>
                <div className="p-4">
                  <BillingDataTable
                    columns={contractColumns}
                    rows={paginatedContractRows}
                    pageSize={contractPageSize}
                    onPageSizeChange={(value) => {
                      setContractPageSize(value);
                      setContractCurrentPage(1);
                    }}
                    searchTerm={contractSearchTerm}
                    onSearchTermChange={(value) => {
                      setContractSearchTerm(value);
                      setContractCurrentPage(1);
                    }}
                    actionButtons={[{ label: 'Nuevo Contrato', onClick: handleCreateContract }]}
                    columnMenuOpen={contractColumnMenuOpen}
                    onToggleColumnMenu={() => setContractColumnMenuOpen((current) => !current)}
                    columnMenuRef={contractColumnMenuRef}
                    exportMenuOpen={false}
                    onToggleExportMenu={() => undefined}
                    exportMenuRef={contractExportMenuRef}
                    onPrint={() => undefined}
                    onExportCsv={() => undefined}
                    onExportExcel={() => undefined}
                    onExportPdf={() => undefined}
                    showExportButton={false}
                    visibleColumnKeys={contractVisibleColumnKeys}
                    onToggleColumn={toggleContractColumn}
                    summary={contractSummary}
                    currentPage={safeContractCurrentPage}
                    onPrevPage={() => setContractCurrentPage((current) => Math.max(1, current - 1))}
                    onNextPage={() =>
                      setContractCurrentPage((current) => Math.min(contractTotalPages, current + 1))
                    }
                    canGoPrev={safeContractCurrentPage > 1}
                    canGoNext={safeContractCurrentPage < contractTotalPages}
                  />
                </div>
              </section>

              <section className="rounded border border-[#d7e0ea] bg-white">
                <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                  Documentos PDF
                </header>
                <div className="p-4">
                  <BillingDataTable
                    columns={pdfDocumentColumns}
                    rows={paginatedPdfDocumentRows}
                    pageSize={pdfDocumentPageSize}
                    onPageSizeChange={(value) => {
                      setPdfDocumentPageSize(value);
                      setPdfDocumentCurrentPage(1);
                    }}
                    searchTerm={pdfDocumentSearchTerm}
                    onSearchTermChange={(value) => {
                      setPdfDocumentSearchTerm(value);
                      setPdfDocumentCurrentPage(1);
                    }}
                    actionButtons={[{ label: 'Nuevo Documento', onClick: handleCreatePdfDocument }]}
                    columnMenuOpen={pdfDocumentColumnMenuOpen}
                    onToggleColumnMenu={() =>
                      setPdfDocumentColumnMenuOpen((current) => !current)
                    }
                    columnMenuRef={pdfDocumentColumnMenuRef}
                    exportMenuOpen={false}
                    onToggleExportMenu={() => undefined}
                    exportMenuRef={pdfDocumentExportMenuRef}
                    onPrint={() => undefined}
                    onExportCsv={() => undefined}
                    onExportExcel={() => undefined}
                    onExportPdf={() => undefined}
                    showExportButton={false}
                    visibleColumnKeys={pdfDocumentVisibleColumnKeys}
                    onToggleColumn={togglePdfDocumentColumn}
                    summary={pdfDocumentSummary}
                    currentPage={safePdfDocumentCurrentPage}
                    onPrevPage={() =>
                      setPdfDocumentCurrentPage((current) => Math.max(1, current - 1))
                    }
                    onNextPage={() =>
                      setPdfDocumentCurrentPage((current) =>
                        Math.min(pdfDocumentTotalPages, current + 1),
                      )
                    }
                    canGoPrev={safePdfDocumentCurrentPage > 1}
                    canGoNext={safePdfDocumentCurrentPage < pdfDocumentTotalPages}
                  />
                </div>
              </section>

              <section className="rounded border border-[#d7e0ea] bg-white">
                <header className="flex items-center justify-between border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                  <span>Notas</span>
                  <button
                    type="button"
                    onClick={handleAddClientNote}
                    className="inline-flex h-8 items-center gap-2 rounded bg-[#43c2eb] px-3 text-[12px] font-semibold text-white"
                    {...controlA11yProps('Agregar nota')}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agrega Nota
                  </button>
                </header>
                <div className="min-h-[90px] bg-[#edf2f6]" />
              </section>
            </div>
          ) : null}

          {(activeTab as string) === '__legacy_documents__' ? (
            <div className="space-y-5">
              <EmptyTableCard title="Contratos" columns={['N°', 'N° EXTERNO', 'TITULO', 'CREADO', 'INICIO', 'FINALIZA', 'DURACION', 'FIRMADO', 'ESTADO', 'ACCIONES']} actionLabel="Nuevo Contrato" />
              <EmptyTableCard title="Documentos PDF" columns={['CREADO POR', 'TITULO', 'DESCRIPCION', 'ARCHIVO', 'FECHA', 'ACCIONES']} actionLabel="Nuevo Documento" />
                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="flex items-center justify-between border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                    <span>Notas</span>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 rounded bg-[#43c2eb] px-3 text-[12px] font-semibold text-white"
                    {...controlA11yProps('Agregar nota')}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agrega Nota
                  </button>
                  </header>
                  <div className="min-h-[90px] bg-[#edf2f6]" />
              </section>
            </div>
          ) : null}

          {activeTab === 'statistics' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="grid w-full max-w-[720px] gap-3 md:grid-cols-[110px_minmax(0,1fr)] lg:grid-cols-[110px_minmax(0,1fr)_150px_100px_24px_100px] md:items-center">
                  <label className={pageFormLabelClassName('text-[13px] text-[#40576f]')}>
                    Servicio
                  </label>
                  <select className={pageSelectClassName()} {...controlA11yProps('Servicio')}>
                    <option>Todos los servicios</option>
                  </select>
                  <select className={pageSelectClassName()} {...controlA11yProps('Tipo de grafico')}>
                    <option>Grafico diario</option>
                  </select>
                  <input
                    value={statisticsDateRange[0]}
                    readOnly
                    className={pageInputClassName()}
                    {...controlA11yProps('Fecha inicial')}
                  />
                  <span className="text-center text-[12px] text-[#40576f]">al</span>
                  <input
                    value={statisticsDateRange[1]}
                    readOnly
                    className={pageInputClassName()}
                    {...controlA11yProps('Fecha final')}
                  />
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                    Resumen
                  </header>
                  <div className="p-4">
                    <div className="grid grid-cols-[1fr_110px] border border-[#d7e0ea] text-[13px] text-[#24364b]">
                      {[
                        ['Sesiones', '0'],
                        ['Tiempo', '00:00:00'],
                        ['Descarga', '0'],
                        ['Subida', '0'],
                      ].map(([label, value]) => (
                        <div key={label} className="contents">
                          <div className="border-b border-r border-[#d7e0ea] px-3 py-3">{label}</div>
                          <div className="border-b border-[#d7e0ea] px-3 py-3 text-right">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={handleOpenVisitedSites}
                        className="inline-flex h-10 items-center gap-2 rounded bg-[#2f93e4] px-5 text-[13px] font-semibold text-white"
                        {...controlA11yProps('Sitios visitados hoy')}
                      >
                        <Monitor className="h-4 w-4" />
                        Sitios visitados Hoy
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">
                    Grafico
                  </header>
                  <div className="relative h-[300px] p-6">
                    {['top-[70px]', 'top-[122px]', 'top-[174px]', 'top-[226px]'].map((topClassName, row) => (
                      <div
                        key={`line-${row}`}
                        className={`absolute left-12 right-6 border-t border-[#dce4ec] ${topClassName}`}
                      />
                    ))}
                    <div className="absolute bottom-12 left-12 right-6 border-t border-[#dce4ec]" />
                    <div className="absolute bottom-12 left-12 top-6 border-l border-[#dce4ec]" />
                    <div className="absolute left-16 top-[122px] rounded border border-[#cfd7e2] bg-white px-3 py-2 text-[12px] text-[#24364b] shadow-sm">
                      <div>2026-03-25</div>
                      <div className="text-[#2f93e4]">DOWN: 0 MiB</div>
                      <div className="text-[#0f9488]">UP: 0 MiB</div>
                    </div>
                    <div className="absolute bottom-5 left-16 right-6 flex justify-between text-[11px] text-[#6d8198]">
                      {[
                        '2026-03-25',
                        '2026-03-26',
                        '2026-03-27',
                        '2026-03-28',
                        '2026-03-29',
                        '2026-03-30',
                        '2026-03-31',
                        '2026-04-01',
                        '2026-04-02',
                        '2026-04-03',
                        '2026-04-04',
                        '2026-04-05',
                        '2026-04-06',
                        '2026-04-07',
                        '2026-04-08',
                        '2026-04-09',
                      ].map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <BillingDataTable
                columns={statisticsHistoryColumns}
                rows={paginatedStatisticsHistoryRows}
                pageSize={statisticsHistoryPageSize}
                onPageSizeChange={(value) => {
                  setStatisticsHistoryPageSize(value);
                  setStatisticsHistoryCurrentPage(1);
                }}
                searchTerm={statisticsHistorySearchTerm}
                onSearchTermChange={(value) => {
                  setStatisticsHistorySearchTerm(value);
                  setStatisticsHistoryCurrentPage(1);
                }}
                columnMenuOpen={statisticsHistoryColumnMenuOpen}
                onToggleColumnMenu={() =>
                  setStatisticsHistoryColumnMenuOpen((current) => !current)
                }
                columnMenuRef={statisticsHistoryColumnMenuRef}
                exportMenuOpen={false}
                onToggleExportMenu={() => undefined}
                exportMenuRef={statisticsHistoryExportMenuRef}
                onPrint={() => undefined}
                onExportCsv={() => undefined}
                onExportExcel={() => undefined}
                onExportPdf={() => undefined}
                showExportButton={false}
                visibleColumnKeys={statisticsHistoryVisibleColumnKeys}
                onToggleColumn={toggleStatisticsHistoryColumn}
                summary={statisticsHistorySummary}
                currentPage={safeStatisticsHistoryCurrentPage}
                onPrevPage={() =>
                  setStatisticsHistoryCurrentPage((current) => Math.max(1, current - 1))
                }
                onNextPage={() =>
                  setStatisticsHistoryCurrentPage((current) =>
                    Math.min(statisticsHistoryTotalPages, current + 1),
                  )
                }
                canGoPrev={safeStatisticsHistoryCurrentPage > 1}
                canGoNext={safeStatisticsHistoryCurrentPage < statisticsHistoryTotalPages}
              />
            </div>
          ) : null}

          {(activeTab as string) === '__legacy_statistics__' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="grid w-full max-w-[720px] gap-3 md:grid-cols-[110px_minmax(0,1fr)] lg:grid-cols-[110px_minmax(0,1fr)_150px_100px_24px_100px] md:items-center">
                  <label className={pageFormLabelClassName('text-[13px] text-[#40576f]')}>Servicio</label>
                  <select className={pageSelectClassName()} {...controlA11yProps('Servicio')}>
                    <option>Todos los servicios</option>
                  </select>
                  <select className={pageSelectClassName()} {...controlA11yProps('Tipo de grafico')}>
                    <option>Grafico diario</option>
                  </select>
                  <input value={statisticsDateRange[0]} readOnly className={pageInputClassName()} {...controlA11yProps('Fecha inicial')} />
                  <span className="text-center text-[12px] text-[#40576f]">al</span>
                  <input value={statisticsDateRange[1]} readOnly className={pageInputClassName()} {...controlA11yProps('Fecha final')} />
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">Resumen</header>
                  <div className="p-4">
                    <div className="grid grid-cols-[1fr_110px] border border-[#d7e0ea] text-[13px] text-[#24364b]">
                      {[
                        ['Sesiones', '0'],
                        ['Tiempo', '00:00:00'],
                        ['Descarga', '0'],
                        ['Subida', '0'],
                      ].map(([label, value]) => (
                        <div key={label} className="contents">
                          <div className="border-b border-r border-[#d7e0ea] px-3 py-3">{label}</div>
                          <div className="border-b border-[#d7e0ea] px-3 py-3 text-right">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex justify-center">
                      <button type="button" className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd7e2] bg-white px-5 text-[13px] text-[#24364b]" {...controlA11yProps('Sitios visitados hoy')}>
                        <Monitor className="h-4 w-4" />
                        Sitios visitados Hoy
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded border border-[#d7e0ea] bg-white">
                  <header className="border-b border-[#d7e0ea] px-4 py-3 text-[13px] font-semibold text-[#2a3d53]">Grafico</header>
                  <div className="relative h-[300px] p-6">
                    {['top-[70px]', 'top-[122px]', 'top-[174px]', 'top-[226px]'].map((topClassName, row) => (
                      <div
                        key={`line-${row}`}
                        className={`absolute left-12 right-6 border-t border-[#dce4ec] ${topClassName}`}
                      />
                    ))}
                    <div className="absolute bottom-12 left-12 right-6 border-t border-[#dce4ec]" />
                    <div className="absolute bottom-12 left-12 top-6 border-l border-[#dce4ec]" />
                    <div className="absolute left-16 top-[122px] rounded border border-[#cfd7e2] bg-white px-3 py-2 text-[12px] text-[#24364b] shadow-sm">
                      <div>2026-03-22</div>
                      <div className="text-[#2f93e4]">DOWN: 0 MiB</div>
                      <div className="text-[#0f9488]">UP: 0 MiB</div>
                    </div>
                    <div className="absolute bottom-5 left-16 right-6 flex justify-between text-[11px] text-[#6d8198]">
                      {['2026-03-22', '2026-03-24', '2026-03-26', '2026-03-28', '2026-03-30', '2026-04-01', '2026-04-03', '2026-04-05'].map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <EmptyTableCard title="Historico" columns={['#', 'CONECTADO', 'DESCONECTADO', 'TIEMPO', 'DESCARGA', 'SUBIDA', 'IPV4', 'MAC', 'IP ROUTER']} />
            </div>
          ) : null}

          {activeTab === 'log' ? (
            <BillingDataTable
              columns={clientLogColumns}
              rows={paginatedLogRows}
              pageSize={logPageSize}
              onPageSizeChange={(value) => {
                setLogPageSize(value);
                setLogCurrentPage(1);
              }}
              searchTerm={logSearchTerm}
              onSearchTermChange={(value) => {
                setLogSearchTerm(value);
                setLogCurrentPage(1);
              }}
              toolbarExtras={
                <>
                  <input
                    value="01/04/2026"
                    readOnly
                    className="h-8 w-[108px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                    {...controlA11yProps('Fecha inicial de logs')}
                  />
                  <span className="text-[12px] text-[#415970]">al</span>
                  <input
                    value="30/04/2026"
                    readOnly
                    className="h-8 w-[108px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                    {...controlA11yProps('Fecha final de logs')}
                  />
                  <select
                    className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                    {...controlA11yProps('Filtro de logs')}
                  >
                    <option>Todos los logs</option>
                  </select>
                </>
              }
              columnMenuOpen={logColumnMenuOpen}
              onToggleColumnMenu={() => setLogColumnMenuOpen((current) => !current)}
              columnMenuRef={logColumnMenuRef}
              exportMenuOpen={false}
              onToggleExportMenu={() => undefined}
              exportMenuRef={logExportMenuRef}
              onPrint={() => undefined}
              onExportCsv={() => undefined}
              onExportExcel={() => undefined}
              onExportPdf={() => undefined}
              showExportButton={false}
              visibleColumnKeys={logVisibleColumnKeys}
              onToggleColumn={toggleLogColumn}
              summary={logSummary}
              currentPage={safeLogCurrentPage}
              onPrevPage={() => setLogCurrentPage((current) => Math.max(1, current - 1))}
              onNextPage={() => setLogCurrentPage((current) => Math.min(logTotalPages, current + 1))}
              canGoPrev={safeLogCurrentPage > 1}
              canGoNext={safeLogCurrentPage < logTotalPages}
            />
          ) : null}

          {(activeTab as string) === '__legacy_log__' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <select className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none" {...controlA11yProps('Cantidad de logs')}>
                  <option>15</option>
                </select>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#30465f]" {...controlA11yProps('Vista de lista de logs')}>
                  <List className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="inline-flex h-8 items-center rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b]" {...controlA11yProps('Fecha inicial de logs')}>
                  01/04/2026
                </button>
                <span className="text-[12px] text-[#415970]">al</span>
                <button type="button" className="inline-flex h-8 items-center rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b]" {...controlA11yProps('Fecha final de logs')}>
                  30/04/2026
                </button>
                <select className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none" {...controlA11yProps('Filtro de logs')}>
                  <option>Todos los logs</option>
                </select>
                <div className="relative ml-auto">
                  <input type="text" placeholder="Buscar..." className="h-8 w-[260px] rounded border border-[#d7e0ea] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none" {...controlA11yProps('Buscar en logs')} />
                  <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a0aebe]" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px] text-[#24364b]">
                  <thead>
                    <tr className="bg-white">
                      <th className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">FECHA</th>
                      <th className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">DETALLE</th>
                      <th className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">OPERADOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.log.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="border border-[#d7e0ea] px-4 py-8 text-center text-[13px] text-[#7d8da1]">
                          Ningun registro disponible
                        </td>
                      </tr>
                    ) : (
                      draft.log.map((entry) => (
                        <tr key={entry.id}>
                          <td className="border border-[#d7e0ea] px-3 py-2">{entry.date}</td>
                          <td className="border border-[#d7e0ea] px-3 py-2">{entry.detail}</td>
                          <td className="border border-[#d7e0ea] px-3 py-2">{entry.operator}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#607488]">
                <span>Mostrando de 1 al {draft.log.length} de un total de {draft.log.length}</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]" {...controlA11yProps('Pagina anterior de logs')}>
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#2f93e4] text-[12px] font-semibold text-white" {...controlA11yProps('Pagina 1')}>
                    1
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]" {...controlA11yProps('Pagina siguiente de logs')}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {billingDialogOpen === 'free' ? (
        <BillingInvoiceDialog
          title="Nueva Factura Libre"
          loading={billingDialogLoading}
          dueDate={freeInvoiceDueDate}
          onDueDateChange={setFreeInvoiceDueDate}
          issueDate={freeInvoiceIssueDate}
          onIssueDateChange={setFreeInvoiceIssueDate}
          lines={freeInvoiceLines}
          onLineChange={handleFreeInvoiceLineChange}
          onAddLine={handleAddFreeInvoiceLine}
          onAddProducts={handleAddInvoiceProducts}
          summaryItems={[
            { label: 'Subtotal', value: formatBs(freeInvoiceTotals.subtotal), symbol: '+' },
            { label: 'Impuesto', value: formatBs(freeInvoiceTotals.tax) },
          ]}
          totalLabel={formatBs(freeInvoiceTotals.total)}
          onClose={closeBillingDialog}
          onSubmit={handleSubmitFreeInvoice}
        />
      ) : null}

      {billingDialogOpen === 'service' ? (
        <BillingInvoiceDialog
          title="Nueva Factura Servicio"
          loading={billingDialogLoading}
          dueDate={serviceInvoiceDueDate}
          onDueDateChange={setServiceInvoiceDueDate}
          issueDate={serviceInvoiceIssueDate}
          onIssueDateChange={setServiceInvoiceIssueDate}
          lines={serviceInvoiceLines}
          onLineChange={handleServiceInvoiceLineChange}
          onAddLine={handleAddServiceInvoiceLine}
          onRemoveLine={handleRemoveServiceInvoiceLine}
          onAddProducts={handleAddInvoiceProducts}
          summaryItems={[
            { label: 'Subtotal', value: formatBs(serviceInvoiceTotals.subtotal), symbol: '−' },
            { label: 'Descuento', value: 'Bs. 0', symbol: '+' },
            { label: 'Impuesto', value: formatBs(serviceInvoiceTotals.tax), symbol: '+' },
            { label: 'Otros Impuesto', value: 'Bs. 0.00' },
          ]}
          totalLabel={formatBs(serviceInvoiceTotals.total)}
          onClose={closeBillingDialog}
          onSubmit={handleSubmitServiceInvoice}
        />
      ) : null}

      {ticketDialogOpen ? (
        <TicketDialog
          loading={ticketDialogLoading}
          values={ticketForm}
          onFieldChange={updateTicketFormField}
          onClose={closeTicketDialog}
          onSubmit={handleSubmitTicket}
        />
      ) : null}
    </div>
  );
}
