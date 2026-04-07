import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Eye,
  FileText,
  List,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
  Users,
} from 'lucide-react';
import { useViewTheme } from '../../context/ViewThemeContext';
import { TicketFormModal } from '../../components/forms/TicketFormModal';
import { ServiceProcessingDialog } from '../services/serviceShared';
import { useTicketCreationFlow } from '../services/serviceShared';
import { MOCK_CLIENTS } from '../../data/mockData';
import type {
  MikrosystemListaTicketsAccion,
  MikrosystemTicketsHoyDatos,
  WispHubListaTicketsBoton,
  WispHubTicketsHoyDatos,
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
    padding: '12px',
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
  botonVerde: {
    height: '34px',
    border: '1px solid #42b960',
    backgroundColor: '#45bf63',
    color: '#ffffff',
    padding: '0 16px',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
  } satisfies CSSProperties,
} as const;

const estilosMikrosystem = {
  pagina: {
    minHeight: '100%',
    backgroundColor: '#dbe6f2',
    padding: '18px 24px 28px',
    color: '#25364b',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  } satisfies CSSProperties,
  panel: {
    border: '1px solid #d6dee8',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(15, 23, 42, 0.04)',
  } satisfies CSSProperties,
  encabezado: {
    backgroundColor: '#0f8b8d',
    color: '#ffffff',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
  } satisfies CSSProperties,
} as const;

function obtenerIconoBotonWispHub(
  icono: WispHubListaTicketsBoton['icono'],
) {
  switch (icono) {
    case 'copiar':
      return <Copy className="h-3.5 w-3.5" />;
    case 'documento':
      return <FileText className="h-3.5 w-3.5" />;
    case 'tabla':
      return <Table2 className="h-3.5 w-3.5" />;
    case 'ojo':
      return <Eye className="h-3.5 w-3.5" />;
    case 'usuarios':
      return <Users className="h-3.5 w-3.5" />;
    case 'ubicacion':
      return <MapPin className="h-3.5 w-3.5" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

function obtenerClasesBotonWispHub(
  color: WispHubListaTicketsBoton['color'],
) {
  const mapa = {
    verde: 'border-[#42b960] bg-[#45bf63] text-white',
    azul: 'border-[#189edb] bg-[#1fa9e6] text-white',
    cian: 'border-[#18a4d6] bg-[#1bb1df] text-white',
    morado: 'border-[#9160d8] bg-[#9a67e2] text-white',
  } satisfies Record<WispHubListaTicketsBoton['color'], string>;

  return mapa[color];
}

function obtenerIconoAccionMikrosystem(
  icono: MikrosystemListaTicketsAccion['icono'],
) {
  switch (icono) {
    case 'lista':
      return <List className="h-3.5 w-3.5" />;
    case 'nuevo':
      return <Plus className="h-3.5 w-3.5" />;
    default:
      return <RefreshCw className="h-3.5 w-3.5" />;
  }
}

export default function TodayTickets() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const ticketFlow = useTicketCreationFlow();

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(isWispHub ? 10 : 15);
  const [startDate, setStartDate] = useState('01/03/2026');
  const [endDate, setEndDate] = useState('01/04/2026');
  const [ticketView, setTicketView] = useState('todos');
  const [bulkAction, setBulkAction] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [departmentFilter, setDepartmentFilter] = useState('todos');
  const [tickets, setTickets] = useState<any[]>([]);

  const handleCreateTicket = (data: any) => {
    const newTicket = {
      id: String(tickets.length + 1),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const datosWispHub: WispHubTicketsHoyDatos = {
    tituloPagina: 'Tickets de Hoy',
    filtros: {
      desde: startDate,
      hasta: endDate,
      vistaSeleccionada: ticketView,
      opcionesVista: [
        { valor: 'todos', etiqueta: 'Todos Los Tickets' },
        { valor: 'hoy', etiqueta: 'Tickets de Hoy' },
        { valor: 'abiertos', etiqueta: 'Abiertos hoy' },
      ],
      botonTexto: 'Filtrar',
    },
    buscadorCliente: {
      placeholder: 'Escriba el Nombre del Servicio/Ip cliente',
      botonTexto: 'Crear Ticket',
    },
    accionMasiva: {
      placeholder: '----------',
      botonTexto: 'Ejecutar',
    },
    tabla: {
      selectorRegistrosLabel: 'Mostrar',
      placeholderBusquedaGeneral: 'Buscar',
      botonesExportacion: [
        { id: 'copiar', etiqueta: '', icono: 'copiar', color: 'verde', variante: 'icono' },
        { id: 'documento', etiqueta: '', icono: 'documento', color: 'verde', variante: 'icono' },
        { id: 'tabla', etiqueta: 'Tabla', icono: 'tabla', color: 'verde', variante: 'selector' },
      ],
      botonesAccion: [
        { id: 'ver', etiqueta: '', icono: 'ojo', color: 'morado', variante: 'icono' },
        { id: 'usuarios', etiqueta: '', icono: 'usuarios', color: 'verde', variante: 'icono' },
        { id: 'ubicacion', etiqueta: '', icono: 'ubicacion', color: 'azul', variante: 'icono' },
        { id: 'ia', etiqueta: 'IA', icono: 'ia', color: 'azul', variante: 'menu' },
      ],
      columnas: [
        { clave: 'accion', titulo: 'Acción', placeholderFiltro: 'Buscar Acción' },
        { clave: 'numeroTicket', titulo: '#Ticket', placeholderFiltro: 'Buscar #Ticket' },
        { clave: 'cliente', titulo: 'Cliente', placeholderFiltro: 'Buscar Cliente' },
        { clave: 'asunto', titulo: 'Asunto', placeholderFiltro: 'Buscar Asunto' },
        { clave: 'abierto', titulo: 'Abierto', placeholderFiltro: 'Buscar Abierto' },
        { clave: 'estado', titulo: 'Estado', placeholderFiltro: 'Buscar Estado' },
        { clave: 'prioridad', titulo: 'Prioridad', placeholderFiltro: 'Buscar Prioridad' },
        { clave: 'numeroIp', titulo: 'N° IP', placeholderFiltro: 'Buscar N° IP' },
        { clave: 'ticketCerrado', titulo: 'Ticket cerrado', placeholderFiltro: 'Buscar Ticket cerrado' },
        { clave: 'ticketIniciado', titulo: 'Ticket iniciado', placeholderFiltro: 'Buscar Ticket iniciado' },
        { clave: 'duracionTicket', titulo: 'Duración del ticket', placeholderFiltro: 'Buscar Duración del ticket' },
      ],
      filas: [],
      totalSeleccionados: 0,
    },
  };

  const datosMikrosystem: MikrosystemTicketsHoyDatos = {
    tituloPagina: 'Ticket de Hoy',
    tituloPanel: 'Lista de Ticket Abiertos',
    breadcrumb: {
      inicio: 'Inicio',
      modulo: 'soporte',
    },
    accionesRapidas: [
      { id: 'lista', etiqueta: '', icono: 'lista', variante: 'icono' },
      { id: 'nuevo', etiqueta: 'Nuevo', icono: 'nuevo', variante: 'boton' },
    ],
    filtros: {
      estado: statusFilter,
      departamento: departmentFilter,
      opcionesEstado: [
        { valor: 'todos', etiqueta: 'Todos Ticket' },
        { valor: 'hoy', etiqueta: 'De hoy' },
        { valor: 'abiertos', etiqueta: 'Abiertos' },
      ],
      opcionesDepartamento: [
        { valor: 'todos', etiqueta: 'Todos departamento' },
        { valor: 'ventas', etiqueta: 'Ventas' },
        { valor: 'soporte', etiqueta: 'Soporte técnico' },
      ],
    },
    tabla: {
      placeholderBusquedaGeneral: 'Buscar...',
      tamanoPagina: 15,
      paginaActual: 1,
      total: 0,
      columnas: [
        { clave: 'numero', titulo: 'N°', placeholderFiltro: 'Buscar' },
        { clave: 'departamento', titulo: 'DEPARTAMENTO', placeholderFiltro: '' },
        { clave: 'remitente', titulo: 'REMITENTE', placeholderFiltro: 'Buscar' },
        { clave: 'asunto', titulo: 'ASUNTO', placeholderFiltro: 'Buscar' },
        { clave: 'tecnico', titulo: 'TÉCNICO', placeholderFiltro: 'Buscar' },
        { clave: 'fecha', titulo: 'FECHA', placeholderFiltro: 'Buscar' },
        { clave: 'ubicacion', titulo: 'UBICACIÓN', placeholderFiltro: 'Buscar' },
        { clave: 'abiertoPor', titulo: 'ABIERTO POR', placeholderFiltro: 'Buscar' },
        { clave: 'ultimaRespuesta', titulo: 'ÚLTIMA RSPTA.', placeholderFiltro: 'Buscar' },
      ],
      filas: [],
    },
  };

  if (isWispHub) {
    return (
      <div style={estilosWispHub.pagina}>
        <header style={estilosWispHub.encabezado}>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-[#45bf63]" strokeWidth={2} />
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
                  aria-label="Fecha desde"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  style={estilosWispHub.input}
                  className="w-[340px]"
                />
                <button type="button" aria-label="Seleccionar fecha desde" className="h-[34px] w-[40px] border border-l-0 border-[#cfd6df] bg-[#f4f6f8] text-[#53657a]">
                  <CalendarDays className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold">Hasta</label>
              <div className="flex">
                <input
                  aria-label="Fecha hasta"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  style={estilosWispHub.input}
                  className="w-[340px]"
                />
                <button type="button" aria-label="Seleccionar fecha hasta" className="h-[34px] w-[40px] border border-l-0 border-[#cfd6df] bg-[#f4f6f8] text-[#53657a]">
                  <CalendarDays className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold">Ver</label>
              <select
                aria-label="Ver tickets"
                value={ticketView}
                onChange={(event) => setTicketView(event.target.value)}
                style={estilosWispHub.input}
                className="w-[160px]"
              >
                {datosWispHub.filtros.opcionesVista.map((option) => (
                  <option key={option.valor} value={option.valor}>
                    {option.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" style={estilosWispHub.botonAzul} className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {datosWispHub.filtros.botonTexto}
            </button>
          </div>

          <div className="mt-9 border-t border-[#e0e6ed] pt-5">
            <div className="flex flex-wrap items-center gap-7">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={datosWispHub.buscadorCliente.placeholder}
                style={estilosWispHub.input}
                className="min-w-[420px] flex-1"
              />

              <button
                type="button"
                style={estilosWispHub.botonVerde}
                className="inline-flex items-center gap-1.5"
                onClick={ticketFlow.openSequence}
              >
                <Plus className="h-4 w-4" />
                {datosWispHub.buscadorCliente.botonTexto}
              </button>
            </div>
          </div>
        </section>

        <section style={estilosWispHub.panel}>
          <div className="flex flex-wrap items-center gap-6">
            <span className="min-w-[95px] text-[12px] text-[#20324a]">Acción:</span>
            <select
              aria-label="Acción masiva"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value)}
              style={estilosWispHub.input}
              className="min-w-[520px] flex-1"
            >
              <option value="">{datosWispHub.accionMasiva.placeholder}</option>
            </select>
            <button type="button" style={estilosWispHub.botonAzul} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4" />
              {datosWispHub.accionMasiva.botonTexto}
            </button>
            <span className="text-[12px]">
              {datosWispHub.tabla.totalSeleccionados} seleccionados/as
            </span>
          </div>
        </section>

        <section className="mx-[12px]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="inline-flex h-[33px] items-center gap-2 border border-[#42b960] bg-[#45bf63] px-3 text-[12px] font-medium text-white"
              >
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
                  className={`inline-flex ${button.variante === 'menu' ? 'h-[33px] items-center gap-1.5 px-3' : 'h-[33px] w-[36px] items-center justify-center'} border text-[12px] ${obtenerClasesBotonWispHub(button.color)}`}
                >
                  {obtenerIconoBotonWispHub(button.icono)}
                  {button.etiqueta && <span>{button.etiqueta}</span>}
                  {button.variante === 'menu' && <ChevronDown className="h-3.5 w-3.5" />}
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
                      <th
                        key={column.clave}
                        className="border border-[#d7dde5] px-3 py-2 text-left font-bold text-[#1b2b41]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{column.titulo}</span>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-[#c2cad4]" />
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-[#fbfcfd]">
                    <th className="border border-[#d7dde5] px-2 py-2 text-center">
                      <button
                        type="button"
                        aria-label="Limpiar filtros"
                        className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#cfd6df] bg-white text-[12px] text-[#6c7a8d]"
                      >
                        B
                      </button>
                    </th>
                    {datosWispHub.tabla.columnas.map((column) => (
                      <th
                        key={`${column.clave}-filter`}
                        className="border border-[#d7dde5] px-2 py-2"
                      >
                        <input
                          type="text"
                          aria-label={`Filtrar por ${column.titulo}`}
                          placeholder={column.placeholderFiltro}
                          className="h-[30px] w-full border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={datosWispHub.tabla.columnas.length + 1}
                      className="border border-[#d7dde5] px-4 py-8 text-center text-[14px] text-[#37485f]"
                    >
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
              <button
                type="button"
                disabled
                className="h-[34px] border border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] opacity-60"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled
                className="h-[34px] border border-l-0 border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] opacity-60"
              >
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
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-[21px] font-normal text-[#24364b]">
          {datosMikrosystem.tituloPagina}
        </h1>
        <div className="pt-1 text-[12px] text-[#3d6fb5]">
          <span className="text-[#5f738a]">{datosMikrosystem.breadcrumb.inicio}</span>
          <span className="mx-1">/</span>
          <span>{datosMikrosystem.breadcrumb.modulo}</span>
        </div>
      </div>

      <section style={estilosMikrosystem.panel}>
        <header
          style={estilosMikrosystem.encabezado}
          className="flex items-center justify-between gap-3"
        >
          <span>{datosMikrosystem.tituloPanel}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Actualizar"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Registros por página"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>

              {datosMikrosystem.accionesRapidas.map((action) => (
                action.icono === 'nuevo' ? (
                  <button
                    key={action.id}
                    type="button"
                    onClick={ticketFlow.openSequence}
                    className={`inline-flex h-8 items-center justify-center gap-1.5 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] ${
                      action.variante === 'icono' ? 'w-10 px-0' : ''
                    }`}
                  >
                    {obtenerIconoAccionMikrosystem(action.icono)}
                    {action.etiqueta && <span>{action.etiqueta}</span>}
                  </button>
                ) : (
                  <button
                    key={action.id}
                    type="button"
                    className={`inline-flex h-8 items-center justify-center gap-1.5 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] ${
                      action.variante === 'icono' ? 'w-10 px-0' : ''
                    }`}
                  >
                    {obtenerIconoAccionMikrosystem(action.icono)}
                    {action.etiqueta && <span>{action.etiqueta}</span>}
                  </button>
                )
              ))}

              <select
                aria-label="Estado"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-8 min-w-[112px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                {datosMikrosystem.filtros.opcionesEstado.map((option) => (
                  <option key={option.valor} value={option.valor}>
                    {option.etiqueta}
                  </option>
                ))}
              </select>

              <select
                aria-label="Departamento"
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-8 min-w-[160px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                {datosMikrosystem.filtros.opcionesDepartamento.map((option) => (
                  <option key={option.valor} value={option.valor}>
                    {option.etiqueta}
                  </option>
                ))}
              </select>
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
                    <th
                      key={column.clave}
                      className="border border-[#d7e0ea] px-3 py-2 text-left font-semibold"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.titulo}</span>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                      </div>
                    </th>
                  ))}
                  <th className="w-[78px] border border-[#d7e0ea] px-3 py-2"></th>
                </tr>
                <tr className="bg-[#fbfdff]">
                  {datosMikrosystem.tabla.columnas.map((column) => (
                    <th
                      key={`${column.clave}-filter`}
                      className="border border-[#d7e0ea] px-2 py-2"
                    >
                      {column.placeholderFiltro ? (
                        <input
                          type="text"
                          placeholder={column.placeholderFiltro}
                          className="h-8 w-full rounded border border-[#d7e0ea] bg-white px-3 text-[12px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
                        />
                      ) : null}
                    </th>
                  ))}
                  <th className="border border-[#d7e0ea] px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={datosMikrosystem.tabla.columnas.length + 1}
                    className="border border-[#d7e0ea] px-4 py-14 text-center text-[13px] text-[#7d8da1]"
                  >
                    Ningún dato disponible en esta tabla
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#51657d]">
            <div>Mostrando de 0 a 0 de un total de 0</div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Página anterior"
                disabled
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Página 1"
                className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#2f93e4] text-[12px] font-semibold text-white"
              >
                1
              </button>
              <button
                type="button"
                aria-label="Página siguiente"
                disabled
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <ServiceProcessingDialog open={ticketFlow.processingOpen} />

      <TicketFormModal
        open={ticketFlow.formOpen}
        onClose={ticketFlow.closeAll}
        onSubmit={handleCreateTicket}
        clients={MOCK_CLIENTS}
      />
    </div>
  );
}
