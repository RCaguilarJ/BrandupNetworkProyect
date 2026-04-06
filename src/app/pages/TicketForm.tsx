import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { MOCK_TICKETS, MOCK_CLIENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function TicketForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const selectedTicket = isEditing && id ? MOCK_TICKETS.find((ticket) => ticket.id === id) : null;

  const [formData, setFormData] = useState({
    clientId: selectedTicket?.clientId ?? '',
    subject: selectedTicket?.subject ?? '',
    description: selectedTicket?.description ?? '',
    type: selectedTicket?.type ?? 'no_service',
    priority: selectedTicket?.priority ?? 'medium',
    status: selectedTicket?.status ?? 'open',
  });

  // Filtrar clientes según el usuario
  const availableClients = user?.role === 'super_admin'
    ? MOCK_CLIENTS
    : MOCK_CLIENTS.filter(c => c.companyId === user?.companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success(isEditing ? 'Ticket actualizado exitosamente' : 'Ticket creado exitosamente');
    navigate('/tickets');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Ticket' : 'Nuevo Ticket de Soporte'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Modifica los datos del ticket' : 'Registra un nuevo ticket de soporte técnico'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card className="max-w-4xl dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Información del Ticket</CardTitle>
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
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject" className="dark:text-gray-200">Asunto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Descripción breve del problema"
                required
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="description" className="dark:text-gray-200">Descripción Detallada *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe el problema con el mayor detalle posible"
                rows={6}
                required
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="type" className="dark:text-gray-200">Tipo de Problema *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="no_service">Sin Servicio</SelectItem>
                    <SelectItem value="intermittent">Servicio Intermitente</SelectItem>
                    <SelectItem value="billing">Facturación</SelectItem>
                    <SelectItem value="installation">Instalación</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="dark:text-gray-200">Prioridad *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="dark:text-gray-200">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={() => navigate('/tickets')}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar Ticket' : 'Crear Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
