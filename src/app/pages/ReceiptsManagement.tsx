import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { type ReceiptManagementRecord } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Expand,
  FileText,
  List,
  Pencil,
  Plus,
  RefreshCw,
  SquarePlus,
} from 'lucide-react';
import { toast } from 'sonner';

const SYSTEM_RECEIPTS: ReceiptManagementRecord[] = [
  {
    id: 'receipt-electronic-ticket',
    receiptName: 'BOLETA ELECTRONICA',
    createdAt: '13/06/2023',
    status: 'active',
    canEdit: true,
    canCreateSeries: true,
    canManageTemplate: true,
  },
  {
    id: 'receipt-electronic-invoice',
    receiptName: 'FACTURA ELECTRONICA',
    createdAt: '13/06/2023',
    status: 'active',
    canEdit: true,
    canCreateSeries: true,
    canManageTemplate: true,
  },
  {
    id: 'receipt-voucher',
    receiptName: 'RECIBO',
    createdAt: '13/06/2023',
    status: 'active',
    canEdit: true,
    canCreateSeries: true,
    canManageTemplate: true,
  },
];

export default function ReceiptsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Catalogo base de tipos de comprobante administrados por el sistema.
   * Backend debe reemplazar esta fuente por el listado persistido sin alterar
   * el contrato tipado ni la estructura visual aprobada.
   */
  const records = useMemo(() => SYSTEM_RECEIPTS, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      record.receiptName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [records, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleRefresh() {
    toast.success('Listado de comprobantes actualizado');
  }

  function handleCreateReceipt() {
    toast.info('La creacion de comprobantes queda lista para integrarse con backend.');
  }

  function handleEditReceipt(record: ReceiptManagementRecord) {
    toast.info(`Edicion de ${record.receiptName} lista para conectarse con backend.`);
  }

  function handleCreateSeries(record: ReceiptManagementRecord) {
    toast.info(`Series de ${record.receiptName} listas para conectarse con backend.`);
  }

  function handleManageTemplate(record: ReceiptManagementRecord) {
    toast.info(`Plantilla de ${record.receiptName} lista para conectarse con backend.`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-6 pt-[18px]">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">
          Gestión de Comprobantes
        </h1>

        <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Comprobantes</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d7dfe8] px-4 py-3">
          <p className="text-[14px] text-[#1f2933]">Lista de comprobantes</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                toast.info('Accion de expandir lista pendiente de integracion visual.')
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Expandir"
              aria-label="Expandir listado de comprobantes"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Actualizar"
              aria-label="Actualizar listado de comprobantes"
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
                onClick={handleCreateReceipt}
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
                  <th className="w-[7%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">
                    N°
                  </th>
                  <th className="w-[45%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">
                    COMPROBANTE
                  </th>
                  <th className="w-[24%] border-r border-[#d7dfe8] px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]">
                    CREADO
                  </th>
                  <th className="w-[18%] border-r border-[#d7dfe8] px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]">
                    ESTADO
                  </th>
                  <th className="px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td
                      colSpan={5}
                      className="px-3 py-[18px] text-center text-[14px] text-[#374151]"
                    >
                      No hay informacion
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#111827]"
                    >
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">
                        {record.receiptName}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">
                        {record.createdAt}
                      </td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">
                        <span className="inline-flex rounded-[4px] bg-[#10b8b8] px-2 py-[2px] text-[11px] font-semibold text-white">
                          {record.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="px-3 py-[10px] text-center">
                        <div className="flex items-center justify-center gap-2">
                          {record.canEdit ? (
                            <button
                              type="button"
                              className="text-[#5b9bd5]"
                              onClick={() => handleEditReceipt(record)}
                              aria-label={`Editar comprobante ${record.receiptName}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}
                          {record.canCreateSeries ? (
                            <button
                              type="button"
                              className="text-[#10b8b8]"
                              onClick={() => handleCreateSeries(record)}
                              aria-label={`Crear serie para ${record.receiptName}`}
                            >
                              <SquarePlus className="h-4 w-4" />
                            </button>
                          ) : null}
                          {record.canManageTemplate ? (
                            <button
                              type="button"
                              className="text-[#4b5563]"
                              onClick={() => handleManageTemplate(record)}
                              aria-label={`Gestionar plantilla de ${record.receiptName}`}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          ) : null}
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
              ? 'Mostrando 0 Registros'
              : `Mostrando de ${(currentPage - 1) * pageSize + 1} al ${Math.min(
                  currentPage * pageSize,
                  filteredRecords.length,
                )} de un total de ${filteredRecords.length}`}
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
