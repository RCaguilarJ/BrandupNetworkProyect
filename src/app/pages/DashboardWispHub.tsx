import type { CSSProperties } from 'react';
import { cn } from '../lib/utils';
import type {
  DashboardWispHubBloqueResumen,
  DashboardWispHubDatos,
  DashboardWispHubTarjetaResumen,
  DashboardWispHubTarjetaTrafico,
} from '../types';
import {
  CalendarDays,
  CircleDollarSign,
  CloudDownload,
  CloudUpload,
  Gauge,
  RefreshCcw,
  Ticket,
  TicketPlus,
  Clock3,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const fuenteWispHubClasica =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, sans-serif';

const estilos = {
  pagina: {
    minHeight: '100%',
    backgroundColor: '#ffffff',
    color: '#1f2f42',
    fontFamily: fuenteWispHubClasica,
    padding: '30px 28px 22px',
  } satisfies CSSProperties,
  encabezado: {
    borderBottom: '1px solid #dde2e8',
    paddingBottom: '22px',
    marginBottom: '28px',
  } satisfies CSSProperties,
  gruposResumen: {
    gap: '28px',
  } satisfies CSSProperties,
  grupoResumen: {
    minWidth: 0,
  } satisfies CSSProperties,
  tarjeta: {
    border: '1px solid #d8dee6',
    backgroundColor: '#ffffff',
    padding: '14px 14px 12px',
    minHeight: '71px',
    marginBottom: '6px',
  } satisfies CSSProperties,
  seccion: {
    marginTop: '34px',
  } satisfies CSSProperties,
  traficoGrid: {
    gap: '30px',
  } satisfies CSSProperties,
  tarjetaTrafico: {
    border: '1px solid #d8dee6',
    backgroundColor: '#ffffff',
    padding: '12px 14px',
    minHeight: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  } satisfies CSSProperties,
  graficaLayout: {
    gap: '30px',
  } satisfies CSSProperties,
  graficaContenedor: {
    minHeight: '430px',
  } satisfies CSSProperties,
  piePagina: {
    marginTop: '26px',
    fontSize: '12px',
    lineHeight: 1.7,
    color: '#2c3b4d',
  } satisfies CSSProperties,
} as const;

function obtenerIconoTitulo(
  iconoTitulo: DashboardWispHubBloqueResumen['iconoTitulo'],
) {
  switch (iconoTitulo) {
    case 'pagos':
      return <CircleDollarSign className="h-6 w-6" aria-hidden="true" />;
    case 'clientes':
      return <Users className="h-6 w-6" aria-hidden="true" />;
    default:
      return <Ticket className="h-6 w-6" aria-hidden="true" />;
  }
}

function obtenerIconoResumen(icono: DashboardWispHubTarjetaResumen['icono']) {
  switch (icono) {
    case 'dinero':
      return <CircleDollarSign className="h-7 w-7" aria-hidden="true" />;
    case 'reloj':
      return <Clock3 className="h-7 w-7" aria-hidden="true" />;
    case 'calendario':
      return <CalendarDays className="h-7 w-7" aria-hidden="true" />;
    case 'cliente_nuevo':
      return <UserRoundPlus className="h-7 w-7" aria-hidden="true" />;
    case 'clientes':
      return <Users className="h-7 w-7" aria-hidden="true" />;
    default:
      return <TicketPlus className="h-7 w-7" aria-hidden="true" />;
  }
}

function obtenerIconoTrafico(icono: DashboardWispHubTarjetaTrafico['icono']) {
  if (icono === 'descarga') {
    return <CloudDownload className="h-8 w-8" aria-hidden="true" />;
  }

  return <CloudUpload className="h-8 w-8" aria-hidden="true" />;
}

function obtenerColor(color: DashboardWispHubTarjetaResumen['color']) {
  const colores = {
    verde: '#43c05f',
    naranja: '#f39a1f',
    azul: '#00a3ff',
    rojo: '#ff4a44',
  } as const;

  return colores[color];
}

function formatearMonedaEje(valor: number) {
  const signo = valor < 0 ? '-' : '';
  return `${signo}$ ${Math.abs(valor).toFixed(2)}`;
}

function construirSeriesCero() {
  return [
    { mes: 'Ene', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Feb', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Mar', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Abr', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'May', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Jun', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Jul', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Ago', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Sep', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Oct', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Nov', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
    { mes: 'Dic', ingresosInternet: 0, otrosIngresos: 0, gastos: 0 },
  ];
}

export default function DashboardWispHub() {
  // Backend: este objeto es el contrato visual del dashboard WispHub.
  // La intencion es que el backend entregue esta misma forma para que
  // cada bloque del dashboard quede mapeado sin logica dispersa.
  const datosDashboardWispHub: DashboardWispHubDatos = {
    tituloPagina: 'Dashboard',
    bloquesResumen: [
      {
        clave: 'pagos',
        titulo: 'Pagos Internet',
        iconoTitulo: 'pagos',
        tarjetas: [
          {
            id: 1,
            icono: 'dinero',
            valorPrincipal: '$0.00',
            etiqueta: 'HOY - 0 PAGOS',
            color: 'verde',
            alineacion: 'izquierda',
          },
          {
            id: 2,
            icono: 'reloj',
            valorPrincipal: '$0.00',
            etiqueta: 'PENDIENTE - 0 PAGOS',
            color: 'naranja',
            alineacion: 'izquierda',
          },
          {
            id: 3,
            icono: 'calendario',
            valorPrincipal: '$0.00',
            etiqueta: 'MARZO - 0 PAGOS',
            color: 'azul',
            alineacion: 'izquierda',
          },
        ],
      },
      {
        clave: 'clientes',
        titulo: 'Clientes',
        iconoTitulo: 'clientes',
        tarjetas: [
          {
            id: 1,
            icono: 'cliente_nuevo',
            valorPrincipal: '0',
            etiqueta: 'HOY',
            color: 'verde',
            alineacion: 'derecha',
          },
          {
            id: 2,
            icono: 'calendario',
            valorPrincipal: '0',
            etiqueta: 'MARZO',
            color: 'azul',
            alineacion: 'derecha',
          },
          {
            id: 3,
            icono: 'clientes',
            valorPrincipal: '0',
            etiqueta: 'TOTAL',
            color: 'azul',
            alineacion: 'derecha',
          },
        ],
      },
      {
        clave: 'tickets',
        titulo: 'Tickets',
        iconoTitulo: 'tickets',
        tarjetas: [
          {
            id: 1,
            icono: 'ticket_nuevo',
            valorPrincipal: '0',
            etiqueta: 'HOY',
            color: 'rojo',
            alineacion: 'derecha',
          },
          {
            id: 2,
            icono: 'reloj',
            valorPrincipal: '0',
            etiqueta: 'PENDIENTES',
            color: 'naranja',
            alineacion: 'derecha',
          },
          {
            id: 3,
            icono: 'calendario',
            valorPrincipal: '0',
            etiqueta: 'MARZO',
            color: 'verde',
            alineacion: 'derecha',
          },
        ],
      },
    ],
    trafico: {
      fechaActualizacion: '26/03/2026 12:50',
      tarjetas: [
        {
          id: 1,
          icono: 'descarga',
          valorPrincipal: '0 GiB',
          etiqueta: 'TOTAL DESCARGA',
          color: 'azul',
        },
        {
          id: 2,
          icono: 'subida',
          valorPrincipal: '0 GiB',
          etiqueta: 'TOTAL SUBIDA',
          color: 'naranja',
        },
      ],
    },
    historialFinanzas: {
      fechaActualizacion: '26/03/2026 12:50',
      accionActualizacion: 'Actualizar Ahora',
      titulo: 'Historial de Finanzas',
      subtitulo: 'Finanzas 2026',
      series: construirSeriesCero(),
    },
    piePagina: {
      copyright: 'Copyright © 2026 WispHub',
      fechaSistema: '26/03/2026 13:10 - EST -05:00',
    },
  };

  return (
    <div style={estilos.pagina}>
      <div style={estilos.encabezado}>
        <div className="flex items-center gap-3">
          <Gauge className="h-9 w-9 text-[#46bf67]" strokeWidth={2.2} />
          <h1
            className="text-[2.2rem] leading-none text-[#0f1f35]"
            style={{ fontFamily: fuenteWispHubClasica, fontWeight: 600 }}
          >
            {datosDashboardWispHub.tituloPagina}
          </h1>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-3" style={estilos.gruposResumen}>
        {datosDashboardWispHub.bloquesResumen.map((bloque) => (
          <section key={bloque.clave} style={estilos.grupoResumen}>
            <div className="mb-3 flex items-center gap-2 text-[#17273d]">
              <span className="text-[#17273d]">{obtenerIconoTitulo(bloque.iconoTitulo)}</span>
              <h2
                className="text-[1.15rem] leading-none"
                style={{ fontFamily: fuenteWispHubClasica, fontWeight: 500 }}
              >
                {bloque.titulo}
              </h2>
            </div>

            {bloque.tarjetas.map((tarjeta) => {
              const color = obtenerColor(tarjeta.color);
              const contenidoDerecha =
                tarjeta.alineacion === 'derecha';

              return (
                <article key={tarjeta.id} style={estilos.tarjeta}>
                  <div
                    className={cn(
                      'flex items-center gap-3',
                      contenidoDerecha ? 'justify-between' : 'flex-row-reverse justify-between',
                    )}
                  >
                    <span style={{ color }}>
                      {obtenerIconoResumen(tarjeta.icono)}
                    </span>
                    <div
                      className={cn(
                        'min-w-0',
                        contenidoDerecha ? 'ml-auto text-right' : 'mr-auto text-left',
                      )}
                    >
                      <div
                        className="text-[1rem] leading-none"
                        style={{
                          color,
                          fontFamily: fuenteWispHubClasica,
                          fontWeight: 600,
                          marginBottom: '6px',
                        }}
                      >
                        {tarjeta.valorPrincipal}
                      </div>
                      <div
                        className="text-[0.82rem] leading-none text-[#243244]"
                        style={{ fontFamily: fuenteWispHubClasica }}
                      >
                        {tarjeta.etiqueta}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>

      <section style={estilos.seccion}>
        <div className="mb-3 flex items-center gap-2 text-[#17273d]">
          <RefreshCcw className="h-6 w-6" strokeWidth={2.1} />
          <h2
            className="text-[1.15rem] leading-none"
            style={{ fontFamily: fuenteWispHubClasica, fontWeight: 500 }}
          >
            Trafico
          </h2>
        </div>

        <div
          className="mb-2 text-[11px] text-[#243244]"
          style={{ fontFamily: fuenteWispHubClasica }}
        >
          Ultima actualizacion: {datosDashboardWispHub.trafico.fechaActualizacion}
        </div>

        <div className="grid gap-[30px] md:grid-cols-2" style={estilos.traficoGrid}>
          {datosDashboardWispHub.trafico.tarjetas.map((tarjeta) => {
            const color = tarjeta.color === 'azul' ? '#00a3ff' : '#f39a1f';

            return (
              <article key={tarjeta.id} style={estilos.tarjetaTrafico}>
                <span style={{ color }}>
                  {obtenerIconoTrafico(tarjeta.icono)}
                </span>
                <div className="text-right">
                  <div
                    className="text-[1rem] leading-none"
                    style={{
                      color,
                      fontFamily: fuenteWispHubClasica,
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    {tarjeta.valorPrincipal}
                  </div>
                  <div
                    className="text-[0.82rem] leading-none text-[#243244]"
                    style={{ fontFamily: fuenteWispHubClasica }}
                  >
                    {tarjeta.etiqueta}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section style={estilos.seccion}>
        <div
          className="mb-1 flex flex-wrap items-center gap-6 text-[11px] text-[#243244]"
          style={{ fontFamily: fuenteWispHubClasica }}
        >
          <span>
            Ultima actualizacion: {datosDashboardWispHub.historialFinanzas.fechaActualizacion}
          </span>
          <button className="inline-flex items-center gap-1 text-[#243244] transition hover:text-[#2f7f40]">
            <RefreshCcw className="h-3.5 w-3.5" />
            {datosDashboardWispHub.historialFinanzas.accionActualizacion}
          </button>
        </div>

        <div className="mb-3" style={{ fontFamily: fuenteWispHubClasica }}>
          <h2 className="text-[1.15rem] leading-none text-[#53657a]">
            {datosDashboardWispHub.historialFinanzas.titulo}
          </h2>
          <p className="mt-1 text-[1.05rem] leading-none text-[#9aa7b6]">
            {datosDashboardWispHub.historialFinanzas.subtitulo}
          </p>
        </div>

        <div className="grid gap-[30px] xl:grid-cols-[minmax(0,1fr)_280px]" style={estilos.graficaLayout}>
          <div style={estilos.graficaContenedor}>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart
                data={datosDashboardWispHub.historialFinanzas.series}
                margin={{ top: 16, right: 20, bottom: 36, left: 28 }}
              >
                <CartesianGrid stroke="#dde2e8" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: '#55677c', fontSize: 12, fontFamily: fuenteWispHubClasica }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'Mes',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#1c2a3d',
                    fontSize: 12,
                    fontFamily: fuenteWispHubClasica,
                  }}
                />
                <YAxis
                  domain={[-1, 1]}
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                  tickFormatter={formatearMonedaEje}
                  tick={{ fill: '#55677c', fontSize: 12, fontFamily: fuenteWispHubClasica }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'Total',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#1c2a3d',
                    fontSize: 12,
                    fontFamily: fuenteWispHubClasica,
                    dx: -12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8dee6',
                    borderRadius: '0px',
                    fontFamily: fuenteWispHubClasica,
                    fontSize: '12px',
                  }}
                  formatter={(valor: number) => `$${valor.toFixed(2)}`}
                />
                <Line
                  type="linear"
                  dataKey="ingresosInternet"
                  stroke="#22a37b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="linear"
                  dataKey="otrosIngresos"
                  stroke="#61c3e6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="linear"
                  dataKey="gastos"
                  stroke="#d96a00"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-12" style={{ fontFamily: fuenteWispHubClasica }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#6a788a]">
                <span className="h-3 w-3 rounded-[2px] bg-[#22a37b]" />
                <span className="text-[0.95rem]">Ingresos Internet</span>
              </div>
              <div className="flex items-center gap-3 text-[#6a788a]">
                <span className="h-3 w-3 rounded-[2px] bg-[#61c3e6]" />
                <span className="text-[0.95rem]">Otros Ingresos</span>
              </div>
              <div className="flex items-center gap-3 text-[#6a788a]">
                <span className="h-3 w-3 rounded-[2px] bg-[#d96a00]" />
                <span className="text-[0.95rem]">Gastos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={estilos.piePagina}>
        <div>{datosDashboardWispHub.piePagina.copyright}</div>
        <div>{datosDashboardWispHub.piePagina.fechaSistema}</div>
      </footer>
    </div>
  );
}
