import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {locales, defaultLocale} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested)
    ? requested
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
}); 