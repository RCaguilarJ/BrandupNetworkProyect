import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { type CurrencyManagementRecord } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Expand,
  List,
  Pencil,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const SYSTEM_CURRENCIES: CurrencyManagementRecord[] = [
  {
    id: 'currency-pen',
    isoCode: 'PEN',
    currencyName: 'NUEVO SOL',
    languageCode: 'ES',
    symbol: 'S/.',
    createdAt: '13/06/2023',
    status: 'active',
  },
];

export default function CurrenciesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Catálogo base de divisas del sistema.
   * Backend debe reemplazar esta fuente por el listado real persistido sin alterar
   * la estructura visual ni el contrato de la pantalla.
   */
  const records = useMemo(() => SYSTEM_CURRENCIES, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      [
        record.isoCode,
        record.currencyName,
        record.languageCode,
        record.symbol,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [records, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleRefresh() {
    toast.success('Listado de divisas actualizado');
  }

  function handleCreateCurrency() {
    toast.info('La creación de divisas queda lista para integrarse con backend.');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-6 pt-[18px]">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Gestión de Divisas</h1>

        <div className="flex items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Divisas</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d7dfe8] px-4 py-3">
          <p className="text-[14px] text-[#1f2933]">Lista de divisas</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info('Acción de expandir lista pendiente de integración visual.')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Expandir"
              aria-label="Expandir listado de divisas"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Actualizar"
              aria-label="Actualizar listado de divisas"
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
                onClick={handleCreateCurrency}
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
                  <th className="w-[7%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">N°</th>
                  <th className="w-[9%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">ISO</th>
                  <th className="w-[18%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">MONEDA</th>
                  <th className="w-[16%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">LENGUAJE</th>
                  <th className="w-[15%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]">SIMBOLO</th>
                  <th className="w-[18%] border-r border-[#d7dfe8] px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]">CREADO</th>
                  <th className="w-[13%] border-r border-[#d7dfe8] px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]">ESTADO</th>
                  <th className="px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td colSpan={8} className="px-3 py-[18px] text-center text-[14px] text-[#374151]">
                      No hay información
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <tr key={record.id} className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#111827]">
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.isoCode}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.currencyName}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.languageCode}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px]">{record.symbol}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">{record.createdAt}</td>
                      <td className="border-r border-[#d7dfe8] px-3 py-[10px] text-center">
                        <span className="inline-flex rounded-[4px] bg-[#10b8b8] px-2 py-[2px] text-[11px] font-semibold text-white">
                          {record.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="px-3 py-[10px] text-center">
                        <button
                          type="button"
                          className="text-[#5b9bd5]"
                          onClick={() => toast.info('Edición de divisas lista para conectarse con backend.')}
                          aria-label={`Editar divisa ${record.currencyName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
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
              : `Mostrando de ${(currentPage - 1) * pageSize + 1} al ${Math.min(currentPage * pageSize, filteredRecords.length)} de un total de ${filteredRecords.length}`}
          </span>

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
