import { useState, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface TicketFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  clients: any[];
  initialData?: any;
}

export function TicketFormModal({ open, onClose, onSubmit, clients, initialData }: TicketFormModalProps) {
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || '',
    subject: initialData?.subject || '',
    description: initialData?.description || '',
    type: initialData?.type || 'no_service',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'open',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Editar Ticket' : 'Nuevo Ticket de Soporte'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientId" className="dark:text-gray-200">Cliente *</Label>
            <Select value={formData.clientId} onValueChange={(value: string) => handleChange('clientId', value)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('subject', e.target.value)}
              placeholder="Descripción breve del problema"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="description" className="dark:text-gray-200">Descripción Detallada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible"
              rows={4}
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="dark:text-gray-200">Tipo de Problema *</Label>
              <Select value={formData.type} onValueChange={(value: string) => handleChange('type', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
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
              <Select value={formData.priority} onValueChange={(value: string) => handleChange('priority', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Crear Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
