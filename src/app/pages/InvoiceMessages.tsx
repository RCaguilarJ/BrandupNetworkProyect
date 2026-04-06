import { useState } from 'react';
import SettingsBreadcrumb from '../components/SettingsBreadcrumb';
import { Button } from '../components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  List,
  Save,
} from 'lucide-react';

export default function InvoiceMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(15);
  const [currentPage] = useState(1);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-[30px] pb-8 pt-[18px]">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div />

        <SettingsBreadcrumb currentLabel="Mensajes Facturas" />
      </div>

      <div className="mb-6 rounded-[6px] bg-[#eef3f8] px-6 py-4 text-center text-[18px] leading-8 text-[#556274]">
        Permite crear Mensajes Personalizados que seran mostrados en los PDF de las Facturas/recibos. Para esto necesita agregar el tag <span className="font-semibold">{'{mensaje_personalizado}'}</span> en su plantilla de Factura/Recibo.
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d8e0ea] bg-white shadow-sm">
        <div className="bg-[#20262a] px-6 py-5">
          <h1 className="text-[18px] font-semibold text-white">Mensajes en factura</h1>
        </div>

        <div className="px-4 py-[18px]">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex overflow-hidden rounded-[4px] border border-[#d7dfe8] bg-white">
              <button
                type="button"
                className="flex h-[48px] min-w-[58px] items-center justify-center px-4 text-[18px] text-[#25364a]"
                aria-label={`Mostrar ${pageSize} registros por pagina`}
              >
                {pageSize}
              </button>

              <button
                type="button"
                className="flex h-[48px] w-[56px] items-center justify-center border-l border-[#d7dfe8] text-[#25364a]"
                title="Vista de lista"
                aria-label="Cambiar a vista de lista"
              >
                <List className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="flex h-[48px] w-[56px] items-center justify-center border-l border-[#d7dfe8] text-[#25364a]"
                title="Guardar"
                aria-label="Guardar configuracion"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar..."
              className="h-[50px] w-full rounded-[4px] border border-[#d7dfe8] px-4 text-[15px] text-[#25364a] outline-none placeholder:text-[#c9d0d9] xl:w-[392px]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border border-[#d7dfe8] bg-white">
                  <th className="w-[4%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    ID
                  </th>
                  <th className="w-[16%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    NOMBRE
                  </th>
                  <th className="w-[18%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    ACTIVA HASTA
                  </th>
                  <th className="w-[16%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    APLICADO A
                  </th>
                  <th className="w-[14%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    USUARIOS
                  </th>
                  <th className="w-[15%] border-r border-[#d7dfe8] px-3 py-[12px] text-left text-[14px] font-medium uppercase text-[#25364a]">
                    MENSAJE
                  </th>
                  <th className="w-[4%] border-r border-[#d7dfe8] px-3 py-[12px] text-center text-[14px] font-medium text-[#c7d0da]">
                    <Ellipsis className="mx-auto h-4 w-4" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-t-0 border-[#d7dfe8]">
                  <td colSpan={7} className="px-3 py-[28px] text-center text-[18px] text-[#374151]">
                    Cargando...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-6 pt-2 text-[16px] text-[#64748b]">
          <span>Mostrando 0 registros</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dfe8] bg-white text-[#94a3b8]"
              disabled
              aria-label="Ir a la pagina anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-[48px] w-[48px] items-center justify-center rounded-[6px] border border-[#d7dfe8] bg-white text-[#94a3b8]"
              disabled
              aria-label="Ir a la pagina siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
