import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { MOCK_PLANS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { sanitizeDecimalValue } from '../lib/input-sanitizers';
import { toast } from 'sonner';

export default function PlanForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const selectedPlan = isEditing && id ? MOCK_PLANS.find((plan) => plan.id === id) : null;

  const [formData, setFormData] = useState({
    name: selectedPlan?.name ?? '',
    description: selectedPlan?.description ?? '',
    speed: selectedPlan?.speed ?? '',
    price: selectedPlan ? selectedPlan.price.toString() : '',
    currency: selectedPlan?.currency ?? 'MXN',
    billingCycle: selectedPlan?.billingCycle ?? 'monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const planPayload = {
      ...formData,
      price: parseFloat(formData.price),
      companyId: user?.companyId || 'comp1',
    };
    void planPayload;

    toast.success(isEditing ? 'Plan actualizado exitosamente' : 'Plan creado exitosamente');
    navigate('/plans');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="px-4 pb-6 pt-2 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-3 sm:items-center sm:gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/plans')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Plan' : 'Nuevo Plan de Servicio'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Modifica los datos del plan' : 'Completa la información del nuevo plan'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card className="max-w-4xl dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Información del Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="dark:text-gray-200">Nombre del Plan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ej. Fibra 100 Mbps"
                required
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="description" className="dark:text-gray-200">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción detallada del plan"
                rows={4}
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="speed" className="dark:text-gray-200">Velocidad *</Label>
                <Input
                  id="speed"
                  value={formData.speed}
                  onChange={(e) => handleChange('speed', e.target.value)}
                  placeholder="ej. 100 Mbps"
                  required
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ejemplo: 100 Mbps, 200 Mbps, 1 Gbps
                </p>
              </div>

              <div>
                <Label htmlFor="price" className="dark:text-gray-200">Precio Mensual *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', sanitizeDecimalValue(e.target.value))}
                  inputMode="decimal"
                  placeholder="0.00"
                  required
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currency" className="dark:text-gray-200">Moneda *</Label>
                <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                    <SelectItem value="USD">USD - Dólar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="billingCycle" className="dark:text-gray-200">Ciclo de Facturación *</Label>
                <Select value={formData.billingCycle} onValueChange={(value) => handleChange('billingCycle', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/plans')} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? 'Actualizar Plan' : 'Crear Plan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
