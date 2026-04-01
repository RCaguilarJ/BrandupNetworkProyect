import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  List,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { MOCK_CLIENTS, MOCK_INVOICES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';

const MOCK_REGISTERED_PAYMENTS = [
  {
    id: '1',
    clientId: 'client-1',
    invoiceId: 'inv-1',
    invoiceFolio: '00002352',
    legalNumber: '2104',
    transactionId: '925864726839',
    type: 'SERVICIOS',
    date: '2026-03-19T10:00:55',
    amount: 0.2,
  },
];

type PaymentTab = 'register' | 'registered';
type SearchType = 'client' | 'invoice';

export default function RegisterPayment() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();

  const [activeTab, setActiveTab] = useState<PaymentTab>('register');
  const [searchType, setSearchType] = useState<SearchType>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [paymentType, setPaymentType] = useState('all');
  const [startDate, setStartDate] = useState('19/03/2026');
  const [endDate, setEndDate] = useState('19/03/2026');
  const [location, setLocation] = useState('all');
  const [operator, setOperator] = useState('all');
  const [router, setRouter] = useState('all');

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const clients =
    user?.role === 'super_admin'
      ? MOCK_CLIENTS
      : MOCK_CLIENTS.filter((client) => client.companyId === user?.companyId);

  const invoices = selectedClient
    ? MOCK_INVOICES.filter(
        (invoice) =>
          invoice.clientId === selectedClient &&
          (invoice.status === 'pending' || invoice.status === 'overdue'),
      )
    : [];

  const selectedInvoiceData = invoices.find((invoice) => invoice.id === selectedInvoice);

  const resetForm = () => {
    setSelectedClient('');
    setSelectedInvoice('');
    setPaymentMethod('');
    setAmount('');
    setReference('');
    setNotes('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedClient || !paymentMethod || !amount) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success('Pago registrado exitosamente');
    resetForm();
  };

  const getClientName = (clientId: string) => {
    const client = MOCK_CLIENTS.find((item) => item.id === clientId);
    return client?.name || 'N/A';
  };

  const totalCobrado = MOCK_REGISTERED_PAYMENTS.reduce((sum, payment) => sum + payment.amount, 0);
  const totalComision = 0;
  const totalNeto = totalCobrado - totalComision;

  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center px-4">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Registrar pago
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registered')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'registered'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Pagos registrados (Hoy)
            </button>
            <button
              type="button"
              className="ml-auto rounded p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Configuracion"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'register' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-6 flex items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === 'client'}
                    onChange={() => setSearchType('client')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscar cliente
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === 'invoice'}
                    onChange={() => setSearchType('invoice')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscar numero de comprobante
                  </span>
                </label>
              </div>

              <div className="max-w-2xl">
                <input
                  type="text"
                  placeholder={
                    searchType === 'client'
                      ? 'Nombre o numero de cliente a cobrar / NIT / RUC / DNI'
                      : 'Numero de comprobante'
                  }
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-12 w-full rounded border border-gray-300 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {searchType === 'client'
                  ? 'Ingresa el nombre o numero del cliente para comenzar'
                  : 'Ingresa el numero de comprobante para buscar'}
              </div>
            </div>
          )}

          {activeTab === 'registered' && (
            <>
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Tipo pago
                    </label>
                    <select
                      aria-label="Seleccionar tipo de pago"
                      value={paymentType}
                      onChange={(event) => setPaymentType(event.target.value)}
                      className="h-8 w-full rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">Cualquiera</option>
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                      <option value="card">Tarjeta</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-2 md:col-span-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Fechas
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Fecha inicio"
                          aria-label="Fecha de inicio"
                          value={startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          className="h-8 w-full rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                          aria-label="Abrir calendario"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Fecha fin"
                      aria-label="Fecha de fin"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="h-8 w-24 rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Ubicacion
                    </label>
                    <select
                      aria-label="Seleccionar ubicacion"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className="h-8 w-full rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">Cualquiera</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Operador
                    </label>
                    <select
                      aria-label="Seleccionar operador"
                      value={operator}
                      onChange={(event) => setOperator(event.target.value)}
                      className="h-8 w-full rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">Cualquiera</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Router
                    </label>
                    <select
                      aria-label="Seleccionar router"
                      value={router}
                      onChange={(event) => setRouter(event.target.value)}
                      className="h-8 w-full rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">Cualquiera</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-t-lg border border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <select
                    aria-label="Seleccionar cantidad de registros por pagina"
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="h-7 rounded border border-gray-300 px-2 text-xs focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button
                    type="button"
                    className="rounded border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                    aria-label="Cambiar vista"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Resumen PDF
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Buscar
                </button>
              </div>

              <div className="border-x border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                      <tr>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          ID
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          CLIENTE
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          # FACTURA
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          # LEGAL
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          # TRANSACCION
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          TIPO
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          FECHA Y HORA
                        </th>
                        <th className="border-r border-gray-200 px-3 py-2.5 text-right font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                          COBRADO
                        </th>
                        <th className="px-3 py-2.5 text-center font-semibold text-gray-700 dark:text-gray-300">
                          Accion
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_REGISTERED_PAYMENTS.map((payment, index) => (
                        <tr
                          key={payment.id}
                          className={`border-b border-gray-200 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
                            index % 2 === 0
                              ? 'bg-white dark:bg-gray-800'
                              : 'bg-gray-50/50 dark:bg-gray-900/30'
                          }`}
                        >
                          <td className="border-r border-gray-200 px-3 py-2.5 font-medium text-gray-900 dark:border-gray-700 dark:text-white">
                            {payment.id}
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 text-gray-900 dark:border-gray-700 dark:text-white">
                            {getClientName(payment.clientId)}
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 font-medium text-gray-900 dark:border-gray-700 dark:text-white">
                            {payment.invoiceFolio}
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            {payment.legalNumber}
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 font-mono text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            {payment.transactionId}
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 dark:border-gray-700">
                            <Badge className="bg-blue-100 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {payment.type}
                            </Badge>
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            {new Date(payment.date).toLocaleString('es-MX')}
                          </td>
                          <td className="border-r border-gray-200 px-3 py-2.5 text-right font-medium text-gray-900 dark:border-gray-700 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Ver"
                              >
                                <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Editar"
                              >
                                <FileText className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t-2 border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-900/50">
                  <div className="flex items-center justify-center gap-12 text-sm">
                    <div className="text-center">
                      <div className="mb-1 text-gray-600 dark:text-gray-400">TOTAL COBRADO</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        USD {totalCobrado.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-gray-600 dark:text-gray-400">TOTAL COMISION</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        USD {totalComision.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-gray-600 dark:text-gray-400">TOTAL NETO</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        USD {totalNeto.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <div>Mostrando de 1 al 1 de un total de 1</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-medium text-white"
                    >
                      {currentPage}
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar pago</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Registra un pago manual de cliente
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informacion del pago</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClient && (
                  <div>
                    <Label htmlFor="invoice">Factura (Opcional)</Label>
                    <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                      <SelectTrigger id="invoice">
                        <SelectValue placeholder="Selecciona una factura o pago general" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Pago general (sin factura)</SelectItem>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.folio} - {formatCurrency(invoice.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="method">Metodo de pago *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Selecciona metodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="deposit">Deposito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Monto *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    min="0"
                    step="0.01"
                  />
                  {selectedInvoiceData && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Monto de factura: {formatCurrency(selectedInvoiceData.amount)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reference">Referencia / Folio</Label>
                  <Input
                    id="reference"
                    placeholder="Ej: 123456789"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informacion adicional del pago..."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Registrar pago
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedClient ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cliente seleccionado
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {clients.find((client) => client.id === selectedClient)?.name}
                      </p>
                    </div>
                    {selectedInvoiceData && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Factura</p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {selectedInvoiceData.folio}
                        </p>
                        <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(selectedInvoiceData.amount)}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Search className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Selecciona un cliente para continuar
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Metodos de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Efectivo</span>
                  <span className="font-medium text-gray-900 dark:text-white">Inmediato</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transferencia</span>
                  <span className="font-medium text-gray-900 dark:text-white">24-48hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tarjeta</span>
                  <span className="font-medium text-gray-900 dark:text-white">Inmediato</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
