import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Search, MoreVertical, Edit, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { MOCK_COMPANIES } from '../data/mockData';
import { formatDate } from '../lib/utils';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function Companies() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState(MOCK_COMPANIES);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.fiscalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
      setCompanies(companies.filter(c => c.id !== companyId));
      toast.success('Empresa eliminada exitosamente');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activa</Badge>;
      case 'suspended':
        return <Badge variant="warning">Suspendida</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactiva</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="pt-4 lg:pt-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Empresas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra las empresas registradas en la plataforma</p>
        </div>
        <Button onClick={() => navigate('/companies/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCompanies.map((company) => (
          <Card key={company.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.fiscalName}</p>
                    <p className="text-xs text-gray-500 mt-1">RFC: {company.rfc}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <div className="mt-1">
                    {getStatusBadge(company.status)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{company.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Zona Horaria</p>
                  <p className="text-sm text-gray-900 mt-1">{company.config.timezone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Moneda</p>
                  <p className="text-sm text-gray-900 mt-1">{company.config.currency}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Registrada: {formatDate(company.createdAt)}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/companies/${company.id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{companies.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {companies.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Suspendidas</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {companies.filter(c => c.status === 'suspended').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {companies.filter(c => c.status === 'inactive').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}