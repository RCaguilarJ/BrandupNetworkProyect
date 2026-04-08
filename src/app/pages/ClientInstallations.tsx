import { useMemo, useState } from 'react';
import {
  Clipboard,
  Expand,
  List,
  Plus,
  RefreshCw,
  Save,
  UserRound,
} from 'lucide-react';
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

type InstallationsTab = 'registro' | 'instalaciones';

type RegistrationRecord = {
  id: string;
  client: string;
  location: string;
  date: string;
  documentId: string;
  installationDate: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  notes: string;
};

type InstallationRecord = {
  id: string;
  client: string;
  technician: string;
  location: string;
  date: string;
  documentId: string;
  installationDate: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  status: string;
};

const registrationColumns = [
  'ID',
  'CLIENTE',
  'UBICACION',
  'FECHA',
  'NRO CEDULA',
  'FECHA INSTALACION',
  'TELEFONO',
  'MOVIL',
  'CORREO',
  'DIRECCION',
  'NOTAS',
] as const;

const installationsColumns = [
  'ID',
  'CLIENTE',
  'TECNICO',
  'UBICACION',
  'FECHA',
  'NRO CEDULA',
  'FECHA INSTALACION',
  'TELEFONO',
  'MOVIL',
  'CORREO',
  'DIRECCION',
  'ESTADO',
] as const;

const initialFormValues = {
  client: '',
  location: '',
  date: '2026-04-03',
  documentId: '',
  installationDate: '2026-04-30',
  phone: '',
  mobile: '',
  email: '',
  address: '',
  notes: '',
};

export default function ClientInstallations() {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';
  const dialog = useNetworkDialog();

  const [activeTab, setActiveTab] = useState<InstallationsTab>('registro');
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('2026-03-03');
  const [endDate, setEndDate] = useState('2026-04-30');
  const [registrationRows, setRegistrationRows] = useState<RegistrationRecord[]>([]);
  const [installationRows, setInstallationRows] = useState<InstallationRecord[]>([]);
  const [formValues, setFormValues] = useState(initialFormValues);

  const panelClass = isWispHub
    ? 'border border-[#d7dde5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'border border-[#d5dde7] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]';
  const controlClass = isWispHub
    ? 'h-[46px] rounded-[6px] border border-[#d7dde5] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#b9c4d0]'
    : 'h-[50px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8]';
  const iconButtonClass = isWispHub
    ? 'inline-flex h-[46px] w-[56px] items-center justify-center rounded-[6px] border border-[#d7dde5] bg-white text-[#405365]'
    : 'inline-flex h-[50px] w-[56px] items-center justify-center rounded-[4px] border border-[#cdd8e4] bg-white text-[#405365]';
  const toolbarButtonClass = isWispHub
    ? 'inline-flex h-[46px] items-center gap-2 rounded-[6px] border border-[#d7dde5] bg-white px-5 text-[15px] font-semibold text-[#2b3d51]'
    : 'inline-flex h-[50px] items-center gap-2 rounded-[4px] border border-[#cdd8e4] bg-white px-5 text-[16px] font-semibold text-[#34485e]';
  const tabActiveClass = isWispHub
    ? 'bg-white text-[#45bf63] shadow-[0_-1px_0_rgba(15,23,42,0.04)]'
    : 'bg-white text-[#2f8ded] shadow-[0_-1px_0_rgba(15,23,42,0.04)]';
  const tabInactiveClass = isWispHub ? 'text-[#7a8da2]' : 'text-[#2f8ded]';

  const filteredRegistrationRows = useMemo(() => {
    return registrationRows.filter((row) => {
      const query = searchTerm.trim().toLowerCase();
      const rowDate = new Date(row.date);
      const minDate = startDate ? new Date(startDate) : null;
      const maxDate = endDate ? new Date(endDate) : null;
      const matchesSearch =
        !query ||
        Object.values(row).some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesStart = !minDate || rowDate >= minDate;
      const matchesEnd = !maxDate || rowDate <= maxDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [endDate, registrationRows, searchTerm, startDate]);

  const filteredInstallationRows = useMemo(() => {
    return installationRows.filter((row) => {
      const query = searchTerm.trim().toLowerCase();
      const rowDate = new Date(row.date);
      const minDate = startDate ? new Date(startDate) : null;
      const maxDate = endDate ? new Date(endDate) : null;
      const matchesSearch =
        !query ||
        Object.values(row).some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesStart = !minDate || rowDate >= minDate;
      const matchesEnd = !maxDate || rowDate <= maxDate;

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [endDate, installationRows, searchTerm, startDate]);

  const activeRows =
    activeTab === 'registro' ? filteredRegistrationRows : filteredInstallationRows;
  const visibleRows = activeRows.slice(0, pageSize);

  const handleCreateRegistration = () => {
    if (!formValues.client.trim() || !formValues.location.trim()) {
      toast.error('Completa cliente y ubicacion');
      return;
    }

    const nextId = `${Date.now()}`;
    const registrationRow: RegistrationRecord = {
      id: nextId,
      client: formValues.client.trim(),
      location: formValues.location.trim(),
      date: formValues.date,
      documentId: formValues.documentId.trim() || '-',
      installationDate: formValues.installationDate,
      phone: formValues.phone.trim() || '-',
      mobile: formValues.mobile.trim() || '-',
      email: formValues.email.trim() || '-',
      address: formValues.address.trim() || '-',
      notes: formValues.notes.trim() || '-',
    };
    const installationRow: InstallationRecord = {
      id: nextId,
      client: formValues.client.trim(),
      technician: 'Por asignar',
      location: formValues.location.trim(),
      date: formValues.date,
      documentId: formValues.documentId.trim() || '-',
      installationDate: formValues.installationDate,
      phone: formValues.phone.trim() || '-',
      mobile: formValues.mobile.trim() || '-',
      email: formValues.email.trim() || '-',
      address: formValues.address.trim() || '-',
      status: 'Pendiente',
    };

    setRegistrationRows((current) => [registrationRow, ...current]);
    setInstallationRows((current) => [installationRow, ...current]);
    setFormValues(initialFormValues);
    dialog.closeDialog();
    toast.success('Registro de instalacion creado');
  };

  const renderCell = (
    row: RegistrationRecord | InstallationRecord,
    key: string,
  ) => {
    const value = row[key as keyof typeof row] as string;

    if (key === 'status') {
      return (
        <span className="inline-flex rounded-full bg-[#eaf3fc] px-3 py-1 text-[12px] font-semibold text-[#397fd6]">
          {value}
        </span>
      );
    }

    return value;
  };

  const headerLabels =
    activeTab === 'registro' ? registrationColumns : installationsColumns;
  const rowKeys =
    activeTab === 'registro'
      ? [
          'id',
          'client',
          'location',
          'date',
          'documentId',
          'installationDate',
          'phone',
          'mobile',
          'email',
          'address',
          'notes',
        ]
      : [
          'id',
          'client',
          'technician',
          'location',
          'date',
          'documentId',
          'installationDate',
          'phone',
          'mobile',
          'email',
          'address',
          'status',
        ];

  return (
    <div style={isWispHub ? wisphubPageStyle : mikrosystemPageStyle}>
      <section className={`relative pt-[50px] ${panelClass}`}>
        <div className="absolute left-6 top-0 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('registro')}
            className={`inline-flex h-[50px] items-center gap-2 rounded-t-[8px] px-6 text-[16px] ${
              activeTab === 'registro' ? tabActiveClass : tabInactiveClass
            }`}
          >
            <UserRound className="h-5 w-5" />
            Registro
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('instalaciones')}
            className={`inline-flex h-[50px] items-center gap-2 rounded-t-[8px] px-6 text-[16px] ${
              activeTab === 'instalaciones' ? tabActiveClass : tabInactiveClass
            }`}
          >
            <Clipboard className="h-5 w-5" />
            Instalaciones
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
            <div className="flex flex-wrap items-start gap-3">
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

              {activeTab === 'registro' ? (
                <button
                  type="button"
                  onClick={() => {
                    setFormValues(initialFormValues);
                    dialog.openDialog();
                  }}
                  className={toolbarButtonClass}
                >
                  <Plus className="h-5 w-5" />
                  Nuevo
                </button>
              ) : null}

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

            <div className="flex items-center gap-3">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-[50px] min-w-[280px] rounded-[4px] border border-[#cdd8e4] bg-white px-4 text-[15px] text-[#24364b] outline-none placeholder:text-[#c1ccd8] xl:min-w-[390px]"
                placeholder="Buscar..."
                aria-label="Buscar instalaciones"
              />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2f3d4b]"
                aria-label="Actualizar tabla"
                title="Actualizar"
                onClick={() => toast.success('Tabla actualizada')}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2f3d4b]"
                aria-label="Expandir panel"
                title="Expandir"
              >
                <Expand className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden border border-[#d7dde5] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-[14px] text-[#31465d]">
                <thead>
                  <tr className="bg-white">
                    {headerLabels.map((header) => (
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
                    <th className="w-[40px] border-b px-3 py-4 text-[#c4ccd5]">
                      <div className="flex flex-col items-center gap-[2px]">
                        <span className="h-0 w-0 border-b-[5px] border-x-[5px] border-b-current border-x-transparent" />
                        <span className="h-0 w-0 border-t-[5px] border-x-[5px] border-t-current border-x-transparent" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerLabels.length + 1}
                        className="border-b border-[#d7dde5] bg-[#f6f7f9] px-4 py-8 text-center text-[16px] text-[#495b70]"
                      >
                        Ningun registro disponible
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row) => (
                      <tr key={row.id} className="bg-white">
                        {rowKeys.map((key) => (
                          <td
                            key={`${row.id}-${key}`}
                            className="border-b border-r border-[#d7dde5] px-4 py-3 last:border-r-0"
                          >
                            {renderCell(row, key)}
                          </td>
                        ))}
                        <td className="border-b px-3 py-3" />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-[16px] font-semibold text-[#6c8097]">
            <span>
              {activeRows.length === 0
                ? 'Mostrando 0 registros'
                : `Mostrando ${Math.min(activeRows.length, pageSize)} registros`}
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
        title="Nuevo registro de instalacion"
        submitLabel="Guardar registro"
        values={formValues}
        fields={[
          { name: 'client', label: 'Cliente', required: true },
          { name: 'location', label: 'Ubicacion', required: true },
          { name: 'date', label: 'Fecha', type: 'date', required: true },
          {
            name: 'installationDate',
            label: 'Fecha instalacion',
            type: 'date',
            required: true,
          },
          { name: 'documentId', label: 'Nro cedula' },
          { name: 'phone', label: 'Telefono' },
          { name: 'mobile', label: 'Movil' },
          { name: 'email', label: 'Correo' },
          { name: 'address', label: 'Direccion', colSpan: 2 },
          { name: 'notes', label: 'Notas', type: 'textarea', colSpan: 2 },
        ]}
        onOpenChange={dialog.setOpen}
        onFieldChange={(field, value) =>
          setFormValues((current) => ({ ...current, [field]: value }))
        }
        onSubmit={handleCreateRegistration}
      />
    </div>
  );
}
