import { useEffect, useState } from 'react';

/**
 * Persistencia simple en localStorage para pantallas que hoy funcionan sin backend.
 *
 * Cuando el backend quede listo, el desarrollador puede mantener este hook como
 * caché optimista local o reemplazarlo por un fetch/mutación real conservando el
 * mismo shape de estado de cada vista.
 */
export function usePersistentState<T>(
  storageKey: string,
  initialValue: T,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const rawValue = window.localStorage.getItem(storageKey);
      if (!rawValue) {
        return initialValue;
      }

      return {
        ...initialValue,
        ...(JSON.parse(rawValue) as Partial<T>),
      };
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue] as const;
}
