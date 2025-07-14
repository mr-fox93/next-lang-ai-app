import { AuthService } from '@/core/services/AuthService';
import { SignInWithOtpResult } from '@/core/interfaces/services/AuthService';

export interface SignInWithOtpParams {
  email: string;
}

export class SignInWithOtpUseCase {
  constructor(private authService: AuthService) {}

  async execute(params: SignInWithOtpParams): Promise<SignInWithOtpResult> {
    const { email } = params;

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        error: {
          message: 'Invalid email address',
          code: 'INVALID_EMAIL'
        }
      };
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    try {
      return await this.authService.signInWithOtp(normalizedEmail);
    } catch (error) {
      console.error('SignInWithOtpUseCase error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during sign in',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }
} 