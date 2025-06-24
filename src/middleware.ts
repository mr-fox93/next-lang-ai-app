import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { demoModeService } from './core/useCases/session';

// Create the next-intl middleware
const handleI18nRouting = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip i18n routing for auth endpoints
  if (pathname.startsWith('/auth/')) {
    // Create simple response for auth endpoints
    const response = NextResponse.next();
    
    // Still handle Supabase session for auth endpoints
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    try {
      await supabase.auth.getUser();
    } catch (error) {
      // Only log real errors, not session missing (normal when logged out)
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('session_missing') && !errorMessage.includes('AuthSessionMissingError')) {
        console.error('Auth endpoint session error:', error);
      }
    }

    return response;
  }
  
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

  // Create response for i18n first
  const response = handleI18nRouting(req);

  // Create Supabase client for middleware with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh user authentication and update cookies
  try {
    await supabase.auth.getUser();
  } catch (error) {
    // Only log real errors, not session missing (normal when logged out)
    const errorMessage = error instanceof Error ? error.message : '';
    if (!errorMessage.includes('session_missing') && !errorMessage.includes('AuthSessionMissingError')) {
      console.error('Middleware session error:', error);
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)' // next-intl matcher
  ]
};
