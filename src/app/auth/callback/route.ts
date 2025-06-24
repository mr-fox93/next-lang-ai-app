import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Auth callback called');
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  console.log('Auth callback params:', { 
    hasCode: !!code, 
    hasTokenHash: !!token_hash, 
    type 
  });

  const supabase = await createClient()

  // Handle magic link verification
  if (token_hash && type) {
    console.log('Processing magic link verification');
    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'email',
      })

      console.log('Magic link verification:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error 
      });

      if (error) {
        console.error('Magic link verification error:', error);
        return NextResponse.redirect(new URL('/en/sign-in?error=magic_link_error', request.url))
      }

      if (session?.user) {
        console.log('Magic link successful, redirecting to flashcards');
        return NextResponse.redirect(new URL('/en/flashcards', request.url))
      }
    } catch (err) {
      console.error('Magic link callback exception:', err);
      return NextResponse.redirect(new URL('/en/sign-in?error=magic_link_exception', request.url))
    }
  }

  // Handle OAuth code exchange
  if (code) {
    console.log('Processing OAuth code exchange');
    try {
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
        console.log('OAuth successful, redirecting to flashcards');
        return NextResponse.redirect(new URL('/en/flashcards', request.url))
      }
    } catch (err) {
      console.error('OAuth callback exception:', err);
      return NextResponse.redirect(new URL('/en/sign-in?error=oauth_exception', request.url))
    }
  }

  // If no code or token_hash, or authentication failed, redirect to sign-in
  console.log('Auth callback failed, redirecting to sign-in');
  return NextResponse.redirect(new URL('/en/sign-in', request.url))
} 