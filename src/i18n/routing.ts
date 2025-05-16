import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'pl', 'es', 'it'];
export const defaultLocale = 'en';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale
}); 