import { useEffect, useId, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { useViewTheme } from '../context/ViewThemeContext';
import { VIEW_THEME_OPTIONS } from '../lib/view-theme';

export function ViewThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { viewTheme, setViewTheme } = useViewTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="view-theme-button flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Cambiar vista"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Selector de tema visual"
          className="view-theme-dropdown absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="view-theme-dropdown-header border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Seleccionar vista
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Cambia el estilo visual del sistema
            </p>
          </div>

          <div className="p-2">
            {VIEW_THEME_OPTIONS.map((themeOption) => (
              <button
                key={themeOption.id}
                type="button"
                onClick={() => {
                  setViewTheme(themeOption.id);
                  setIsOpen(false);
                }}
                className={`view-theme-option w-full rounded-lg p-3 text-left transition-all ${
                  viewTheme === themeOption.id
                    ? 'view-theme-option-active'
                    : 'view-theme-option-inactive'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 flex-shrink-0 rounded-lg ${themeOption.previewClassName}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="view-theme-option-title text-sm font-medium">
                        {themeOption.name}
                      </p>
                      {viewTheme === themeOption.id ? (
                        <Check className="view-theme-check-icon h-4 w-4" />
                      ) : null}
                    </div>
                    <p className="view-theme-option-description truncate text-xs">
                      {themeOption.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="view-theme-dropdown-footer rounded-b-lg border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Los cambios se guardan automaticamente
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
