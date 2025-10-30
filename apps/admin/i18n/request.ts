// apps/admin/i18n/request.ts  (same path you shared)
import { getUserLocale } from '@/lib/utils/methods/locale';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const FALLBACK_LOCALE = 'en';
  const SUPPORTED_LOCALES = ['en', 'ar', 'fr', 'km', 'zh', 'he'] as const;

  // 1) Get locale safely
  let locale = FALLBACK_LOCALE;
  try {
    const detected = await getUserLocale();
    if (detected && SUPPORTED_LOCALES.includes(detected as typeof SUPPORTED_LOCALES[number])) {
      locale = detected;
    }
  } catch {
    // ignore and keep fallback
  }

  // 2) Load messages with fallback
  const loadMessages = async (l: string) =>
    (await import(`../locales/${l}.json`)).default;

  try {
    const messages = await loadMessages(locale);
    return {
      locale,
      messages,
      timeZone: 'Africa/Cairo', // ✅ fixes ENVIRONMENT_FALLBACK / hydration TZ mismatch
      now: new Date(),          // ✅ keeps server/client in sync for time formatting
    };
  } catch {
    const messages = await loadMessages(FALLBACK_LOCALE);
    return {
      locale: FALLBACK_LOCALE,
      messages,
      timeZone: 'Africa/Cairo',
      now: new Date(),
    };
  }
});