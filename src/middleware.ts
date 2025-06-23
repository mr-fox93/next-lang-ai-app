import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { demoModeService } from './core/useCases/session';

// Create the next-intl middleware
const handleI18nRouting = createMiddleware(routing);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/en',
  '/pl',
  '/de',
  '/fr',
  '/es',
  '/it',
  '/pt',
  '/ru',
  '/zh',
  '/ja',
  '/ko',
  '/ar',
  '/hi',
  '/tr',
  '/nl',
  '/sv',
  '/da',
  '/no',
  '/fi',
  '/el',
  '/he',
  '/th',
  '/vi',
  '/id',
  '/ms',
  '/tl',
  '/cs',
  '/sk',
  '/hu',
  '/ro',
  '/bg',
  '/hr',
  '/sr',
  '/sl',
  '/et',
  '/lv',
  '/lt',
  '/mt',
  '/ca',
  '/eu',
  '/gl',
  '/cy',
  '/ga',
  '/is',
  '/fo',
  '/kl',
  '/sm',
  '/to',
  '/fj',
  '/gu',
  '/haw',
  '/mi',
  '/na',
  '/nr',
  '/nv',
  '/ny',
  '/om',
  '/or',
  '/pa',
  '/ps',
  '/qu',
  '/rn',
  '/rw',
  '/sg',
  '/si',
  '/so',
  '/st',
  '/su',
  '/sw',
  '/ta',
  '/te',
  '/ti',
  '/tk',
  '/tl',
  '/tn',
  '/ts',
  '/tt',
  '/tw',
  '/ug',
  '/uk',
  '/ur',
  '/uz',
  '/ve',
  '/vo',
  '/wa',
  '/wo',
  '/xh',
  '/yi',
  '/yo',
  '/za',
  '/zu',
  '/guest-flashcard(.*)',
  '/privacy-policy',
  '/terms',
  '/(.*)/sign-in(.*)',
  '/(.*)/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/guest(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Handle demo mode auto-logout logic
  const cookies = req.headers.get('cookie') || '';
  
  // Check if demo mode should be automatically logged out
  if (demoModeService.shouldAutoLogout(pathname, cookies)) {
    // Get the i18n response first
    const response = handleI18nRouting(req);
    
    // Add the demo mode clear cookie to the response
    response.headers.set('Set-Cookie', demoModeService.clearDemoMode());
    
    return response;
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ]
};
