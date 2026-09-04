'use server';

import { cookies } from 'next/headers';
import { TLocale } from '../types/locale';
import { DEFAULT_LOCALE } from '../constants';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || DEFAULT_LOCALE;
}

export async function setUserLocale(locale: TLocale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}
