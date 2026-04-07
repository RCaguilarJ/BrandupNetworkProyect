import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { type UserManagementRecord } from '../types';
import {
  CircleX,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Expand,
  List,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeLettersValue, sanitizeNumericValue } from '../lib/input-sanitizers';

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: 'ADMINISTRADOR',
    isp_admin: 'ADMINISTRADOR',
    cobranza: 'COBRANZA',
    soporte: 'SOPORTE',
    tecnico: 'TECNICO',
    cliente: 'CLIENTE',
  };

  return labels[role] ?? role.toUpperCase();
}

type UserFormState = {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  profile: string;
  cellphone: string;
  status: 'active' | 'inactive';
};

const INITIAL_USER_FORM: UserFormState = {
  id: '',
  fullName: '',
  documentType: '',
  documentNumber: '',
  profile: '',
  cellphone: '',
  status: 'active',
};

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<UserManagementRecord[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [formState, setFormState] = useState<UserFormState>(INITIAL_USER_FORM);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      [record.fullName, record.documentType, record.documentNumber, record.profile, record.cellphone]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [records, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleRefresh() {
    toast.success('Listado de usuarios actualizado');
  }

  function resetForm() {
    setFormState(INITIAL_USER_FORM);
  }

  function handleCreateUser() {
    resetForm();
    setIsCreateUserOpen(true);
  }

  function handleCloseForm() {
    setIsCreateUserOpen(false);
    resetForm();
  }

  function handleNumericFieldChange(field: 'id' | 'documentNumber' | 'cellphone', value: string) {
    setFormState((current) => ({
      ...current,
      [field]: sanitizeNumericValue(value),
    }));
  }

  function handleLettersFieldChange(field: 'fullName', value: string) {
    setFormState((current) => ({
      ...current,
      [field]: sanitizeLettersValue(value),
    }));
  }

  function handleSaveUser() {
    const fullName = formState.fullName.trim();

    if (!formState.id || !fullName || !formState.documentType || !formState.documentNumber || !formState.profile) {
      toast.error('Completa los campos obligatorios del usuario.');
      return;
    }

    if (records.some((record) => record.id === formState.id)) {
      toast.error('El ID de usuario ya existe.');
      return;
    }

    const nextRecord: UserManagementRecord = {
      id: formState.id,
      fullName: fullName.toUpperCase(),
      documentType: formState.documentType,
      documentNumber: formState.documentNumber,
      profile: getRoleLabel(formState.profile),
      cellphone: formState.cellphone || '-',
      status: formState.status,
    };

    setRecords((current) => [nextRecord, ...current]);
    setCurrentPage(1);
    setIsCreateUserOpen(false);
    resetForm();
    toast.success('Usuario registrado correctamente.');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-6 pt-[18px]">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Gestion de Usuarios</h1>

        <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Usuarios</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d7dfe8] px-4 py-3">
          <p className="text-[14px] text-[#1f2933]">Lista de usuarios</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info('Accion de expandir lista pendiente de integracion visual.')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Expandir"
              aria-label="Expandir listado de usuarios"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Actualizar"
              aria-label="Actualizar listado de usuarios"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isCreateUserOpen ? (
          <div className="border-b border-[#d7dfe8] bg-[#f8fafc] px-4 py-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-medium text-[#111827]">Nuevo usuario</h2>
                <p className="text-[13px] text-[#6b7280]">El formulario inicia vacio y sin datos mock.</p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-white"
                aria-label="Cerrar formulario de nuevo usuario"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                ID de usuario
                <input
                  type="number"
                  min="0"
                  value={formState.id}
                  onChange={(event) => handleNumericFieldChange('id', event.target.value)}
                  placeholder="Ej. 1001"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Nombre completo
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(event) => handleLettersFieldChange('fullName', event.target.value)}
                  placeholder="Nombre del usuario"
                  inputMode="text"
                  pattern="[A-Za-zÀ-ÿ\\s'-]+"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Documento
                <select
                  value={formState.documentType}
                  onChange={(event) => setFormState((current) => ({ ...current, documentType: event.target.value }))}
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                >
                  <option value="">Seleccionar documento</option>
                  <option value="DNI">DNI</option>
                  <option value="INE">INE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                N documento
                <input
                  type="number"
                  min="0"
                  value={formState.documentNumber}
                  onChange={(event) => handleNumericFieldChange('documentNumber', event.target.value)}
                  placeholder="Solo numeros"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Perfil
                <select
                  value={formState.profile}
                  onChange={(event) => setFormState((current) => ({ ...current, profile: event.target.value }))}
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                >
                  <option value="">Seleccionar perfil</option>
                  <option value="super_admin">Administrador general</option>
                  <option value="isp_admin">Administrador ISP</option>
                  <option value="cobranza">Cobranza</option>
                  <option value="soporte">Soporte</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="cliente">Cliente</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Celular
                <input
                  type="number"
                  min="0"
                  value={formState.cellphone}
                  onChange={(event) => handleNumericFieldChange('cellphone', event.target.value)}
                  placeholder="Solo numeros"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Estado
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value === 'inactive' ? 'inactive' : 'active',
                    }))
                  }
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-[#cfd8e3] text-[#111827] hover:bg-white"
                onClick={handleCloseForm}
              >
                Cancelar
              </Button>
              <Button type="button" className="bg-[#10b8d4] text-white hover:bg-[#0ea5c0]" onClick={handleSaveUser}>
                Guardar usuario
              </Button>
            </div>
          </div>
        ) : null}

        <div className="px-4 py-[14px]">
          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="h-[34px] min-w-[40px] rounded-[4px] border border-[#d7dfe8] bg-white px-3 text-[14px] text-[#111827]"
                aria-label={`Mostrar ${pageSize} registros por pagina`}
              >
                {pageSize}
              </button>

              <button
                type="button"
                className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white text-[#374151]"
                title="Vista de lista"
                aria-label="Cambiar a vista de lista"
              >
                <List className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white text-[#374151]"
                title="Mas opciones"
                aria-label="Abrir mas opciones del listado"
              >
                <Ellipsis className="h-4 w-4" />
              </button>

              <Button
                type="button"
                onClick={handleCreateUser}
                variant="outline"
                size="sm"
                className="h-[34px] rounded-[4px] border-[#cfd8e3] px-4 text-[14px] font-medium text-[#111827] hover:bg-[#f8fafc]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo
              </Button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar..."
              className="h-[34px] w-full rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none placeholder:text-[#c0c7d1] xl:w-[200px]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border border-[#d7dfe8]">
                  <th className="w-[6%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">No</th>
                  <th className="w-[20%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">NOMBRE</th>
                  <th className="w-[15%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">DOCUMENTO</th>
                  <th className="w-[17%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">No DOCUMENTO</th>
                  <th className="w-[18%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">PERFIL</th>
                  <th className="w-[14%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">CELULAR</th>
                  <th className="w-[10%] border-r border-[#d7dfe8] px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]">ESTADO</th>
                  <th className="px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td colSpan={8} className="px-3 py-[18px] text-center text-[14px] text-[#374151]">
                      No hay informacion
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <tr key={record.id} className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#111827]">
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.fullName}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.documentType}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.documentNumber}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.profile}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {record.cellphone}
                        </span>
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">
                        <span className="inline-flex rounded-[4px] bg-[#10b8b8] px-2 py-[2px] text-[11px] font-semibold text-white">
                          {record.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="px-3 py-[10px]">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-[#5b9bd5]"
                            onClick={() => toast.info('Edicion de usuarios lista para conectarse con backend.')}
                            aria-label={`Editar usuario ${record.fullName}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="text-[#22c55e]"
                            onClick={() => toast.info('Accion de contacto lista para integrarse.')}
                            aria-label={`Contactar usuario ${record.fullName}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-4 pt-2 text-[14px] text-[#556274]">
          <span>
            {filteredRecords.length === 0
              ? 'Mostrando 0 registros'
              : `Mostrando de ${(currentPage - 1) * pageSize + 1} al ${Math.min(currentPage * pageSize, filteredRecords.length)} de un total de ${filteredRecords.length}`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#d7dfe8] text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Ir a la pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-[32px] min-w-[32px] items-center justify-center rounded-[4px] bg-[#10b8d4] px-3 text-[14px] text-white"
              aria-current="page"
            >
              {currentPage}
            </button>
            <button
              type="button"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#d7dfe8] text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || filteredRecords.length === 0}
              aria-label="Ir a la pagina siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
