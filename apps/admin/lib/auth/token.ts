const KEY = 'admin:jwt';

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;

export const setToken = (t: string) =>
  typeof window !== 'undefined' && localStorage.setItem(KEY, t);

export const clearToken = () =>
  typeof window !== 'undefined' && localStorage.removeItem(KEY);