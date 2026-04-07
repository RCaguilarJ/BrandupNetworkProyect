import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { sanitizeDecimalValue } from '../../lib/input-sanitizers';

interface PromotionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function PromotionFormModal({ open, onClose, onSubmit, initialData }: PromotionFormModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    discount: initialData?.discount || '',
    type: initialData?.type || 'percentage',
    status: initialData?.status || 'active',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      discount:
        formData.discount === ''
          ? ''
          : parseFloat(String(formData.discount).replace(',', '.')),
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Editar Promoción' : 'Nueva Promoción'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-200">Nombre de la Promoción *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="ej. Primer Mes al 50%"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="description" className="dark:text-gray-200">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción de la promoción"
              rows={3}
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="dark:text-gray-200">Tipo de Descuento *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                  <SelectItem value="fixed">Cantidad Fija</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount" className="dark:text-gray-200">
                {formData.type === 'percentage' ? 'Porcentaje *' : 'Cantidad *'}
              </Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => handleChange('discount', sanitizeDecimalValue(e.target.value))}
                inputMode="decimal"
                placeholder={formData.type === 'percentage' ? '50' : '200.00'}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="dark:text-gray-200">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="dark:text-gray-200">Fecha de Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="dark:text-gray-200">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Crear Promoción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
