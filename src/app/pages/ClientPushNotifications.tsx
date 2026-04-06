import { useMemo, useState } from 'react';
import { BellRing, Expand, Laptop, List, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../context/ViewThemeContext';
import {
  HorizontalScrollRail,
  NetworkFormDialog,
  useNetworkDialog,
} from './network/networkManagementShared';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './network/networkManagementData';

type NotificationRecord = {
  id: string;
  client: string;
  type: string;
  createdAt: string;
  status: string;
  title: string;
  message: string;
};

const initialRows: NotificationRecord[] = [];

const initialFormValues = {
  client: '',
  type: 'Promocional',
  status: 'Pendiente',
  title: '',
  message: '',
};

export default function ClientPushNotifications() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const dialog = useNetworkDialog();

  const [rows, setRows] = useState<NotificationRecord[]>(initialRows);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-04-30');
  const [formValues, setFormValues] = useState(initialFormValues);

  const toolbarButtonClass = isWispHub
    ? 'inline-flex h-[46px] items-center gap-2 rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[15px] font-semibold text-[#2b3d51]'
    : 'inline-flex h-[50px] items-center gap-2 rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[16px] font-semibold text-[#34485e]';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[46px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#405365]'
    : 'inline-flex h-[50px] w-[56px] items-center justify-center rounded-[4px] border border-[#cdd8e4] bg-white text-[#405365]';
  const controlClass = isWispHub
    ? 'h-[46px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#b9c4d0]'
    : 'h-[50px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8]';
  const panelClass = isWispHub
    ? 'border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]';
  const headerActionClass = isWispHub
    ? 'flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#3b4d62]'
    : 'flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2f3d4b]';

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const query = searchTerm.trim().toLowerCase();
      const createdAt = new Date(row.createdAt);
      const minDate = startDate ? new Date(startDate) : null;
      const maxDate = endDate ? new Date(endDate) : null;
      const matchesSearch =
        !query ||
        row.client.toLowerCase().includes(query) ||
        row.type.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.message.toLowerCase().includes(query);
      const matchesStart = !minDate || createdAt >= minDate;
      const matchesEnd = !maxDate || createdAt <= maxDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [endDate, rows, searchTerm, startDate]);

  const paginatedRows = filteredRows.slice(0, pageSize);
  const allVisibleSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((row) => selectedIds.includes(row.id));

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !paginatedRows.some((row) => row.id === id)),
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...paginatedRows.map((row) => row.id)]),
    ]);
  };

  const openDialog = () => {
    setFormValues(initialFormValues);
    dialog.openDialog();
  };

  const handleSubmit = () => {
    if (!formValues.client.trim() || !formValues.title.trim() || !formValues.message.trim()) {
      toast.error('Completa cliente, titulo y mensaje');
      return;
    }

    setRows((current) => [
      {
        id: `${Date.now()}`,
        client: formValues.client.trim(),
        type: formValues.type,
        createdAt: new Date().toISOString().slice(0, 10),
        status: formValues.status,
        title: formValues.title.trim(),
        message: formValues.message.trim(),
      },
      ...current,
    ]);
    dialog.closeDialog();
    toast.success('Notificacion push creada');
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos una notificacion');
      return;
    }

    setRows((current) => current.filter((row) => !selectedIds.includes(row.id)));
    setSelectedIds([]);
    toast.success('Notificaciones eliminadas');
  };

  const handleResend = () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos una notificacion');
      return;
    }

    setRows((current) =>
      current.map((row) =>
        selectedIds.includes(row.id) ? { ...row, status: 'Reenviada' } : row,
      ),
    );
    toast.success('Notificaciones reenviadas');
  };

  const handleDevices = () => {
    toast.info('Vista de dispositivos pendiente de implementar');
  };

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <section className={panelClass}>
        <header className="flex items-center justify-between gap-4 bg-[#1f2429] px-6 py-4">
          <h1 className="text-[18px] font-bold text-white">Notificaciones push</h1>
          <div className="flex items-center gap-2">
            <button type="button" className={headerActionClass} aria-label="Expandir panel" title="Expandir">
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={headerActionClass}
              aria-label="Actualizar panel"
              title="Actualizar"
              onClick={() => toast.success('Tabla actualizada')}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-[4px] border border-[#cdd8e4] bg-white">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className={`${controlClass} min-w-[56px] rounded-none border-0 border-r border-[#cdd8e4] px-4`}
                  aria-label="Cantidad de registros"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button type="button" className={`${iconButtonClass} rounded-none border-0 border-r border-[#cdd8e4]`} aria-label="Vista lista">
                  <List className="h-5 w-5" />
                </button>
                <button type="button" className={`${iconButtonClass} rounded-none border-0`} aria-label="Guardar configuracion">
                  <Save className="h-5 w-5" />
                </button>
              </div>

              <button type="button" onClick={openDialog} className={toolbarButtonClass}>
                <Plus className="h-5 w-5" />
                Nuevo
              </button>
              <button type="button" onClick={handleDelete} className={toolbarButtonClass}>
                <Trash2 className="h-5 w-5" />
                Eliminar
              </button>
              <button type="button" onClick={handleResend} className={toolbarButtonClass}>
                <BellRing className="h-5 w-5" />
                Reenviar
              </button>
              <button type="button" onClick={handleDevices} className={toolbarButtonClass}>
                <Laptop className="h-5 w-5" />
                Dispositivos
              </button>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="flex overflow-hidden rounded-[4px] border border-[#cdd8e4] bg-white">
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={`${controlClass} min-w-[142px] rounded-none border-0`}
                  aria-label="Fecha inicial"
                />
                <span className="flex items-center border-x border-[#cdd8e4] bg-[#d3d9e0] px-3 text-[15px] text-[#435468]">
                  al
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={`${controlClass} min-w-[142px] rounded-none border-0`}
                  aria-label="Fecha final"
                />
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-[50px] min-w-[280px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8] xl:min-w-[390px]"
                placeholder="Buscar..."
                aria-label="Buscar notificaciones"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden border border-[#d7dde5] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-[14px] text-[#31465d]">
                <thead>
                  <tr className="bg-white">
                    <th className="w-[54px] border-b border-r border-[#d7dde5] px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label="Seleccionar todas las notificaciones visibles"
                        className="h-5 w-5 rounded border border-[#aab9c8]"
                      />
                    </th>
                    {['ID', 'CLIENTE', 'TIPO', 'CREADO', 'ESTADO', 'TITULO', 'MENSAJE'].map((header) => (
                      <th
                        key={header}
                        className="border-b border-r border-[#d7dde5] px-4 py-4 text-left text-[13px] font-semibold uppercase text-[#3f4b57] last:border-r-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{header}</span>
                          <div className="flex flex-col gap-[2px] text-[#c4ccd5]">
                            <span className="h-0 w-0 border-b-[5px] border-x-[5px] border-b-current border-x-transparent" />
                            <span className="h-0 w-0 border-t-[5px] border-x-[5px] border-t-current border-x-transparent" />
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="border-b border-[#d7dde5] bg-[#f6f7f9] px-4 py-8 text-center text-[16px] text-[#495b70]"
                      >
                        Ningun registro disponible
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row) => (
                      <tr key={row.id} className="bg-white">
                        <td className="border-b border-r border-[#d7dde5] px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => toggleRow(row.id)}
                            aria-label={`Seleccionar notificacion ${row.id}`}
                            className="h-5 w-5 rounded border border-[#aab9c8]"
                          />
                        </td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.id}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.client}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.type}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.createdAt}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">
                          <span className="inline-flex rounded-full bg-[#eaf3fc] px-3 py-1 text-[12px] font-semibold text-[#397fd6]">
                            {row.status}
                          </span>
                        </td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.title}</td>
                        <td className="border-b px-4 py-3">{row.message}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-[16px] font-semibold text-[#6c8097]">
            <span>
              {filteredRows.length === 0
                ? 'Mostrando 0 registros'
                : `Mostrando ${Math.min(filteredRows.length, pageSize)} registros`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-[48px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#a8b5c4]"
                aria-label="Pagina anterior"
              >
                <span className="h-0 w-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-current" />
              </button>
              <button
                type="button"
                className="flex h-[48px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#9cadbe]"
                aria-label="Pagina siguiente"
              >
                <span className="h-0 w-0 border-y-[8px] border-y-transparent border-l-[10px] border-l-current" />
              </button>
            </div>
          </div>

          {!isWispHub ? <HorizontalScrollRail /> : null}
        </div>
      </section>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nueva notificacion push"
        submitLabel="Guardar notificacion"
        values={formValues}
        fields={[
          { name: 'client', label: 'Cliente', required: true },
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'Promocional', label: 'Promocional' },
              { value: 'Cobranza', label: 'Cobranza' },
              { value: 'Recordatorio', label: 'Recordatorio' },
            ],
          },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Enviada', label: 'Enviada' },
              { value: 'Programada', label: 'Programada' },
            ],
          },
          { name: 'title', label: 'Titulo', required: true, colSpan: 2 },
          {
            name: 'message',
            label: 'Mensaje',
            type: 'textarea',
            required: true,
            colSpan: 2,
          },
        ]}
        onOpenChange={dialog.setOpen}
        onFieldChange={(field, value) =>
          setFormValues((current) => ({ ...current, [field]: value }))
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
