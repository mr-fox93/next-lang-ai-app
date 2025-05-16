import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const handleI18nRouting = createMiddleware(routing);

// Optional: Create a route matcher for protected routes
// const isProtectedRoute = createRouteMatcher(['/(.*)dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  // Optional: Protect specific routes
  // if (isProtectedRoute(req)) {
  //   return auth.protect();
  // }

  return handleI18nRouting(req);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)' // next-intl matcher
  ]
};
