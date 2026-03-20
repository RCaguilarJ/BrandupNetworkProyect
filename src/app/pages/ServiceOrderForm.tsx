import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { MOCK_SERVICE_ORDERS, MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ServiceOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    clientId: '',
    type: 'installation',
    scheduledDate: '',
    notes: '',
    status: 'pending',
  });

  // Filtrar clientes según el usuario
  const availableClients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  useEffect(() => {
    if (isEditing && id) {
      const order = MOCK_SERVICE_ORDERS.find(o => o.id === id);
      if (order) {
        setFormData({
          clientId: order.clientId,
          type: order.type,
          scheduledDate: order.scheduledDate || '',
          notes: order.notes || '',
          status: order.status,
        });
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success(isEditing ? 'Orden actualizada exitosamente' : 'Orden de servicio creada exitosamente');
    navigate('/service-orders');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getClientInfo = (clientId: string) => {
    const client = availableClients.find(c => c.id === clientId);
    return client;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/service-orders')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Modifica los datos de la orden' : 'Crea una nueva orden de trabajo de campo'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="clientId" className="dark:text-gray-200">Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)} required>
                    <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      {availableClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="type" className="dark:text-gray-200">Tipo de Servicio *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectItem value="installation">Instalación</SelectItem>
                        <SelectItem value="maintenance">Mantenimiento</SelectItem>
                        <SelectItem value="removal">Retiro de Servicio</SelectItem>
                        <SelectItem value="equipment_change">Cambio de Equipo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scheduledDate" className="dark:text-gray-200">Fecha y Hora Programada</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange('scheduledDate', e.target.value)}
                      className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="dark:text-gray-200">Notas e Instrucciones</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Información adicional para el técnico (materiales, herramientas, instrucciones especiales)"
                    rows={6}
                    className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="dark:text-gray-200">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="scheduled">Programada</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={() => navigate('/service-orders')}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? 'Actualizar Orden' : 'Crear Orden'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral con información del cliente */}
        <div>
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.clientId ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getClientInfo(formData.clientId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getClientInfo(formData.clientId)?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dirección</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getClientInfo(formData.clientId)?.address}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selecciona un cliente para ver su información
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
