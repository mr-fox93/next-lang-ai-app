import { NextRequest, NextResponse } from 'next/server'
import { getHandleAuthCallbackUseCase } from '@/lib/container'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect')

  const handleAuthCallbackUseCase = getHandleAuthCallbackUseCase()

  try {
    const result = await handleAuthCallbackUseCase.execute({
      code: code || undefined,
      tokenHash: token_hash || undefined,
      type: type || undefined,
      redirectTo: redirectTo || undefined
    })

    return NextResponse.redirect(new URL(result.redirectUrl, request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/en/sign-in?error=unexpected_error', request.url))
  }
} 