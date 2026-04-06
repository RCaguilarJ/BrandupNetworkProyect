import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  applyViewThemeClass,
  isViewTheme,
  VIEW_THEME_STORAGE_KEY,
  type ViewThemeId,
} from '../lib/view-theme';

interface ViewThemeContextType {
  viewTheme: ViewThemeId;
  setViewTheme: (theme: ViewThemeId) => void;
}

const ViewThemeContext = createContext<ViewThemeContextType | undefined>(undefined);

export function ViewThemeProvider({ children }: { children: ReactNode }) {
  const [viewTheme, setViewThemeState] = useState<ViewThemeId>(() => {
    if (typeof window === 'undefined') {
      return 'mikrosystem';
    }

    const storedTheme = window.localStorage.getItem(VIEW_THEME_STORAGE_KEY);
    return isViewTheme(storedTheme) ? storedTheme : 'mikrosystem';
  });

  useEffect(() => {
    window.localStorage.setItem(VIEW_THEME_STORAGE_KEY, viewTheme);
    applyViewThemeClass(viewTheme);
  }, [viewTheme]);

  const setViewTheme = (theme: ViewThemeId) => {
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
