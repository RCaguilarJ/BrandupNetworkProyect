import { useMemo, useState } from 'react';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

type StaffRecord = {
  id: string;
  name: string;
  username: string;
  email: string;
  roleLabel: string;
  statusLabel: string;
};

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: 'Administrador',
    isp_admin: 'Administrador',
    cobranza: 'Cobranza',
    soporte: 'Soporte',
    tecnico: 'Tecnico',
    cliente: 'Cliente',
  };

  return labels[role] ?? 'Operador';
}

function getInitials(name: string) {
  const parts = name
    .split(' ')
    .map((segment) => segment.trim())
    .filter(Boolean);

  return parts.slice(0, 2).map((segment) => segment[0]?.toUpperCase() ?? '').join('') || 'OP';
}

function ToolbarIconButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[48px] w-[56px] items-center justify-center border-l border-[#d7dfe8] text-[#3a4a5d] transition hover:bg-[#f6f9fc]"
      aria-label={title}
      title={title}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function StaffManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const records = useMemo<StaffRecord[]>(() => {
    if (!user) {
      return [];
    }

    return [
      {
        id: user.id,
        name: user.name,
        username: user.email.split('@')[0] ?? 'admin',
        email: user.email,
        roleLabel: getRoleLabel(user.role),
        statusLabel: 'ACTIVADO',
      },
    ];
  }, [user]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      [record.id, record.name, record.username, record.email, record.roleLabel]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [records, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleRefresh() {
    toast.success('Listado de operadores actualizado');
  }

  function handleCreateOperator() {
    toast.info('La creacion de operadores queda lista para integrarse con backend.');
  }

  function handleEditOperator(record: StaffRecord) {
    toast.info(`Edicion de ${record.name} lista para integrarse con backend.`);
  }

  function handleDeleteOperator(record: StaffRecord) {
    toast.info(`Eliminacion de ${record.name} lista para integrarse con backend.`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-6 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Operadores</h1>

        <SettingsBreadcrumb currentLabel="Gestion de personal" />
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d8e0ea]">
          <div className="px-6 py-4">
            <h2 className="text-[19px] font-semibold uppercase tracking-[0.02em] text-[#425466]">
              Gestion personal
            </h2>
          </div>

          <div className="flex items-center">
            <ToolbarIconButton
              icon={Expand}
              title="Expandir"
              onClick={() => toast.info('Accion de expandir pendiente de integracion visual.')}
            />
            <ToolbarIconButton
              icon={RefreshCw}
              title="Actualizar"
              onClick={handleRefresh}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-[4px] border border-[#d7dfe8] bg-white">
                <button
                  type="button"
                  className="flex h-[48px] min-w-[58px] items-center justify-center px-4 text-[18px] text-[#25364a]"
                  aria-label={`Mostrar ${pageSize} registros por pagina`}
                >
                  {pageSize}
                </button>
                <ToolbarIconButton
                  icon={List}
                  title="Vista de lista"
                  onClick={() => toast.info('Vista de lista ya activa.')}
                />
                <ToolbarIconButton
                  icon={Save}
                  title="Exportar"
                  onClick={() => toast.info('La exportacion queda lista para integrarse.')}
                />
              </div>

              <Button
                type="button"
                onClick={handleCreateOperator}
                className="h-[48px] rounded-[4px] bg-[#2f96f3] px-7 text-[16px] font-semibold text-white hover:bg-[#2288e4]"
              >
                <Plus className="mr-2 h-5 w-5" />
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
              className="h-[50px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#25364a] outline-none placeholder:text-[#c9d0d9] xl:w-[392px]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border border-[#d7dfe8] bg-white">
                  <th className="w-[5%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    ID
                  </th>
                  <th className="w-[29%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    Nombre
                  </th>
                  <th className="w-[11%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    Usuario
                  </th>
                  <th className="w-[25%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    Correo
                  </th>
                  <th className="w-[14%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    Rol
                  </th>
                  <th className="w-[10%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    Estado
                  </th>
                  <th className="w-[6%] px-3 py-[12px] text-center text-[14px] font-medium uppercase text-[#25364a]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td colSpan={7} className="px-3 py-[18px] text-center text-[14px] text-[#556274]">
                      No hay informacion
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => (
                    <tr key={record.id} className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#1f2933]">
                      <td className="border-r border-[#d7dfe8] px-3 py-[12px]">{record.id.replace(/\D/g, '') || '1'}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[6px]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#4a9df0] text-[16px] font-semibold text-white">
                            {getInitials(record.name)}
                          </span>
                          <span className="text-[17px] text-[#25364a]">{record.name}</span>
                        </div>
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[12px] text-[17px] text-[#25364a]">
                        {record.username}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[12px] text-[17px] text-[#25364a]">
                        {record.email}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[12px] text-[17px] text-[#25364a]">
                        {record.roleLabel}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[12px]">
                        <span className="inline-flex rounded-[4px] bg-[#12b7bb] px-3 py-[4px] text-[12px] font-semibold text-white">
                          {record.statusLabel}
                        </span>
                      </td>
                      <td className="px-3 py-[12px]">
                        <div className="flex items-center justify-center gap-2 text-[#25364a]">
                          <button
                            type="button"
                            onClick={() => handleEditOperator(record)}
                            aria-label={`Editar operador ${record.name}`}
                            title="Editar"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOperator(record)}
                            aria-label={`Eliminar operador ${record.name}`}
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-col gap-6 text-[14px] text-[#64748b] xl:flex-row xl:items-center xl:justify-between">
            <span className="text-[17px]">
              {filteredRecords.length === 0
                ? 'Mostrando de 0 al 0 de un total de 0'
                : `Mostrando de ${(currentPage - 1) * pageSize + 1} al ${Math.min(currentPage * pageSize, filteredRecords.length)} de un total de ${filteredRecords.length}`}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dfe8] bg-white text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="Ir a la pagina anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-[48px] min-w-[48px] items-center justify-center rounded-[6px] bg-[#2f96f3] px-4 text-[18px] font-medium text-white"
                aria-current="page"
              >
                {currentPage}
              </button>
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dfe8] bg-white text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages || filteredRecords.length === 0}
                aria-label="Ir a la pagina siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
