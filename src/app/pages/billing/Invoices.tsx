import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  Ban,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Filter,
  List,
  Mail,
  Play,
  RefreshCw,
  Search,
  Settings2,
  Table2,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import type {
  MikrosystemListaFacturasAccion,
  MikrosystemListaFacturasDatos,
  WispHubListaFacturasBoton,
  WispHubListaFacturasDatos,
} from '../../types';

const fuenteWispHubClasica =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, sans-serif';

const estilosWispHub = {
  pagina: {
    minHeight: '100%',
    backgroundColor: '#ffffff',
    borderTop: '4px solid #45bf63',
    color: '#17273d',
    fontFamily: fuenteWispHubClasica,
    paddingBottom: '28px',
  } satisfies CSSProperties,
  encabezado: {
    borderBottom: '1px solid #d7dde5',
    padding: '22px 12px 24px',
    marginBottom: '28px',
  } satisfies CSSProperties,
  panel: {
    border: '1px solid #d7dde5',
    backgroundColor: '#ffffff',
    margin: '0 12px 20px',
    padding: '10px',
  } satisfies CSSProperties,
  input: {
    height: '34px',
    border: '1px solid #cfd6df',
    backgroundColor: '#ffffff',
    padding: '0 12px',
    color: '#20324a',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
  } satisfies CSSProperties,
  botonAzul: {
    height: '34px',
    border: '1px solid #1399da',
    backgroundColor: '#1fa9e6',
    color: '#ffffff',
    padding: '0 16px',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
  } satisfies CSSProperties,
} as const;

const estilosMikrosystem = {
  pagina: {
    minHeight: '100%',
    backgroundColor: '#d9e7f3',
    padding: '20px 22px 26px',
    color: '#223448',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  } satisfies CSSProperties,
  tarjeta: {
    border: '1px solid #d5dde7',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 0 rgba(15, 23, 42, 0.04)',
  } satisfies CSSProperties,
  encabezado: {
    backgroundColor: '#2f93e4',
    color: '#ffffff',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
  } satisfies CSSProperties,
  cuerpo: {
    padding: '16px',
  } satisfies CSSProperties,
} as const;

function obtenerIconoBotonWispHub(
  icono: WispHubListaFacturasBoton['icono'],
) {
  switch (icono) {
    case 'copiar':
      return <Copy className="h-3.5 w-3.5" />;
    case 'excel':
      return <FileSpreadsheet className="h-3.5 w-3.5" />;
    case 'documento':
      return <FileText className="h-3.5 w-3.5" />;
    case 'tabla':
      return <Table2 className="h-3.5 w-3.5" />;
    case 'dinero':
      return <DollarSign className="h-3.5 w-3.5" />;
    case 'correo':
      return <Mail className="h-3.5 w-3.5" />;
    case 'cancelar':
      return <Ban className="h-3.5 w-3.5" />;
    case 'eliminar':
      return <Trash2 className="h-3.5 w-3.5" />;
    default:
      return <Wrench className="h-3.5 w-3.5" />;
  }
}

function obtenerClasesBotonWispHub(
  color: WispHubListaFacturasBoton['color'],
) {
  const mapa = {
    verde: 'border-[#42b960] bg-[#45bf63] text-white',
    azul: 'border-[#189edb] bg-[#1fa9e6] text-white',
    cian: 'border-[#18a4d6] bg-[#1bb1df] text-white',
    rojo: 'border-[#eb5148] bg-[#f04f44] text-white',
  } satisfies Record<WispHubListaFacturasBoton['color'], string>;

  return mapa[color];
}

function obtenerIconoAccionMikrosystem(
  icono: MikrosystemListaFacturasAccion['icono'],
) {
  switch (icono) {
    case 'lista':
      return <List className="h-3.5 w-3.5" />;
    case 'herramientas':
      return <Settings2 className="h-3.5 w-3.5" />;
    default:
      return <RefreshCw className="h-3.5 w-3.5" />;
  }
}

export default function Invoices() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(isWispHub ? 10 : 15);
  const [statusFilter, setStatusFilter] = useState(
    isWispHub ? '' : 'cualquiera',
  );
  const [startDate, setStartDate] = useState(
    isWispHub ? '01/02/2026' : '01/03/2026',
  );
  const [endDate, setEndDate] = useState(
    isWispHub ? '01/04/2026' : '31/03/2026',
  );
  const [routerFilter, setRouterFilter] = useState('cualquiera');
  const [dateType, setDateType] = useState('vencimiento');
  const [bulkAction, setBulkAction] = useState('');

  const datosWispHub: WispHubListaFacturasDatos = {
    tituloPagina: 'Lista de Facturas',
    filtrosFecha: {
      desde: startDate,
      hasta: endDate,
      botonTexto: 'Filtrar',
    },
    accionesLote: {
      placeholder: '----------',
      opciones: [
        { valor: 'marcar-pagadas', etiqueta: 'Marcar pagadas' },
        { valor: 'reenviar', etiqueta: 'Reenviar factura' },
        { valor: 'cancelar', etiqueta: 'Cancelar factura' },
      ],
      botonTexto: 'Ejecutar',
    },
    tabla: {
      selectorRegistrosLabel: 'Mostrar',
      placeholderBusquedaGeneral: 'Buscar',
      botonesExportacion: [
        { id: 'copiar', etiqueta: '', icono: 'copiar', color: 'verde', variante: 'icono' },
        { id: 'excel', etiqueta: '', icono: 'excel', color: 'verde', variante: 'icono' },
        { id: 'documento', etiqueta: '', icono: 'documento', color: 'verde', variante: 'icono' },
        { id: 'tabla', etiqueta: 'Tabla', icono: 'tabla', color: 'verde', variante: 'selector' },
      ],
      botonesAccion: [
        { id: 'dinero', etiqueta: '', icono: 'dinero', color: 'verde', variante: 'icono' },
        { id: 'documento-accion', etiqueta: '', icono: 'documento', color: 'cian', variante: 'icono' },
        { id: 'correo', etiqueta: '', icono: 'correo', color: 'verde', variante: 'icono' },
        { id: 'cancelar', etiqueta: '', icono: 'cancelar', color: 'rojo', variante: 'icono' },
        { id: 'eliminar', etiqueta: '', icono: 'eliminar', color: 'azul', variante: 'icono' },
      ],
      botonesMenu: [
        { id: 'herramientas', etiqueta: '', icono: 'herramientas', color: 'azul', variante: 'menu' },
      ],
      columnas: [
        { clave: 'numeroFactura', titulo: '#Factura', placeholderFiltro: 'Buscar #Factura' },
        { clave: 'cajero', titulo: 'Cajero', placeholderFiltro: 'Buscar Cajero' },
        { clave: 'usuario', titulo: 'Usuario', placeholderFiltro: 'Buscar Usuario' },
        { clave: 'cliente', titulo: 'Cliente', placeholderFiltro: 'Buscar Cliente' },
        { clave: 'fechaPago', titulo: 'Fecha Pago', placeholderFiltro: 'Buscar Fecha Pago' },
        { clave: 'estado', titulo: 'Estado', placeholderFiltro: 'Buscar Estado' },
        { clave: 'zona', titulo: 'Zona', placeholderFiltro: 'Buscar Zona' },
        { clave: 'totalCobrado', titulo: 'Total Cobrado', placeholderFiltro: 'Buscar Total Cobrado' },
        { clave: 'formaPago', titulo: 'Forma de Pago', placeholderFiltro: 'Buscar Forma de Pago' },
        { clave: 'total', titulo: 'Total', placeholderFiltro: 'Buscar Total' },
        { clave: 'accion', titulo: 'Acción', placeholderFiltro: 'Buscar Acción' },
      ],
      filas: [],
      totalSeleccionados: 0,
      totalMontoTexto: '$0.00',
    },
  };

  const datosMikrosystem: MikrosystemListaFacturasDatos = {
    tituloPagina: 'Facturas',
    filtros: {
      tipoFecha: dateType,
      desde: startDate,
      hasta: endDate,
      router: routerFilter,
      estado: statusFilter,
      opcionesTipoFecha: [
        { valor: 'vencimiento', etiqueta: 'Vencimiento' },
        { valor: 'emitido', etiqueta: 'Emitido' },
        { valor: 'pagado', etiqueta: 'Pagado' },
      ],
      opcionesRouter: [
        { valor: 'cualquiera', etiqueta: 'Cualquiera' },
      ],
      opcionesEstado: [
        { valor: 'cualquiera', etiqueta: 'Cualquiera' },
        { valor: 'pagado', etiqueta: 'Pagado' },
        { valor: 'pendiente', etiqueta: 'Pendiente' },
        { valor: 'anulado', etiqueta: 'Anulado' },
      ],
    },
    accionesRapidas: [
      { id: 'lista', etiqueta: '', icono: 'lista', variante: 'icono' },
      { id: 'herramientas', etiqueta: 'Herramientas', icono: 'herramientas', variante: 'boton' },
    ],
    tabla: {
      placeholderBusquedaGeneral: 'Buscar...',
      tamanoPagina: 15,
      paginaActual: 1,
      total: 0,
      columnas: [
        { clave: 'numeroFactura', titulo: 'N° FACTURA', placeholderFiltro: 'Buscar' },
        { clave: 'numeroLegal', titulo: 'N° LEGAL', placeholderFiltro: 'Buscar' },
        { clave: 'tipo', titulo: 'TIPO', placeholderFiltro: 'Buscar' },
        { clave: 'cliente', titulo: 'CLIENTE', placeholderFiltro: 'Buscar' },
        { clave: 'fechaEmitido', titulo: 'F. EMITIDO', placeholderFiltro: 'Buscar' },
        { clave: 'fechaVencimiento', titulo: 'F. VENCIMIENTO', placeholderFiltro: 'Buscar' },
        { clave: 'total', titulo: 'TOTAL', placeholderFiltro: 'Buscar' },
        { clave: 'saldo', titulo: 'SALDO', placeholderFiltro: 'Buscar' },
        { clave: 'formaPago', titulo: 'FORMA DE PAGO', placeholderFiltro: 'Buscar' },
        { clave: 'numeroIdentificacion', titulo: 'N° IDENTIFICACIÓN', placeholderFiltro: 'Buscar' },
        { clave: 'estado', titulo: 'ESTADO', placeholderFiltro: 'Buscar' },
      ],
      filas: [],
    },
    resumen: [
      { detalle: 'Pagadas', cantidad: 0, impuesto: '$ 0.00', total: '$ 0.00', cobrado: '$ 0.00', variante: 'turquesa' },
      { detalle: 'No pagadas', cantidad: 0, impuesto: '$ 0.00', total: '$ 0.00', cobrado: '$ 0.00', variante: 'amarillo' },
      { detalle: 'Vencidas', cantidad: 0, impuesto: '$ 0.00', total: '$ 0.00', cobrado: '$ 0.00', variante: 'rosa' },
      { detalle: 'Anuladas', cantidad: 0, impuesto: '$ 0.00', total: '$ 0.00', cobrado: '$ 0.00', variante: 'rosa' },
      { detalle: 'TOTALES', cantidad: 0, impuesto: '$ 0.00', total: '$ 0.00', cobrado: '$ 0.00', variante: 'azul' },
    ],
  };

  if (isWispHub) {
    return (
      <div style={estilosWispHub.pagina}>
        <header style={estilosWispHub.encabezado}>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#45bf63]" strokeWidth={2} />
            <h1 className="text-[2.05rem] font-semibold leading-none text-[#0f1f35]">
              {datosWispHub.tituloPagina}
            </h1>
          </div>
        </header>

        <section style={estilosWispHub.panel}>
          <div className="flex flex-wrap items-end gap-7">
            <div>
              <label className="mb-2 block text-[12px] font-semibold">Desde</label>
              <div className="flex">
                <input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  style={estilosWispHub.input}
                  className="w-[340px]"
                />
                <button type="button" className="h-[34px] w-[40px] border border-l-0 border-[#cfd6df] bg-[#f4f6f8] text-[#53657a]">
                  <CalendarDays className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold">Hasta</label>
              <div className="flex">
                <input
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  style={estilosWispHub.input}
                  className="w-[340px]"
                />
                <button type="button" className="h-[34px] w-[40px] border border-l-0 border-[#cfd6df] bg-[#f4f6f8] text-[#53657a]">
                  <CalendarDays className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>

            <button type="button" style={estilosWispHub.botonAzul} className="inline-flex items-center gap-1.5">
              <Filter className="h-4 w-4" />
              {datosWispHub.filtrosFecha.botonTexto}
            </button>
          </div>

          <div className="mt-4 text-[17px] text-[#1f2f42]">
            Total <strong>{datosWispHub.tabla.totalMontoTexto}</strong>
          </div>
        </section>

        <section style={estilosWispHub.panel}>
          <div className="flex flex-wrap items-center gap-6">
            <span className="min-w-[135px] text-[12px] text-[#20324a]">Acciónes en Lote:</span>
            <select
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value)}
              style={estilosWispHub.input}
              className="min-w-[560px] flex-1"
            >
              <option value="">{datosWispHub.accionesLote.placeholder}</option>
              {datosWispHub.accionesLote.opciones.map((option) => (
                <option key={option.valor} value={option.valor}>
                  {option.etiqueta}
                </option>
              ))}
            </select>
            <button type="button" style={estilosWispHub.botonAzul} className="inline-flex items-center gap-1.5">
              <Play className="h-4 w-4" />
              {datosWispHub.accionesLote.botonTexto}
            </button>
            <span className="text-[12px]">0 seleccionados/as</span>
          </div>
        </section>

        <section className="mx-[12px]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" className="inline-flex h-[33px] items-center gap-2 border border-[#42b960] bg-[#45bf63] px-3 text-[12px] font-medium text-white">
                {datosWispHub.tabla.selectorRegistrosLabel} {pageSize} registros
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {datosWispHub.tabla.botonesExportacion.map((button) => (
                <button
                  key={button.id}
                  type="button"
                  className={`inline-flex h-[33px] items-center justify-center gap-1.5 border px-3 text-[12px] ${obtenerClasesBotonWispHub(button.color)}`}
                >
                  {obtenerIconoBotonWispHub(button.icono)}
                  {button.etiqueta && <span>{button.etiqueta}</span>}
                  {button.variante === 'selector' && <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              ))}

              <span className="ml-1 text-[12px] text-[#20324a]">Botones de Acción:</span>

              {datosWispHub.tabla.botonesAccion.map((button) => (
                <button
                  key={button.id}
                  type="button"
                  className={`inline-flex h-[33px] w-[36px] items-center justify-center border text-[12px] ${obtenerClasesBotonWispHub(button.color)}`}
                >
                  {obtenerIconoBotonWispHub(button.icono)}
                </button>
              ))}

              {datosWispHub.tabla.botonesMenu.map((button) => (
                <button
                  key={button.id}
                  type="button"
                  className={`inline-flex h-[33px] w-[36px] items-center justify-center border text-[12px] ${obtenerClasesBotonWispHub(button.color)}`}
                >
                  {obtenerIconoBotonWispHub(button.icono)}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#17273d]">
              Buscar:
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-[30px] w-[160px] border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none"
              />
            </label>
          </div>

          <div className="border border-[#d7dde5] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-white">
                    <th className="w-[42px] border border-[#d7dde5] px-2 py-2 text-center">
                      <input type="checkbox" disabled className="h-4 w-4" />
                    </th>
                    {datosWispHub.tabla.columnas.map((column) => (
                      <th key={column.clave} className="border border-[#d7dde5] px-3 py-2 text-left font-bold text-[#1b2b41]">
                        <div className="flex items-center justify-between gap-2">
                          <span>{column.titulo}</span>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-[#c2cad4]" />
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-[#fbfcfd]">
                    <th className="border border-[#d7dde5] px-2 py-2 text-center">
                      <button type="button" className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#cfd6df] bg-white text-[12px] text-[#6c7a8d]">
                        B
                      </button>
                    </th>
                    {datosWispHub.tabla.columnas.map((column) => (
                      <th key={`${column.clave}-filter`} className="border border-[#d7dde5] px-2 py-2">
                        <input
                          type="text"
                          placeholder={column.placeholderFiltro}
                          className="h-[30px] w-full border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={datosWispHub.tabla.columnas.length + 1} className="border border-[#d7dde5] px-4 py-8 text-center text-[14px] text-[#37485f]">
                      Ningún dato disponible en esta tabla
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#20324a]">
            <div>Mostrando registros del 0 al 0 de un total de 0 registros</div>
            <div className="flex items-center">
              <button type="button" disabled className="h-[34px] border border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] opacity-60">
                Anterior
              </button>
              <button type="button" disabled className="h-[34px] border border-l-0 border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] opacity-60">
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={estilosMikrosystem.pagina}>
      <section style={estilosMikrosystem.tarjeta}>
        <header style={estilosMikrosystem.encabezado} className="flex items-center justify-between gap-3">
          <span>{datosMikrosystem.tituloPagina}</span>
          <div className="flex items-center gap-2">
            <button type="button" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div style={estilosMikrosystem.cuerpo}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2">
                <select
                  value={dateType}
                  onChange={(event) => setDateType(event.target.value)}
                  className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                >
                  {datosMikrosystem.filtros.opcionesTipoFecha.map((option) => (
                    <option key={option.valor} value={option.valor}>
                      {option.etiqueta}
                    </option>
                  ))}
                </select>

                <input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-8 w-[102px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                />
                <span className="inline-flex h-8 items-center border border-x-0 border-[#cfd7e2] bg-[#e8edf3] px-3 text-[12px] text-[#51657d]">
                  al
                </span>
                <input
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-8 w-[102px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#51657d]">Router</span>
                <select
                  value={routerFilter}
                  onChange={(event) => setRouterFilter(event.target.value)}
                  className="h-8 min-w-[138px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                >
                  {datosMikrosystem.filtros.opcionesRouter.map((option) => (
                    <option key={option.valor} value={option.valor}>
                      {option.etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#51657d]">Estado</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-8 min-w-[120px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
                >
                  {datosMikrosystem.filtros.opcionesEstado.map((option) => (
                    <option key={option.valor} value={option.valor}>
                      {option.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>

              {datosMikrosystem.accionesRapidas.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] ${
                    action.variante === 'icono' ? 'w-9 px-0' : ''
                  }`}
                >
                  {obtenerIconoAccionMikrosystem(action.icono)}
                  {action.etiqueta && <span>{action.etiqueta}</span>}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={datosMikrosystem.tabla.placeholderBusquedaGeneral}
                className="h-8 w-[260px] rounded border border-[#cfd7e2] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa8b7]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px] text-[#24364b]">
              <thead>
                <tr className="bg-white">
                  {datosMikrosystem.tabla.columnas.map((column) => (
                    <th key={column.clave} className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold">
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.titulo}</span>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                      </div>
                    </th>
                  ))}
                  <th className="w-[70px] border border-[#d7e0ea] px-3 py-2"></th>
                </tr>
                <tr className="bg-[#fbfdff]">
                  {datosMikrosystem.tabla.columnas.map((column) => (
                    <th key={`${column.clave}-filter`} className="border border-[#d7e0ea] px-2 py-2">
                      <input
                        type="text"
                        placeholder={column.placeholderFiltro}
                        className="h-8 w-full rounded border border-[#d7e0ea] bg-white px-3 text-[12px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
                      />
                    </th>
                  ))}
                  <th className="border border-[#d7e0ea] px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={datosMikrosystem.tabla.columnas.length + 1} className="border border-[#d7e0ea] px-4 py-14 text-center text-[13px] text-[#7d8da1]">
                    Sin datos cargados. La lista queda lista para facturas reales.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#51657d]">
            <div>Mostrando de 0 a 0 de un total de 0</div>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#2f93e4] text-[12px] font-semibold text-white">
                1
              </button>
              <button type="button" disabled className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-[1340px] overflow-x-auto">
            <table className="w-full border-collapse text-[12px] text-[#24364b]">
              <thead>
                <tr className="bg-white">
                  <th className="border border-[#d7e0ea] px-4 py-3 text-center font-semibold">DETALLE</th>
                  <th className="border border-[#d7e0ea] px-4 py-3 text-center font-semibold">CANTIDAD</th>
                  <th className="border border-[#d7e0ea] px-4 py-3 text-center font-semibold">IMPUESTO</th>
                  <th className="border border-[#d7e0ea] px-4 py-3 text-center font-semibold">TOTAL</th>
                  <th className="border border-[#d7e0ea] px-4 py-3 text-center font-semibold">COBRADO</th>
                </tr>
              </thead>
              <tbody>
                {datosMikrosystem.resumen.map((row) => {
                  const bgMap = {
                    turquesa: 'bg-[#b7e2e6]',
                    amarillo: 'bg-[#ffe5b7]',
                    rosa: 'bg-[#ffd1d1]',
                    azul: 'bg-[#c8e4f3]',
                  } as const;

                  return (
                    <tr key={row.detalle} className={bgMap[row.variante]}>
                      <td className="border border-[#d7e0ea] px-4 py-2.5 text-center">{row.detalle}</td>
                      <td className="border border-[#d7e0ea] px-4 py-2.5 text-center">{row.cantidad}</td>
                      <td className="border border-[#d7e0ea] px-4 py-2.5 text-center">{row.impuesto}</td>
                      <td className="border border-[#d7e0ea] px-4 py-2.5 text-center">{row.total}</td>
                      <td className="border border-[#d7e0ea] px-4 py-2.5 text-center">{row.cobrado}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
