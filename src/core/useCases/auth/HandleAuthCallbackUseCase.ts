import { AuthService } from '@/core/services/AuthService';

export interface HandleAuthCallbackParams {
  code?: string;
  tokenHash?: string;
  type?: string;
  redirectTo?: string;
}

export interface HandleAuthCallbackResult {
  success: boolean;
  error?: string;
  redirectUrl: string;
  user?: {
    id: string;
    email: string;
  };
}

export class HandleAuthCallbackUseCase {
  constructor(private authService: AuthService) {}

  async execute(params: HandleAuthCallbackParams): Promise<HandleAuthCallbackResult> {
    const { code, tokenHash, type, redirectTo } = params;

    const defaultRedirect = '/en/flashcards';
    const targetRedirect = redirectTo || defaultRedirect;

    // Handle magic link verification
    if (tokenHash && type) {
      try {
        const result = await this.authService.verifyOtpWithTokenHash(tokenHash, type as 'email');

        if (result.error) {
          return {
            success: false,
            error: result.error.message,
            redirectUrl: '/en/sign-in?error=magic_link_error'
          };
        }

        if (result.data?.user) {
          return {
            success: true,
            redirectUrl: targetRedirect,
            user: {
              id: result.data.user.id,
              email: result.data.user.email
            }
          };
        }
      } catch (error) {
        console.error('Magic link verification error:', error);
        return {
          success: false,
          error: 'Magic link verification failed',
          redirectUrl: '/en/sign-in?error=magic_link_exception'
        };
      }
    }

    // Handle OAuth code exchange
    if (code) {
      try {
        const result = await this.authService.exchangeCodeForSession(code);

        if (result.error) {
          return {
            success: false,
            error: result.error.message,
            redirectUrl: '/en/sign-in?error=oauth_error'
          };
        }

        if (result.data?.user) {
          return {
            success: true,
            redirectUrl: targetRedirect,
            user: {
              id: result.data.user.id,
              email: result.data.user.email
            }
          };
        }
      } catch (error) {
        console.error('OAuth code exchange error:', error);
        return {
          success: false,
          error: 'OAuth authentication failed',
          redirectUrl: '/en/sign-in?error=oauth_exception'
        };
      }
    }

    // If no code or token_hash, or authentication failed
    return {
      success: false,
      error: 'No authentication parameters provided',
      redirectUrl: '/en/sign-in'
    };
  }
} 