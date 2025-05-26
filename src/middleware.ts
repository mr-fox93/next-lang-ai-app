import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { demoModeService } from './core/useCases/session';

// Create the next-intl middleware
const handleI18nRouting = createMiddleware(routing);

// Optional: Create a route matcher for protected routes
// const isProtectedRoute = createRouteMatcher(['/(.*)dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  // Handle demo mode auto-logout logic
  const cookies = req.headers.get('cookie') || '';
  const pathname = req.nextUrl.pathname;
  
  // Check if demo mode should be automatically logged out
  if (demoModeService.shouldAutoLogout(pathname, cookies)) {
    // Get the i18n response first
    const response = handleI18nRouting(req);
    
    // Add the demo mode clear cookie to the response
    response.headers.set('Set-Cookie', demoModeService.clearDemoMode());
    
    return response;
  }

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
