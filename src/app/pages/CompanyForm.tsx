import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { MOCK_COMPANIES } from '../data/mockData';
import { toast } from 'sonner';

export default function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    fiscalName: '',
    rfc: '',
    email: '',
    phone: '',
    address: '',
    plan: 'Professional',
    status: 'active',
    timezone: 'America/Mexico_City',
    currency: 'MXN',
  });

  useEffect(() => {
    if (isEditing && id) {
      const company = MOCK_COMPANIES.find(c => c.id === id);
      if (company) {
        setFormData({
          name: company.name,
          fiscalName: company.fiscalName,
          rfc: company.rfc,
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          plan: company.plan,
          status: company.status,
          timezone: company.config.timezone,
          currency: company.config.currency,
        });
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success(isEditing ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente');
    navigate('/companies');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/companies')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Empresa' : 'Nueva Empresa ISP'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Modifica los datos de la empresa' : 'Registra una nueva empresa en la plataforma'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card className="max-w-4xl dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="dark:text-gray-200">Nombre Comercial *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Mi ISP"
                  required
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="fiscalName" className="dark:text-gray-200">Razón Social *</Label>
                <Input
                  id="fiscalName"
                  value={formData.fiscalName}
                  onChange={(e) => handleChange('fiscalName', e.target.value)}
                  placeholder="Mi ISP S.A. de C.V."
                  required
                  className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="rfc" className="dark:text-gray-200">RFC *</Label>
                <Input
                  id="rfc"
                  value={formData.rfc}
                  onChange={(e) => handleChange('rfc', e.target.value)}
                  placeholder="ABC123456XYZ"
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
              <Label htmlFor="email" className="dark:text-gray-200">Email Corporativo *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@miisp.com"
                required
                className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="address" className="dark:text-gray-200">Dirección Fiscal *</Label>
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
                <Label htmlFor="plan" className="dark:text-gray-200">Plan de Suscripción *</Label>
                <Select value={formData.plan} onValueChange={(value) => handleChange('plan', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="Starter">Starter - Hasta 100 clientes</SelectItem>
                    <SelectItem value="Professional">Professional - Hasta 500 clientes</SelectItem>
                    <SelectItem value="Enterprise">Enterprise - Ilimitado</SelectItem>
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
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="suspended">Suspendida</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timezone" className="dark:text-gray-200">Zona Horaria *</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectItem value="America/Mexico_City">América/Ciudad de México</SelectItem>
                    <SelectItem value="America/Cancun">América/Cancún</SelectItem>
                    <SelectItem value="America/Tijuana">América/Tijuana</SelectItem>
                    <SelectItem value="America/Monterrey">América/Monterrey</SelectItem>
                    <SelectItem value="America/Bogota">América/Bogotá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar Empresa' : 'Crear Empresa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
