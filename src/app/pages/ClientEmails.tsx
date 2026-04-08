import { useMemo, useState } from 'react';
import { SearchCheck, Settings2, List, Save, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useViewTheme } from '../context/ViewThemeContext';
import {
  NetworkFormDialog,
  useNetworkDialog,
} from './network/networkManagementShared';
import {
  mikrosystemPageStyle,
  wisphubPageStyle,
} from './network/networkManagementData';

type EmailRecord = {
  id: string;
  client: string;
  subject: string;
  date: string;
  sender: string;
  recipient: string;
  status: string;
};

const initialRows: EmailRecord[] = [];

const initialFormValues = {
  client: '',
  subject: '',
  sender: '',
  recipient: '',
  status: 'Pendiente',
};

export default function ClientEmails() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const dialog = useNetworkDialog();

  const [rows, setRows] = useState<EmailRecord[]>(initialRows);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-04-30');
  const [formValues, setFormValues] = useState(initialFormValues);

  const pageStyle = isWispHub ? wisphubPageStyle : mikrosystemPageStyle;
  const panelClass = isWispHub
    ? 'border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]';
  const controlClass = isWispHub
    ? 'h-[46px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#b9c4d0]'
    : 'h-[50px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8]';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[46px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#405365]'
    : 'inline-flex h-[50px] w-[56px] items-center justify-center rounded-[4px] border border-[#cdd8e4] bg-white text-[#405365]';
  const actionButtonClass = isWispHub
    ? 'inline-flex h-[46px] items-center gap-2 rounded-[6px] border border-[#d7dde5] bg-white px-5 text-[15px] font-semibold text-[#2b3d51]'
    : 'inline-flex h-[50px] items-center gap-2 rounded-[4px] border border-[#cdd8e4] bg-white px-5 text-[16px] font-semibold text-[#34485e]';
  const headerActionClass = isWispHub
    ? 'flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dde5] bg-white text-[#3b4d62]'
    : 'flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2f3d4b]';

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const query = searchTerm.trim().toLowerCase();
      const rowDate = new Date(row.date);
      const minDate = startDate ? new Date(startDate) : null;
      const maxDate = endDate ? new Date(endDate) : null;
      const matchesSearch =
        !query ||
        row.client.toLowerCase().includes(query) ||
        row.subject.toLowerCase().includes(query) ||
        row.sender.toLowerCase().includes(query) ||
        row.recipient.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query);
      const matchesStart = !minDate || rowDate >= minDate;
      const matchesEnd = !maxDate || rowDate <= maxDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [endDate, rows, searchTerm, startDate]);

  const paginatedRows = filteredRows.slice(0, pageSize);
  const allVisibleSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((row) => selectedIds.includes(row.id));

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

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const openComposeDialog = () => {
    setFormValues(initialFormValues);
    dialog.openDialog();
  };

  const handleSubmit = () => {
    if (!formValues.client.trim() || !formValues.subject.trim()) {
      toast.error('Completa cliente y asunto');
      return;
    }

    setRows((current) => [
      {
        id: `${Date.now()}`,
        client: formValues.client.trim(),
        subject: formValues.subject.trim(),
        date: new Date().toISOString().slice(0, 10),
        sender: formValues.sender.trim() || 'sistema@brandup.mx',
        recipient: formValues.recipient.trim() || 'cliente@ejemplo.com',
        status: formValues.status,
      },
      ...current,
    ]);
    dialog.closeDialog();
    toast.success('Correo agregado a enviados');
  };

  return (
    <div style={pageStyle}>
      <div className="px-3 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-[30px] font-normal text-[#26384d]">Correos</h1>
          <div className="text-right text-[13px] text-[#6d8093]">
            <span>Inicio</span>
            <span className="mx-2 text-[#b6c1cb]">/</span>
            <span>Lista usuarios</span>
            <span className="mx-2 text-[#b6c1cb]">/</span>
            <span className="font-semibold text-[#2f8ded]">Correos</span>
          </div>
        </div>
      </div>

      <section className={panelClass}>
        <header className="flex items-center justify-between gap-4 bg-[#1f2429] px-6 py-4">
          <h2 className="text-[18px] font-bold text-white">Correos Enviados</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={headerActionClass}
              aria-label="Buscar panel"
              title="Buscar panel"
              onClick={() => toast.info('Busqueda rapida pendiente de implementar')}
            >
              <SearchCheck className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={headerActionClass}
              aria-label="Actualizar panel"
              title="Actualizar"
              onClick={() => toast.success('Tabla actualizada')}
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-stretch overflow-hidden rounded-[4px] border border-[#cdd8e4] bg-white align-middle">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className={`${controlClass} min-w-[56px] appearance-none rounded-none border-0 border-r border-[#cdd8e4] px-4 leading-none`}
                  aria-label="Cantidad de registros"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button
                  type="button"
                  className={`${iconButtonClass} shrink-0 rounded-none border-0 border-r border-[#cdd8e4]`}
                  aria-label="Vista lista"
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={`${iconButtonClass} shrink-0 rounded-none border-0`}
                  aria-label="Guardar configuracion"
                >
                  <Save className="h-5 w-5" />
                </button>
              </div>

              <button type="button" onClick={openComposeDialog} className={actionButtonClass}>
                <Wrench className="h-5 w-5" />
                Acciones
              </button>

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
            </div>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-[50px] min-w-[280px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8] xl:min-w-[390px]"
              placeholder="Buscar..."
              aria-label="Buscar correos"
            />
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
                        aria-label="Seleccionar todos los correos visibles"
                        className="h-5 w-5 rounded border border-[#aab9c8]"
                      />
                    </th>
                    {['ID', 'CLIENTE', 'ASUNTO', 'FECHA', 'REMITENTE', 'DESTINATARIO', 'ESTADO'].map((header) => (
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
                        Ningún registro disponible
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
                            aria-label={`Seleccionar correo ${row.id}`}
                            className="h-5 w-5 rounded border border-[#aab9c8]"
                          />
                        </td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.id}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.client}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.subject}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.date}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.sender}</td>
                        <td className="border-b border-r border-[#d7dde5] px-4 py-3">{row.recipient}</td>
                        <td className="border-b px-4 py-3">
                          <span className="inline-flex rounded-full bg-[#eaf3fc] px-3 py-1 text-[12px] font-semibold text-[#397fd6]">
                            {row.status}
                          </span>
                        </td>
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
        </div>
      </section>

      <NetworkFormDialog
        open={dialog.open}
        loading={dialog.loading}
        title="Nuevo correo enviado"
        submitLabel="Guardar correo"
        values={formValues}
        fields={[
          { name: 'client', label: 'Cliente', required: true },
          { name: 'subject', label: 'Asunto', required: true, colSpan: 2 },
          { name: 'sender', label: 'Remitente' },
          { name: 'recipient', label: 'Destinatario' },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Enviado', label: 'Enviado' },
              { value: 'Error', label: 'Error' },
            ],
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
