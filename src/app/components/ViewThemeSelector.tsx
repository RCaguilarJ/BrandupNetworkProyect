import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useViewTheme } from '../context/ViewThemeContext';

export function ViewThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { viewTheme, setViewTheme } = useViewTheme();

  const viewThemes = [
    {
      id: 'mikrosystem' as const,
      name: 'Tema Mikrosystem',
      description: 'Vista azul profesional',
      preview: 'bg-gradient-to-r from-blue-600 to-blue-800'
    },
    {
      id: 'wisphub' as const,
      name: 'Tema Wisphub',
      description: 'Vista verde moderna',
      preview: 'bg-gradient-to-r from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 view-theme-button"
        title="Cambiar vista"
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 view-theme-dropdown">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 view-theme-dropdown-header">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Seleccionar Vista
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Cambia el estilo visual del sistema
              </p>
            </div>

            <div className="p-2">
              {viewThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setViewTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`view-theme-option w-full p-3 rounded-lg text-left transition-all ${
                    viewTheme === theme.id
                      ? 'view-theme-option-active'
                      : 'view-theme-option-inactive'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${theme.preview} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm view-theme-option-title">
                          {theme.name}
                        </p>
                        {viewTheme === theme.id && (
                          <Check className="w-4 h-4 view-theme-check-icon" />
                        )}
                      </div>
                      <p className="text-xs view-theme-option-description truncate">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg view-theme-dropdown-footer">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Los cambios se guardan automáticamente
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
