import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';

export default getRequestConfig(async ({locale}) => {
  // Make sure locale is never undefined
  const resolvedLocale = locale || routing.defaultLocale;
  
  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
}); 