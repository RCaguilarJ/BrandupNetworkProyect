import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { 
  CreditCard, 
  Search, 
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Trash2,
  List,
  Calendar
} from 'lucide-react';
import { MOCK_CLIENTS, MOCK_INVOICES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useViewTheme } from '../../context/ViewThemeContext';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../../lib/utils';

// Datos mock para pagos registrados
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
    amount: 0.20,
  },
];

export default function RegisterPayment() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [activeTab, setActiveTab] = useState<'register' | 'registered' | 'promises'>('register');
  const [searchType, setSearchType] = useState<'client' | 'invoice'>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtros para pagos registrados
  const [paymentType, setPaymentType] = useState('all');
  const [startDate, setStartDate] = useState('19/03/2026');
  const [endDate, setEndDate] = useState('19/03/2026');
  const [location, setLocation] = useState('all');
  const [operator, setOperator] = useState('all');
  const [router, setRouter] = useState('all');

  // Estados del formulario original
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const clients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const invoices = selectedClient
    ? MOCK_INVOICES.filter(i => i.clientId === selectedClient && (i.status === 'pending' || i.status === 'overdue'))
    : [];

  const selectedInvoiceData = invoices.find(i => i.id === selectedInvoice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !paymentMethod || !amount) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success('Pago registrado exitosamente');
    
    // Reset form
    setSelectedClient('');
    setSelectedInvoice('');
    setPaymentMethod('');
    setAmount('');
    setReference('');
    setNotes('');
  };

  const getClientName = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  // Totales para pagos registrados
  const totalCobrado = MOCK_REGISTERED_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  const totalComision = 0;
  const totalNeto = totalCobrado - totalComision;

  // Si es tema Mikrosystem, mostrar diseño con tabs
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        {/* Tabs superiores */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-4">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📋 Registrar pago
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'registered'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🛒 Pagos registrados (Hoy)
            </button>
            <button
              onClick={() => setActiveTab('promises')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'promises'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🕐 Promesas de pago (activos)
            </button>
            <button className="ml-auto p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido según tab activo */}
        <div className="p-6">
          {/* Tab: Registrar pago */}
          {activeTab === 'register' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {/* Radio buttons para tipo de búsqueda */}
              <div className="flex items-center gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === 'client'}
                    onChange={() => setSearchType('client')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscar Cliente
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === 'invoice'}
                    onChange={() => setSearchType('invoice')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscar Nº comprobante
                  </span>
                </label>
              </div>

              {/* Campo de búsqueda */}
              <div className="max-w-2xl">
                <input
                  type="text"
                  placeholder={searchType === 'client' ? 'Nombre o Nº de cliente a COBRAR/NIT/RUC/DNI' : 'Número de comprobante'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Mensaje informativo */}
              <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                {searchType === 'client' 
                  ? 'Ingresa el nombre o número del cliente para comenzar'
                  : 'Ingresa el número de comprobante para buscar'}
              </div>
            </div>
          )}

          {/* Tab: Pagos registrados */}
          {activeTab === 'registered' && (
            <>
              {/* Filtros superiores */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Tipo Pago */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo Pago
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">Cualquiera</option>
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                      <option value="card">Tarjeta</option>
                    </select>
                  </div>

                  {/* Fechas */}
                  <div className="md:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fechas
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                        />
                        <button className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-24 h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Ubicación */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ubicación
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">Cualquiera</option>
                    </select>
                  </div>

                  {/* Operador */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Operador
                    </label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">Cualquiera</option>
                    </select>
                  </div>

                  {/* Router */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Router
                    </label>
                    <select
                      value={router}
                      onChange={(e) => setRouter(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">Cualquiera</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs font-medium">
                    📄 Resumen PDF
                  </button>
                </div>
                <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600">
                  Buscar
                </button>
              </div>

              {/* Tabla */}
              <div className="bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          ID ▲
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          CLIENTE
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          # FACTURA
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          # LEGAL
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          # TRANSACCIÓN
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          TIPO
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          FECHA & HORA
                        </th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          COBRADO
                        </th>
                        <th className="text-center px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_REGISTERED_PAYMENTS.map((payment, index) => (
                        <tr
                          key={payment.id}
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/30'
                          }`}
                        >
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                            {payment.id}
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            {getClientName(payment.clientId)}
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                            {payment.invoiceFolio}
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            {payment.legalNumber}
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 font-mono text-gray-600 dark:text-gray-400">
                            {payment.transactionId}
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                              {payment.type}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            {new Date(payment.date).toLocaleString('es-MX')}
                          </td>
                          <td className="px-3 py-2.5 border-r border-gray-200 dark:border-gray-700 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Ver">
                                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Editar">
                                <FileText className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer con totales */}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
                  <div className="flex justify-center items-center gap-12 text-sm">
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">TOTAL COBRADO</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        USD {totalCobrado.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">TOTAL COMISION</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        USD {totalComision.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">TOTAL NETO</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        USD {totalNeto.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paginación */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    Mostrando de 1 al 1 de un total de 1
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-medium">
                      {currentPage}
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab: Promesas de pago */}
          {activeTab === 'promises' && (
            <>
              {/* Toolbar */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-7 px-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600">
                  Buscar
                </button>
              </div>

              {/* Tabla vacía */}
              <div className="bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          ID ▲
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          CLIENTE
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          # FACTURA
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          FECHA
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          FECHA CORTE
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                          OPERADOR
                        </th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">
                          DESCRIPCIÓN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={7} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                          Ningún registro disponible
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div>Mostrando 0 registros</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled
                    >
                      <ChevronRight className="w-4 h-4" />
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

  // Si es tema WispHub, mostrar formulario original
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar Pago</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Registra un pago manual de cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cliente */}
                <div>
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
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

                {/* Factura */}
                {selectedClient && (
                  <div>
                    <Label htmlFor="invoice">Factura (Opcional)</Label>
                    <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una factura o pago general" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Pago General (sin factura)</SelectItem>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.folio} - {formatCurrency(invoice.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Método de pago */}
                <div>
                  <Label htmlFor="method">Método de Pago *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="deposit">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monto */}
                <div>
                  <Label htmlFor="amount">Monto *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  {selectedInvoiceData && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Monto de factura: {formatCurrency(selectedInvoiceData.amount)}
                    </p>
                  )}
                </div>

                {/* Referencia */}
                <div>
                  <Label htmlFor="reference">Referencia / Folio</Label>
                  <Input
                    id="reference"
                    placeholder="Ej: 123456789"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                {/* Notas */}
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional del pago..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setSelectedClient('');
                    setSelectedInvoice('');
                    setPaymentMethod('');
                    setAmount('');
                    setReference('');
                    setNotes('');
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cliente seleccionado</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {clients.find(c => c.id === selectedClient)?.name}
                      </p>
                    </div>
                    {selectedInvoiceData && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Factura</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {selectedInvoiceData.folio}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {formatCurrency(selectedInvoiceData.amount)}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
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
              <CardTitle className="text-base">Métodos de Pago</CardTitle>
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
