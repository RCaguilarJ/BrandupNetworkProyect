import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Expand,
  List,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  fileName: string;
  createdAt: string;
  fileSize: number;
}

const DEFAULT_PAGE_SIZE = 15;

export default function Backups() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  /**
   * Punto de lectura del modulo "Base de datos".
   * El boton de Ajustes reutiliza esta pantalla para evitar una segunda vista duplicada.
   * Backend debe reemplazar el cuerpo del fetch por GET /api/v1/backups o el endpoint definitivo.
   */
  const loadBackups = useCallback(async () => {
    try {
      setLoading(true);

      // TODO: Integrar backend real.
      // const response = await fetch('/api/v1/backups');
      // const data = await response.json();
      // setBackups(data.backups);

      setBackups([]);
    } catch (error) {
      console.error('Error al cargar backups:', error);
      toast.error('No fue posible cargar las copias de seguridad');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBackups();
  }, [loadBackups]);

  const filteredBackups = useMemo(() => {
    return backups.filter((backup) =>
      backup.fileName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [backups, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBackups.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedBackups = filteredBackups.slice(pageStart, pageStart + pageSize);

  /**
   * Flujo preparado para POST de nueva copia.
   * Mientras no exista backend, solo comunica que la acción quedó lista para integrarse.
   */
  async function handleCreateBackup() {
    try {
      setIsCreatingBackup(true);

      // TODO: Integrar backend real.
      // await fetch('/api/v1/backups', { method: 'POST' });

      toast.info('La creación de copias queda lista para conectarse con backend.');
    } catch (error) {
      console.error('Error al crear backup:', error);
      toast.error('No fue posible iniciar la copia de seguridad');
    } finally {
      setIsCreatingBackup(false);
    }
  }

  async function handleRefresh() {
    await loadBackups();
    toast.success('Listado de copias actualizado');
  }

  const footerCountLabel =
    filteredBackups.length === 0
      ? 'Mostrando 0 Registros'
      : `Mostrando ${pageStart + 1}-${Math.min(pageStart + pageSize, filteredBackups.length)} Registros`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-6 pt-[18px]">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Copias de Seguridad</h1>

        <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Backup</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d7dfe8] px-4 py-3">
          <p className="text-[14px] text-[#1f2933]">Todas las copias</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info('Acción de expandir lista pendiente de integración visual.')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Expandir"
              aria-label="Expandir listado de copias"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Actualizar"
              aria-label="Actualizar listado de copias"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-[14px]">
          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="h-[34px] min-w-[40px] rounded-[4px] border border-[#d7dfe8] bg-white px-3 text-[14px] text-[#111827]"
                aria-label={`Mostrar ${pageSize} registros por página`}
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
                title="Más opciones"
                aria-label="Abrir más opciones del listado"
              >
                <Ellipsis className="h-4 w-4" />
              </button>

              <Button
                type="button"
                onClick={() => void handleCreateBackup()}
                disabled={isCreatingBackup}
                variant="outline"
                size="sm"
                className="h-[34px] rounded-[4px] border-[#cfd8e3] px-4 text-[14px] font-medium text-[#111827] hover:bg-[#f8fafc]"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isCreatingBackup ? 'Creando...' : 'Crear copia'}
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
                  <th className="w-[13%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">N°</th>
                  <th className="w-[32%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">ARCHIVO</th>
                  <th className="w-[27%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">CREADO</th>
                  <th className="px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">TAMAÑO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td colSpan={4} className="px-3 py-6 text-center text-[14px] text-[#4b5563]">
                      Cargando información...
                    </td>
                  </tr>
                ) : paginatedBackups.length === 0 ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td colSpan={4} className="px-3 py-[18px] text-center text-[14px] text-[#374151]">
                      No hay información
                    </td>
                  </tr>
                ) : (
                  paginatedBackups.map((backup, index) => (
                    <tr key={backup.id} className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#111827]">
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{pageStart + index + 1}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{backup.fileName}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{backup.createdAt}</td>
                      <td className="px-3 py-[10px]">{backup.fileSize}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-4 pt-2 text-[14px] text-[#556274]">
          <span>{footerCountLabel}</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#d7dfe8] text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Ir a la página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#d7dfe8] text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || filteredBackups.length === 0}
              aria-label="Ir a la página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
