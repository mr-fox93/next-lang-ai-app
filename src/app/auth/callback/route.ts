import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Secure logging helper
const secureLog = (message: string, data?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] ${message}`, data || '');
  }
}

export async function GET(request: NextRequest) {
  secureLog('Auth callback initiated');
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  secureLog('Auth callback params received', { 
    hasCode: !!code, 
    hasTokenHash: !!token_hash, 
    type: type || 'none' 
  });

  const supabase = await createClient()

  // Handle magic link verification
  if (token_hash && type) {
    secureLog('Processing magic link verification');
    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'email',
      })

      if (error) {
        secureLog('Magic link verification failed', { 
          errorCode: error.message?.substring(0, 50) // Only log first 50 chars
        });
        return NextResponse.redirect(new URL('/en/sign-in?error=magic_link_error', request.url))
      }

      if (session?.user) {
        secureLog('Magic link verification successful');
        return NextResponse.redirect(new URL('/en/flashcards', request.url))
      }
    } catch (_err: unknown) {
      secureLog('Magic link callback exception');
      return NextResponse.redirect(new URL('/en/sign-in?error=magic_link_exception', request.url))
    }
  }

  // Handle OAuth code exchange
  if (code) {
    secureLog('Processing OAuth code exchange');
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        secureLog('OAuth session exchange failed', { 
          errorCode: error.message?.substring(0, 50) // Only log first 50 chars  
        });
        return NextResponse.redirect(new URL('/en/sign-in?error=oauth_error', request.url))
      }

      if (session?.user) {
        secureLog('OAuth authentication successful');
        return NextResponse.redirect(new URL('/en/flashcards', request.url))
      }
    } catch (_err: unknown) {
      secureLog('OAuth callback exception');
      return NextResponse.redirect(new URL('/en/sign-in?error=oauth_exception', request.url))
    }
  }

  // If no code or token_hash, or authentication failed, redirect to sign-in
  secureLog('Auth callback completed - redirecting to sign-in');
  return NextResponse.redirect(new URL('/en/sign-in', request.url))
} 