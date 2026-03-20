import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Globe, 
  DollarSign, 
  Bell, 
  Shield, 
  Mail, 
  MessageSquare,
  CreditCard,
  Lock,
  Database,
  Zap,
  Building2,
  User,
  Palette,
  Key,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { MOCK_COMPANIES } from '../data/mockData';

export default function Settings() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const [activeTab, setActiveTab] = useState('general');

  // Si es ISP Admin, mostrar configuración de su empresa
  const company = user?.role === 'isp_admin' 
    ? MOCK_COMPANIES.find(c => c.id === user.companyId)
    : null;

  const tabs = user?.role === 'super_admin' 
    ? [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'licenses', label: 'Licencias', icon: Shield },
        { id: 'billing', label: 'Facturación', icon: DollarSign },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'security', label: 'Seguridad', icon: Lock },
        { id: 'integrations', label: 'Integraciones', icon: Zap },
      ]
    : [
        { id: 'company', label: 'Empresa', icon: Building2 },
        { id: 'billing', label: 'Facturación', icon: DollarSign },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'appearance', label: 'Apariencia', icon: Palette },
        { id: 'users', label: 'Usuarios', icon: User },
      ];

  // Vista Mikrosystem - Tabs verticales con diseño compacto
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-900">
        {/* Header oscuro */}
        <div className="bg-gray-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">
            {user?.role === 'super_admin' ? 'Configuración Global' : 'Configuración de Empresa'}
          </h1>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Super Admin Tabs */}
            {user?.role === 'super_admin' && (
              <>
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Configuración Global del Sistema
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Zona Horaria por Defecto
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm">
                            <option>America/Mexico_City</option>
                            <option>America/Bogota</option>
                            <option>America/Lima</option>
                            <option>America/Santiago</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Moneda por Defecto
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm">
                            <option>MXN - Peso Mexicano</option>
                            <option>COP - Peso Colombiano</option>
                            <option>PEN - Sol Peruano</option>
                            <option>USD - Dólar Americano</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'licenses' && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Gestión de Licencias
                      </h2>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Plan Enterprise</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Empresas ilimitadas, todas las funcionalidades
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Activo
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Empresas Activas</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">3 de ilimitadas</p>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Ilimitado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Configuración de Facturación
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configuración de facturación global del sistema
                    </p>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Configuración de Notificaciones
                    </h2>
                    <div className="space-y-3">
                      {[
                        'Notificaciones por email',
                        'Notificaciones push',
                        'Alertas de sistema',
                        'Recordatorios automáticos'
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
                          <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Configuración de Seguridad
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tiempo de sesión (minutos)
                        </label>
                        <input
                          type="number"
                          defaultValue={120}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Requerir autenticación de dos factores
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Integraciones
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Conecta servicios externos y APIs
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ISP Admin Tabs */}
            {user?.role === 'isp_admin' && company && (
              <>
                {activeTab === 'company' && (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Información de la Empresa
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre Comercial
                        </label>
                        <input
                          type="text"
                          defaultValue={company.name}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Razón Social
                        </label>
                        <input
                          type="text"
                          defaultValue={company.fiscalName}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          RFC / NIT
                        </label>
                        <input
                          type="text"
                          defaultValue={company.rfc}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          País
                        </label>
                        <input
                          type="text"
                          defaultValue={company.country}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Personalización de Apariencia
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tema de Color
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm">
                          <option>Tema Mikrosystem (Azul/Gris)</option>
                          <option>Tema WispHub (Verde)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Logo de la Empresa
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-4 text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Arrastra tu logo aquí o haz clic para seleccionar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista WispHub original
  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="pt-4 lg:pt-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'super_admin' ? 'Configuración Global' : 'Configuración de Empresa'}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'super_admin' 
            ? 'Administra la configuración de la plataforma'
            : `Configuración de ${company?.name || 'tu empresa'}`
          }
        </p>
      </div>

      {user?.role === 'super_admin' && (
        <>
          {/* Configuración global */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <CardTitle>Configuración Global del Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria por Defecto
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>America/Mexico_City</option>
                    <option>America/Bogota</option>
                    <option>America/Lima</option>
                    <option>America/Santiago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda por Defecto
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>MXN - Peso Mexicano</option>
                    <option>COP - Peso Colombiano</option>
                    <option>PEN - Sol Peruano</option>
                    <option>USD - Dólar Americano</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>

          {/* Licencias */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <CardTitle>Gestión de Licencias</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Plan Enterprise</h4>
                    <p className="text-sm text-gray-600 mt-1">Empresas ilimitadas, todas las funcionalidades</p>
                  </div>
                  <Badge variant="success">Activo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Empresas Activas</h4>
                    <p className="text-sm text-gray-600 mt-1">3 de ilimitadas</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Ilimitado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Información de la empresa (ISP Admin) */}
      {user?.role === 'isp_admin' && company && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <CardTitle>Información de la Empresa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  defaultValue={company.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social
                </label>
                <input
                  type="text"
                  defaultValue={company.fiscalName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFC / NIT
                </label>
                <input
                  type="text"
                  defaultValue={company.rfc}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Horaria
                </label>
                <select 
                  defaultValue={company.config.timezone}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>America/Mexico_City</option>
                  <option>America/Bogota</option>
                  <option>America/Lima</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Facturación */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin') && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <CardTitle>Configuración de Facturación</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de Facturación
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  defaultValue={company?.config.billingDay || 1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de Gracia
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  defaultValue={company?.config.graceDays || 5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Corte
                </label>
                <input
                  type="time"
                  defaultValue={company?.config.cutoffTime || '23:59'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select 
                  defaultValue={company?.config.currency || 'MXN'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="PEN">PEN - Sol Peruano</option>
                  <option value="USD">USD - Dólar</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button>Guardar Configuración</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métodos de pago */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin') && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <CardTitle>Métodos de Pago</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Tarjeta de Crédito/Débito', 'SPEI / Transferencia', 'Efectivo', 'PayPal', 'Mercado Pago'].map((method) => (
                <div key={method} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="font-medium text-gray-900">{method}</span>
                  </div>
                  <Button variant="ghost" size="sm">Configurar</Button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button>Guardar Métodos</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notificaciones */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-yellow-600" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-600">Recibir notificaciones por correo</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">SMS</h4>
                <p className="text-sm text-gray-600">Alertas importantes por SMS</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Telegram</h4>
                <p className="text-sm text-gray-600">Notificaciones en Telegram</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Web</h4>
                <p className="text-sm text-gray-600">Notificaciones del navegador</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
          <div className="mt-4">
            <Button>Guardar Preferencias</Button>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-600" />
            <CardTitle>Seguridad</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Autenticación de Dos Factores (2FA)</h4>
                <p className="text-sm text-gray-600">Agrega una capa extra de seguridad</p>
              </div>
              <Button variant="outline" size="sm">Activar</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Sesiones Activas</h4>
                <p className="text-sm text-gray-600">Gestiona tus dispositivos conectados</p>
              </div>
              <Button variant="outline" size="sm">Ver Sesiones</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Cambiar Contraseña</h4>
                <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
              </div>
              <Button variant="outline" size="sm">Cambiar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integraciones */}
      {(user?.role === 'super_admin' || user?.role === 'isp_admin') && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <CardTitle>Integraciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Stripe</h4>
                  <Badge variant="success">Conectado</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Pasarela de pagos en línea</p>
                <Button variant="outline" size="sm" className="w-full">Configurar</Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">MercadoPago</h4>
                  <Badge>No conectado</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Pagos en Latinoamérica</p>
                <Button variant="outline" size="sm" className="w-full">Conectar</Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Telegram Bot</h4>
                  <Badge variant="success">Conectado</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Notificaciones vía Telegram</p>
                <Button variant="outline" size="sm" className="w-full">Configurar</Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Twilio SMS</h4>
                  <Badge>No conectado</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Envío de SMS</p>
                <Button variant="outline" size="sm" className="w-full">Conectar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}