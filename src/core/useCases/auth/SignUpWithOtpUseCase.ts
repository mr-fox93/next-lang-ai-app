import { AuthService } from '@/core/services/AuthService';
import { SignInWithOtpResult } from '@/core/interfaces/services/AuthService';

export interface SignUpWithOtpParams {
  email: string;
  fullName?: string;
}

export class SignUpWithOtpUseCase {
  constructor(private authService: AuthService) {}

  async execute(params: SignUpWithOtpParams): Promise<SignInWithOtpResult> {
    const { email, fullName } = params;

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        error: {
          message: 'Invalid email address',
          code: 'INVALID_EMAIL'
        }
      };
    }

    // Validate full name if provided
    if (fullName && fullName.trim().length < 2) {
      return {
        error: {
          message: 'Full name must be at least 2 characters long',
          code: 'INVALID_FULLNAME'
        }
      };
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // For sign up, we use the same OTP mechanism as sign in
      // The difference is handled on the frontend (showing "Create account" vs "Sign in")
      return await this.authService.signInWithOtp(normalizedEmail);
    } catch (error) {
      console.error('SignUpWithOtpUseCase error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during sign up',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }
} 