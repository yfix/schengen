const PREFIX = 'schengen';

const safeStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

export const storageKey = (key: string) => `${PREFIX}/${key}`;

export const readJson = <T>(key: string): T | undefined => {
  const raw = safeStorage()?.getItem(storageKey(key));
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

export const writeJson = (key: string, value: unknown) => {
  try {
    safeStorage()?.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    return;
  }
};

export const removeKey = (key: string) => {
  try {
    safeStorage()?.removeItem(storageKey(key));
  } catch {
    return;
  }
};
