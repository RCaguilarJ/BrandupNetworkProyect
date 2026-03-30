import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { cn } from '../lib/utils';
import type {
  DashboardMikrosystemDatos,
  DashboardMikrosystemEmisorItem,
  DashboardMikrosystemEstadoServidorItem,
  DashboardMikrosystemResumenSistemaItem,
  DashboardMikrosystemTarjetaSuperior,
} from '../types';
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cpu,
  DollarSign,
  FileText,
  HardDrive,
  List,
  Search,
  Server,
  Ticket,
  Users,
  Wifi,
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

interface PanelMikrosystemProps {
  titulo: string;
  children: ReactNode;
  className?: string;
  cuerpoClassName?: string;
  accionesEncabezado?: ReactNode;
}

function PanelMikrosystem({
  titulo,
  children,
  className,
  cuerpoClassName,
  accionesEncabezado,
}: PanelMikrosystemProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border border-[#ccd6e2] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:border-[#2d3743] dark:bg-[#1a2028]',
        className,
      )}
    >
      <div className="flex items-center justify-between bg-[#1f252b] px-4 py-3 text-white">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        {accionesEncabezado}
      </div>
      <div className={cn('bg-white dark:bg-[#1a2028]', cuerpoClassName)}>{children}</div>
    </Card>
  );
}

function obtenerEtiquetaRol(rol?: string) {
  const rolesPorClave: Record<string, string> = {
    super_admin: 'Administrador principal',
    isp_admin: 'Administrador ISP',
    cobranza: 'Cobranza',
    soporte: 'Soporte',
    tecnico: 'Tecnico',
    cliente: 'Cliente',
  };

  return rolesPorClave[rol || ''] || 'Administrador principal';
}

function obtenerIconoTarjetaSuperior(clave: DashboardMikrosystemTarjetaSuperior['clave']) {
  switch (clave) {
    case 'clientes_online':
      return <Users className="h-28 w-28" aria-hidden="true" />;
    case 'transacciones_hoy':
      return <DollarSign className="h-28 w-28" aria-hidden="true" />;
    case 'facturas_no_pagadas':
      return <FileText className="h-28 w-28" aria-hidden="true" />;
    default:
      return <Ticket className="h-28 w-28" aria-hidden="true" />;
  }
}

function obtenerClasesTarjetaSuperior(variante: DashboardMikrosystemTarjetaSuperior['variante']) {
  const clasesPorVariante = {
    turquesa: {
      fondo: 'from-[#12b7bf] to-[#0ea5b8]',
      borde: 'border-[#0b8a93]',
      brillo: 'bg-white/10',
    },
    azul: {
      fondo: 'from-[#4697f5] to-[#2f7fd7]',
      borde: 'border-[#2b6bb1]',
      brillo: 'bg-white/10',
    },
    morado: {
      fondo: 'from-[#9959f6] to-[#7c47db]',
      borde: 'border-[#6535b8]',
      brillo: 'bg-white/10',
    },
    grafito: {
      fondo: 'from-[#343a41] to-[#2a3037]',
      borde: 'border-[#1d232a]',
      brillo: 'bg-white/5',
    },
  } as const;

  return clasesPorVariante[variante];
}

function obtenerClasesResumenSistema(variante: DashboardMikrosystemResumenSistemaItem['variante']) {
  const clasesPorVariante = {
    azul: 'bg-[#13b9c8]',
    rojo: 'bg-[#ff5b64]',
    verde: 'bg-[#55c657]',
    rosa: 'bg-[#ff5fa2]',
    cian: 'bg-[#49c2f1]',
    lima: 'bg-[#8bd14b]',
    morado: 'bg-[#8f63f6]',
  } as const;

  return clasesPorVariante[variante];
}

function obtenerIconoServidor(clave: DashboardMikrosystemEstadoServidorItem['clave']) {
  switch (clave) {
    case 'cpu_cores':
      return <Cpu className="h-4 w-4" aria-hidden="true" />;
    case 'carga_promedio':
      return <BarChart3 className="h-4 w-4" aria-hidden="true" />;
    case 'uso_cpu':
      return <Activity className="h-4 w-4" aria-hidden="true" />;
    case 'memoria':
      return <Server className="h-4 w-4" aria-hidden="true" />;
    case 'disco':
      return <HardDrive className="h-4 w-4" aria-hidden="true" />;
    default:
      return <Clock3 className="h-4 w-4" aria-hidden="true" />;
  }
}

function obtenerClasesServidor(variante: DashboardMikrosystemEstadoServidorItem['variante']) {
  const clasesPorVariante = {
    morado: 'from-[#8c63f7] to-[#7b52ec]',
    azul: 'from-[#58a9ff] to-[#3d8ce8]',
    cian: 'from-[#63d8f5] to-[#4dc4e4]',
    rojo: 'from-[#ff7866] to-[#ff6056]',
    rosa: 'from-[#ff68ad] to-[#ff4e95]',
    gris: 'from-[#9aa4b2] to-[#7d8897]',
  } as const;

  return clasesPorVariante[variante];
}

function obtenerClasesEstadoEmisor(estado: DashboardMikrosystemEmisorItem['estado']) {
  if (estado === 'desconectado') {
    return 'bg-[#ff6f6f] text-white';
  }

  return 'bg-[#13c9bd] text-white';
}

function renderizarBarraUso(porcentajeUso: number, colorUsado: string, colorLibre: string) {
  const porcentajeSeguro = Math.max(0, Math.min(100, porcentajeUso));

  return (
    <div className="flex h-5 w-full overflow-hidden rounded-[3px] border border-[#a9b6c4] bg-[#eef2f7] text-[10px] font-semibold">
      <div
        className={cn('flex items-center justify-center text-white', colorUsado)}
        style={{ width: `${porcentajeSeguro}%` }}
      >
        {porcentajeSeguro > 18 ? 'Usado' : ''}
      </div>
      <div
        className={cn('flex items-center justify-center text-white', colorLibre)}
        style={{ width: `${100 - porcentajeSeguro}%` }}
      >
        {100 - porcentajeSeguro > 18 ? 'Libre' : ''}
      </div>
    </div>
  );
}

export default function DashboardMikrosystem() {
  const { user } = useAuth();

  const nombreUsuario = user?.name || 'Administrador principal';
  const rolUsuario = obtenerEtiquetaRol(user?.role);

  // Backend: este bloque agrupa todo el contrato que el API debe entregar
  // para pintar el dashboard Mikrosystem. Cada clave corresponde a una
  // seccion visual del layout y se documenta tambien en el README.
  const datosDashboardMikrosystem: DashboardMikrosystemDatos = {
    saludo: {
      titulo: 'Bienvenido',
      nombreUsuario,
      rolUsuario,
    },
    tarjetasSuperiores: [
      {
        clave: 'clientes_online',
        titulo: 'CLIENTES ONLINE',
        valorPrincipal: '0',
        etiquetaDetalle: 'Total Registrados',
        valorDetalle: '67',
        accion: 'Ver clientes',
        variante: 'turquesa',
      },
      {
        clave: 'transacciones_hoy',
        titulo: 'TRANSACCIONES HOY',
        valorPrincipal: '$ 1,107.80',
        etiquetaDetalle: 'Cobrado este mes',
        valorDetalle: '$ 32,880.31',
        accion: 'Ver transacciones',
        variante: 'azul',
      },
      {
        clave: 'facturas_no_pagadas',
        titulo: 'FACTURAS NO PAGADAS',
        valorPrincipal: '5',
        etiquetaDetalle: 'Total vencidas',
        valorDetalle: '5',
        accion: 'Ver Facturas',
        variante: 'morado',
      },
      {
        clave: 'tickets_soporte',
        titulo: 'TICKET SOPORTE',
        valorPrincipal: '65',
        etiquetaDetalle: 'Total Abiertos',
        valorDetalle: '65',
        accion: 'Ver Tickets',
        variante: 'grafito',
      },
    ],
    graficaTrafico: {
      totalGb: '0 GB',
      porcentajeDescarga: 0,
      descargaGb: '0 GB',
      subidaGb: '0 GB',
      puntos: [
        { fecha: '20/03/2026', traficoGb: 0 },
        { fecha: '21/03/2026', traficoGb: 0 },
        { fecha: '22/03/2026', traficoGb: 0 },
        { fecha: '23/03/2026', traficoGb: 0 },
        { fecha: '24/03/2026', traficoGb: 0 },
        { fecha: '25/03/2026', traficoGb: 0 },
        { fecha: '26/03/2026', traficoGb: 0 },
      ],
    },
    resumenSistema: [
      { id: 1, etiqueta: 'Routers Activos', valor: 2, variante: 'azul' },
      { id: 2, etiqueta: 'Routers desconectados', valor: 0, variante: 'rojo' },
      { id: 3, etiqueta: 'Clientes Activos', valor: 104, variante: 'verde' },
      { id: 4, etiqueta: 'Clientes suspendidos', valor: 35, variante: 'rosa' },
      { id: 5, etiqueta: 'Servicios Activos', valor: 33, variante: 'cian' },
      { id: 6, etiqueta: 'Monitoreo Activos', valor: 2, variante: 'lima' },
      { id: 7, etiqueta: 'Monitoreo Caidos', valor: 1, variante: 'morado' },
    ],
    ultimosPagos: [
      { id: 1, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 34 minutos' },
      { id: 2, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 35 minutos' },
      { id: 3, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 35 minutos' },
      { id: 4, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 37 minutos' },
      { id: 5, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 37 minutos' },
      { id: 6, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 38 minutos' },
      { id: 7, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 38 minutos' },
      { id: 8, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 38 minutos' },
      { id: 9, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 39 minutos' },
      { id: 10, cliente: 'Cliente prueba', monto: '$ 0.20', operador: 'api', tiempo: 'Hace 39 minutos' },
    ],
    ultimosConectados: [],
    datosServidor: [
      { id: 1, clave: 'cpu_cores', etiqueta: 'CPU Cores', valorPrincipal: '1', variante: 'morado' },
      { id: 2, clave: 'carga_promedio', etiqueta: 'Carga promedio (1,5,15 min)', valorPrincipal: '0,0,0', variante: 'azul' },
      { id: 3, clave: 'uso_cpu', etiqueta: 'Uso de CPU', valorPrincipal: '0%', porcentajeUso: 0, variante: 'cian' },
      { id: 4, clave: 'memoria', etiqueta: 'Mem : 1 GB (Libre 41.42%)', valorPrincipal: '', porcentajeUso: 58.58, variante: 'rojo' },
      { id: 5, clave: 'disco', etiqueta: 'Disco: 31 GB (Libre 63.62%)', valorPrincipal: '', porcentajeUso: 36.38, variante: 'rosa' },
      { id: 6, clave: 'ultima_copia', etiqueta: 'Ultima copia de seguridad', valorPrincipal: 'Hace 13 dias (5 MB)', variante: 'rosa' },
    ],
    resumenFacturacion: {
      etiquetaPeriodoActual: 'Mes actual',
      etiquetaPeriodoAnterior: 'El mes pasado',
      periodoActual: [
        { concepto: 'Pagos', cantidad: 280, monto: '$ 32,880.31' },
        { concepto: 'Facturas pagadas', cantidad: 2, monto: '$ 800.00' },
        { concepto: 'Facturas sin Pagar', cantidad: 0, monto: '$ 0.00' },
      ],
      periodoAnterior: [
        { concepto: 'Pagos', cantidad: 6, monto: '$ 1,822.00' },
        { concepto: 'Facturas pagadas', cantidad: 3, monto: '$ 2.00' },
        { concepto: 'Facturas sin Pagar', cantidad: 1, monto: '$ 0.20' },
      ],
    },
    emisores: {
      total: 3,
      paginaActual: 1,
      tamanoPagina: 15,
      filas: [
        { id: 1, nombre: 'AP OMNI CORNEJO', equipo: 'ROCKET AC LITE', ip: '10.0.0.10', estado: 'desconectado' },
        { id: 2, nombre: 'Tes', equipo: '', ip: '1.1.1.1', estado: 'en_linea' },
        { id: 3, nombre: 'AAA', equipo: '', ip: '8.8.4.4', estado: 'en_linea' },
      ],
    },
  };

  return (
    <div className="min-h-full bg-[#dce4ee] px-4 pb-6 pt-4 lg:px-6 lg:pb-8 lg:pt-5">
      <div className="mb-4">
        <h1 className="flex flex-wrap items-center gap-2 text-[2rem] font-medium leading-none text-[#253245]">
          <span>{datosDashboardMikrosystem.saludo.titulo}</span>
          <span className="text-base font-normal text-[#708399]">
            {datosDashboardMikrosystem.saludo.rolUsuario}
          </span>
        </h1>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {datosDashboardMikrosystem.tarjetasSuperiores.map((tarjeta) => {
          const clasesTarjeta = obtenerClasesTarjetaSuperior(tarjeta.variante);

          return (
            <Card
              key={tarjeta.clave}
              className={cn(
                'relative overflow-hidden border shadow-[0_8px_18px_rgba(15,23,42,0.12)]',
                clasesTarjeta.borde,
              )}
            >
              <div className={cn('absolute inset-0 bg-gradient-to-r', clasesTarjeta.fondo)} />
              <div className="absolute -right-3 top-3 opacity-15 text-white">
                {obtenerIconoTarjetaSuperior(tarjeta.clave)}
              </div>
              <div className="absolute right-12 top-7 flex gap-2 opacity-30">
                <span className={cn('h-5 w-5 rounded-full', clasesTarjeta.brillo)} />
                <span className={cn('h-8 w-8 rounded-full', clasesTarjeta.brillo)} />
                <span className={cn('mt-2 h-4 w-4 rounded-full', clasesTarjeta.brillo)} />
              </div>
              <div className="relative flex min-h-[118px] flex-col justify-between px-4 py-3 text-white">
                <div>
                  <p className="text-[13px] uppercase tracking-[0.02em] text-white/90">{tarjeta.titulo}</p>
                  <p className="mt-1 text-[2.35rem] font-bold leading-none">{tarjeta.valorPrincipal}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-black/30 pt-2 text-[13px]">
                  <p className="text-white/95">
                    {tarjeta.etiquetaDetalle}{' '}
                    <span className="font-semibold">{tarjeta.valorDetalle}</span>
                  </p>
                  <button className="inline-flex items-center gap-1 text-[13px] font-semibold text-white transition hover:text-white/90">
                    {tarjeta.accion}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(320px,0.84fr)]">
        <PanelMikrosystem titulo="Tráfico Clientes" cuerpoClassName="bg-[#2b3239] p-0">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_226px]">
            <div className="px-5 pb-4 pt-2">
              <div className="mb-3 text-[13px] text-[#d1dae4]">Últimos 7 días</div>
              <div className="h-[256px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={datosDashboardMikrosystem.graficaTrafico.puntos}
                    margin={{ top: 8, right: 18, bottom: 12, left: 4 }}
                  >
                    <CartesianGrid stroke="#55616d" vertical={false} />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fill: '#9eaab8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      angle={-28}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis
                      domain={[0, 1]}
                      ticks={[0, 0.25, 0.5, 0.75, 1]}
                      tickFormatter={(valor) => `${valor} GB`}
                      tick={{ fill: '#9eaab8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip
                      cursor={{ stroke: '#58a9ff', strokeWidth: 1 }}
                      contentStyle={{
                        backgroundColor: '#1f252b',
                        border: '1px solid #55616d',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                      formatter={(valor: number) => [`${valor} GB`, 'Tráfico']}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="traficoGb"
                      stroke="#4da6ff"
                      strokeWidth={2}
                      dot={{ fill: '#4da6ff', stroke: '#d7e3ee', strokeWidth: 1.5, r: 3.2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-[#313942] bg-[#1f252b] px-4 py-4 text-white xl:border-l xl:border-t-0">
              <div className="text-[2.1rem] font-semibold leading-none">{datosDashboardMikrosystem.graficaTrafico.totalGb}</div>
              <div className="mt-1 text-sm text-[#a8b4c1]">Total tráfico</div>

              <div className="mt-6 flex justify-center">
                <div className="relative flex h-[184px] w-[184px] items-center justify-center rounded-full border-[24px] border-[#3f9cff] bg-[#1f252b] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <div className="text-center">
                    <div className="text-[3rem] font-bold leading-none">{datosDashboardMikrosystem.graficaTrafico.porcentajeDescarga}%</div>
                    <div className="text-[0.95rem] font-medium uppercase tracking-normal text-white">DESCARGA</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-xs text-[#d7e3ee]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3f9cff]" />
                  <span className="font-semibold">{datosDashboardMikrosystem.graficaTrafico.descargaGb}</span>
                  <span>Descarga</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#12b7bf]" />
                  <span className="font-semibold">{datosDashboardMikrosystem.graficaTrafico.subidaGb}</span>
                  <span>Subida</span>
                </div>
              </div>
            </div>
          </div>
        </PanelMikrosystem>

        <PanelMikrosystem
          titulo="Resumen del sistema"
          cuerpoClassName="bg-[#1f252b] p-0"
          className="border-[#2a3138] bg-[#1f252b] shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
        >
          <div className="divide-y divide-[#313942]">
            {datosDashboardMikrosystem.resumenSistema.map((item, indice) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-[13px] text-white">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-[0.95rem] font-semibold text-white">{indice + 1}.</span>
                  <span className="truncate text-[0.95rem] text-white">{item.etiqueta}</span>
                </div>
                <span
                  className={cn(
                    'inline-flex min-w-[26px] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none text-white',
                    obtenerClasesResumenSistema(item.variante),
                  )}
                >
                  {item.valor}
                </span>
              </div>
            ))}
          </div>
        </PanelMikrosystem>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
        <PanelMikrosystem titulo="Últimos pagos registrados">
          <table className="w-full text-xs">
            <thead className="bg-[#f7f9fc] text-[#2a3542]">
              <tr>
                <th className="border-b border-[#d9e1ea] px-3 py-2 text-left font-semibold">Cliente</th>
                <th className="border-b border-[#d9e1ea] px-3 py-2 text-left font-semibold">Cobrado</th>
                <th className="border-b border-[#d9e1ea] px-3 py-2 text-left font-semibold">Operador</th>
                <th className="border-b border-[#d9e1ea] px-3 py-2 text-left font-semibold">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {datosDashboardMikrosystem.ultimosPagos.map((pago, indice) => (
                <tr key={pago.id} className={indice % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                  <td className="border-b border-[#e5ebf2] px-3 py-2 text-[#334155]">{pago.cliente}</td>
                  <td className="border-b border-[#e5ebf2] px-3 py-2 text-[#334155]">{pago.monto}</td>
                  <td className="border-b border-[#e5ebf2] px-3 py-2 text-[#526376]">{pago.operador}</td>
                  <td className="border-b border-[#e5ebf2] px-3 py-2 text-[#526376]">{pago.tiempo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center border-t border-[#d9e1ea] px-3 py-3">
            <button className="inline-flex items-center gap-1 text-sm font-medium text-[#2c6eb8] transition hover:text-[#1e5b98]">
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </PanelMikrosystem>

        <PanelMikrosystem titulo="Últimos conectados">
          <div className="min-h-[176px] bg-white dark:bg-[#1a2028]" />
          <div className="flex justify-center border-t border-[#d9e1ea] px-3 py-3">
            <button className="inline-flex items-center gap-1 text-sm font-medium text-[#2c6eb8] transition hover:text-[#1e5b98]">
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </PanelMikrosystem>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <PanelMikrosystem titulo="DATOS DEL SERVIDOR">
          <div className="bg-[#2b3239] px-4 py-4 text-white">
            <div className="space-y-4">
              {datosDashboardMikrosystem.datosServidor.map((item) => (
                <div key={item.id} className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br text-white',
                      obtenerClasesServidor(item.variante),
                    )}
                  >
                    {obtenerIconoServidor(item.clave)}
                  </div>
                  <div className="border-b border-[#3b454f] pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-white">{item.etiqueta}</span>
                      {item.clave === 'cpu_cores' || item.clave === 'carga_promedio' || item.clave === 'ultima_copia' ? (
                        <span className="text-sm text-[#d8e2ec]">{item.valorPrincipal}</span>
                      ) : null}
                    </div>

                    {item.clave === 'uso_cpu' && typeof item.porcentajeUso === 'number' ? (
                      <div className="mt-2">
                        <div className="mb-1 text-right text-xs font-semibold text-[#d8e2ec]">{item.valorPrincipal}</div>
                        {renderizarBarraUso(item.porcentajeUso, 'bg-[#f6a731]', 'bg-[#7cbcff]')}
                      </div>
                    ) : null}

                    {item.clave === 'memoria' && typeof item.porcentajeUso === 'number' ? (
                      <div className="mt-2">{renderizarBarraUso(item.porcentajeUso, 'bg-[#f6a731]', 'bg-[#5aa7ff]')}</div>
                    ) : null}

                    {item.clave === 'disco' && typeof item.porcentajeUso === 'number' ? (
                      <div className="mt-2">{renderizarBarraUso(item.porcentajeUso, 'bg-[#f6a731]', 'bg-[#5aa7ff]')}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PanelMikrosystem>

        <PanelMikrosystem titulo="Resumen Facturación">
          <div className="p-3">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <th className="rounded-t-[3px] bg-[#4295f5] px-3 py-2 text-center text-sm font-semibold text-white" colSpan={2}>
                    {datosDashboardMikrosystem.resumenFacturacion.etiquetaPeriodoActual}
                  </th>
                </tr>
                {datosDashboardMikrosystem.resumenFacturacion.periodoActual.map((fila) => (
                  <tr key={`actual-${fila.concepto}`} className="border-b border-[#e5ebf2]">
                    <td className="px-3 py-2 text-[#334155]">{fila.concepto}</td>
                    <td className="px-3 py-2 text-right font-medium text-[#334155]">
                      {fila.cantidad} ({fila.monto})
                    </td>
                  </tr>
                ))}
                <tr>
                  <th className="bg-[#4eb5d6] px-3 py-2 text-center text-sm font-semibold text-white" colSpan={2}>
                    {datosDashboardMikrosystem.resumenFacturacion.etiquetaPeriodoAnterior}
                  </th>
                </tr>
                {datosDashboardMikrosystem.resumenFacturacion.periodoAnterior.map((fila, indice) => (
                  <tr
                    key={`anterior-${fila.concepto}`}
                    className={cn('border-b border-[#e5ebf2]', indice === datosDashboardMikrosystem.resumenFacturacion.periodoAnterior.length - 1 && 'border-b-0')}
                  >
                    <td className="px-3 py-2 text-[#334155]">{fila.concepto}</td>
                    <td className="px-3 py-2 text-right font-medium text-[#334155]">
                      {fila.cantidad} ({fila.monto})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelMikrosystem>
      </div>

      <PanelMikrosystem
        titulo="Emisores"
        accionesEncabezado={
          <div className="flex items-center gap-2">
            <div className="flex items-center overflow-hidden rounded border border-[#46515d] bg-[#f5f8fb] text-[#2b3642]">
              <button className="px-3 py-1.5 text-sm">{datosDashboardMikrosystem.emisores.tamanoPagina}</button>
              <button className="border-l border-[#cfd7e2] px-3 py-1.5 text-sm" title="Toggle list view">
                <List className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8b9d]" />
              <input
                type="search"
                placeholder="Buscar..."
                className="h-9 w-[220px] rounded border border-[#cfd7e2] bg-white pl-9 pr-3 text-sm text-[#334155] outline-none placeholder:text-[#a0adba] focus:border-[#4295f5]"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="border-b border-[#d9e1ea] px-4 py-3 text-left font-semibold text-[#334155]">NOMBRE</th>
                <th className="border-b border-[#d9e1ea] px-4 py-3 text-left font-semibold text-[#334155]">EQUIPO</th>
                <th className="border-b border-[#d9e1ea] px-4 py-3 text-left font-semibold text-[#334155]">IP</th>
                <th className="border-b border-[#d9e1ea] px-4 py-3 text-left font-semibold text-[#334155]">ESTADO</th>
                <th className="border-b border-[#d9e1ea] px-4 py-3 text-right font-semibold text-[#334155]"></th>
              </tr>
            </thead>
            <tbody>
              {datosDashboardMikrosystem.emisores.filas.map((emisor, indice) => (
                <tr key={emisor.id} className={indice % 2 === 0 ? 'bg-white' : 'bg-[#fbfcfe]'}>
                  <td className="border-b border-[#e5ebf2] px-4 py-3 text-[#334155]">{emisor.nombre}</td>
                  <td className="border-b border-[#e5ebf2] px-4 py-3 text-[#526376]">{emisor.equipo || '-'}</td>
                  <td className="border-b border-[#e5ebf2] px-4 py-3 text-[#526376]">{emisor.ip}</td>
                  <td className="border-b border-[#e5ebf2] px-4 py-3">
                    <span className={cn('inline-flex rounded-[3px] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.04em]', obtenerClasesEstadoEmisor(emisor.estado))}>
                      {emisor.estado === 'desconectado' ? 'DESCONECTADO' : 'EN LINEA'}
                    </span>
                  </td>
                  <td className="border-b border-[#e5ebf2] px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-[#2f3b48]">
                      <Wifi className="h-4 w-4" />
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#d9e1ea] px-4 py-4 text-sm text-[#526376] md:flex-row md:items-center md:justify-between">
          <p>
            Mostrando de 1 a {datosDashboardMikrosystem.emisores.total} de un total de {datosDashboardMikrosystem.emisores.total}
          </p>

          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#7b8898] transition hover:border-[#9fb0c1] hover:text-[#526376]" title="Página anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="inline-flex h-9 min-w-9 items-center justify-center rounded border border-[#2f7fd7] bg-[#4295f5] px-3 font-semibold text-white">
              {datosDashboardMikrosystem.emisores.paginaActual}
            </button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#cfd7e2] bg-white text-[#7b8898] transition hover:border-[#9fb0c1] hover:text-[#526376]" title="Página siguiente">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PanelMikrosystem>
    </div>
  );
}
