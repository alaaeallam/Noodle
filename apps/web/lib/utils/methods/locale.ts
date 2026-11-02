'use server';

import { cookies } from 'next/headers';
import { TLocale } from '../types/locale';
import { DEFAULT_LOCALE } from '../constants';
import { locales } from '@/config';


const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const locale = (await cookies()).get(COOKIE_NAME)?.value;
  // Unknown values would make i18n/request.ts import a missing JSON file.
  return locale && locales.includes(locale) ? locale : DEFAULT_LOCALE;
}

export async function setUserLocale(locale: TLocale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
