import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { MOCK_CLIENTS, MOCK_PLANS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const selectedClient = isEditing && id ? MOCK_CLIENTS.find((client) => client.id === id) : null;

  const [formData, setFormData] = useState({
    name: selectedClient?.name ?? '',
    email: selectedClient?.email ?? '',
    phone: selectedClient?.phone ?? '',
    address: selectedClient?.address ?? '',
    planId: selectedClient?.planId ?? '',
    fiscalId: selectedClient?.fiscalId ?? '',
    status: selectedClient?.status ?? 'active',
  });

  // Filtrar planes según el usuario
  const availablePlans = user?.role === 'super_admin'
    ? MOCK_PLANS
    : MOCK_PLANS.filter(p => p.companyId === user?.companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientPayload = {
      ...formData,
      companyId: user?.companyId || 'comp1',
      balance: 0,
      lastPayment: null,
      createdAt: new Date().toISOString(),
    };
    void clientPayload;

    toast.success(isEditing ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
    navigate('/clients');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Modifica los datos del cliente' : 'Registra un nuevo cliente en el sistema'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card className="max-w-4xl dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="dark:text-gray-200">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Juan Pérez García"
                required
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="dark:text-gray-200">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  required
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="dark:text-gray-200">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+52 55 1234 5678"
                  required
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="dark:text-gray-200">Dirección de Instalación *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Calle, Número, Colonia, CP, Ciudad, Estado"
                rows={3}
                required
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fiscalId" className="dark:text-gray-200">RFC (Opcional)</Label>
                <Input
                  id="fiscalId"
                  value={formData.fiscalId}
                  onChange={(e) => handleChange('fiscalId', e.target.value)}
                  placeholder="XAXX010101000"
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="planId" className="dark:text-gray-200">Plan de Servicio *</Label>
                <Select value={formData.planId} onValueChange={(value) => handleChange('planId', value)} required>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    {availablePlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.speed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="dark:text-gray-200">Estado Inicial</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                  <SelectItem value="overdue">Moroso</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
