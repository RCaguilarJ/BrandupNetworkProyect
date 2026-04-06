import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  ArrowLeftRight,
  ChartColumn,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CircleHelp,
  Copy,
  Edit,
  Eye,
  Filter,
  FileSpreadsheet,
  FileText,
  List,
  Mail,
  Phone,
  Play,
  Plus,
  Power,
  RefreshCw,
  Search,
  Smile,
  Sparkles,
  Table2,
  Trash2,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';
import type {
  MikrosystemListaClientesAccion,
  MikrosystemListaClientesDatos,
  WispHubListaClientesBoton,
  WispHubListaClientesColumna,
  WispHubListaClientesDatos,
  WispHubListaClientesFila,
} from '../types';

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
    padding: '22px 16px 24px',
    marginBottom: '30px',
  } satisfies CSSProperties,
  panelControl: {
    border: '1px solid #d7dde5',
    backgroundColor: '#ffffff',
    margin: '0 15px 20px',
    padding: '10px',
  } satisfies CSSProperties,
  inputClasico: {
    height: '34px',
    border: '1px solid #cfd6df',
    backgroundColor: '#ffffff',
    padding: '0 12px',
    color: '#20324a',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
  } satisfies CSSProperties,
  botonVerde: {
    height: '34px',
    border: '1px solid #41b85f',
    backgroundColor: '#45bf63',
    color: '#ffffff',
    padding: '0 14px',
    fontFamily: fuenteWispHubClasica,
    fontSize: '12px',
    fontWeight: 600,
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
  tablaWrapper: {
    margin: '0 15px',
  } satisfies CSSProperties,
  tablaContenedor: {
    border: '1px solid #d7dde5',
    backgroundColor: '#ffffff',
  } satisfies CSSProperties,
  piePagina: {
    margin: '18px 15px 0',
    borderTop: '1px solid #e4e7eb',
    paddingTop: '18px',
    fontSize: '12px',
    lineHeight: 1.5,
    color: '#2c3b4d',
  } satisfies CSSProperties,
} as const;

const estilosMikrosystem = {
  pagina: {
    minHeight: '100%',
    backgroundColor: '#d9e7f3',
    padding: '18px 22px 26px',
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
    padding: '10px 14px',
    fontSize: '14px',
    fontWeight: 600,
  } satisfies CSSProperties,
  cuerpo: {
    padding: '16px 14px 14px',
  } satisfies CSSProperties,
} as const;

function obtenerMetaEstadoWispHub(
  estado: WispHubListaClientesFila['estado'],
) {
  const mapa = {
    activo: {
      etiqueta: 'Activo',
      clase: 'bg-[#e8f8ec] text-[#2f8d45] border-[#c9ebd2]',
    },
    suspendido: {
      etiqueta: 'Suspendido',
      clase: 'bg-[#fff4db] text-[#c28014] border-[#f5d79b]',
    },
    moroso: {
      etiqueta: 'Moroso',
      clase: 'bg-[#ffe8e8] text-[#c34a45] border-[#f2c2c2]',
    },
    cancelado: {
      etiqueta: 'Cancelado',
      clase: 'bg-[#eef1f5] text-[#607184] border-[#d7dde5]',
    },
  } satisfies Record<
    WispHubListaClientesFila['estado'],
    { etiqueta: string; clase: string }
  >;

  return mapa[estado];
}

function obtenerIconoBotonLista(
  icono: WispHubListaClientesBoton['icono'],
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
    case 'ayuda':
      return <CircleHelp className="h-3.5 w-3.5" />;
    case 'reiniciar':
      return <RefreshCw className="h-3.5 w-3.5" />;
    case 'encender':
      return <Power className="h-3.5 w-3.5" />;
    case 'suspender':
      return <Power className="h-3.5 w-3.5" />;
    case 'cliente':
      return <UserRound className="h-3.5 w-3.5" />;
    case 'estado':
      return <Smile className="h-3.5 w-3.5" />;
    case 'grafica':
      return <ChartColumn className="h-3.5 w-3.5" />;
    case 'intercambio':
      return <ArrowLeftRight className="h-3.5 w-3.5" />;
    case 'herramientas':
      return <Wrench className="h-3.5 w-3.5" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

function obtenerClasesBotonWispHub(
  color: WispHubListaClientesBoton['color'],
) {
  const mapa = {
    verde: 'border-[#42b960] bg-[#45bf63] text-white',
    azul: 'border-[#189edb] bg-[#1fa9e6] text-white',
    cian: 'border-[#1dabe7] bg-[#20b1e9] text-white',
    naranja: 'border-[#f0a22f] bg-[#f2a62d] text-white',
    morado: 'border-[#8a63d8] bg-[#9167df] text-white',
  } satisfies Record<WispHubListaClientesBoton['color'], string>;

  return mapa[color];
}

function obtenerIconoAccionMikrosystem(
  icono: MikrosystemListaClientesAccion['icono'],
) {
  switch (icono) {
    case 'tabla':
      return <Table2 className="h-3.5 w-3.5" />;
    case 'lista':
      return <List className="h-3.5 w-3.5" />;
    case 'encendido':
      return <Power className="h-3.5 w-3.5" />;
    case 'eliminar':
      return <Trash2 className="h-3.5 w-3.5" />;
    case 'filtrar':
      return <Filter className="h-3.5 w-3.5" />;
    default:
      return <Plus className="h-3.5 w-3.5" />;
  }
}

export default function Clients() {
  useAuth();
  const navigate = useNavigate();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    isWispHub ? 'all' : 'usuarios-activos',
  );
  const [pageSize, setPageSize] = useState(() =>
    isWispHub ? 10 : 15,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [zonaSeleccionada, setZonaSeleccionada] =
    useState('all');
  const [accionMasivaSeleccionada, setAccionMasivaSeleccionada] =
    useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<
    string[]
  >([]);
  const [wispHubSortField, setWispHubSortField] =
    useState<WispHubListaClientesColumna['clave']>('nombre');
  const [wispHubSortDirection, setWispHubSortDirection] =
    useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<
    Record<WispHubListaClientesColumna['clave'], string>
  >({
    nombre: '',
    servicio: '',
    ip: '',
    estado: '',
    planInternet: '',
    router: '',
    direccion: '',
    accion: '',
  });

  const filasWispHubBase: WispHubListaClientesFila[] = [];

  const opcionesZona = Array.from(
    new Set(filasWispHubBase.map((fila) => fila.zona)),
  )
    .sort((firstZone, secondZone) =>
      firstZone.localeCompare(secondZone),
    )
    .map((zona) => ({
      valor: zona,
      etiqueta: zona,
    }));

  const datosListaClientesWispHub: WispHubListaClientesDatos = {
    tituloPagina: 'Lista de Clientes',
    filtroZona: {
      placeholder: 'Seleccione una Zona',
      opciones: opcionesZona,
    },
    accionMasiva: {
      placeholder: '----------',
      opciones: [
        {
          valor: 'activar',
          etiqueta: 'Activar servicio',
        },
        {
          valor: 'suspender',
          etiqueta: 'Suspender servicio',
        },
        {
          valor: 'enviar-recordatorio',
          etiqueta: 'Enviar recordatorio',
        },
        {
          valor: 'exportar',
          etiqueta: 'Exportar seleccion',
        },
      ],
      botonTexto: 'Ejecutar',
    },
    tabla: {
      selectorRegistrosLabel: 'Mostrar',
      selectorVistaLabel: 'Tabla',
      placeholderBusquedaGeneral: 'Buscar',
      botonesExportacion: [
        {
          id: 'copiar',
          etiqueta: '',
          icono: 'copiar',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'excel',
          etiqueta: '',
          icono: 'excel',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'documento',
          etiqueta: '',
          icono: 'documento',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'tabla',
          etiqueta: 'Tabla',
          icono: 'tabla',
          color: 'verde',
          variante: 'selector',
        },
      ],
      botonesAccion: [
        {
          id: 'ayuda',
          etiqueta: '',
          icono: 'ayuda',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'reiniciar',
          etiqueta: '',
          icono: 'reiniciar',
          color: 'cian',
          variante: 'icono',
        },
        {
          id: 'encender',
          etiqueta: '',
          icono: 'encender',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'suspender',
          etiqueta: '',
          icono: 'suspender',
          color: 'naranja',
          variante: 'icono',
        },
        {
          id: 'cliente',
          etiqueta: '',
          icono: 'cliente',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'estado',
          etiqueta: '',
          icono: 'estado',
          color: 'verde',
          variante: 'icono',
        },
        {
          id: 'grafica',
          etiqueta: '',
          icono: 'grafica',
          color: 'azul',
          variante: 'icono',
        },
        {
          id: 'intercambio',
          etiqueta: '',
          icono: 'intercambio',
          color: 'cian',
          variante: 'icono',
        },
      ],
      botonesMenu: [
        {
          id: 'herramientas',
          etiqueta: 'Herramientas',
          icono: 'herramientas',
          color: 'azul',
          variante: 'menu',
        },
        {
          id: 'ia',
          etiqueta: 'IA',
          icono: 'ia',
          color: 'azul',
          variante: 'menu',
        },
      ],
      columnas: [
        {
          clave: 'nombre',
          titulo: 'Nombre',
          placeholderFiltro: 'Buscar Nombre',
        },
        {
          clave: 'servicio',
          titulo: 'Servicio',
          placeholderFiltro: 'Buscar Servicio',
        },
        {
          clave: 'ip',
          titulo: 'Ip',
          placeholderFiltro: 'Buscar Ip',
        },
        {
          clave: 'estado',
          titulo: 'Estado',
          placeholderFiltro: 'Buscar Estado',
        },
        {
          clave: 'planInternet',
          titulo: 'Plan Internet',
          placeholderFiltro: 'Buscar Plan Internet',
        },
        {
          clave: 'router',
          titulo: 'Router',
          placeholderFiltro: 'Buscar Router',
        },
        {
          clave: 'direccion',
          titulo: 'Direccion',
          placeholderFiltro: 'Buscar Direccion',
        },
        {
          clave: 'accion',
          titulo: 'Accion',
          placeholderFiltro: 'Buscar',
        },
      ],
      filas: filasWispHubBase,
    },
    piePagina: {
      copyright: 'Copyright © 2026 WispHub',
      fechaSistema: '26/03/2026 13:23 - EST -05:00',
    },
  };

  const filasWispHubFiltradas = datosListaClientesWispHub.tabla.filas
    .filter(
      (fila) =>
        zonaSeleccionada === 'all' ||
        fila.zona === zonaSeleccionada,
    )
    .filter((fila) => {
      if (!searchTerm.trim()) {
        return true;
      }

      const termino = searchTerm.toLowerCase();
      return [
        fila.nombre,
        fila.servicio,
        fila.ip,
        fila.estado,
        fila.planInternet,
        fila.router,
        fila.direccion,
        fila.email,
        fila.telefono,
      ].some((valor) =>
        valor.toLowerCase().includes(termino),
      );
    })
    .filter((fila) =>
      datosListaClientesWispHub.tabla.columnas.every(
        (columna) => {
          const filtro = columnFilters[columna.clave]
            .trim()
            .toLowerCase();
          if (!filtro) {
            return true;
          }

          return String(fila[columna.clave])
            .toLowerCase()
            .includes(filtro);
        },
      ),
    );

  const filasWispHubOrdenadas = [...filasWispHubFiltradas].sort(
    (firstRow, secondRow) => {
      const firstValue = String(
        firstRow[wispHubSortField],
      ).toLowerCase();
      const secondValue = String(
        secondRow[wispHubSortField],
      ).toLowerCase();

      if (firstValue < secondValue) {
        return wispHubSortDirection === 'asc' ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return wispHubSortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    },
  );

  const totalPagesWispHub = Math.max(
    1,
    Math.ceil(filasWispHubOrdenadas.length / pageSize),
  );
  const currentPageWispHub = Math.min(
    currentPage,
    totalPagesWispHub,
  );
  const filasWispHubPaginaActual =
    filasWispHubOrdenadas.slice(
      (currentPageWispHub - 1) * pageSize,
      currentPageWispHub * pageSize,
    );
  const todasFilasPaginaSeleccionadas =
    filasWispHubPaginaActual.length > 0 &&
    filasWispHubPaginaActual.every((fila) =>
      selectedClientIds.includes(fila.id),
    );

  const toggleSelectedClient = (clientId: string) => {
    setSelectedClientIds((currentIds) =>
      currentIds.includes(clientId)
        ? currentIds.filter((id) => id !== clientId)
        : [...currentIds, clientId],
    );
  };

  const toggleSelectAllCurrentPage = () => {
    if (todasFilasPaginaSeleccionadas) {
      setSelectedClientIds((currentIds) =>
        currentIds.filter(
          (currentId) =>
            !filasWispHubPaginaActual.some(
              (fila) => fila.id === currentId,
            ),
        ),
      );
      return;
    }

    setSelectedClientIds((currentIds) => [
      ...new Set([
        ...currentIds,
        ...filasWispHubPaginaActual.map((fila) => fila.id),
      ]),
    ]);
  };

  const limpiarFiltrosWispHub = () => {
    setColumnFilters({
      nombre: '',
      servicio: '',
      ip: '',
      estado: '',
      planInternet: '',
      router: '',
      direccion: '',
      accion: '',
    });
    setSearchTerm('');
    setZonaSeleccionada('all');
    setCurrentPage(1);
  };

  const handleWispHubSort = (
    columnKey: WispHubListaClientesColumna['clave'],
  ) => {
    if (wispHubSortField === columnKey) {
      setWispHubSortDirection(
        wispHubSortDirection === 'asc' ? 'desc' : 'asc',
      );
      return;
    }

    setWispHubSortField(columnKey);
    setWispHubSortDirection('asc');
  };

  const datosListaClientesMikrosystem: MikrosystemListaClientesDatos =
    {
      tituloPagina: 'Lista Usuarios',
      accionesRapidas: [
        {
          id: 'vista-tabla',
          etiqueta: '',
          icono: 'tabla',
          variante: 'icono',
        },
        {
          id: 'vista-lista',
          etiqueta: '',
          icono: 'lista',
          variante: 'icono',
        },
        {
          id: 'encendido',
          etiqueta: '',
          icono: 'encendido',
          variante: 'icono',
        },
        {
          id: 'eliminar',
          etiqueta: '',
          icono: 'eliminar',
          variante: 'icono',
        },
        {
          id: 'nuevo',
          etiqueta: 'Nuevo',
          icono: 'nuevo',
          variante: 'boton',
        },
        {
          id: 'filtrar',
          etiqueta: 'Filtrar',
          icono: 'filtrar',
          variante: 'boton',
        },
      ],
      filtroEstado: {
        valorDefault: 'Usuarios ACTIVOS',
        opciones: [
          {
            valor: 'usuarios-activos',
            etiqueta: 'Usuarios ACTIVOS',
          },
          {
            valor: 'usuarios-suspendidos',
            etiqueta: 'Usuarios SUSPENDIDOS',
          },
          {
            valor: 'todos',
            etiqueta: 'Todos',
          },
        ],
      },
      tabla: {
        placeholderBusquedaGeneral: 'Buscar...',
        tamanoPagina: 15,
        paginaActual: 1,
        total: 0,
        columnas: [
          {
            clave: 'id',
            titulo: 'ID',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'nombre',
            titulo: 'NOMBRE',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'direccionPrincipal',
            titulo: 'DIRECCION PRINCIPAL',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'ultimoPago',
            titulo: 'ULTIMO PAGO',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'ip',
            titulo: 'IP',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'direccionServicio',
            titulo: 'DIRECCION SERVICIO',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'mac',
            titulo: 'MAC',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'diaPago',
            titulo: 'DIA PAGO',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'deudaActual',
            titulo: 'DEUDA ACTUAL',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'correo',
            titulo: 'CORREO',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'telefono',
            titulo: 'TELEFONO',
            placeholderFiltro: 'Buscar',
          },
          {
            clave: 'plan',
            titulo: 'PLAN',
            placeholderFiltro: 'Buscar',
          },
        ],
        filas: [],
      },
    };

  if (isWispHub) {
    const totalRegistrosWispHub = filasWispHubOrdenadas.length;
    const inicioRegistrosWispHub =
      totalRegistrosWispHub === 0
        ? 0
        : (currentPageWispHub - 1) * pageSize + 1;
    const finRegistrosWispHub = Math.min(
      currentPageWispHub * pageSize,
      totalRegistrosWispHub,
    );

    return (
      <div style={estilosWispHub.pagina}>
        <header style={estilosWispHub.encabezado}>
          <div className="flex items-center gap-3">
            <Users
              className="h-8 w-8 text-[#45bf63]"
              strokeWidth={2.2}
            />
            <h1
              className="text-[2.05rem] leading-none text-[#0f1f35]"
              style={{
                fontFamily: fuenteWispHubClasica,
                fontWeight: 600,
              }}
            >
              {datosListaClientesWispHub.tituloPagina}
            </h1>
          </div>
        </header>

        <section style={estilosWispHub.panelControl}>
          <div className="flex flex-wrap items-center gap-7">
            <div className="flex min-w-[320px] flex-1 items-center">
              <select
                value={zonaSeleccionada}
                onChange={(event) => {
                  setZonaSeleccionada(event.target.value);
                  setCurrentPage(1);
                }}
                style={estilosWispHub.inputClasico}
                className="w-full"
              >
                <option value="all">
                  {
                    datosListaClientesWispHub.filtroZona
                      .placeholder
                  }
                </option>
                {datosListaClientesWispHub.filtroZona.opciones.map(
                  (opcion) => (
                    <option
                      key={opcion.valor}
                      value={opcion.valor}
                    >
                      {opcion.etiqueta}
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              type="button"
              style={estilosWispHub.botonVerde}
              className="inline-flex items-center gap-1.5"
              onClick={() => navigate('/clients/new')}
            >
              <Plus className="h-4 w-4" />
              Agregar Cliente
            </button>
          </div>
        </section>

        <section style={estilosWispHub.panelControl}>
          <div className="flex flex-wrap items-center gap-6">
            <span className="min-w-[74px] text-[12px] text-[#20324a]">
              Accion:
            </span>

            <select
              value={accionMasivaSeleccionada}
              onChange={(event) =>
                setAccionMasivaSeleccionada(
                  event.target.value,
                )
              }
              style={estilosWispHub.inputClasico}
              className="min-w-[320px] flex-1"
            >
              <option value="">
                {
                  datosListaClientesWispHub.accionMasiva
                    .placeholder
                }
              </option>
              {datosListaClientesWispHub.accionMasiva.opciones.map(
                (opcion) => (
                  <option
                    key={opcion.valor}
                    value={opcion.valor}
                  >
                    {opcion.etiqueta}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              style={estilosWispHub.botonAzul}
              className="inline-flex items-center gap-1.5"
            >
              <Play className="h-4 w-4" />
              {
                datosListaClientesWispHub.accionMasiva
                  .botonTexto
              }
            </button>

            <span className="text-[12px] text-[#20324a]">
              {selectedClientIds.length} seleccionados/as
            </span>
          </div>
        </section>

        <section style={estilosWispHub.tablaWrapper}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="inline-flex h-[33px] items-center gap-2 border border-[#42b960] bg-[#45bf63] px-3 text-[12px] font-medium text-white"
              >
                {
                  datosListaClientesWispHub.tabla
                    .selectorRegistrosLabel
                }{' '}
                {pageSize} registros
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {datosListaClientesWispHub.tabla.botonesExportacion.map(
                (boton) => (
                  <button
                    key={boton.id}
                    type="button"
                    className={`inline-flex h-[33px] items-center justify-center gap-1.5 border px-3 text-[12px] ${obtenerClasesBotonWispHub(
                      boton.color,
                    )}`}
                  >
                    {obtenerIconoBotonLista(boton.icono)}
                    {boton.etiqueta && (
                      <span>{boton.etiqueta}</span>
                    )}
                    {boton.variante === 'selector' && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                ),
              )}

              <span className="ml-1 text-[12px] text-[#20324a]">
                Botones de Accion.
              </span>

              {datosListaClientesWispHub.tabla.botonesAccion.map(
                (boton) => (
                  <button
                    key={boton.id}
                    type="button"
                    className={`inline-flex h-[33px] w-[36px] items-center justify-center border text-[12px] ${obtenerClasesBotonWispHub(
                      boton.color,
                    )}`}
                    title={boton.id}
                  >
                    {obtenerIconoBotonLista(boton.icono)}
                  </button>
                ),
              )}

              {datosListaClientesWispHub.tabla.botonesMenu.map(
                (boton) => (
                  <button
                    key={boton.id}
                    type="button"
                    className={`inline-flex h-[33px] items-center gap-1.5 border px-3 text-[12px] ${obtenerClasesBotonWispHub(
                      boton.color,
                    )}`}
                  >
                    {obtenerIconoBotonLista(boton.icono)}
                    <span>{boton.etiqueta}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                ),
              )}
            </div>

            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#17273d]">
              Buscar:
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] w-[180px] border border-[#cfd6df] bg-white px-3 pr-8 text-[12px] text-[#20324a] outline-none"
                />
                <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#93a0b0]" />
              </div>
            </label>
          </div>

          <div style={estilosWispHub.tablaContenedor}>
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ fontSize: '12px' }}
              >
                <thead>
                  <tr className="bg-white">
                    <th className="w-[42px] border border-[#d7dde5] px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={todasFilasPaginaSeleccionadas}
                        onChange={toggleSelectAllCurrentPage}
                        className="h-4 w-4 border-[#c7d1dd]"
                      />
                    </th>
                    {datosListaClientesWispHub.tabla.columnas.map(
                      (columna) => (
                        <th
                          key={columna.clave}
                          className="border border-[#d7dde5] px-3 py-2 text-left font-bold text-[#1b2b41]"
                        >
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3"
                            onClick={() =>
                              handleWispHubSort(
                                columna.clave,
                              )
                            }
                          >
                            <span>{columna.titulo}</span>
                            {wispHubSortField ===
                            columna.clave ? (
                              wispHubSortDirection ===
                              'asc' ? (
                                <ChevronUp className="h-3.5 w-3.5 text-[#aeb8c4]" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-[#aeb8c4]" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 text-[#c2cad4]" />
                            )}
                          </button>
                        </th>
                      ),
                    )}
                  </tr>
                  <tr className="bg-[#fbfcfd]">
                    <th className="border border-[#d7dde5] px-2 py-2 text-center">
                      <button
                        type="button"
                        className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#cfd6df] bg-white text-[12px] text-[#6c7a8d]"
                        onClick={limpiarFiltrosWispHub}
                      >
                        B
                      </button>
                    </th>
                    {datosListaClientesWispHub.tabla.columnas.map(
                      (columna) => (
                        <th
                          key={`${columna.clave}-filter`}
                          className="border border-[#d7dde5] px-3 py-2"
                        >
                          <input
                            type="text"
                            value={columnFilters[columna.clave]}
                            onChange={(event) => {
                              setColumnFilters(
                                (currentFilters) => ({
                                  ...currentFilters,
                                  [columna.clave]:
                                    event.target.value,
                                }),
                              );
                              setCurrentPage(1);
                            }}
                            placeholder={
                              columna.placeholderFiltro
                            }
                            className="h-[30px] w-full border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none"
                          />
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filasWispHubPaginaActual.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          datosListaClientesWispHub.tabla
                            .columnas.length + 1
                        }
                        className="border border-[#d7dde5] px-4 py-8 text-center text-[14px] text-[#37485f]"
                      >
                        Ningun dato disponible en esta tabla
                      </td>
                    </tr>
                  ) : (
                    filasWispHubPaginaActual.map((fila) => {
                      const estadoMeta =
                        obtenerMetaEstadoWispHub(
                          fila.estado,
                        );

                      return (
                        <tr key={fila.id} className="bg-white">
                          <td className="border border-[#d7dde5] px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={selectedClientIds.includes(
                                fila.id,
                              )}
                              onChange={() =>
                                toggleSelectedClient(fila.id)
                              }
                              className="h-4 w-4 border-[#c7d1dd]"
                            />
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2 align-top">
                            <div className="font-semibold text-[#1b2b41]">
                              {fila.nombre}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[#6b7b8f]">
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {fila.email}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {fila.telefono}
                              </span>
                            </div>
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2 text-[#20324a]">
                            {fila.servicio}
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2 text-[#20324a]">
                            {fila.ip}
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2">
                            <span
                              className={`inline-flex rounded border px-2 py-1 text-[11px] font-semibold ${estadoMeta.clase}`}
                            >
                              {estadoMeta.etiqueta}
                            </span>
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2 text-[#20324a]">
                            {fila.planInternet}
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2 text-[#20324a]">
                            {fila.router}
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2 text-[#20324a]">
                            {fila.direccion}
                          </td>
                          <td className="border border-[#d7dde5] px-3 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#cfd6df] bg-white text-[#5e6d80]"
                                title="Ver"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#cfd6df] bg-white text-[#5e6d80]"
                                title="Editar"
                                onClick={() =>
                                  navigate(
                                    `/clients/${fila.id}/edit`,
                                  )
                                }
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-[28px] w-[28px] items-center justify-center border border-[#f2c2c2] bg-white text-[#c34a45]"
                                title="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#20324a]">
            <div>
              Mostrando registros del {inicioRegistrosWispHub} al{' '}
              {finRegistrosWispHub} de un total de{' '}
              {totalRegistrosWispHub} registros
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    Math.max(1, currentPageWispHub - 1),
                  )
                }
                disabled={currentPageWispHub === 1}
                className="h-[34px] border border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      totalPagesWispHub,
                      currentPageWispHub + 1,
                    ),
                  )
                }
                disabled={
                  currentPageWispHub === totalPagesWispHub ||
                  totalRegistrosWispHub === 0
                }
                className="h-[34px] border border-l-0 border-[#d7dde5] bg-white px-4 text-[12px] text-[#6d7a8e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>

        <footer style={estilosWispHub.piePagina}>
          <div>{datosListaClientesWispHub.piePagina.copyright}</div>
          <div>{datosListaClientesWispHub.piePagina.fechaSistema}</div>
        </footer>
      </div>
    );
  }

  return (
    <div style={estilosMikrosystem.pagina}>
      <section style={estilosMikrosystem.tarjeta}>
        <header
          style={estilosMikrosystem.encabezado}
          className="flex items-center justify-between gap-3"
        >
          <span>{datosListaClientesMikrosystem.tituloPagina}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div style={estilosMikrosystem.cuerpo}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>

              {datosListaClientesMikrosystem.accionesRapidas
                .filter((accion) => accion.variante === 'icono')
                .map((accion) => (
                  <button
                    key={accion.id}
                    type="button"
                    className="inline-flex h-8 w-9 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#2b3f55]"
                  >
                    {obtenerIconoAccionMikrosystem(
                      accion.icono,
                    )}
                  </button>
                ))}

              {datosListaClientesMikrosystem.accionesRapidas
                .filter((accion) => accion.variante === 'boton')
                .map((accion) => (
                  <button
                    key={accion.id}
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded border border-[#cfd7e2] bg-white px-3 text-[12px] font-medium text-[#24364b]"
                    onClick={() => {
                      if (accion.id === 'nuevo') {
                        navigate('/clients/new');
                      }
                    }}
                  >
                    {obtenerIconoAccionMikrosystem(
                      accion.icono,
                    )}
                    {accion.etiqueta}
                  </button>
                ))}

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 min-w-[170px] rounded border border-[#cfd7e2] bg-white px-3 text-[12px] text-[#24364b] outline-none"
              >
                {datosListaClientesMikrosystem.filtroEstado.opciones.map(
                  (opcion) => (
                    <option
                      key={opcion.valor}
                      value={opcion.valor}
                    >
                      {opcion.etiqueta}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder={
                  datosListaClientesMikrosystem.tabla
                    .placeholderBusquedaGeneral
                }
                className="h-8 w-[260px] rounded border border-[#cfd7e2] bg-white px-3 pr-8 text-[12px] text-[#24364b] outline-none"
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa8b7]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px] text-[#24364b]">
              <thead>
                <tr className="bg-white">
                  <th className="w-8 border border-[#d7e0ea] px-2 py-2"></th>
                  <th className="w-8 border border-[#d7e0ea] px-2 py-2 text-center">
                    <input type="checkbox" disabled />
                  </th>
                  {datosListaClientesMikrosystem.tabla.columnas.map(
                    (columna) => (
                      <th
                        key={columna.clave}
                        className="border border-[#d7e0ea] px-8 py-2 text-left font-semibold"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{columna.titulo}</span>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-[#bcc7d2]" />
                        </div>
                      </th>
                    ),
                  )}
                  <th className="w-[88px] border border-[#d7e0ea] px-3 py-2"></th>
                </tr>
                <tr className="bg-[#fbfdff]">
                  <th className="border border-[#d7e0ea] px-2 py-2"></th>
                  <th className="border border-[#d7e0ea] px-2 py-2"></th>
                  {datosListaClientesMikrosystem.tabla.columnas.map(
                    (columna) => (
                      <th
                        key={`${columna.clave}-filter`}
                        className="border border-[#d7e0ea] px-2 py-2"
                      >
                        <input
                          type="text"
                          placeholder={columna.placeholderFiltro}
                          className="h-8 w-full rounded border border-[#d7e0ea] bg-white px-3 text-[12px] text-[#24364b] outline-none placeholder:text-[#c3ccd6]"
                        />
                      </th>
                    ),
                  )}
                  <th className="border border-[#d7e0ea] px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {datosListaClientesMikrosystem.tabla.filas.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={
                        datosListaClientesMikrosystem.tabla
                          .columnas.length + 3
                      }
                      className="border border-[#d7e0ea] px-4 py-14 text-center text-[13px] text-[#7d8da1]"
                    >
                      Sin datos cargados. La tabla queda lista
                      para cuando el usuario capture clientes.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#51657d]">
            <div>
              Mostrando de 0 al 0 de un total de 0
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-90" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#2f93e4] text-[12px] font-semibold text-white"
              >
                1
              </button>
              <button
                type="button"
                disabled
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7e0ea] bg-white text-[#9aa8b7]"
              >
                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
