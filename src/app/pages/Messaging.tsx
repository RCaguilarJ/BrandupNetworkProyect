import {
  MessageCircleMore,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import {
  ThemedViewPanel,
  ThemedViewShell,
} from "../components/ThemedViewShell";

const messagingStats = [
  {
    label: "Canales",
    value: "02",
    helper: "Mensajes y notificaciones",
    icon: <MessageCircleMore className="h-5 w-5" />,
    tone: "primary" as const,
  },
  {
    label: "Estado",
    value: "Disponible",
    helper: "Ruta preparada para integracion futura",
    icon: <Sparkles className="h-5 w-5" />,
    tone: "success" as const,
  },
];

export default function Messaging() {
  return (
    <ThemedViewShell
      eyebrow="Comunicacion"
      title="Mensajeria"
      description="Vista base para futuras integraciones de mensajeria interna, plantillas, envios y seguimiento por cliente."
      stats={messagingStats}
    >
      <ThemedViewPanel className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Ruta inicial de Mensajeria
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Se incorpora al menu principal para dejar lista la
              navegacion y poder crecer el modulo por iteraciones.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <MessageSquareText className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
                Objetivo
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Reservada para paneles de mensajes, campañas, historial
              de contacto y automatizaciones por canal.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">
                Estado actual
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              La navegacion y la ruta ya estan activas para futuras
              conexiones con formularios, listados y APIs del modulo.
            </p>
          </article>
        </div>
      </ThemedViewPanel>
    </ThemedViewShell>
  );
}
