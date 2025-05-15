import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/routing';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // This is a list of routes that should not be internationalized
  localePrefix: 'as-needed'
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
