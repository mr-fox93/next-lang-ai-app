import { AuthService } from '@/core/services/AuthService';
import { SignInWithOAuthResult } from '@/core/interfaces/services/AuthService';

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
  redirectUrl?: string;
}

export class SignInWithOAuthUseCase {
  constructor(private authService: AuthService) {}

  async execute(params: SignInWithOAuthParams): Promise<SignInWithOAuthResult> {
    const { provider, redirectUrl } = params;

    // Validate provider
    if (!provider || !['google', 'discord'].includes(provider)) {
      return {
        error: {
          message: 'Invalid OAuth provider',
          code: 'INVALID_PROVIDER'
        }
      };
    }

    try {
      return await this.authService.signInWithOAuth(provider, redirectUrl);
    } catch (error) {
      console.error('SignInWithOAuthUseCase error:', error);
      return {
        error: {
          message: `An unexpected error occurred during ${provider} sign in`,
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }
} 