import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  List,
  LoaderCircle,
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
  summary,
  emptyMessage = 'Ningún registro disponible',
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
  summary: string;
  emptyMessage?: string;
}) {
  const visibleRows = rows.slice(0, pageSize);

  return (
    <ServiceShell title={title} breadcrumb={breadcrumb}>
      <div className="service-toolbar">
        <div className="service-toolbar__group">
          <div className="service-toolbar__cluster">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="service-toolbar__select"
              aria-label="Cantidad de registros por página"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button type="button" className="service-toolbar__icon-button" aria-label="Vista de lista">
              <List className="h-4 w-4" />
            </button>
            <button type="button" className="service-toolbar__icon-button" aria-label="Guardar configuración">
              <Save className="h-4 w-4" />
            </button>
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
                        <ChevronsUpDown className="h-4 w-4 text-[#cad4de]" />
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
          <button type="button" className="service-footer__page-button" aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {rows.length > 0 ? (
            <button type="button" className="service-footer__page-button service-footer__page-button--active">
              1
            </button>
          ) : null}
          <button type="button" className="service-footer__page-button" aria-label="Página siguiente">
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
