import { useState } from 'react';
import { Button } from '../components/ui/button';
import { 
  CreditCard, 
  DollarSign, 
  Banknote, 
  Landmark,
  Wallet,
  Bitcoin,
  CheckCircle2,
  XCircle,
  Settings,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useViewTheme } from '../context/ViewThemeContext';
import { ThemedViewPanel, ThemedViewShell } from '../components/ThemedViewShell';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  countries: string[];
  enabled: boolean;
  configured: boolean;
  commission: number;
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  merchantId?: string;
  accountId?: string;
}

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Procesador de pagos líder en América Latina',
    icon: <Wallet className="w-6 h-6" />,
    countries: ['Argentina', 'Brasil', 'Chile', 'Colombia', 'México', 'Perú', 'Uruguay'],
    enabled: true,
    configured: true,
    commission: 3.99,
    apiKey: '••••••••••••••••',
    publicKey: 'APP_USR_••••••••'
  },
  {
    id: 'payu',
    name: 'PayU Latam',
    description: 'Solución de pagos para Latinoamérica',
    icon: <CreditCard className="w-6 h-6" />,
    countries: ['Colombia', 'Perú', 'Chile', 'Argentina', 'México', 'Brasil', 'Panamá'],
    enabled: true,
    configured: true,
    commission: 3.49,
    apiKey: '••••••••••••••••',
    merchantId: '508029',
    accountId: '512321'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Plataforma global de procesamiento de pagos',
    icon: <CreditCard className="w-6 h-6" />,
    countries: ['México', 'Brasil', 'Global'],
    enabled: true,
    configured: false,
    commission: 3.6,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pagos internacionales seguros',
    icon: <Wallet className="w-6 h-6" />,
    countries: ['Global'],
    enabled: false,
    configured: false,
    commission: 4.4,
  },
  {
    id: 'oxxo',
    name: 'OXXO Pay',
    description: 'Pagos en efectivo en tiendas OXXO',
    icon: <Banknote className="w-6 h-6" />,
    countries: ['México'],
    enabled: true,
    configured: true,
    commission: 2.5,
    apiKey: '••••••••••••••••'
  },
  {
    id: 'pagoefectivo',
    name: 'PagoEfectivo',
    description: 'Pagos en efectivo y online en Perú',
    icon: <Banknote className="w-6 h-6" />,
    countries: ['Perú'],
    enabled: false,
    configured: false,
    commission: 2.95,
  },
  {
    id: 'khipu',
    name: 'Khipu',
    description: 'Transferencias bancarias instantáneas',
    icon: <Landmark className="w-6 h-6" />,
    countries: ['Chile'],
    enabled: false,
    configured: false,
    commission: 1.49,
  },
  {
    id: 'pse',
    name: 'PSE',
    description: 'Pagos Seguros en Línea - Colombia',
    icon: <Landmark className="w-6 h-6" />,
    countries: ['Colombia'],
    enabled: true,
    configured: true,
    commission: 2.0,
    merchantId: '••••••••'
  },
  {
    id: 'transferencia',
    name: 'Transferencia Bancaria',
    description: 'Transferencias directas a cuenta bancaria',
    icon: <Landmark className="w-6 h-6" />,
    countries: ['Todos'],
    enabled: true,
    configured: true,
    commission: 0,
  },
  {
    id: 'efectivo',
    name: 'Efectivo',
    description: 'Pagos en efectivo en oficina',
    icon: <DollarSign className="w-6 h-6" />,
    countries: ['Todos'],
    enabled: true,
    configured: true,
    commission: 0,
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin / Crypto',
    description: 'Pagos con criptomonedas',
    icon: <Bitcoin className="w-6 h-6" />,
    countries: ['Global'],
    enabled: false,
    configured: false,
    commission: 1.0,
  }
];

export default function PaymentMethods() {
  const [methods, setMethods] = useState(initialPaymentMethods);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const { theme } = useViewTheme();

  const handleToggleMethod = (id: string) => {
    setMethods(methods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const handleConfigure = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowModal(true);
  };

  const handleSaveConfiguration = () => {
    if (selectedMethod) {
      setMethods(methods.map(method =>
        method.id === selectedMethod.id 
          ? { ...selectedMethod, configured: true }
          : method
      ));
      setShowModal(false);
      setSelectedMethod(null);
    }
  };

  const toggleShowKey = (field: string) => {
    setShowKeys({ ...showKeys, [field]: !showKeys[field] });
  };

  const enabledMethods = methods.filter(m => m.enabled);
  const configuredMethods = methods.filter(m => m.configured);
  const averageCommission = enabledMethods.length > 0
    ? (enabledMethods.reduce((sum, m) => sum + m.commission, 0) / enabledMethods.length).toFixed(2)
    : '0.00';

  return (
    <ThemedViewShell
      eyebrow="Pasarelas y cobro"
      title="Metodos de Pago"
      description="La pantalla conserva la misma informacion funcional, pero ahora cada tema define un ambiente visual distinto para la presentacion del catalogo y la configuracion."
      actions={
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurar
        </Button>
      }
      stats={[
        {
          label: 'Total metodos',
          value: methods.length,
          helper: 'Catalogo disponible',
          icon: <CreditCard className="w-5 h-5" />,
          tone: 'primary',
        },
        {
          label: 'Habilitados',
          value: enabledMethods.length,
          helper: 'Listos para cobrar',
          icon: <CheckCircle2 className="w-5 h-5" />,
          tone: 'success',
        },
        {
          label: 'Configurados',
          value: configuredMethods.length,
          helper: 'Con credenciales listas',
          icon: <Settings className="w-5 h-5" />,
          tone: 'neutral',
        },
        {
          label: 'Comision prom.',
          value: `${averageCommission}%`,
          helper: 'Costo de procesamiento',
          icon: <DollarSign className="w-5 h-5" />,
          tone: 'warning',
        },
      ]}
    >
      {false && (
      <>
      {/* Header */}
      <div className="pt-4 lg:pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Métodos de Pago</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configura y gestiona los métodos de pago disponibles para tus clientes
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Métodos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{methods.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Habilitados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{enabledMethods.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configurados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{configuredMethods.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comisión Prom.</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {(enabledMethods.reduce((sum, m) => sum + m.commission, 0) / enabledMethods.length).toFixed(2)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      </>
      )}

      {/* Alert */}
      <div className="themed-view-panel bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-300">
              Importante: Seguridad de las credenciales
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Las credenciales de API se almacenan de forma segura y encriptada. Nunca compartas tus claves secretas.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`themed-view-panel bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
              method.enabled
                ? 'border-blue-500 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  method.enabled
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  {method.icon}
                </div>
                <button
                  onClick={() => handleToggleMethod(method.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {method.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {method.description}
              </p>

              {/* Countries */}
              <div className="flex flex-wrap gap-1 mb-3">
                {method.countries.slice(0, 3).map((country) => (
                  <span
                    key={country}
                    className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {country}
                  </span>
                ))}
                {method.countries.length > 3 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    +{method.countries.length - 3}
                  </span>
                )}
              </div>

              {/* Status & Commission */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {method.configured ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {method.configured ? 'Configurado' : 'Sin configurar'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {method.commission}% comisión
                </span>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleConfigure(method)}
                variant={method.configured ? 'outline' : 'default'}
                className="w-full"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                {method.configured ? 'Reconfigurar' : 'Configurar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showModal && selectedMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {selectedMethod.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Configurar {selectedMethod.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMethod.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                {/* API Key */}
                {selectedMethod.id !== 'transferencia' && selectedMethod.id !== 'efectivo' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Key / Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys['apiKey'] ? 'text' : 'password'}
                          value={selectedMethod.apiKey || ''}
                          onChange={(e) => setSelectedMethod({ ...selectedMethod, apiKey: e.target.value })}
                          placeholder="Ingresa tu API Key"
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => toggleShowKey('apiKey')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showKeys['apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Public Key */}
                    {(selectedMethod.id === 'mercadopago' || selectedMethod.id === 'stripe') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Public Key
                        </label>
                        <input
                          type="text"
                          value={selectedMethod.publicKey || ''}
                          onChange={(e) => setSelectedMethod({ ...selectedMethod, publicKey: e.target.value })}
                          placeholder="Ingresa tu Public Key"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Merchant ID */}
                    {(selectedMethod.id === 'payu' || selectedMethod.id === 'pse') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Merchant ID
                        </label>
                        <input
                          type="text"
                          value={selectedMethod.merchantId || ''}
                          onChange={(e) => setSelectedMethod({ ...selectedMethod, merchantId: e.target.value })}
                          placeholder="Ingresa tu Merchant ID"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Account ID */}
                    {selectedMethod.id === 'payu' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account ID
                        </label>
                        <input
                          type="text"
                          value={selectedMethod.accountId || ''}
                          onChange={(e) => setSelectedMethod({ ...selectedMethod, accountId: e.target.value })}
                          placeholder="Ingresa tu Account ID"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Bank Account Info for Transferencia */}
                {selectedMethod.id === 'transferencia' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Banco
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre del banco"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        placeholder="1234567890"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titular
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre del titular"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Cash Info */}
                {selectedMethod.id === 'efectivo' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Los pagos en efectivo se registran manualmente cuando el cliente realiza el pago en la oficina.
                    </p>
                  </div>
                )}

                {/* Commission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comisión (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedMethod.commission}
                    onChange={(e) => setSelectedMethod({ ...selectedMethod, commission: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Enabled Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Habilitar método</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Los clientes podrán usar este método para pagar
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMethod({ ...selectedMethod, enabled: !selectedMethod.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedMethod.enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedMethod.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveConfiguration}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ThemedViewShell>
  );
}
