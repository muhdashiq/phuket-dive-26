import { useCallback, useEffect, useState } from 'react';
import { sanitizePhoto } from '../lib/photo';
import { readRaw, removeKey, STORAGE_KEYS, tryWriteRaw } from '../lib/storage';

// The profile photo is stored as a raw data URL (not JSON) under pdw:photo.
export const usePhoto = () => {
  const [photo, setPhoto] = useState<string | null>(() => sanitizePhoto(readRaw(STORAGE_KEYS.photo)));

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.photo) setPhoto(sanitizePhoto(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Returns false when the browser has no room to keep it.
  const save = useCallback((dataUrl: string): boolean => {
    const clean = sanitizePhoto(dataUrl);
    if (!clean || !tryWriteRaw(STORAGE_KEYS.photo, clean)) {
      removeKey(STORAGE_KEYS.photo);
      return false;
    }
    setPhoto(clean);
    return true;
  }, []);

  const remove = useCallback(() => {
    removeKey(STORAGE_KEYS.photo);
    setPhoto(null);
  }, []);

  return { photo, save, remove };
};
