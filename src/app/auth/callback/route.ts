import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect')

  const supabase = await createClient()

  // Default redirect path
  const defaultRedirect = '/en/flashcards'
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
        return NextResponse.redirect(new URL(targetRedirect, request.url))
      }
          } catch {
        return NextResponse.redirect(new URL('/en/sign-in?error=oauth_exception', request.url))
    }
  }

  // If no code or token_hash, or authentication failed, redirect to sign-in
  return NextResponse.redirect(new URL('/en/sign-in', request.url))
} 