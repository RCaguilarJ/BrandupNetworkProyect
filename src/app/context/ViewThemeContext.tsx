import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewThemeType = 'mikrosystem' | 'wisphub';

interface ViewThemeContextType {
  viewTheme: ViewThemeType;
  setViewTheme: (theme: ViewThemeType) => void;
}

const ViewThemeContext = createContext<ViewThemeContextType | undefined>(undefined);

export function ViewThemeProvider({ children }: { children: ReactNode }) {
  const [viewTheme, setViewThemeState] = useState<ViewThemeType>(() => {
    const stored = localStorage.getItem('viewTheme');
    return (stored as ViewThemeType) || 'mikrosystem';
  });

  useEffect(() => {
    localStorage.setItem('viewTheme', viewTheme);
    
    // Remover todas las clases de tema de vista
    document.documentElement.classList.remove('view-mikrosystem', 'view-wisphub');
    
    // Agregar la clase correspondiente
    document.documentElement.classList.add(`view-${viewTheme}`);
  }, [viewTheme]);

  const setViewTheme = (theme: ViewThemeType) => {
    setViewThemeState(theme);
  };

  return (
    <ViewThemeContext.Provider value={{ viewTheme, setViewTheme }}>
      {children}
    </ViewThemeContext.Provider>
  );
}

export function useViewTheme() {
  const context = useContext(ViewThemeContext);
  if (context === undefined) {
    throw new Error('useViewTheme must be used within a ViewThemeProvider');
  }
  return context;
}
