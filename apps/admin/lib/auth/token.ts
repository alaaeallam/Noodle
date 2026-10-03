import { TOKEN_STORAGE_KEY } from '@/lib/config';
import { APP_NAME } from '@/lib/utils/constants/strings/global';

// Must be the same key the login screen writes (TOKEN_STORAGE_KEY). This
// used to be a separate 'admin:jwt' literal, so the login token was never
// found, no request carried an Authorization header, and any page that
// queried a guarded resolver (e.g. the vendors page's role check) got
// "Unauthenticated" and bounced back to the login screen.
const KEY = TOKEN_STORAGE_KEY;
const USER_KEY = `user-${APP_NAME}`;

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(KEY);
  if (token) return token;
  // The login response (including its token) is also saved as the user
  // record, so sessions started before this fix keep working.
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user)?.token ?? null : null;
  } catch {
    return null;
  }
};

export const setToken = (t: string) =>
  typeof window !== 'undefined' && localStorage.setItem(KEY, t);

// Also drop the saved user record: getToken() falls back to its token, so
// leaving it would keep re-sending a rejected token after an auth error.
export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
};
