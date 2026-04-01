import {
  Boxes,
  ClipboardList,
  PackageCheck,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import {
  ThemedViewPanel,
  ThemedViewShell,
} from "../components/ThemedViewShell";

const storageStats = [
  {
    label: "Modulos",
    value: "03",
    helper: "Inventario, movimientos y stock",
    icon: <WarehouseIcon className="h-5 w-5" />,
    tone: "primary" as const,
  },
  {
    label: "Estado",
    value: "Listo",
    helper: "Ruta habilitada para integracion",
    icon: <PackageCheck className="h-5 w-5" />,
    tone: "success" as const,
  },
];

export default function Warehouse() {
  return (
    <ThemedViewShell
      eyebrow="Operacion interna"
      title="Almacen"
      description="Panel base para administrar inventario, bodegas y movimientos de materiales dentro de la plataforma."
      stats={storageStats}
    >
      <ThemedViewPanel className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Ruta inicial de Almacen
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Esta vista queda disponible en navegacion mientras se
              conectan los formularios y modulos operativos.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <ClipboardList className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
                Alcance
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Espacio reservado para catalogo de productos, control
              de stock, entradas, salidas y trazabilidad por empresa.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <PackageCheck className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
                Siguiente paso
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              La ruta ya esta registrada para poder iterar formularios,
              tablas y operaciones reales sin volver a tocar el sidebar.
            </p>
          </article>
        </div>
      </ThemedViewPanel>
    </ThemedViewShell>
  );
}
