import { 
  AuthService as IAuthService,
  AuthUser,
  SignInWithOtpResult,
  SignInWithOAuthResult,
  VerifyOtpResult
} from '@/core/interfaces/services/AuthService';

export abstract class AuthService implements IAuthService {
  abstract signInWithOtp(email: string): Promise<SignInWithOtpResult>;
  
  abstract signInWithOAuth(provider: 'google' | 'discord', redirectUrl?: string): Promise<SignInWithOAuthResult>;
  
  abstract verifyOtp(email: string, token: string): Promise<VerifyOtpResult>;
  
  abstract exchangeCodeForSession(code: string): Promise<VerifyOtpResult>;
  
  abstract verifyOtpWithTokenHash(tokenHash: string, type: 'email'): Promise<VerifyOtpResult>;
  
  abstract getCurrentUser(): Promise<AuthUser | null>;
  
  abstract signOut(): Promise<void>;
} 