import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileDown,
  FileSpreadsheet,
  List,
  LoaderCircle,
  Printer,
  Save,
  Search,
  SquarePen,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useViewTheme } from '../../context/ViewThemeContext';
import { NetworkPageShell, type DataColumn } from '../network/networkManagementShared';
import './servicesWorkflow.css';

function getAlignClass(align: DataColumn<unknown>['align']) {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
}

type ServiceExportColumn<T> = {
  key: string;
  header: string;
  getValue: (row: T) => string;
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
  const normalized = sanitizeExportValue(value).replace(/"/g, '""');
  return `"${normalized}"`;
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

function buildExportColumns<T>(columns: DataColumn<T>[]): ServiceExportColumn<T>[] {
  return columns
    .filter((column) => column.header.trim().length > 0 && column.key !== 'actions')
    .map((column) => ({
      key: column.key,
      header: column.header,
      getValue: (row: T) => {
        const record = row as Record<string, unknown>;
        const rawValue = record[column.key];
        if (rawValue === null || rawValue === undefined) {
          return '';
        }

        return sanitizeExportValue(String(rawValue));
      },
    }));
}

function exportRowsToCsv<T>(filename: string, columns: ServiceExportColumn<T>[], rows: T[]) {
  const lines = [
    columns.map((column) => escapeCsvValue(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsvValue(column.getValue(row))).join(',')),
  ];

  downloadBlob(filename, `\uFEFF${lines.join('\n')}`, 'text/csv;charset=utf-8;');
}

function exportRowsToExcel<T>(filename: string, title: string, columns: ServiceExportColumn<T>[], rows: T[]) {
  const tableHeader = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join('');
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(column.getValue(row))}</td>`)
          .join('')}</tr>`,
    )
    .join('');

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

function openPrintableTable<T>(title: string, columns: ServiceExportColumn<T>[], rows: T[], autoPrint: boolean) {
  const tableHeader = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join('');
  const tableRows = rows.length
    ? rows
        .map(
          (row) =>
            `<tr>${columns
              .map((column) => `<td>${escapeHtml(column.getValue(row))}</td>`)
              .join('')}</tr>`,
        )
        .join('')
    : `<tr><td colspan="${columns.length}">No hay datos para mostrar</td></tr>`;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
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

export function ServiceShell({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb: string;
  children: ReactNode;
}) {
  const { viewTheme } = useViewTheme();
  const isWispHub = viewTheme === 'wisphub';

  return (
    <div
      className={`service-shell${isWispHub ? ' service-shell--wisphub' : ' service-shell--mikrosystem'}`}
    >
      <NetworkPageShell title={title} breadcrumb={breadcrumb} isWispHub={isWispHub}>
        <section className="service-shell__panel">{children}</section>
      </NetworkPageShell>
    </div>
  );
}

export function ServiceCountBadge({
  value,
  tone,
}: {
  value: string | number;
  tone: 'teal' | 'amber' | 'slate';
}) {
  return (
    <span className={`service-badge service-badge--${tone}`}>
      {value}
    </span>
  );
}

export function ServiceRowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="service-table__actions">
      <button type="button" className="service-table__icon-button" onClick={onDelete} aria-label="Eliminar registro">
        <Trash2 className="h-4 w-4" />
      </button>
      <button type="button" className="service-table__icon-button" onClick={onEdit} aria-label="Editar registro">
        <SquarePen className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ServiceListView<T>({
  title,
  breadcrumb,
  actionLabel,
  pageSize,
  onPageSizeChange,
  searchTerm,
  onSearchTermChange,
  onOpenNew,
  columns,
  rows,
  emptyMessage = 'Ningun registro disponible',
}: {
  title: string;
  breadcrumb: string;
  actionLabel: string;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onOpenNew: () => void;
  columns: DataColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  const listMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [headerDirection, setHeaderDirection] = useState<'up' | 'down'>('up');
  const exportableColumns = useMemo(() => buildExportColumns(columns), [columns]);
  const defaultSearchKeys = useMemo(
    () => exportableColumns.map((column) => column.key),
    [exportableColumns],
  );
  const [selectedSearchKeys, setSelectedSearchKeys] = useState<string[]>(defaultSearchKeys);
  const activeSearchKeys = useMemo(() => {
    const nextKeys = selectedSearchKeys.filter((key) => defaultSearchKeys.includes(key));
    return nextKeys.length > 0 ? nextKeys : defaultSearchKeys;
  }, [defaultSearchKeys, selectedSearchKeys]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (listMenuRef.current && !listMenuRef.current.contains(target)) {
        setListMenuOpen(false);
      }

      if (exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setExportMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    const activeColumns = exportableColumns.filter((column) => activeSearchKeys.includes(column.key));
    if (activeColumns.length === 0) {
      return rows;
    }

    return rows.filter((row) =>
      activeColumns.some((column) => column.getValue(row).toLowerCase().includes(query)),
    );
  }, [activeSearchKeys, exportableColumns, rows, searchTerm]);

  const visibleRows =
    headerDirection === 'down'
      ? filteredRows.slice(Math.max(filteredRows.length - pageSize, 0))
      : filteredRows.slice(0, pageSize);
  const summary =
    filteredRows.length === 0
      ? 'Mostrando 0 registros'
      : `Mostrando de 1 al ${Math.min(pageSize, filteredRows.length)} de un total de ${filteredRows.length}`;

  function toggleSearchColumn(columnKey: string) {
    setSelectedSearchKeys((current) => {
      const baseKeys = current.filter((key) => defaultSearchKeys.includes(key));
      const nextKeys = baseKeys.length > 0 ? baseKeys : defaultSearchKeys;

      if (nextKeys.includes(columnKey)) {
        return nextKeys.length === 1 ? nextKeys : nextKeys.filter((key) => key !== columnKey);
      }

      return [...nextKeys, columnKey];
    });
  }

  function createExportFilename(extension: string) {
    return `${title.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
  }

  function handlePrint() {
    openPrintableTable(title, exportableColumns, filteredRows, true);
    setExportMenuOpen(false);
  }

  function handleExportCsv() {
    exportRowsToCsv(createExportFilename('csv'), exportableColumns, filteredRows);
    setExportMenuOpen(false);
  }

  function handleExportExcel() {
    exportRowsToExcel(createExportFilename('xls'), title, exportableColumns, filteredRows);
    setExportMenuOpen(false);
  }

  function handleExportPdf() {
    openPrintableTable(`${title} - PDF`, exportableColumns, filteredRows, true);
    setExportMenuOpen(false);
  }

  function toggleHeaderDirection() {
    setHeaderDirection((current) => (current === 'up' ? 'down' : 'up'));
  }

  return (
    <ServiceShell title={title} breadcrumb={breadcrumb}>
      <div className="service-toolbar">
        <div className="service-toolbar__group">
          <div className="service-toolbar__cluster">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="service-toolbar__select"
              aria-label="Cantidad de registros por pagina"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <div className="service-toolbar__menu-wrap" ref={listMenuRef}>
              <button
                type="button"
                className="service-toolbar__icon-button"
                aria-label="Filtrar columnas de busqueda"
                onClick={() => {
                  setListMenuOpen((current) => !current);
                  setExportMenuOpen(false);
                }}
              >
                <List className="h-4 w-4" />
              </button>

              {listMenuOpen ? (
                <div className="service-toolbar__menu service-toolbar__menu--columns">
                  {exportableColumns.map((column) => (
                    <label key={column.key} className="service-toolbar__menu-checkbox">
                      <input
                        type="checkbox"
                        checked={activeSearchKeys.includes(column.key)}
                        onChange={() => toggleSearchColumn(column.key)}
                      />
                      <span>{column.header}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="service-toolbar__menu-wrap" ref={exportMenuRef}>
              <button
                type="button"
                className="service-toolbar__icon-button"
                aria-label="Opciones de descarga"
                onClick={() => {
                  setExportMenuOpen((current) => !current);
                  setListMenuOpen(false);
                }}
              >
                <Save className="h-4 w-4" />
              </button>

              {exportMenuOpen ? (
                <div className="service-toolbar__menu service-toolbar__menu--exports">
                  <button type="button" className="service-toolbar__menu-item" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </button>
                  <button type="button" className="service-toolbar__menu-item" onClick={handleExportCsv}>
                    <FileDown className="h-4 w-4" />
                    Exportar csv
                  </button>
                  <button type="button" className="service-toolbar__menu-item" onClick={handleExportExcel}>
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar a Excel
                  </button>
                  <button type="button" className="service-toolbar__menu-item" onClick={handleExportPdf}>
                    <FileDown className="h-4 w-4" />
                    Exportar a PDF
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <button type="button" className="service-toolbar__primary-button" onClick={onOpenNew}>
            <span className="text-[20px] leading-none">+</span>
            {actionLabel}
          </button>
        </div>

        <div className="service-toolbar__search">
          <Search className="service-toolbar__search-icon h-4 w-4" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="service-toolbar__search-input"
            placeholder="Buscar..."
            aria-label="Buscar registro"
          />
        </div>
      </div>

      <div className="service-table-wrap">
        <div className="service-table-scroll">
          <table className="service-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${getAlignClass(column.align)} ${column.width ? `[width:${column.width}]` : ''}`}
                  >
                    <div
                      className={`service-table__heading ${
                        column.align === 'center'
                          ? 'justify-center'
                          : column.align === 'right'
                            ? 'justify-end'
                            : 'justify-between'
                      }`}
                    >
                      <span>{column.header}</span>
                      {!column.hideSortIcon ? (
                        <button
                          type="button"
                          onClick={toggleHeaderDirection}
                          className="text-[#cad4de] transition hover:text-[#3f93e7]"
                          aria-label={
                            headerDirection === 'up'
                              ? 'Ir a los ultimos registros'
                              : 'Ir a los primeros registros'
                          }
                        >
                          {headerDirection === 'up' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="service-table__empty">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key} className={getAlignClass(column.align)}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="service-footer">
        <div className="service-footer__summary">{summary}</div>
        <div className="service-footer__pagination">
          <button type="button" className="service-footer__page-button" aria-label="Pagina anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {filteredRows.length > 0 ? (
            <button type="button" className="service-footer__page-button service-footer__page-button--active">
              1
            </button>
          ) : null}
          <button type="button" className="service-footer__page-button" aria-label="Pagina siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </ServiceShell>
  );
}

export function ServiceProcessingDialog({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="service-processing-dialog"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="service-processing-dialog__header">
          <DialogTitle className="service-processing-dialog__title">
            Procesando
          </DialogTitle>
        </DialogHeader>
        <div className="service-processing-dialog__body">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#2f3033]" />
          <span>Cargando...</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceModalFrame({
  open,
  title,
  submitLabel,
  submitIcon,
  size = 'default',
  onOpenChange,
  onCancel,
  onSubmit,
  children,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  submitIcon?: ReactNode;
  size?: 'default' | 'compact';
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`service-modal${size === 'compact' ? ' service-modal--compact' : ''}`}>
        <DialogHeader className="service-modal__header">
          <DialogTitle className="service-modal__title">{title}</DialogTitle>
        </DialogHeader>
        <div className="service-modal__body">{children}</div>
        <DialogFooter className="service-modal__footer">
          <button type="button" className="service-modal__secondary-action" onClick={onCancel}>
            Cerrar
          </button>
          <button type="button" className="service-modal__primary-action" onClick={onSubmit}>
            {submitIcon}
            {submitLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useServiceCreationFlow() {
  const [processingOpen, setProcessingOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const openSequence = () => {
    clearTimer();
    setProcessingOpen(true);
    setFormOpen(false);

    timerRef.current = window.setTimeout(() => {
      setProcessingOpen(false);
      setFormOpen(true);
      timerRef.current = null;
    }, 650);
  };

  const closeAll = () => {
    clearTimer();
    setProcessingOpen(false);
    setFormOpen(false);
  };

  const setDialogOpen = (open: boolean) => {
    if (!open) {
      closeAll();
      return;
    }

    setFormOpen(true);
  };

  return {
    processingOpen,
    formOpen,
    openSequence,
    closeAll,
    setDialogOpen,
  };
}

export function useTicketCreationFlow() {
  const [processingOpen, setProcessingOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const openSequence = () => {
    clearTimer();
    setProcessingOpen(true);
    setFormOpen(false);

    timerRef.current = window.setTimeout(() => {
      setProcessingOpen(false);
      setFormOpen(true);
      timerRef.current = null;
    }, 650);
  };

  const closeAll = () => {
    clearTimer();
    setProcessingOpen(false);
    setFormOpen(false);
  };

  const setDialogOpen = (open: boolean) => {
    if (!open) {
      closeAll();
      return;
    }

    setFormOpen(true);
  };

  return {
    processingOpen,
    formOpen,
    openSequence,
    closeAll,
    setDialogOpen,
  };
}

export type { DataColumn };
