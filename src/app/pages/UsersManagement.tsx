import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '../components/ui/button';
import { type UserManagementRecord } from '../types';
import {
  CircleX,
  ChevronLeft,
  ChevronRight,
  Expand,
  FileDown,
  FileSpreadsheet,
  List,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeLettersValue, sanitizeNumericValue } from '../lib/input-sanitizers';

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: 'ADMINISTRADOR',
    isp_admin: 'ADMINISTRADOR',
    cobranza: 'COBRANZA',
    soporte: 'SOPORTE',
    tecnico: 'TECNICO',
    cliente: 'CLIENTE',
  };

  return labels[role] ?? role.toUpperCase();
}

type UserFormState = {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  profile: string;
  cellphone: string;
  status: 'active' | 'inactive';
};

const INITIAL_USER_FORM: UserFormState = {
  id: '',
  fullName: '',
  documentType: '',
  documentNumber: '',
  profile: '',
  cellphone: '',
  status: 'active',
};

type UserColumnKey =
  | 'rowNumber'
  | 'fullName'
  | 'documentType'
  | 'documentNumber'
  | 'profile'
  | 'cellphone'
  | 'status'
  | 'actions';

type UserTableColumn = {
  key: UserColumnKey;
  label: string;
  header: string;
  headerClassName: string;
  cellClassName: string;
  exportable?: boolean;
  render: (record: UserManagementRecord, rowNumber: number) => ReactNode;
  getExportValue?: (record: UserManagementRecord, rowNumber: number) => string;
};

type ExportColumn<T> = {
  header: string;
  getValue: (row: T, rowNumber: number) => string;
};

function sanitizeExportValue(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvValue(value: string) {
  return `"${sanitizeExportValue(value).replace(/"/g, '""')}"`;
}

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportRowsToCsv<T>(filename: string, columns: ExportColumn<T>[], rows: T[]) {
  const lines = [
    columns.map((column) => escapeCsvValue(column.header)).join(','),
    ...rows.map((row, index) =>
      columns.map((column) => escapeCsvValue(column.getValue(row, index + 1))).join(','),
    ),
  ];

  downloadBlob(filename, `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
}

function exportRowsToExcel<T>(filename: string, title: string, columns: ExportColumn<T>[], rows: T[]) {
  const tableHeader = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join('');
  const tableRows = rows.length
    ? rows
        .map(
          (row, index) =>
            `<tr>${columns
              .map((column) => `<td>${escapeHtml(column.getValue(row, index + 1))}</td>`)
              .join('')}</tr>`,
        )
        .join('')
    : `<tr><td colspan="${columns.length}">No hay datos para mostrar</td></tr>`;

  const documentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #223448; }
    h1 { font-size: 18px; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #cfd8e3; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background: #f3f7fb; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${tableHeader}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

  downloadBlob(filename, `\uFEFF${documentHtml}`, 'application/vnd.ms-excel;charset=utf-8;');
}

function openPrintableTable<T>(title: string, columns: ExportColumn<T>[], rows: T[], autoPrint: boolean) {
  const tableHeader = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join('');
  const tableRows = rows.length
    ? rows
        .map(
          (row, index) =>
            `<tr>${columns
              .map((column) => `<td>${escapeHtml(column.getValue(row, index + 1))}</td>`)
              .join('')}</tr>`,
        )
        .join('')
    : `<tr><td colspan="${columns.length}">No hay datos para mostrar</td></tr>`;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    toast.error('No se pudo abrir la vista de impresion.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #223448; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d7dde5; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background: #f5f7fb; }
    @page { margin: 16mm; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${tableHeader}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();

  if (autoPrint) {
    printWindow.print();
  }
}

const USER_TABLE_COLUMNS: UserTableColumn[] = [
  {
    key: 'rowNumber',
    label: 'No',
    header: 'No',
    headerClassName:
      'w-[6%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px] text-center',
    render: (_record, rowNumber) => rowNumber,
    getExportValue: (_record, rowNumber) => String(rowNumber),
  },
  {
    key: 'fullName',
    label: 'Nombre',
    header: 'NOMBRE',
    headerClassName:
      'w-[20%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px]',
    render: (record) => record.fullName,
    getExportValue: (record) => record.fullName,
  },
  {
    key: 'documentType',
    label: 'Documento',
    header: 'DOCUMENTO',
    headerClassName:
      'w-[15%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px]',
    render: (record) => record.documentType,
    getExportValue: (record) => record.documentType,
  },
  {
    key: 'documentNumber',
    label: 'No Documento',
    header: 'No DOCUMENTO',
    headerClassName:
      'w-[17%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px]',
    render: (record) => record.documentNumber,
    getExportValue: (record) => record.documentNumber,
  },
  {
    key: 'profile',
    label: 'Perfil',
    header: 'PERFIL',
    headerClassName:
      'w-[18%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px]',
    render: (record) => record.profile,
    getExportValue: (record) => record.profile,
  },
  {
    key: 'cellphone',
    label: 'Celular',
    header: 'CELULAR',
    headerClassName:
      'w-[14%] border-r border-[#d7dfe8] px-3 py-[9px] text-left text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px]',
    render: (record) => (
      <span className="flex items-center gap-1">
        <Phone className="h-3.5 w-3.5" />
        {record.cellphone}
      </span>
    ),
    getExportValue: (record) => record.cellphone,
  },
  {
    key: 'status',
    label: 'Estado',
    header: 'ESTADO',
    headerClassName:
      'w-[10%] border-r border-[#d7dfe8] px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]',
    cellClassName: 'border-r border-[#d7dfe8] px-3 py-[10px] text-center',
    render: (record) => (
      <span className="inline-flex rounded-[4px] bg-[#10b8b8] px-2 py-[2px] text-[11px] font-semibold text-white">
        {record.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
      </span>
    ),
    getExportValue: (record) => (record.status === 'active' ? 'ACTIVO' : 'INACTIVO'),
  },
  {
    key: 'actions',
    label: 'Acciones',
    header: '',
    headerClassName: 'px-3 py-[9px] text-center text-[14px] font-normal text-[#111827]',
    cellClassName: 'px-3 py-[10px]',
    exportable: false,
    render: (record) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className="text-[#5b9bd5]"
          onClick={() => toast.info('Edicion de usuarios lista para conectarse con backend.')}
          aria-label={`Editar usuario ${record.fullName}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="text-[#22c55e]"
          onClick={() => toast.info('Accion de contacto lista para integrarse.')}
          aria-label={`Contactar usuario ${record.fullName}`}
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<UserManagementRecord[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [formState, setFormState] = useState<UserFormState>(INITIAL_USER_FORM);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<UserColumnKey[]>(
    USER_TABLE_COLUMNS.map((column) => column.key),
  );
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (columnMenuRef.current && !columnMenuRef.current.contains(target)) {
        setColumnMenuOpen(false);
      }

      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setExportMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      [record.fullName, record.documentType, record.documentNumber, record.profile, record.cellphone]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [records, searchTerm]);

  const visibleColumns = useMemo(
    () => USER_TABLE_COLUMNS.filter((column) => visibleColumnKeys.includes(column.key)),
    [visibleColumnKeys],
  );

  const exportColumns = useMemo<ExportColumn<UserManagementRecord>[]>(
    () =>
      visibleColumns
        .filter((column) => column.exportable !== false)
        .map((column) => ({
          header: column.label,
          getValue: (record, rowNumber) => column.getExportValue?.(record, rowNumber) ?? '',
        })),
    [visibleColumns],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleRefresh() {
    toast.success('Listado de usuarios actualizado');
  }

  function toggleColumn(columnKey: UserColumnKey) {
    setVisibleColumnKeys((current) => {
      if (current.includes(columnKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== columnKey);
      }

      return USER_TABLE_COLUMNS.map((column) => column.key).filter(
        (key) => key === columnKey || current.includes(key),
      );
    });
  }

  function createExportFilename(extension: string) {
    return `usuarios.${extension}`;
  }

  function handlePrint() {
    openPrintableTable('Lista de usuarios', exportColumns, filteredRecords, true);
    setExportMenuOpen(false);
  }

  function handleExportCsv() {
    exportRowsToCsv(createExportFilename('csv'), exportColumns, filteredRecords);
    setExportMenuOpen(false);
  }

  function handleExportExcel() {
    exportRowsToExcel(createExportFilename('xls'), 'Lista de usuarios', exportColumns, filteredRecords);
    setExportMenuOpen(false);
  }

  function handleExportPdf() {
    openPrintableTable('Lista de usuarios - PDF', exportColumns, filteredRecords, true);
    setExportMenuOpen(false);
  }

  function resetForm() {
    setFormState(INITIAL_USER_FORM);
  }

  function handleCreateUser() {
    resetForm();
    setIsCreateUserOpen(true);
  }

  function handleCloseForm() {
    setIsCreateUserOpen(false);
    resetForm();
  }

  function handleNumericFieldChange(field: 'id' | 'documentNumber' | 'cellphone', value: string) {
    setFormState((current) => ({
      ...current,
      [field]: sanitizeNumericValue(value),
    }));
  }

  function handleLettersFieldChange(field: 'fullName', value: string) {
    setFormState((current) => ({
      ...current,
      [field]: sanitizeLettersValue(value),
    }));
  }

  function handleSaveUser() {
    const fullName = formState.fullName.trim();

    if (!formState.id || !fullName || !formState.documentType || !formState.documentNumber || !formState.profile) {
      toast.error('Completa los campos obligatorios del usuario.');
      return;
    }

    if (records.some((record) => record.id === formState.id)) {
      toast.error('El ID de usuario ya existe.');
      return;
    }

    const nextRecord: UserManagementRecord = {
      id: formState.id,
      fullName: fullName.toUpperCase(),
      documentType: formState.documentType,
      documentNumber: formState.documentNumber,
      profile: getRoleLabel(formState.profile),
      cellphone: formState.cellphone || '-',
      status: formState.status,
    };

    setRecords((current) => [nextRecord, ...current]);
    setCurrentPage(1);
    setIsCreateUserOpen(false);
    resetForm();
    toast.success('Usuario registrado correctamente.');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#d3dce7] px-4 pb-6 pt-[18px] sm:px-6 lg:px-[30px]">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 className="text-[26px] font-normal leading-none text-[#1f2933]">Gestion de Usuarios</h1>

        <div className="flex flex-wrap items-center gap-2 pt-[3px] text-[12px] text-[#1f2933]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Ajustes</span>
          <span>/</span>
          <span className="text-[#1bc3dc]">Usuarios</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-[#d7dfe8] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7dfe8] px-4 py-3">
          <p className="text-[14px] text-[#1f2933]">Lista de usuarios</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info('Accion de expandir lista pendiente de integracion visual.')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Expandir"
              aria-label="Expandir listado de usuarios"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-[#f8fafc]"
              title="Actualizar"
              aria-label="Actualizar listado de usuarios"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isCreateUserOpen ? (
          <div className="border-b border-[#d7dfe8] bg-[#f8fafc] px-4 py-4 sm:px-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[16px] font-medium text-[#111827]">Nuevo usuario</h2>
                <p className="text-[13px] text-[#6b7280]">El formulario inicia vacio y sin datos mock.</p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7dfe8] text-[#4b5563] hover:bg-white"
                aria-label="Cerrar formulario de nuevo usuario"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                ID de usuario
                <input
                  type="number"
                  min="0"
                  value={formState.id}
                  onChange={(event) => handleNumericFieldChange('id', event.target.value)}
                  placeholder="Ej. 1001"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Nombre completo
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(event) => handleLettersFieldChange('fullName', event.target.value)}
                  placeholder="Nombre del usuario"
                  inputMode="text"
                  pattern="[A-Za-zÀ-ÿ\\s'-]+"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Documento
                <select
                  value={formState.documentType}
                  onChange={(event) => setFormState((current) => ({ ...current, documentType: event.target.value }))}
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                >
                  <option value="">Seleccionar documento</option>
                  <option value="DNI">DNI</option>
                  <option value="INE">INE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                N documento
                <input
                  type="number"
                  min="0"
                  value={formState.documentNumber}
                  onChange={(event) => handleNumericFieldChange('documentNumber', event.target.value)}
                  placeholder="Solo numeros"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Perfil
                <select
                  value={formState.profile}
                  onChange={(event) => setFormState((current) => ({ ...current, profile: event.target.value }))}
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                >
                  <option value="">Seleccionar perfil</option>
                  <option value="super_admin">Administrador general</option>
                  <option value="isp_admin">Administrador ISP</option>
                  <option value="cobranza">Cobranza</option>
                  <option value="soporte">Soporte</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="cliente">Cliente</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Celular
                <input
                  type="number"
                  min="0"
                  value={formState.cellphone}
                  onChange={(event) => handleNumericFieldChange('cellphone', event.target.value)}
                  placeholder="Solo numeros"
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[13px] text-[#374151]">
                Estado
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value === 'inactive' ? 'inactive' : 'active',
                    }))
                  }
                  className="h-[38px] rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#cfd8e3] text-[#111827] hover:bg-white sm:w-auto"
                onClick={handleCloseForm}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="w-full bg-[#10b8d4] text-white hover:bg-[#0ea5c0] sm:w-auto"
                onClick={handleSaveUser}
              >
                Guardar usuario
              </Button>
            </div>
          </div>
        ) : null}

        <div className="px-4 py-[14px]">
          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="h-[34px] min-w-[40px] rounded-[4px] border border-[#d7dfe8] bg-white px-3 text-[14px] text-[#111827]"
                aria-label={`Mostrar ${pageSize} registros por pagina`}
              >
                {pageSize}
              </button>

              <div className="relative" ref={columnMenuRef}>
                <button
                  type="button"
                  className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white text-[#374151]"
                  title="Vista de lista"
                  aria-label="Cambiar a vista de lista"
                  onClick={() => {
                    setColumnMenuOpen((current) => !current);
                    setExportMenuOpen(false);
                  }}
                >
                  <List className="h-4 w-4" />
                </button>

                {columnMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[170px] border border-[#d7dde5] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                    <div className="max-h-[260px] overflow-y-auto py-2">
                      {USER_TABLE_COLUMNS.map((column) => (
                        <label
                          key={column.key}
                          className="flex cursor-pointer items-center gap-3 px-4 py-[7px] text-[13px] text-[#334b63] hover:bg-[#f7fafc]"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumnKeys.includes(column.key)}
                            onChange={() => toggleColumn(column.key)}
                            className="h-[13px] w-[13px] accent-[#2f3033]"
                          />
                          <span>{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  className="flex h-[34px] w-[38px] items-center justify-center rounded-[4px] border border-[#d7dfe8] bg-white text-[#374151]"
                  title="Guardar"
                  aria-label="Guardar configuracion"
                  onClick={() => {
                    setExportMenuOpen((current) => !current);
                    setColumnMenuOpen(false);
                  }}
                >
                  <Save className="h-4 w-4" />
                </button>

                {exportMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[180px] border border-[#d7dde5] bg-white py-2 shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                    >
                      <FileDown className="h-4 w-4" />
                      Exportar csv
                    </button>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Exportar a Excel
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="flex w-full items-center gap-3 px-4 py-[7px] text-left text-[13px] text-[#4d5b68] hover:bg-[#f3f7fb]"
                    >
                      <FileDown className="h-4 w-4" />
                      Exportar a PDF
                    </button>
                  </div>
                ) : null}
              </div>

              <Button
                type="button"
                onClick={handleCreateUser}
                variant="outline"
                size="sm"
                className="h-[34px] rounded-[4px] border-[#cfd8e3] px-4 text-[14px] font-medium text-[#111827] hover:bg-[#f8fafc]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo
              </Button>
            </div>

            <div className="w-full xl:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar..."
                className="h-[34px] w-full rounded-[4px] border border-[#d7dfe8] px-3 text-[14px] text-[#111827] outline-none placeholder:text-[#c0c7d1] sm:max-w-[240px] xl:w-[200px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border border-[#d7dfe8]">
                  {visibleColumns.map((column) => (
                    <th key={column.key} className={column.headerClassName}>
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr className="border border-t-0 border-[#d7dfe8]">
                    <td colSpan={visibleColumns.length} className="px-3 py-[18px] text-center text-[14px] text-[#374151]">
                      No hay informacion
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <tr key={record.id} className="border border-t-0 border-[#d7dfe8] text-[14px] text-[#111827]">
                      {visibleColumns.map((column) => (
                        <td key={column.key} className={column.cellClassName}>
                          {column.render(record, (currentPage - 1) * pageSize + index + 1)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 pb-4 pt-2 text-[14px] text-[#556274] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {filteredRecords.length === 0
              ? 'Mostrando 0 registros'
              : `Mostrando de ${(currentPage - 1) * pageSize + 1} al ${Math.min(currentPage * pageSize, filteredRecords.length)} de un total de ${filteredRecords.length}`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#d7dfe8] text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Ir a la pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-[32px] min-w-[32px] items-center justify-center rounded-[4px] bg-[#10b8d4] px-3 text-[14px] text-white"
              aria-current="page"
            >
              {currentPage}
            </button>
            <button
              type="button"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#d7dfe8] text-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || filteredRecords.length === 0}
              aria-label="Ir a la pagina siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
