import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Zap, Wifi, DollarSign, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { MOCK_PLANS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function Plans() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(MOCK_PLANS);
  
  // Filtrar planes según el usuario
  const filteredPlans = user?.role === 'super_admin'
    ? plans
    : plans.filter(p => p.companyId === user?.companyId);

  const handleDeletePlan = (planId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este plan?')) {
      setPlans(plans.filter(p => p.id !== planId));
      toast.success('Plan eliminado exitosamente');
    }
  };

  const getSubscriberCount = (planId: string) =>
    planId
      .split('')
      .reduce((sum, character) => sum + character.charCodeAt(0), 0) % 50 + 10;

  // Renderizar versión Mikrosystem
  if (viewTheme === 'mikrosystem') {
    return (
      <div className="px-4 lg:px-6 pb-4 lg:pb-6 bg-gray-100 dark:bg-gray-900">
        {/* Header compacto */}
        <div className="pt-4 lg:pt-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Planes y Servicios</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Gestión de planes de Internet y servicios adicionales
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/plans/new')}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo Plan
            </Button>
          </div>
        </div>

        {/* Resumen estadístico compacto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Planes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPlans.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${Math.round(filteredPlans.reduce((sum, p) => sum + p.price, 0) / filteredPlans.length)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan Más Popular</p>
                <p className="text-base font-bold text-gray-900 dark:text-white truncate">Fibra 100Mb</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">67</p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de planes estilo Mikrosystem */}
        <Card className="border-0 shadow-md mb-4">
          <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">Planes de Internet</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white border-0 text-xs">
                  {filteredPlans.length} planes
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">PLAN</th>
                    <th className="text-center px-4 py-2.5 font-semibold">VELOCIDAD</th>
                    <th className="text-center px-4 py-2.5 font-semibold">PRECIO</th>
                    <th className="text-center px-4 py-2.5 font-semibold">CICLO</th>
                    <th className="text-center px-4 py-2.5 font-semibold">SUSCRIPTORES</th>
                    <th className="text-center px-4 py-2.5 font-semibold">ESTADO</th>
                    <th className="text-center px-4 py-2.5 font-semibold">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan, index) => (
                    <tr 
                      key={plan.id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/30'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                            {plan.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-bold text-gray-900 dark:text-white">{plan.speed}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(plan.price, plan.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge 
                          variant={plan.billingCycle === 'monthly' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {plan.billingCycle === 'monthly' ? 'Mensual' : 'Quincenal'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getSubscriberCount(plan.id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/plans/${plan.id}/edit`)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Mostrando <strong>{filteredPlans.length}</strong> de <strong>{filteredPlans.length}</strong> planes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Servicios Adicionales - Tabla compacta */}
        <Card className="border-0 shadow-md mb-4">
          <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">Servicios Adicionales</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">SERVICIO</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">DESCRIPCIÓN</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">PRECIO</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">TIPO</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">IP Fija</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Dirección IP pública dedicada</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(150)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="default" className="text-xs">Mensual</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="success" className="text-xs">Activo</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Instalación</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Costo único de instalación</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(500)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary" className="text-xs">Único</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="success" className="text-xs">Activo</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Soporte Premium</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Atención prioritaria 24/7</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(199)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="default" className="text-xs">Mensual</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="info" className="text-xs">Opcional</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Promociones - Tabla compacta */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 bg-gray-800 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">Promociones Activas</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
              >
                <Plus className="w-3 h-3 mr-1" />
                Nueva
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">PROMOCIÓN</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">DESCRIPCIÓN</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">DESCUENTO</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">VIGENCIA</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Primer Mes al 50%</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Descuento del 50% en el primer mes de servicio</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
                        50%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">Permanente</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="success" className="text-xs">Activa</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Referido Amigo</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">$200 de descuento por cada amigo referido</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                        $200
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">Permanente</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="success" className="text-xs">Activa</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Pronto Pago</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">10% de descuento pagando antes del día 5</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 text-xs">
                        10%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">Mensual</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="warning" className="text-xs">Pendiente</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Versión original (WispHub y otros temas)
  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="pt-4 lg:pt-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planes y Servicios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configura los planes de servicio disponibles</p>
        </div>
        <Button onClick={() => navigate('/plans/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden">
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
            
            <CardContent className="p-6 relative">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(plan.price, plan.currency)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/ mes</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Velocidad</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.speed}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ciclo de facturación</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {plan.billingCycle === 'monthly' ? 'Mensual' : 'Quincenal'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Moneda</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.currency}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/plans/${plan.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Servicios adicionales */}
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="dark:text-white">Servicios Adicionales</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">IP Fija</h4>
                <Badge variant="success">Activo</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Dirección IP pública dedicada</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(150)}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Instalación</h4>
                <Badge variant="success">Activo</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Costo único de instalación</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(500)}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Soporte Premium</h4>
                <Badge variant="info">Opcional</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Atención prioritaria 24/7</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(199)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promociones */}
      <Card className="mt-6 dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="dark:text-white">Promociones Activas</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Promoción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Primer Mes al 50%</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Descuento del 50% en el primer mes de servicio</p>
              </div>
              <Badge variant="success">Activa</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Referido Amigo</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">$200 de descuento por cada amigo referido</p>
              </div>
              <Badge variant="success">Activa</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Pronto Pago</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">10% de descuento pagando antes del día 5</p>
              </div>
              <Badge variant="warning">Pendiente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
