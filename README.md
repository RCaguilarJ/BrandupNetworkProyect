
# BRANDUP NETWORK

Bundle base de la plataforma BRANDUP NETWORK.

## Ejecutar el proyecto

Instalar dependencias:

```bash
npm i
```

Levantar entorno local:

```bash
npm run dev
```

## Dashboard Mikrosystem

Archivos clave del rediseño:

- `src/app/pages/DashboardMikrosystem.tsx`
- `src/app/types/index.ts`

La pantalla del dashboard Mikrosystem ahora se construye a partir de un contrato unico llamado `DashboardMikrosystemDatos`. La idea es que backend entregue una respuesta con esta misma estructura o una transformacion muy cercana para evitar que el frontend vuelva a repartir campos sueltos.

### Contrato esperado para backend

```ts
interface DashboardMikrosystemDatos {
  saludo: {
    titulo: string;
    nombreUsuario: string;
    rolUsuario: string;
  };
  tarjetasSuperiores: Array<{
    clave: string;
    titulo: string;
    valorPrincipal: string;
    etiquetaDetalle: string;
    valorDetalle: string;
    accion: string;
    variante: 'turquesa' | 'azul' | 'morado' | 'grafito';
  }>;
  graficaTrafico: {
    totalGb: string;
    porcentajeDescarga: number;
    descargaGb: string;
    subidaGb: string;
    puntos: Array<{
      fecha: string;
      traficoGb: number;
    }>;
  };
  resumenSistema: Array<{
    id: number;
    etiqueta: string;
    valor: number;
    variante: 'azul' | 'rojo' | 'verde' | 'rosa' | 'cian' | 'lima' | 'morado';
  }>;
  ultimosPagos: Array<{
    id: number;
    cliente: string;
    monto: string;
    operador: string;
    tiempo: string;
  }>;
  ultimosConectados: Array<{
    id: number;
    cliente: string;
    monto: string;
    operador: string;
    tiempo: string;
  }>;
  datosServidor: Array<{
    id: number;
    clave: string;
    etiqueta: string;
    valorPrincipal: string;
    porcentajeUso?: number;
    variante: 'morado' | 'azul' | 'cian' | 'rojo' | 'rosa' | 'gris';
  }>;
  resumenFacturacion: {
    etiquetaPeriodoActual: string;
    etiquetaPeriodoAnterior: string;
    periodoActual: Array<{
      concepto: string;
      cantidad: number;
      monto: string;
    }>;
    periodoAnterior: Array<{
      concepto: string;
      cantidad: number;
      monto: string;
    }>;
  };
  emisores: {
    total: number;
    paginaActual: number;
    tamanoPagina: number;
    filas: Array<{
      id: number;
      nombre: string;
      equipo: string;
      ip: string;
      estado: 'desconectado' | 'en_linea';
    }>;
  };
}
```

### Mapeo visual por bloque

- `saludo`: texto de bienvenida del dashboard. `nombreUsuario` y `rolUsuario` deben venir resueltos por backend o por el contexto de autenticacion.
- `tarjetasSuperiores[clientes_online]`: `valorPrincipal` representa sesiones activas; `valorDetalle` representa total de clientes registrados.
- `tarjetasSuperiores[transacciones_hoy]`: `valorPrincipal` representa monto cobrado hoy; `valorDetalle` representa acumulado del mes.
- `tarjetasSuperiores[facturas_no_pagadas]`: `valorPrincipal` representa total de facturas abiertas sin pago; `valorDetalle` representa vencidas.
- `tarjetasSuperiores[tickets_soporte]`: `valorPrincipal` representa tickets visibles; `valorDetalle` representa abiertos.
- `graficaTrafico.puntos`: arreglo cronologico para el grafico principal. `traficoGb` debe enviarse como numero.
- `graficaTrafico.porcentajeDescarga`: usar numero de `0` a `100`.
- `resumenSistema`: lista lateral del panel oscuro. El orden importa porque se enumera visualmente.
- `ultimosPagos`: tabla izquierda. Si backend cambia columnas, actualizar el componente y este README al mismo tiempo.
- `ultimosConectados`: panel derecho. Puede llegar vacio; el frontend deja el panel limpio y mantiene la accion "Ver todos".
- `datosServidor`: `porcentajeUso` se usa para las barras. Cuando no aplique, puede omitirse.
- `resumenFacturacion`: dos bloques comparativos. `cantidad` es conteo y `monto` ya puede llegar formateado o formatearse antes del render.
- `emisores.filas`: tabla final. `estado` solo contempla `desconectado` y `en_linea` en la version actual.

### Notas de mantenimiento

- Si cambia una clave del contrato `DashboardMikrosystemDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/DashboardMikrosystem.tsx` y este README en el mismo cambio.
- Las variables y comentarios del dashboard se dejaron en espanol a proposito para que backend pueda mapear la respuesta sin traducir conceptos.
- Los datos actuales del dashboard son placeholders visuales alineados con la maqueta de referencia; backend debe reemplazarlos por datos reales sin cambiar la forma del objeto.

## Dashboard WispHub

Archivos clave del rediseño:

- `src/app/pages/DashboardWispHub.tsx`
- `src/app/types/index.ts`

La vista WispHub se rehizo con un layout clasico tipo ERP, apoyado en un contrato unico llamado `DashboardWispHubDatos`. Igual que en Mikrosystem, la recomendacion es que backend entregue esta forma o algo muy cercano para no repartir el mapeo del dashboard en multiples transformaciones.

### Contrato esperado para backend

```ts
interface DashboardWispHubDatos {
  tituloPagina: string;
  bloquesResumen: Array<{
    clave: 'pagos' | 'clientes' | 'tickets';
    titulo: string;
    iconoTitulo: 'pagos' | 'clientes' | 'tickets';
    tarjetas: Array<{
      id: number;
      icono: 'dinero' | 'reloj' | 'calendario' | 'cliente_nuevo' | 'clientes' | 'ticket_nuevo';
      valorPrincipal: string;
      etiqueta: string;
      color: 'verde' | 'naranja' | 'azul' | 'rojo';
      alineacion: 'izquierda' | 'derecha';
    }>;
  }>;
  trafico: {
    fechaActualizacion: string;
    tarjetas: Array<{
      id: number;
      icono: 'descarga' | 'subida';
      valorPrincipal: string;
      etiqueta: string;
      color: 'azul' | 'naranja';
    }>;
  };
  historialFinanzas: {
    fechaActualizacion: string;
    accionActualizacion: string;
    titulo: string;
    subtitulo: string;
    series: Array<{
      mes: string;
      ingresosInternet: number;
      otrosIngresos: number;
      gastos: number;
    }>;
  };
  piePagina: {
    copyright: string;
    fechaSistema: string;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal del dashboard. En la maqueta actual se muestra como `Dashboard`.
- `bloquesResumen[pagos]`: tres cajas del bloque "Pagos Internet". `valorPrincipal` y `etiqueta` ya pueden llegar formateados desde backend.
- `bloquesResumen[clientes]`: bloque central con altas del dia, del mes y total.
- `bloquesResumen[tickets]`: bloque derecho con conteos del dia, pendientes y del mes.
- `tarjetas[].alineacion`: controla si el valor se presenta a la izquierda o a la derecha. Esto se dejo explicito para no meter reglas visuales escondidas en el frontend.
- `trafico.fechaActualizacion`: texto pequeno arriba de las tarjetas de descarga y subida.
- `trafico.tarjetas`: resumen rapido de trafico. `valorPrincipal` espera texto como `0 GiB`.
- `historialFinanzas.fechaActualizacion`: linea superior de la seccion de grafica.
- `historialFinanzas.accionActualizacion`: copy del boton/enlace de refresco.
- `historialFinanzas.series`: puntos de la grafica. Cada objeto representa un mes y tres series: `ingresosInternet`, `otrosIngresos`, `gastos`.
- `piePagina`: texto inferior del dashboard para copyright y fecha del sistema.

### Notas de mantenimiento

- Si cambia una clave del contrato `DashboardWispHubDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/DashboardWispHub.tsx` y este README en el mismo cambio.
- La tipografia, colores y distribucion del dashboard WispHub se dejaron definidas dentro del componente para que el look clasico no dependa de estilos globales del tema.
- Los comentarios y variables del dashboard se dejaron en espanol para facilitar el mapeo con backend.

## Lista de Clientes WispHub

Archivos clave del rediseño:

- `src/app/pages/Clients.tsx`
- `src/app/types/index.ts`

La vista WispHub de lista de clientes ahora se resuelve con un contrato visual separado llamado `WispHubListaClientesDatos`. Igual que en los dashboards, la intencion es que backend entregue datos listos para pintar la maqueta clasica sin obligar al frontend a reconstruir zona, servicio visible, router o textos de controles en varias capas.

### Contrato esperado para backend

```ts
interface WispHubListaClientesDatos {
  tituloPagina: string;
  filtroZona: {
    placeholder: string;
    opciones: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  accionMasiva: {
    placeholder: string;
    opciones: Array<{
      valor: string;
      etiqueta: string;
    }>;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    selectorVistaLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: Array<{
      id: string;
      etiqueta: string;
      icono: 'copiar' | 'excel' | 'documento' | 'tabla';
      color: 'verde' | 'azul' | 'cian' | 'naranja' | 'morado';
      variante: 'selector' | 'icono' | 'menu';
    }>;
    botonesAccion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'ayuda'
        | 'reiniciar'
        | 'encender'
        | 'suspender'
        | 'cliente'
        | 'estado'
        | 'grafica'
        | 'intercambio';
      color: 'verde' | 'azul' | 'cian' | 'naranja' | 'morado';
      variante: 'selector' | 'icono' | 'menu';
    }>;
    botonesMenu: Array<{
      id: string;
      etiqueta: string;
      icono: 'herramientas' | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'naranja' | 'morado';
      variante: 'selector' | 'icono' | 'menu';
    }>;
    columnas: Array<{
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
    }>;
    filas: Array<{
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
    }>;
  };
  piePagina: {
    copyright: string;
    fechaSistema: string;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal de la pantalla. En la maqueta actual se muestra como `Lista de Clientes`.
- `filtroZona`: controla el selector superior izquierdo. `opciones` debe venir ya listo para pintarse y filtrar.
- `accionMasiva`: controla la segunda barra. `botonTexto` define el CTA azul de ejecucion.
- `tabla.selectorRegistrosLabel`: texto del boton verde de cantidad de registros.
- `tabla.selectorVistaLabel`: texto del selector verde de vista. En la version actual se usa `Tabla`.
- `tabla.placeholderBusquedaGeneral`: placeholder del input superior derecho.
- `tabla.botonesExportacion`: bloque verde pequeño antes del texto `Botones de Accion.`.
- `tabla.botonesAccion`: secuencia de botones cuadrados de accion rapida.
- `tabla.botonesMenu`: botones azules desplegables de `Herramientas` e `IA`.
- `tabla.columnas`: define encabezados y placeholders de filtros por columna. Si cambia una columna, actualizar el render y este README en el mismo cambio.
- `tabla.filas[].zona`: no se pinta en la tabla pero si se usa para el filtro superior.
- `tabla.filas[].estado`: hoy solo contempla `activo`, `suspendido`, `moroso` y `cancelado`.
- `tabla.filas[].accion`: valor base para busqueda de la columna de acciones; la UI actual sigue mostrando iconos de ver, editar y eliminar.
- `piePagina`: copyright y fecha del sistema en el bloque inferior.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubListaClientesDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/Clients.tsx` y este README en el mismo cambio.
- La variante WispHub se mantiene aislada dentro de `Clients.tsx`; no mezclar estilos clasicos con la tabla compacta de Mikrosystem.
- Las capturas de referencia solo definen estilos. La tabla WispHub debe iniciar sin filas mock; si no hay datos reales, `tabla.filas` debe quedarse en `[]`.
- Mientras backend no entregue zona, router o IP reales, la forma del contrato no debe cambiar, pero tampoco se deben inventar registros para poblar la vista.

## Lista de Clientes Mikrosystem

Archivos clave del rediseño:

- `src/app/pages/Clients.tsx`
- `src/app/types/index.ts`

La vista Mikrosystem del listado de clientes ahora tambien tiene su propio contrato visual: `MikrosystemListaClientesDatos`. A diferencia de WispHub, esta maqueta debe quedar vacia por defecto mientras no existan datos reales capturados por el usuario o enviados por backend. No se deben volver a inyectar mocks en esta variante.

### Contrato esperado para backend

```ts
interface MikrosystemListaClientesDatos {
  tituloPagina: string;
  accionesRapidas: Array<{
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
  }>;
  filtroEstado: {
    valorDefault: string;
    opciones: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: Array<{
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
    }>;
    filas: Array<{
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
    }>;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: barra azul superior. En la referencia actual se muestra como `Lista Usuarios`.
- `accionesRapidas`: fila de botones superior izquierda. Se separan entre botones pequenos de icono y CTA secundarios como `Nuevo` y `Filtrar`.
- `filtroEstado`: selector de estado visual a la derecha de los botones superiores.
- `tabla.placeholderBusquedaGeneral`: placeholder del buscador superior derecho.
- `tabla.tamanoPagina`: valor por defecto del selector izquierdo. La maqueta actual usa `15`.
- `tabla.columnas`: define encabezados y placeholders de la fila de filtros.
- `tabla.filas`: debe poder venir vacio. En la implementacion actual se deja `[]` a proposito para evitar datos inventados.
- `tabla.total` y `tabla.paginaActual`: alimentan el texto inferior y el paginador.

### Notas de mantenimiento

- Si cambia una clave del contrato `MikrosystemListaClientesDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/Clients.tsx` y este README en el mismo cambio.
- La variante Mikrosystem debe permanecer sin datos mock; si no hay datos reales, la tabla se renderiza vacia.
- WispHub y Mikrosystem ya no comparten la misma presentacion del listado; cualquier ajuste visual debe respetar la variante activa.
- En nuevas capturas de referencia tomar unicamente layout, tipografia, colores y controles. No usar el contenido de ejemplo como datos iniciales.

## Lista de Facturas WispHub

Archivos clave del rediseño:

- `src/app/pages/billing/Invoices.tsx`
- `src/app/types/index.ts`

La vista WispHub de lista de facturas se resolvió con un contrato visual dedicado llamado `WispHubListaFacturasDatos`. Igual que en clientes, las capturas solo sirven para estilo: la tabla debe permanecer vacía mientras no existan facturas reales.

### Contrato esperado para backend

```ts
interface WispHubListaFacturasDatos {
  tituloPagina: string;
  filtrosFecha: {
    desde: string;
    hasta: string;
    botonTexto: string;
  };
  accionesLote: {
    placeholder: string;
    opciones: Array<{
      valor: string;
      etiqueta: string;
    }>;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: Array<{
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
    }>;
    botonesAccion: Array<{
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
    }>;
    botonesMenu: Array<{
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
    }>;
    columnas: Array<{
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
    }>;
    filas: Array<{
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
    }>;
    totalSeleccionados: number;
    totalMontoTexto: string;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal. En la referencia se muestra como `Lista de Facturas`.
- `filtrosFecha`: bloque superior con `Desde`, `Hasta` y el boton azul `Filtrar`.
- `accionesLote`: segunda barra con selector masivo y boton `Ejecutar`.
- `tabla.totalMontoTexto`: total visible debajo de los filtros superiores.
- `tabla.selectorRegistrosLabel`: texto del selector verde de registros.
- `tabla.placeholderBusquedaGeneral`: texto del buscador superior derecho.
- `tabla.botonesExportacion`, `tabla.botonesAccion` y `tabla.botonesMenu`: grupos de botones superiores.
- `tabla.columnas`: encabezados y placeholders de filtros por columna.
- `tabla.filas`: debe poder venir vacio; si no hay datos reales, la tabla se deja en estado vacío.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubListaFacturasDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/billing/Invoices.tsx` y este README en el mismo cambio.

- Los textos y controles del layout clásico deben permanecer encapsulados en la variante WispHub.

## Lista de Facturas Mikrosystem

Archivos clave del rediseño:

- `src/app/pages/billing/Invoices.tsx`
- `src/app/types/index.ts`

La vista Mikrosystem de lista de facturas también se separó con un contrato específico: `MikrosystemListaFacturasDatos`. Igual que en clientes, no se deben poblar filas de ejemplo; la tabla y el resumen deben representar estado vacío cuando no existan facturas reales.

### Contrato esperado para backend

```ts
interface MikrosystemListaFacturasDatos {
  tituloPagina: string;
  filtros: {
    tipoFecha: string;
    desde: string;
    hasta: string;
    router: string;
    estado: string;
    opcionesTipoFecha: Array<{
      valor: string;
      etiqueta: string;
    }>;
    opcionesRouter: Array<{
      valor: string;
      etiqueta: string;
    }>;
    opcionesEstado: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  accionesRapidas: Array<{
    id: string;
    etiqueta: string;
    icono: 'lista' | 'herramientas' | 'refrescar';
    variante: 'icono' | 'boton';
  }>;
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: Array<{
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
    }>;
    filas: Array<{
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
    }>;
  };
  resumen: Array<{
    detalle: string;
    cantidad: number;
    impuesto: string;
    total: string;
    cobrado: string;
    variante: 'turquesa' | 'amarillo' | 'rosa' | 'azul';
  }>;
}
```

### Mapeo visual por bloque

- `tituloPagina`: barra azul superior. En la referencia actual se muestra como `Facturas`.
- `filtros`: primera fila de controles con tipo de fecha, rango, router y estado.
- `accionesRapidas`: segunda fila izquierda con selector de tamaño, icono de lista y botón `Herramientas`.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.columnas`: encabezados y placeholders de la fila de filtros.
- `tabla.filas`: debe venir vacio cuando no haya datos reales.
- `resumen`: tabla inferior de totales por estado. Si no hay facturas, las cantidades y montos deben llegar en cero.

### Notas de mantenimiento

- Si cambia una clave del contrato `MikrosystemListaFacturasDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/billing/Invoices.tsx` y este README en el mismo cambio.
- La variante Mikrosystem no debe reutilizar mocks del modulo de facturación.
- En nuevas capturas de referencia tomar solo estilo, estructura y controles; no replicar contenido de ejemplo.

## Lista de Pagos Pendientes WispHub

Archivos clave del rediseño:

- `src/app/pages/billing/PendingInvoices.tsx`
- `src/app/types/index.ts`

La variante WispHub de pagos pendientes ahora se rige por un contrato visual propio: `WispHubListaPagosPendientesDatos`. La captura define solamente estilo y distribución. La tabla debe permanecer vacía mientras no existan pagos o facturas pendientes reales.

### Contrato esperado para backend

```ts
interface WispHubListaPagosPendientesDatos {
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
    botonesExportacion: Array<{
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
    }>;
    botonesAccion: Array<{
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
    }>;
    columnas: Array<{
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
    }>;
    filas: Array<{
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
    }>;
    totalSeleccionados: number;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal. En la referencia se muestra como `Lista de Pagos Pendientes`.
- `pestanas`: barra superior con `Pagos Pendientes` y `Pagos Pendientes por Clientes`.
- `formularioPago`: bloque de selectores para registrar pagos y botón `Ejecutar`.
- `tabla.selectorRegistrosLabel`: selector verde de cantidad de registros.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.botonesExportacion` y `tabla.botonesAccion`: grupos de botones superiores del listado.
- `tabla.columnas`: encabezados y placeholders de filtros por columna.
- `tabla.filas`: debe venir vacio cuando no haya datos reales.
- `tabla.totalSeleccionados`: contador al lado del botón `Ejecutar`.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubListaPagosPendientesDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/billing/PendingInvoices.tsx` y este README en el mismo cambio.
- La referencia recibida para WispHub solo define layout y estilo, no contenido inicial.
- La variante Mikrosystem de `PendingInvoices` se conserva como está actualmente hasta que se indique otro rediseño.

## Lista de Tickets WispHub

Archivos clave del rediseño:

- `src/app/pages/Tickets.tsx`
- `src/app/types/index.ts`

La variante WispHub del listado de tickets ahora se rige por `WispHubListaTicketsDatos`. La captura de referencia define únicamente estructura visual, distribución y controles. La tabla debe permanecer vacía mientras no existan tickets reales.

### Contrato esperado para backend

```ts
interface WispHubListaTicketsDatos {
  tituloPagina: string;
  filtros: {
    desde: string;
    hasta: string;
    vistaSeleccionada: string;
    opcionesVista: Array<{
      valor: string;
      etiqueta: string;
    }>;
    botonTexto: string;
  };
  buscadorCliente: {
    placeholder: string;
    botonTexto: string;
  };
  accionMasiva: {
    placeholder: string;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    botonesAccion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    columnas: Array<{
      clave:
        | 'accion'
        | 'numeroTicket'
        | 'cliente'
        | 'asunto'
        | 'abierto'
        | 'estado'
        | 'prioridad'
        | 'numeroIp'
        | 'ticketCerrado'
        | 'ticketIniciado'
        | 'duracionTicket';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      accion: string;
      numeroTicket: string;
      cliente: string;
      asunto: string;
      abierto: string;
      estado: string;
      prioridad: string;
      numeroIp: string;
      ticketCerrado: string;
      ticketIniciado: string;
      duracionTicket: string;
    }>;
    totalSeleccionados: number;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal. En la referencia actual se muestra como `Lista de Tickets`.
- `filtros`: primera fila con fechas `Desde`, `Hasta`, selector `Ver` y botón `Filtrar`.
- `buscadorCliente`: segunda fila con input para cliente/servicio/IP y botón `Crear Ticket`.
- `accionMasiva`: tercera franja con selector de acción, botón `Ejecutar` y contador de seleccionados.
- `tabla.selectorRegistrosLabel`: botón verde de cantidad de registros.
- `tabla.botonesExportacion` y `tabla.botonesAccion`: toolbar superior del listado.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.columnas`: encabezados de tabla y placeholders de filtros.
- `tabla.filas`: debe venir vacío cuando no haya tickets reales.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubListaTicketsDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/Tickets.tsx` y este README en el mismo cambio.
- La referencia de WispHub para tickets solo define estilo y estructura; no debe usarse para sembrar filas de ejemplo.
- Cualquier dato inicial de la tabla debe provenir del backend cuando exista integración real.

## Lista de Tickets Mikrosystem

Archivos clave del rediseño:

- `src/app/pages/Tickets.tsx`
- `src/app/types/index.ts`

La variante Mikrosystem de tickets ahora se documenta con `MikrosystemListaTicketsDatos`. Igual que en las demás listas, la captura solo sirve de referencia visual. No se deben conservar tickets mock dentro de la tabla.

### Contrato esperado para backend

```ts
interface MikrosystemListaTicketsDatos {
  tituloPagina: string;
  tituloPanel: string;
  breadcrumb: {
    inicio: string;
    modulo: string;
  };
  accionesRapidas: Array<{
    id: string;
    etiqueta: string;
    icono: 'lista' | 'nuevo' | 'refrescar';
    variante: 'icono' | 'boton';
  }>;
  filtros: {
    estado: string;
    departamento: string;
    opcionesEstado: Array<{
      valor: string;
      etiqueta: string;
    }>;
    opcionesDepartamento: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: Array<{
      clave:
        | 'numero'
        | 'departamento'
        | 'remitente'
        | 'asunto'
        | 'tecnico'
        | 'fecha'
        | 'ubicacion'
        | 'abiertoPor'
        | 'ultimaRespuesta';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      numero: string;
      departamento: string;
      remitente: string;
      asunto: string;
      tecnico: string;
      fecha: string;
      ubicacion: string;
      abiertoPor: string;
      ultimaRespuesta: string;
    }>;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: título superior fuera del panel. En la referencia se muestra como `Ticket Abiertos`.
- `breadcrumb`: texto superior derecho `Inicio / soporte`.
- `tituloPanel`: barra turquesa del módulo.
- `accionesRapidas`: selector de tamaño, icono de lista y botón `Nuevo`.
- `filtros.estado` y `filtros.departamento`: combos superiores a la izquierda.
- `tabla.placeholderBusquedaGeneral`: campo de búsqueda superior derecho.
- `tabla.columnas`: encabezados y placeholders de búsqueda por columna.
- `tabla.filas`: debe llegar vacío hasta contar con tickets reales.
- `tabla.paginaActual` y `tabla.total`: controlan el pie con paginación y resumen del listado.

### Notas de mantenimiento

- Si cambia una clave del contrato `MikrosystemListaTicketsDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/Tickets.tsx` y este README en el mismo cambio.
- La captura de Mikrosystem solo se usa para replicar layout, controles y estilo visual.
- No se deben reintroducir `MOCK_TICKETS` en esta vista.

## Tickets Finalizados WispHub

Archivos clave del rediseño:

- `src/app/pages/tickets/CompletedTickets.tsx`
- `src/app/types/index.ts`

La variante WispHub de tickets finalizados ahora se documenta con `WispHubTicketsFinalizadosDatos`. La referencia visual solo define estructura, controles y composición. La tabla debe llegar vacía mientras no existan tickets cerrados reales.

### Contrato esperado para backend

```ts
interface WispHubTicketsFinalizadosDatos {
  tituloPagina: string;
  filtros: {
    desde: string;
    hasta: string;
    vistaSeleccionada: string;
    opcionesVista: Array<{
      valor: string;
      etiqueta: string;
    }>;
    botonTexto: string;
  };
  buscadorCliente: {
    placeholder: string;
    botonTexto: string;
  };
  accionMasiva: {
    placeholder: string;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    botonesAccion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    columnas: Array<{
      clave:
        | 'accion'
        | 'numeroTicket'
        | 'cliente'
        | 'asunto'
        | 'abierto'
        | 'estado'
        | 'prioridad'
        | 'numeroIp'
        | 'ticketCerrado'
        | 'ticketIniciado'
        | 'duracionTicket';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      accion: string;
      numeroTicket: string;
      cliente: string;
      asunto: string;
      abierto: string;
      estado: string;
      prioridad: string;
      numeroIp: string;
      ticketCerrado: string;
      ticketIniciado: string;
      duracionTicket: string;
    }>;
    totalSeleccionados: number;
  };
}
```

### Mapeo visual por bloque

- `filtros`: primera franja superior con fechas `Desde`, `Hasta`, selector `Ver` y botón `Filtrar`.
- `buscadorCliente`: segunda franja con input para cliente/servicio/IP y botón `Crear Ticket`.
- `accionMasiva`: tercera franja con selector de acción, botón `Ejecutar` y contador de seleccionados.
- `tabla.selectorRegistrosLabel`: botón verde de registros.
- `tabla.botonesExportacion` y `tabla.botonesAccion`: toolbar superior del listado.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.columnas`: encabezados y placeholders de filtros por columna.
- `tabla.filas`: debe permanecer vacío hasta tener tickets finalizados reales.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubTicketsFinalizadosDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/tickets/CompletedTickets.tsx` y este README en el mismo cambio.
- La captura de WispHub no debe usarse para sembrar registros de ejemplo.
- Cualquier futura integración debe llenar la tabla con datos reales del backend.

## Tickets Finalizados Mikrosystem

Archivos clave del rediseño:

- `src/app/pages/tickets/CompletedTickets.tsx`
- `src/app/types/index.ts`

La variante Mikrosystem de tickets finalizados quedó documentada con `MikrosystemTicketsFinalizadosDatos`. La captura solo marca el estilo del panel rojo, el breadcrumb y el layout de tabla. No deben mantenerse tickets mock dentro de la vista.

### Contrato esperado para backend

```ts
interface MikrosystemTicketsFinalizadosDatos {
  tituloPagina: string;
  tituloPanel: string;
  breadcrumb: {
    inicio: string;
    modulo: string;
  };
  accionesRapidas: Array<{
    id: string;
    etiqueta: string;
    icono: 'lista' | 'nuevo' | 'refrescar';
    variante: 'icono' | 'boton';
  }>;
  filtros: {
    estado: string;
    departamento: string;
    opcionesEstado: Array<{
      valor: string;
      etiqueta: string;
    }>;
    opcionesDepartamento: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: Array<{
      clave:
        | 'numero'
        | 'departamento'
        | 'remitente'
        | 'asunto'
        | 'tecnico'
        | 'fecha'
        | 'ubicacion'
        | 'abiertoPor'
        | 'ultimaRespuesta';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      numero: string;
      departamento: string;
      remitente: string;
      asunto: string;
      tecnico: string;
      fecha: string;
      ubicacion: string;
      abiertoPor: string;
      ultimaRespuesta: string;
    }>;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: título superior fuera del panel. En la referencia se muestra como `Ticket Cerrados`.
- `breadcrumb`: bloque superior derecho `Inicio / soporte`.
- `tituloPanel`: barra roja del módulo.
- `accionesRapidas`: selector de tamaño, icono de lista y botón `Nuevo`.
- `filtros.estado` y `filtros.departamento`: combos superiores del listado.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.columnas`: encabezados y placeholders de búsqueda por columna.
- `tabla.filas`: debe venir vacío hasta contar con tickets finalizados reales.
- `tabla.paginaActual` y `tabla.total`: definen el pie con paginación y resumen.

### Notas de mantenimiento

- Si cambia una clave del contrato `MikrosystemTicketsFinalizadosDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/tickets/CompletedTickets.tsx` y este README en el mismo cambio.
- La captura de Mikrosystem se usa solo como guía visual.
- No se deben reintroducir arreglos mock en `CompletedTickets`.

## Tickets en Proceso WispHub

Archivos clave del ajuste:

- `src/app/layouts/MainLayout.tsx`
- `src/app/routes.tsx`
- `src/app/pages/tickets/OverdueTickets.tsx`
- `src/app/types/index.ts`

La antigua entrada visual de `Tickets vencidos` pasa a representar `Tickets en Proceso`. La variante WispHub se documenta con `WispHubTicketsEnProcesoDatos`. La lista debe poblarse desde backend con tickets cuyo estado operativo sea `in_progress`, filtrados según el usuario/rol que tenga sesión y la selección que aplique el flujo de revisión.

### Contrato esperado para backend

```ts
interface WispHubTicketsEnProcesoDatos {
  tituloPagina: string;
  filtros: {
    desde: string;
    hasta: string;
    vistaSeleccionada: string;
    opcionesVista: Array<{
      valor: string;
      etiqueta: string;
    }>;
    botonTexto: string;
  };
  buscadorCliente: {
    placeholder: string;
    botonTexto: string;
  };
  accionMasiva: {
    placeholder: string;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    botonesAccion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    columnas: Array<{
      clave:
        | 'accion'
        | 'numeroTicket'
        | 'cliente'
        | 'asunto'
        | 'abierto'
        | 'estado'
        | 'prioridad'
        | 'numeroIp'
        | 'ticketCerrado'
        | 'ticketIniciado'
        | 'duracionTicket';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      accion: string;
      numeroTicket: string;
      cliente: string;
      asunto: string;
      abierto: string;
      estado: string;
      prioridad: string;
      numeroIp: string;
      ticketCerrado: string;
      ticketIniciado: string;
      duracionTicket: string;
    }>;
    totalSeleccionados: number;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal. En esta variante se muestra como `Tickets en Proceso`.
- `filtros`: primera franja con rango de fechas, selector `Ver` y botón `Filtrar`.
- `buscadorCliente`: segunda franja con búsqueda por cliente/servicio/IP y botón `Crear Ticket`.
- `accionMasiva`: selector de acción con botón `Ejecutar`.
- `tabla.selectorRegistrosLabel`: botón verde de registros.
- `tabla.botonesExportacion` y `tabla.botonesAccion`: toolbar superior del listado.
- `tabla.filas`: debe alimentarse desde backend con tickets en revisión/en progreso; mientras no exista integración real debe permanecer vacío.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubTicketsEnProcesoDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/tickets/OverdueTickets.tsx` y este README en el mismo cambio.
- La ruta canónica de la vista es `/tickets/in-progress`.
- `/tickets/overdue` se conserva solo como redirección de compatibilidad.
- No se deben volver a usar `MOCK_TICKETS` para esta pantalla.

## Tickets en Proceso Mikrosystem

Archivos clave del ajuste:

- `src/app/layouts/MainLayout.tsx`
- `src/app/routes.tsx`
- `src/app/pages/tickets/OverdueTickets.tsx`
- `src/app/types/index.ts`

La variante Mikrosystem para esta misma vista se documenta con `MikrosystemTicketsEnProcesoDatos`. Debe recibir desde backend únicamente tickets que ya fueron puestos en revisión o trabajo activo (`status === 'in_progress'`), con el filtro correspondiente al usuario que los haya seleccionado o tenga permiso para verlos.

### Contrato esperado para backend

```ts
interface MikrosystemTicketsEnProcesoDatos {
  tituloPagina: string;
  tituloPanel: string;
  breadcrumb: {
    inicio: string;
    modulo: string;
  };
  accionesRapidas: Array<{
    id: string;
    etiqueta: string;
    icono: 'lista' | 'nuevo' | 'refrescar';
    variante: 'icono' | 'boton';
  }>;
  filtros: {
    estado: string;
    departamento: string;
    opcionesEstado: Array<{
      valor: string;
      etiqueta: string;
    }>;
    opcionesDepartamento: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: Array<{
      clave:
        | 'numero'
        | 'departamento'
        | 'remitente'
        | 'asunto'
        | 'tecnico'
        | 'fecha'
        | 'ubicacion'
        | 'abiertoPor'
        | 'ultimaRespuesta';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      numero: string;
      departamento: string;
      remitente: string;
      asunto: string;
      tecnico: string;
      fecha: string;
      ubicacion: string;
      abiertoPor: string;
      ultimaRespuesta: string;
    }>;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: título superior fuera del panel. En esta variante se muestra como `Ticket en Proceso`.
- `breadcrumb`: bloque superior derecho `Inicio / soporte`.
- `tituloPanel`: barra ámbar del módulo.
- `accionesRapidas`: selector de tamaño, icono de lista y botón `Nuevo`.
- `filtros.estado` y `filtros.departamento`: combos superiores del listado.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.columnas`: encabezados y filtros por columna.
- `tabla.filas`: debe llegar desde backend con tickets en progreso del contexto del usuario; mientras no exista integración real debe permanecer vacío.

### Notas de mantenimiento

- Si cambia una clave del contrato `MikrosystemTicketsEnProcesoDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/tickets/OverdueTickets.tsx` y este README en el mismo cambio.
- El nombre visual en menú y pantalla debe mantenerse como `Tickets en Proceso`.
- La ruta canónica es `/tickets/in-progress` y la ruta anterior queda solo como alias de compatibilidad.
- No se deben reintroducir arreglos mock en `OverdueTickets`.

## Tickets de Hoy WispHub

Archivos clave del ajuste:

- `src/app/pages/tickets/TodayTickets.tsx`
- `src/app/types/index.ts`

La variante WispHub de `Tickets de Hoy` ahora se documenta con `WispHubTicketsHoyDatos`. Igual que en las otras listas de tickets, la tabla queda vacía hasta recibir tickets reales desde backend y el toolbar se redujo a botones no duplicados para mantener consistencia visual.

### Contrato esperado para backend

```ts
interface WispHubTicketsHoyDatos {
  tituloPagina: string;
  filtros: {
    desde: string;
    hasta: string;
    vistaSeleccionada: string;
    opcionesVista: Array<{
      valor: string;
      etiqueta: string;
    }>;
    botonTexto: string;
  };
  buscadorCliente: {
    placeholder: string;
    botonTexto: string;
  };
  accionMasiva: {
    placeholder: string;
    botonTexto: string;
  };
  tabla: {
    selectorRegistrosLabel: string;
    placeholderBusquedaGeneral: string;
    botonesExportacion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    botonesAccion: Array<{
      id: string;
      etiqueta: string;
      icono:
        | 'copiar'
        | 'documento'
        | 'tabla'
        | 'ojo'
        | 'cliente'
        | 'usuarios'
        | 'lista'
        | 'ubicacion'
        | 'ia';
      color: 'verde' | 'azul' | 'cian' | 'morado';
      variante: 'selector' | 'icono' | 'menu' | 'boton';
    }>;
    columnas: Array<{
      clave:
        | 'accion'
        | 'numeroTicket'
        | 'cliente'
        | 'asunto'
        | 'abierto'
        | 'estado'
        | 'prioridad'
        | 'numeroIp'
        | 'ticketCerrado'
        | 'ticketIniciado'
        | 'duracionTicket';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      accion: string;
      numeroTicket: string;
      cliente: string;
      asunto: string;
      abierto: string;
      estado: string;
      prioridad: string;
      numeroIp: string;
      ticketCerrado: string;
      ticketIniciado: string;
      duracionTicket: string;
    }>;
    totalSeleccionados: number;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: encabezado principal. En esta variante se muestra como `Tickets de Hoy`.
- `filtros`: primera fila con fechas, selector `Ver` y botón `Filtrar`.
- `buscadorCliente`: segunda fila con búsqueda por cliente/servicio/IP y botón `Crear Ticket`.
- `accionMasiva`: tercera fila con selector de acción y botón `Ejecutar`.
- `tabla.botonesAccion`: toolbar superior unificado sin duplicar acciones; solo conserva accesos visuales distintos.
- `tabla.filas`: debe llegar vacío mientras no exista integración real de tickets creados el día actual.

### Notas de mantenimiento

- Si cambia una clave del contrato `WispHubTicketsHoyDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/tickets/TodayTickets.tsx` y este README en el mismo cambio.
- No se deben reintroducir `mockTickets` ni `CompactTable` en esta pantalla.
- El toolbar de acción debe mantenerse alineado con el resto de listas de tickets y sin botones repetidos.

## Tickets de Hoy Mikrosystem

Archivos clave del ajuste:

- `src/app/pages/tickets/TodayTickets.tsx`
- `src/app/types/index.ts`

La variante Mikrosystem de `Tickets de Hoy` se documenta con `MikrosystemTicketsHoyDatos`. Sigue la misma línea gráfica de las otras vistas de tickets y queda vacía hasta recibir datos reales desde backend.

### Contrato esperado para backend

```ts
interface MikrosystemTicketsHoyDatos {
  tituloPagina: string;
  tituloPanel: string;
  breadcrumb: {
    inicio: string;
    modulo: string;
  };
  accionesRapidas: Array<{
    id: string;
    etiqueta: string;
    icono: 'lista' | 'nuevo' | 'refrescar';
    variante: 'icono' | 'boton';
  }>;
  filtros: {
    estado: string;
    departamento: string;
    opcionesEstado: Array<{
      valor: string;
      etiqueta: string;
    }>;
    opcionesDepartamento: Array<{
      valor: string;
      etiqueta: string;
    }>;
  };
  tabla: {
    placeholderBusquedaGeneral: string;
    tamanoPagina: number;
    paginaActual: number;
    total: number;
    columnas: Array<{
      clave:
        | 'numero'
        | 'departamento'
        | 'remitente'
        | 'asunto'
        | 'tecnico'
        | 'fecha'
        | 'ubicacion'
        | 'abiertoPor'
        | 'ultimaRespuesta';
      titulo: string;
      placeholderFiltro: string;
    }>;
    filas: Array<{
      id: string;
      numero: string;
      departamento: string;
      remitente: string;
      asunto: string;
      tecnico: string;
      fecha: string;
      ubicacion: string;
      abiertoPor: string;
      ultimaRespuesta: string;
    }>;
  };
}
```

### Mapeo visual por bloque

- `tituloPagina`: título superior fuera del panel. En esta variante se muestra como `Ticket de Hoy`.
- `tituloPanel`: barra turquesa del módulo.
- `accionesRapidas`: selector de tamaño, icono de lista y botón `Nuevo`.
- `filtros.estado` y `filtros.departamento`: filtros superiores del listado.
- `tabla.placeholderBusquedaGeneral`: buscador superior derecho.
- `tabla.filas`: debe llegar vacío mientras no haya tickets de hoy reales para el usuario.

### Notas de mantenimiento

- Si cambia una clave del contrato `MikrosystemTicketsHoyDatos`, actualizar `src/app/types/index.ts`, `src/app/pages/tickets/TodayTickets.tsx` y este README en el mismo cambio.
- No se deben reintroducir arreglos mock en `TodayTickets`.
- La línea gráfica y el set de acciones deben mantenerse consistentes con `Tickets`, `Tickets en Proceso` y `Tickets Finalizados`.
