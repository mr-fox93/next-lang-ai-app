import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function isWebView(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  
  // iOS WebViews
  const isIOSWebView = 
    /iphone|ipad|ipod/.test(ua) && (
      /instagram/.test(ua) ||
      /fbav|fban/.test(ua) ||
      /twitter/.test(ua) ||
      /gsa\//.test(ua) ||
      (!/safari/.test(ua) && /mobile/.test(ua)) ||
      /wkwebview/.test(ua)
    );
  
  // Android WebViews
  const isAndroidWebView = 
    /android/.test(ua) && (
      /fb_iab|fbav/.test(ua) ||
      /instagram/.test(ua) ||
      /twitter/.test(ua) ||
      /gsa\//.test(ua) ||
      /wv\)/.test(ua)
    );
  
  return isIOSWebView || isAndroidWebView;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect')

  // Detect WebView for mobile instructions
  const userAgent = request.headers.get('user-agent') || '';
  const isInWebView = isWebView(userAgent);

  const supabase = await createClient()

  // Default redirect paths
  const defaultRedirect = '/en/flashcards'
  const mobileHelpRedirect = '/en/mobile-auth-help?from=callback'
  const targetRedirect = redirectTo || defaultRedirect

  // Handle magic link verification
  if (token_hash && type) {
    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'email',
      })

      if (error) {
        return NextResponse.redirect(new URL('/en/sign-in?error=magic_link_error', request.url))
      }

      if (session?.user) {
        // If user authenticated successfully but is in WebView, show mobile instructions
        if (isInWebView) {
          return NextResponse.redirect(new URL(mobileHelpRedirect, request.url))
        }
        return NextResponse.redirect(new URL(targetRedirect, request.url))
      }
          } catch {
        return NextResponse.redirect(new URL('/en/sign-in?error=magic_link_exception', request.url))
    }
  }

  // Handle OAuth code exchange
  if (code) {
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        return NextResponse.redirect(new URL('/en/sign-in?error=oauth_error', request.url))
      }

      if (session?.user) {
        // If user authenticated successfully but is in WebView, show mobile instructions
        if (isInWebView) {
          return NextResponse.redirect(new URL(mobileHelpRedirect, request.url))
        }
        return NextResponse.redirect(new URL(targetRedirect, request.url))
      }
          } catch {
        return NextResponse.redirect(new URL('/en/sign-in?error=oauth_exception', request.url))
    }
  }

  // If no code or token_hash, or authentication failed, redirect to sign-in
  return NextResponse.redirect(new URL('/en/sign-in', request.url))
} 