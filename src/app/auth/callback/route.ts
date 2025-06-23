import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('OAuth callback called');
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/flashcards'

  console.log('OAuth callback params:', { code: !!code, next });

  if (code) {
    try {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('OAuth session exchange:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error 
      });

      if (error) {
        console.error('OAuth session exchange error:', error);
        return NextResponse.redirect(new URL('/en/sign-in?error=oauth_error', request.url))
      }

      if (session?.user) {
        console.log('OAuth successful, redirecting to:', next);
        const redirectUrl = next.startsWith('/') ? `/en${next}` : `/en/${next}`;
        console.log('Final redirect URL:', redirectUrl);
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    } catch (err) {
      console.error('OAuth callback exception:', err);
      return NextResponse.redirect(new URL('/en/sign-in?error=oauth_exception', request.url))
    }
  }

  // If no code or session failed, redirect to sign-in
  console.log('OAuth callback failed, redirecting to sign-in');
  return NextResponse.redirect(new URL('/en/sign-in', request.url))
} 