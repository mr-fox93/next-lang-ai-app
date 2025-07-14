import { AuthService } from '@/core/services/AuthService';
import { VerifyOtpResult } from '@/core/interfaces/services/AuthService';

export interface VerifyOtpParams {
  email: string;
  token: string;
}

export class VerifyOtpUseCase {
  constructor(private authService: AuthService) {}

  async execute(params: VerifyOtpParams): Promise<VerifyOtpResult> {
    const { email, token } = params;

    // Validate inputs
    if (!email || !email.includes('@')) {
      return {
        error: {
          message: 'Invalid email address',
          code: 'INVALID_EMAIL'
        }
      };
    }

    if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
      return {
        error: {
          message: 'Invalid verification code. Code must be 6 digits.',
          code: 'INVALID_CODE'
        }
      };
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    try {
      return await this.authService.verifyOtp(normalizedEmail, token);
    } catch (error) {
      console.error('VerifyOtpUseCase error:', error);
      return {
        error: {
          message: 'An unexpected error occurred during verification',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }
} 