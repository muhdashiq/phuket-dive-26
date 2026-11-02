import { useCallback, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

type Updater<T> = T | ((previous: T) => T);

// React state mirrored to localStorage, kept in sync across tabs.
export const useLocalStorage = <T,>(key: string, initial: T, sanitize: (raw: unknown) => T = (raw) => raw as T) => {
  const [value, setValue] = useState<T>(() => sanitize(readJSON<unknown>(key, initial)));

  const update = useCallback(
    (next: Updater<T>) => {
      setValue((previous) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(previous) : next;
        writeJSON(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) setValue(sanitize(readJSON<unknown>(key, initial)));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // initial and sanitize are treated as constants for a given key.
  }, [key]);

  return [value, update] as const;
};
