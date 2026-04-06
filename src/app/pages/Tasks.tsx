import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  List,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { useViewTheme } from '../context/ViewThemeContext';

type TaskForm = {
  title: string;
  startAt: string;
  endAt: string;
  operator: string;
  status: string;
  client: string;
  area: string;
  durationHours: string;
  durationMinutes: string;
  gps: string;
  address: string;
  activities: string;
  description: string;
};

type TaskItem = TaskForm & { id: string };

const WISPHUB_FONT =
  '"Trebuchet MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
const statusOptions = ['Pendiente', 'En progreso', 'Completada', 'Cancelada'];
const areaOptions = [
  'Quejas y Sugerencias',
  'Instalaciones',
  'Cobranza',
  'Soporte tecnico',
];
const clientOptions = [
  'Sin cliente asociado',
  'Cliente demo 1',
  'Cliente demo 2',
];
const tabs = [
  { id: 'all', label: 'Todas las tareas' },
  { id: 'mine', label: 'Mis tareas' },
  { id: 'timeline', label: 'Cronologia' },
  { id: 'tasks', label: 'Tareas' },
];
const columns = [
  'TITULO',
  'ESTADO',
  'FECHA',
  'DURACION',
  'OPERADOR',
  'DEPARTAMENTO',
  'CLIENTE',
];
const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const wisphubPage = {
  minHeight: '100%',
  background:
    'radial-gradient(circle at top right, rgba(69, 191, 99, 0.08), transparent 28%), #ffffff',
  borderTop: '4px solid #45bf63',
  color: '#17273d',
  fontFamily: WISPHUB_FONT,
  paddingBottom: '32px',
} satisfies CSSProperties;

const mikrosystemPage = {
  minHeight: '100%',
  backgroundColor: '#d9e7f3',
  padding: '18px 22px 26px',
  color: '#223448',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
} satisfies CSSProperties;

function shiftDate(date: Date, delta: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + delta);
  return nextDate;
}

function formatTimelineDate(date: Date) {
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTaskDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${dd}/${mm}/${yy} ${String(h12).padStart(2, '0')}:${minutes} ${meridiem}`;
}

function defaultForm(operator: string): TaskForm {
  return {
    title: '',
    startAt: '2026-03-31T09:00',
    endAt: '',
    operator,
    status: 'Pendiente',
    client: 'Sin cliente asociado',
    area: 'Quejas y Sugerencias',
    durationHours: '1',
    durationMinutes: '0',
    gps: '',
    address: '',
    activities: '',
    description: '',
  };
}

export default function Tasks() {
  const { user } = useAuth();
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const defaultOperator = user?.name || 'Administrador DesingsGDL';
  const pageStyle = isWispHub ? wisphubPage : mikrosystemPage;
  const panelClass = isWispHub
    ? 'mx-[12px] mb-[18px] border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'mt-8 border border-[#d5dde7] bg-white';
  const inputClass = isWispHub
    ? 'h-[38px] rounded-[6px] border border-[#cfd6df] bg-white px-3 text-[12px] text-[#20324a] outline-none'
    : 'h-[50px] rounded-[6px] border border-[#d7e0ea] bg-white px-4 text-[14px] text-[#24364b] outline-none';

  const [activeTab, setActiveTab] = useState('all');
  const [pageSize, setPageSize] = useState('15');
  const [taskDate, setTaskDate] = useState('31 mar. 2026');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timelineDate, setTimelineDate] = useState(new Date(2026, 2, 31));
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [form, setForm] = useState<TaskForm>(defaultForm(defaultOperator));
  const loadingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);

    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (!open) {
      setDialogLoading(false);
      return;
    }

    setDialogLoading(true);
    loadingTimeoutRef.current = window.setTimeout(() => {
      setDialogLoading(false);
      loadingTimeoutRef.current = null;
    }, 650);
  };

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !query ||
          task.title.toLowerCase().includes(query) ||
          task.operator.toLowerCase().includes(query) ||
          task.client.toLowerCase().includes(query) ||
          task.area.toLowerCase().includes(query);
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesMine =
          activeTab !== 'mine' || task.operator === defaultOperator;
        return matchesSearch && matchesStatus && matchesMine;
      }),
    [activeTab, defaultOperator, searchTerm, statusFilter, tasks],
  );

  const tasksForTimeline = useMemo(
    () =>
      tasks
        .filter((task) => {
          const date = new Date(task.startAt);
          return (
            date.getFullYear() === timelineDate.getFullYear() &&
            date.getMonth() === timelineDate.getMonth() &&
            date.getDate() === timelineDate.getDate()
          );
        })
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [tasks, timelineDate],
  );

  const previousDate = shiftDate(timelineDate, -1);
  const nextDate = shiftDate(timelineDate, 1);

  const openNewTask = () => {
    setForm(defaultForm(defaultOperator));
    handleDialogOpenChange(true);
  };

  const updateForm = (field: keyof TaskForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetFilters = () => {
    setTaskDate('31 mar. 2026');
    setStatusFilter('');
    setSearchTerm('');
  };

  const saveTask = () => {
    const task = { ...form, id: `${Date.now()}` };
    setTasks((current) => [...current, task]);
    setTimelineDate(new Date(task.startAt));
    setActiveTab('timeline');
    handleDialogOpenChange(false);
  };

  const renderHeader = () => (
    <>
      {isWispHub ? (
        <header
          style={{
            borderBottom: '1px solid #d7dde5',
            padding: '22px 12px 18px',
            marginBottom: '20px',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45bf63]">
                Operacion
              </p>
              <h1 className="mt-2 text-[30px] font-semibold leading-none text-[#15263b]">
                Tareas
              </h1>
            </div>
            <div className="text-right text-[13px] text-[#6d8093]">
              <span>Inicio</span>
              <span className="mx-2 text-[#b6c1cb]">/</span>
              <span className="font-semibold text-[#45bf63]">Tareas</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={openNewTask}
              className="inline-flex h-[44px] items-center gap-2 rounded-[6px] border border-[#42b960] bg-[#45bf63] px-5 text-[14px] font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Nueva tarea
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-[42px] items-center rounded-[6px] border px-4 text-[14px] font-semibold ${
                    activeTab === tab.id
                      ? 'border-[#42b960] bg-[#45bf63] text-white'
                      : 'border-[#d7dde5] bg-white text-[#2d4257]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-[22px] font-normal text-[#24364b]">Tareas</h1>
            <div className="text-right text-[13px] text-[#50657c]">
              <span>Inicio</span>
              <span className="mx-2 text-[#b8c2cc]">/</span>
              <span className="text-[#2f7ee8]">Tareas</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={openNewTask}
              className="inline-flex h-[48px] items-center gap-2 rounded-[6px] border border-[#d5dde7] bg-white px-5 text-[16px] font-semibold text-[#24364b]"
            >
              <Plus className="h-5 w-5" />
              Nueva tarea
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-[42px] items-center rounded-[4px] border px-4 text-[16px] font-semibold ${
                    activeTab === tab.id
                      ? 'border-[#3f93e7] bg-[#3f93e7] text-white'
                      : 'border-[#3f93e7] bg-white text-[#2f7ee8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderRows = () => {
    if (filteredTasks.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className={`border px-4 py-8 text-center ${
              isWispHub
                ? 'border-[#d7dde5] bg-[#f7faf8] text-[16px] text-[#37485f]'
                : 'border-[#d7e0ea] bg-[#f4f6f8] text-[18px] text-[#4c6078]'
            }`}
          >
            Ningun registro disponible
          </td>
        </tr>
      );
    }

    return filteredTasks.map((task) => (
      <tr key={task.id} className="bg-white">
        <td className="border border-[#d7dde5] px-3 py-3">{task.title || 'Tarea sin titulo'}</td>
        <td className="border border-[#d7dde5] px-3 py-3">{task.status}</td>
        <td className="border border-[#d7dde5] px-3 py-3">{formatTaskDate(task.startAt)}</td>
        <td className="border border-[#d7dde5] px-3 py-3">{`${task.durationHours}h ${task.durationMinutes}m`}</td>
        <td className="border border-[#d7dde5] px-3 py-3">{task.operator}</td>
        <td className="border border-[#d7dde5] px-3 py-3">{task.area}</td>
        <td className="border border-[#d7dde5] px-3 py-3">{task.client}</td>
      </tr>
    ));
  };

  const renderTable = () => (
    <section className={panelClass}>
      <div className={isWispHub ? 'px-5 py-5' : 'px-6 py-6'}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-[6px] border border-[#d7dde5] bg-white">
              <select
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
                className={`appearance-none bg-white outline-none ${
                  isWispHub
                    ? 'h-[42px] min-w-[56px] border-r border-[#d7dde5] px-4 text-[18px] font-medium text-[#223448]'
                    : 'h-[48px] min-w-[56px] border-r border-[#d5dde7] px-4 text-[18px] font-medium text-[#223448]'
                }`}
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <button type="button" className={`inline-flex items-center justify-center border-r bg-white ${isWispHub ? 'h-[42px] w-[52px] border-[#d7dde5] text-[#4e637c]' : 'h-[48px] w-[56px] border-[#d5dde7] text-[#334a62]'}`}>
                <List className={isWispHub ? 'h-4 w-4' : 'h-5 w-5'} />
              </button>
              <button type="button" className={`inline-flex items-center justify-center bg-white ${isWispHub ? 'h-[42px] w-[52px] text-[#4e637c]' : 'h-[48px] w-[56px] text-[#334a62]'}`}>
                <Save className={isWispHub ? 'h-4 w-4' : 'h-5 w-5'} />
              </button>
            </div>

            <button type="button" onClick={resetFilters} className={`inline-flex items-center justify-center rounded-[6px] ${isWispHub ? 'h-[42px] w-[42px] border border-[#d7dde5] bg-white text-[#2d4257]' : 'h-[48px] w-[48px] text-[#1f2d3d]'}`}>
              <X className={isWispHub ? 'h-4 w-4' : 'h-6 w-6'} />
            </button>

            <div className="relative">
              <input value={taskDate} onChange={(event) => setTaskDate(event.target.value)} className={`${inputClass} ${isWispHub ? 'w-[180px] pr-11' : 'w-[174px] pr-12'}`} />
              <CalendarDays className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${isWispHub ? 'h-4 w-4 text-[#4e637c]' : 'h-6 w-6 text-[#24364b]'}`} />
            </div>

            <div className="relative">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${inputClass} appearance-none ${isWispHub ? 'w-[160px] pr-10' : 'w-[136px] pr-10'}`}>
                <option value="">Estado</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e637c]" />
            </div>
          </div>

          <label className={`relative block w-full ${isWispHub ? 'max-w-[340px]' : 'xl:max-w-[390px]'}`}>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar..." className={`${inputClass} w-full ${isWispHub ? 'pl-10' : 'pl-12'} placeholder:text-[#c0cad5]`} />
            <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#9aa8b7] ${isWispHub ? 'left-3 h-4 w-4' : 'left-4 h-5 w-5'}`} />
          </label>
        </div>

        <div className={`${isWispHub ? 'mt-4 overflow-x-auto border border-[#d7dde5]' : 'mt-7 overflow-x-auto'}`}>
          <table className={`w-full border-collapse ${isWispHub ? 'text-[13px]' : 'text-[14px] text-[#24364b]'}`}>
            <thead>
              <tr className="bg-white">
                {columns.map((column, index) => (
                  <th
                    key={column}
                    className={`border px-3 py-3 text-left ${
                      isWispHub
                        ? 'border-[#d7dde5] font-bold text-[#1b2b41]'
                        : 'border-[#d7e0ea] font-semibold'
                    } ${index === 0 ? 'min-w-[210px]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{column}</span>
                      {column === 'FECHA' && !isWispHub ? (
                        <span className="text-[#3f93e7]">▲</span>
                      ) : (
                        <ChevronsUpDown className={`h-3.5 w-3.5 ${isWispHub ? 'text-[#c2cad4]' : 'text-[#bcc7d2]'}`} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-4 ${isWispHub ? 'mt-4 text-[14px] text-[#20324a]' : 'mt-10 text-[14px] font-semibold text-[#6f8296]'}`}>
          <div>Mostrando {filteredTasks.length} registros</div>
          <div className="flex items-center gap-2">
            <button type="button" disabled className={`inline-flex items-center justify-center rounded-[6px] border bg-white opacity-70 ${isWispHub ? 'h-[38px] w-[38px] border-[#d7dde5] text-[#8da0b3]' : 'h-12 w-12 border-[#d7e0ea] text-[#9fb0c2]'}`}>
              <ChevronLeft className={isWispHub ? 'h-4 w-4' : 'h-5 w-5'} />
            </button>
            <button type="button" disabled className={`inline-flex items-center justify-center rounded-[6px] border bg-white opacity-70 ${isWispHub ? 'h-[38px] w-[38px] border-[#d7dde5] text-[#8da0b3]' : 'h-12 w-12 border-[#d7e0ea] text-[#9fb0c2]'}`}>
              <ChevronRight className={isWispHub ? 'h-4 w-4' : 'h-5 w-5'} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderTimeline = () => (
    <section className={panelClass}>
      <div className={isWispHub ? 'px-5 py-6' : 'px-6 py-6'}>
        <div className="flex flex-wrap items-center justify-center gap-8 text-[#1d3045]">
          <button type="button" onClick={() => setTimelineDate((current) => shiftDate(current, -1))} className={`inline-flex items-center gap-2 ${isWispHub ? 'text-[18px] font-semibold text-[#3e556f]' : 'text-[18px] font-normal text-[#24364b]'}`}>
            <ChevronsLeft className={`h-6 w-6 ${isWispHub ? 'text-[#45bf63]' : 'text-[#1f2d3d]'}`} />
            <span>{previousDate.getDate()}</span>
          </button>
          <div className={`text-center text-[20px] font-semibold ${isWispHub ? 'text-[#15263b]' : 'text-[#111827]'}`}>
            {formatTimelineDate(timelineDate)}
          </div>
          <button type="button" onClick={() => setTimelineDate((current) => shiftDate(current, 1))} className={`inline-flex items-center gap-2 ${isWispHub ? 'text-[18px] font-semibold text-[#3e556f]' : 'text-[18px] font-normal text-[#24364b]'}`}>
            <span>{nextDate.getDate()}</span>
            <ChevronsRight className={`h-6 w-6 ${isWispHub ? 'text-[#45bf63]' : 'text-[#1f2d3d]'}`} />
          </button>
        </div>

        {tasksForTimeline.length === 0 ? (
          <div className={`mt-8 rounded-[8px] px-6 py-5 text-center text-[16px] ${isWispHub ? 'border border-[#ffd3d3] bg-[#fff2f2] text-[#d34444]' : 'border border-[#ff8c8c] bg-[#ffd7d7] text-[#e53935]'}`}>
            No hay ninguna tarea programada para este dia.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {tasksForTimeline.map((task) => (
              <article key={task.id} className={`rounded-[10px] border px-5 py-4 ${isWispHub ? 'border-[#d7dde5] bg-[#fbfefc] shadow-[0_8px_18px_rgba(69,191,99,0.08)]' : 'border-[#d7e0ea] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#1d3045]">{task.title || 'Tarea sin titulo'}</h3>
                    <p className="mt-1 text-[13px] text-[#64748b]">{formatTaskDate(task.startAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                    task.status === 'Completada'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'En progreso'
                        ? 'bg-blue-100 text-blue-700'
                        : task.status === 'Cancelada'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a9aad]">Operador</p><p className="mt-1 text-[14px] text-[#24364b]">{task.operator}</p></div>
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a9aad]">Cliente</p><p className="mt-1 text-[14px] text-[#24364b]">{task.client}</p></div>
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a9aad]">Area</p><p className="mt-1 text-[14px] text-[#24364b]">{task.area}</p></div>
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a9aad]">Duracion</p><p className="mt-1 text-[14px] text-[#24364b]">{`${task.durationHours}h ${task.durationMinutes}m`}</p></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const dialogFieldClass =
    'h-[50px] rounded-[6px] border border-[#d7dfe8] px-4 text-[14px] text-[#24364b] outline-none';

  return (
    <div style={pageStyle}>
      {renderHeader()}
      {activeTab === 'timeline' ? renderTimeline() : renderTable()}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto border border-[#d7dfe8] bg-white p-0 sm:max-w-[980px]">
          <DialogHeader className="border-b border-[#d7dfe8] bg-[#f5f5f5] px-6 py-3">
            <DialogTitle className="text-[18px] font-semibold text-[#303030]">
              Nueva tarea
            </DialogTitle>
          </DialogHeader>

          {dialogLoading ? (
            <div className="px-6 py-10">
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d7dfe8] bg-[#fbfcfe]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ff] text-[#2f7ee8]">
                  <RefreshCw className="h-10 w-10 animate-spin" />
                </div>
                <p className="mt-6 text-[16px] font-semibold text-[#24364b]">
                  Cargando formulario...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-center"><label className="text-right text-[14px] font-medium text-[#5b6470]">Titulo</label><input value={form.title} onChange={(e) => updateForm('title', e.target.value)} className={dialogFieldClass} /></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"><label className="pt-3 text-right text-[14px] font-medium text-[#5b6470]">Inicio</label><div className="grid gap-4 lg:grid-cols-2"><input type="datetime-local" value={form.startAt} onChange={(e) => updateForm('startAt', e.target.value)} className={dialogFieldClass} /><div className="grid gap-4 lg:grid-cols-[72px_minmax(0,1fr)] lg:items-center"><label className="text-[14px] font-medium text-[#5b6470]">Fin</label><input type="datetime-local" value={form.endAt} onChange={(e) => updateForm('endAt', e.target.value)} className={dialogFieldClass} /></div></div></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"><label className="pt-3 text-right text-[14px] font-medium text-[#5b6470]">Operador</label><div className="grid gap-4 lg:grid-cols-2"><div className="relative"><select value={form.operator} onChange={(e) => updateForm('operator', e.target.value)} className={`${dialogFieldClass} w-full appearance-none pr-10 font-semibold`}><option>{defaultOperator}</option><option>Administrador Secundario</option></select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7a]" /></div><div className="grid gap-4 lg:grid-cols-[72px_minmax(0,1fr)] lg:items-center"><label className="text-[14px] font-medium text-[#5b6470]">Estado</label><div className="relative"><select value={form.status} onChange={(e) => updateForm('status', e.target.value)} className={`${dialogFieldClass} w-full appearance-none pr-10`}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7a]" /></div></div></div></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"><label className="pt-3 text-right text-[14px] font-medium text-[#5b6470]">Cliente</label><div className="grid gap-4 lg:grid-cols-2"><div className="relative"><select value={form.client} onChange={(e) => updateForm('client', e.target.value)} className={`${dialogFieldClass} w-full appearance-none pr-10 font-semibold`}>{clientOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7a]" /></div><div className="grid gap-4 lg:grid-cols-[72px_minmax(0,1fr)] lg:items-center"><label className="text-[14px] font-medium text-[#5b6470]">Area</label><div className="relative"><select value={form.area} onChange={(e) => updateForm('area', e.target.value)} className={`${dialogFieldClass} w-full appearance-none pr-10 font-semibold`}>{areaOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7a]" /></div></div></div></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"><label className="pt-3 text-right text-[14px] font-medium text-[#5b6470]">Duracion</label><div className="grid gap-4 lg:grid-cols-2"><div className="grid gap-4 sm:grid-cols-2"><div><input value={form.durationHours} onChange={(e) => updateForm('durationHours', e.target.value)} className={dialogFieldClass} /><p className="mt-2 text-[12px] text-[#8b99a8]">Horas</p></div><div><input value={form.durationMinutes} onChange={(e) => updateForm('durationMinutes', e.target.value)} className={dialogFieldClass} /><p className="mt-2 text-[12px] text-[#8b99a8]">Minutos</p></div></div><div className="grid gap-4 lg:grid-cols-[72px_minmax(0,1fr)] lg:items-center"><label className="text-[14px] font-medium text-[#5b6470]">GPS</label><input value={form.gps} onChange={(e) => updateForm('gps', e.target.value)} placeholder="Latitud, longitud" className={`${dialogFieldClass} placeholder:text-[#c6ced8]`} /></div></div></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-center"><label className="text-right text-[14px] font-medium text-[#5b6470]">Direccion</label><input value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Direccion o referencia" className={`${dialogFieldClass} placeholder:text-[#c6ced8]`} /></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"><label className="pt-3 text-right text-[14px] font-medium text-[#5b6470]">Actividades</label><textarea value={form.activities} onChange={(e) => updateForm('activities', e.target.value)} placeholder="Checklist, puntos a revisar o actividades" className="min-h-[108px] rounded-[6px] border border-[#d7dfe8] px-4 py-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#c6ced8]" /></div>
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"><label className="pt-3 text-right text-[14px] font-medium text-[#5b6470]">Descripcion</label><textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Notas internas o detalle del trabajo" className="min-h-[130px] rounded-[6px] border border-[#d7dfe8] px-4 py-3 text-[14px] text-[#24364b] outline-none placeholder:text-[#c6ced8]" /></div>
              </div>

              <DialogFooter className="border-t border-[#d7dfe8] px-6 py-4 sm:justify-end">
                <button type="button" onClick={() => handleDialogOpenChange(false)} className="inline-flex h-[44px] items-center rounded-[6px] border border-[#d7dfe8] bg-white px-5 text-[14px] font-semibold text-[#4b5563]">
                  Cancelar
                </button>
                <button type="button" onClick={saveTask} className="inline-flex h-[44px] items-center rounded-[6px] bg-[#2f7ee8] px-5 text-[14px] font-semibold text-white">
                  Guardar
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
