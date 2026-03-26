// Tipos globales de la plataforma BRANDUP NETWORK

export type UserRole = 'super_admin' | 'isp_admin' | 'cobranza' | 'soporte' | 'tecnico' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string; // null para super_admin
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  fiscalName: string;
  rfc: string;
  logo?: string;
  status: 'active' | 'suspended' | 'inactive';
  plan: string;
  createdAt: string;
  config: CompanyConfig;
}

export interface CompanyConfig {
  timezone: string;
  currency: string;
  graceDays: number;
  cutoffTime: string;
  paymentMethods: string[];
  billingDay: number;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  fiscalId?: string;
  status: 'active' | 'suspended' | 'overdue' | 'cancelled';
  planId: string;
  balance: number;
  lastPayment?: string;
  connectionDate: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Plan {
  id: string;
  companyId: string;
  name: string;
  speed: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'biweekly';
  description?: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issueDate?: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  folio: string;
}

export interface Payment {
  id: string;
  companyId: string;
  clientId: string;
  invoiceId?: string;
  amount: number;
  method: string;
  reference?: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Ticket {
  id: string;
  companyId: string;
  clientId: string;
  type: 'no_service' | 'intermittent' | 'billing' | 'installation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ServiceOrder {
  id: string;
  companyId: string;
  clientId: string;
  type: 'installation' | 'maintenance' | 'removal' | 'equipment_change';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  assignedTo?: string;
  notes?: string;
  evidence?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface NetworkDevice {
  id: string;
  companyId: string;
  name: string;
  type: 'router' | 'switch' | 'ap' | 'tower' | 'link';
  ip: string;
  location?: string;
  status: 'up' | 'down' | 'warning';
  uptime?: number;
  lastCheck: string;
}

export interface Voucher {
  id: string;
  companyId: string;
  code: string;
  duration: string;
  speed: string;
  status: 'available' | 'used' | 'expired';
  createdAt: string;
  usedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  companyId?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  activeCompanies?: number;
  totalClients?: number;
  overdueBalance?: number;
  openTickets?: number;
  networkUptime?: number;
  revenue?: number;
  activeClients?: number;
  suspendedClients?: number;
  monthlyRevenue?: number;
}

export interface DashboardMikrosystemTarjetaSuperior {
  clave: string;
  titulo: string;
  valorPrincipal: string;
  etiquetaDetalle: string;
  valorDetalle: string;
  accion: string;
  variante: 'turquesa' | 'azul' | 'morado' | 'grafito';
}

export interface DashboardMikrosystemPuntoTrafico {
  fecha: string;
  traficoGb: number;
}

export interface DashboardMikrosystemResumenSistemaItem {
  id: number;
  etiqueta: string;
  valor: number;
  variante: 'azul' | 'rojo' | 'verde' | 'rosa' | 'cian' | 'lima' | 'morado';
}

export interface DashboardMikrosystemFilaActividad {
  id: number;
  cliente: string;
  monto: string;
  operador: string;
  tiempo: string;
}

export interface DashboardMikrosystemEstadoServidorItem {
  id: number;
  clave: string;
  etiqueta: string;
  valorPrincipal: string;
  valorSecundario?: string;
  porcentajeUso?: number;
  variante: 'morado' | 'azul' | 'cian' | 'rojo' | 'rosa' | 'gris';
}

export interface DashboardMikrosystemFilaFacturacion {
  concepto: string;
  cantidad: number;
  monto: string;
}

export interface DashboardMikrosystemEmisorItem {
  id: number;
  nombre: string;
  equipo: string;
  ip: string;
  estado: 'desconectado' | 'en_linea';
}

export interface DashboardMikrosystemDatos {
  saludo: {
    titulo: string;
    nombreUsuario: string;
    rolUsuario: string;
  };
  tarjetasSuperiores: DashboardMikrosystemTarjetaSuperior[];
  graficaTrafico: {
    totalGb: string;
    porcentajeDescarga: number;
    descargaGb: string;
    subidaGb: string;
    puntos: DashboardMikrosystemPuntoTrafico[];
  };
  resumenSistema: DashboardMikrosystemResumenSistemaItem[];
  ultimosPagos: DashboardMikrosystemFilaActividad[];
  ultimosConectados: DashboardMikrosystemFilaActividad[];
  datosServidor: DashboardMikrosystemEstadoServidorItem[];
  resumenFacturacion: {
    etiquetaPeriodoActual: string;
    etiquetaPeriodoAnterior: string;
    periodoActual: DashboardMikrosystemFilaFacturacion[];
    periodoAnterior: DashboardMikrosystemFilaFacturacion[];
  };
  emisores: {
    total: number;
    paginaActual: number;
    tamanoPagina: number;
    filas: DashboardMikrosystemEmisorItem[];
  };
}

export interface DashboardWispHubTarjetaResumen {
  id: number;
  icono: 'dinero' | 'reloj' | 'calendario' | 'cliente_nuevo' | 'clientes' | 'ticket_nuevo';
  valorPrincipal: string;
  etiqueta: string;
  color: 'verde' | 'naranja' | 'azul' | 'rojo';
  alineacion: 'izquierda' | 'derecha';
}

export interface DashboardWispHubBloqueResumen {
  clave: 'pagos' | 'clientes' | 'tickets';
  titulo: string;
  iconoTitulo: 'pagos' | 'clientes' | 'tickets';
  tarjetas: DashboardWispHubTarjetaResumen[];
}

export interface DashboardWispHubTarjetaTrafico {
  id: number;
  icono: 'descarga' | 'subida';
  valorPrincipal: string;
  etiqueta: string;
  color: 'azul' | 'naranja';
}

export interface DashboardWispHubSerieFinanciera {
  mes: string;
  ingresosInternet: number;
  otrosIngresos: number;
  gastos: number;
}

export interface DashboardWispHubDatos {
  tituloPagina: string;
  bloquesResumen: DashboardWispHubBloqueResumen[];
  trafico: {
    fechaActualizacion: string;
    tarjetas: DashboardWispHubTarjetaTrafico[];
  };
  historialFinanzas: {
    fechaActualizacion: string;
    accionActualizacion: string;
    titulo: string;
    subtitulo: string;
    series: DashboardWispHubSerieFinanciera[];
  };
  piePagina: {
    copyright: string;
    fechaSistema: string;
  };
}

export interface WispHubListaClientesOpcion {
  valor: string;
  etiqueta: string;
}

export interface WispHubListaClientesBoton {
  id: string;
  etiqueta: string;
  icono:
    | 'copiar'
    | 'excel'
    | 'documento'
    | 'tabla'
    | 'ayuda'
    | 'reiniciar'
    | 'encender'
    | 'suspender'
    | 'cliente'
    | 'estado'
    | 'grafica'
    | 'intercambio'
    | 'herramientas'
    | 'ia';
  color: 'verde' | 'azul' | 'cian' | 'naranja' | 'morado';
  variante: 'selector' | 'icono' | 'menu';
}

export interface WispHubListaClientesColumna {
  clave:
    | 'nombre'
    | 'servicio'
    | 'ip'
    | 'estado'
    | 'planInternet'
    | 'router'
    | 'direccion'
    | 'accion';
  titulo: string;
  placeholderFiltro: string;
  alineacion?: 'left' | 'center' | 'right';
}

export interface WispHubListaClientesFila {
  id: string;
  zona: string;
  nombre: string;
  servicio: string;
  ip: string;
  estado: 'activo' | 'suspendido' | 'moroso' | 'cancelado';
  planInternet: string;
  router: string;
  direccion: string;
  accion: string;
  email: string;
  telefono: string;
}

export interface WispHubListaClientesDatos {
  tituloPagina: string;
  filtroZona: {
    placeholder: string;
    opciones: WispHubListaClientesOpcion[];
  };
  accionMasiva: {
    placeholder: string;
    opciones: WispHubListaClientesOpcion[];
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    selectorVistaLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: WispHubListaClientesBoton[];
    botonesAccion: WispHubListaClientesBoton[];
    botonesMenu: WispHubListaClientesBoton[];
    columnas: WispHubListaClientesColumna[];
    filas: WispHubListaClientesFila[];
  };
  piePagina: {
    copyright: string;
    fechaSistema: string;
  };
}

export interface MikrosystemListaClientesAccion {
  id: string;
  etiqueta: string;
  icono:
    | 'tabla'
    | 'lista'
    | 'encendido'
    | 'eliminar'
    | 'nuevo'
    | 'filtrar'
    | 'refrescar';
  variante: 'icono' | 'boton' | 'selector';
}

export interface MikrosystemListaClientesColumna {
  clave:
    | 'id'
    | 'nombre'
    | 'direccionPrincipal'
    | 'ultimoPago'
    | 'ip'
    | 'direccionServicio'
    | 'mac'
    | 'diaPago'
    | 'deudaActual'
    | 'correo'
    | 'telefono'
    | 'plan';
  titulo: string;
  placeholderFiltro: string;
}

export interface MikrosystemListaClientesFila {
  id: string;
  nombre: string;
  direccionPrincipal: string;
  ultimoPago: string;
  ip: string;
  direccionServicio: string;
  mac: string;
  diaPago: string;
  deudaActual: string;
  correo: string;
  telefono: string;
  plan: string;
}

export interface MikrosystemListaClientesDatos {
  tituloPagina: string;
  accionesRapidas: MikrosystemListaClientesAccion[];
  filtroEstado: {
    valorDefault: string;
    opciones: WispHubListaClientesOpcion[];
  };
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: MikrosystemListaClientesColumna[];
    filas: MikrosystemListaClientesFila[];
  };
}

export interface WispHubListaFacturasBoton {
  id: string;
  etiqueta: string;
  icono:
    | 'copiar'
    | 'excel'
    | 'documento'
    | 'tabla'
    | 'dinero'
    | 'correo'
    | 'cancelar'
    | 'eliminar'
    | 'herramientas';
  color: 'verde' | 'azul' | 'cian' | 'rojo';
  variante: 'selector' | 'icono' | 'menu';
}

export interface WispHubListaFacturasColumna {
  clave:
    | 'numeroFactura'
    | 'cajero'
    | 'usuario'
    | 'cliente'
    | 'fechaPago'
    | 'estado'
    | 'zona'
    | 'totalCobrado'
    | 'formaPago'
    | 'total'
    | 'accion';
  titulo: string;
  placeholderFiltro: string;
}

export interface WispHubListaFacturasFila {
  id: string;
  numeroFactura: string;
  cajero: string;
  usuario: string;
  cliente: string;
  fechaPago: string;
  estado: string;
  zona: string;
  totalCobrado: string;
  formaPago: string;
  total: string;
  accion: string;
}

export interface WispHubListaFacturasDatos {
  tituloPagina: string;
  filtrosFecha: {
    desde: string;
    hasta: string;
    botonTexto: string;
  };
  accionesLote: {
    placeholder: string;
    opciones: WispHubListaClientesOpcion[];
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: WispHubListaFacturasBoton[];
    botonesAccion: WispHubListaFacturasBoton[];
    botonesMenu: WispHubListaFacturasBoton[];
    columnas: WispHubListaFacturasColumna[];
    filas: WispHubListaFacturasFila[];
    totalSeleccionados: number;
    totalMontoTexto: string;
  };
}

export interface MikrosystemListaFacturasAccion {
  id: string;
  etiqueta: string;
  icono: 'lista' | 'herramientas' | 'refrescar';
  variante: 'icono' | 'boton';
}

export interface MikrosystemListaFacturasColumna {
  clave:
    | 'numeroFactura'
    | 'numeroLegal'
    | 'tipo'
    | 'cliente'
    | 'fechaEmitido'
    | 'fechaVencimiento'
    | 'total'
    | 'saldo'
    | 'formaPago'
    | 'numeroIdentificacion'
    | 'estado';
  titulo: string;
  placeholderFiltro: string;
}

export interface MikrosystemListaFacturasFila {
  id: string;
  numeroFactura: string;
  numeroLegal: string;
  tipo: string;
  cliente: string;
  fechaEmitido: string;
  fechaVencimiento: string;
  total: string;
  saldo: string;
  formaPago: string;
  numeroIdentificacion: string;
  estado: string;
}

export interface MikrosystemListaFacturasResumenFila {
  detalle: string;
  cantidad: number;
  impuesto: string;
  total: string;
  cobrado: string;
  variante: 'turquesa' | 'amarillo' | 'rosa' | 'azul';
}

export interface MikrosystemListaFacturasDatos {
  tituloPagina: string;
  filtros: {
    tipoFecha: string;
    desde: string;
    hasta: string;
    router: string;
    estado: string;
    opcionesTipoFecha: WispHubListaClientesOpcion[];
    opcionesRouter: WispHubListaClientesOpcion[];
    opcionesEstado: WispHubListaClientesOpcion[];
  };
  accionesRapidas: MikrosystemListaFacturasAccion[];
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: MikrosystemListaFacturasColumna[];
    filas: MikrosystemListaFacturasFila[];
  };
  resumen: MikrosystemListaFacturasResumenFila[];
}

export interface WispHubListaPagosPendientesBoton {
  id: string;
  etiqueta: string;
  icono:
    | 'copiar'
    | 'documento'
    | 'tabla'
    | 'filtro'
    | 'dinero'
    | 'correo'
    | 'encendido'
    | 'herramientas';
  color: 'verde' | 'azul' | 'cian' | 'naranja';
  variante: 'selector' | 'icono' | 'menu' | 'boton';
}

export interface WispHubListaPagosPendientesColumna {
  clave:
    | 'numeroFactura'
    | 'cliente'
    | 'idServicio'
    | 'estadoServicio'
    | 'ipServicio'
    | 'estadoFactura'
    | 'zona'
    | 'total'
    | 'accion';
  titulo: string;
  placeholderFiltro: string;
}

export interface WispHubListaPagosPendientesFila {
  id: string;
  numeroFactura: string;
  cliente: string;
  idServicio: string;
  estadoServicio: string;
  ipServicio: string;
  estadoFactura: string;
  zona: string;
  total: string;
  accion: string;
}

export interface WispHubListaPagosPendientesDatos {
  tituloPagina: string;
  pestanas: Array<{
    id: string;
    etiqueta: string;
    activa: boolean;
    resalto?: string;
  }>;
  formularioPago: {
    accionPlaceholder: string;
    formaPagoPlaceholder: string;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: WispHubListaPagosPendientesBoton[];
    botonesAccion: WispHubListaPagosPendientesBoton[];
    columnas: WispHubListaPagosPendientesColumna[];
    filas: WispHubListaPagosPendientesFila[];
    totalSeleccionados: number;
  };
}
