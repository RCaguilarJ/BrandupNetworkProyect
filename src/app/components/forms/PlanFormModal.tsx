import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { sanitizeDecimalValue } from '../../lib/input-sanitizers';

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function PlanFormModal({ open, onClose, onSubmit, initialData }: PlanFormModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    speed: initialData?.speed || '',
    price: initialData?.price || '',
    currency: initialData?.currency || 'MXN',
    billingCycle: initialData?.billingCycle || 'monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: formData.price === '' ? '' : parseFloat(String(formData.price).replace(',', '.')),
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Editar Plan' : 'Nuevo Plan de Servicio'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-200">Nombre del Plan *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="ej. Fibra 100 Mbps"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="description" className="dark:text-gray-200">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción del plan"
              rows={3}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="speed" className="dark:text-gray-200">Velocidad *</Label>
              <Input
                id="speed"
                value={formData.speed}
                onChange={(e) => handleChange('speed', e.target.value)}
                placeholder="ej. 100 Mbps"
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
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
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency" className="dark:text-gray-200">Moneda *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billingCycle" className="dark:text-gray-200">Ciclo de Facturación *</Label>
              <Select value={formData.billingCycle} onValueChange={(value) => handleChange('billingCycle', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Crear Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
