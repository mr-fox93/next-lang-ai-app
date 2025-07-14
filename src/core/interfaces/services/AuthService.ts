export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignInWithOtpResult {
  error?: AuthError;
  data?: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
}

export interface SignInWithOAuthResult {
  error?: AuthError;
  data?: {
    url?: string;
    user?: AuthUser;
    session?: AuthSession;
  };
}

export interface VerifyOtpResult {
  error?: AuthError;
  data?: {
    user: AuthUser;
    session: AuthSession;
  };
}

export interface AuthService {
  signInWithOtp(email: string): Promise<SignInWithOtpResult>;
  
  signInWithOAuth(provider: 'google' | 'discord', redirectUrl?: string): Promise<SignInWithOAuthResult>;
  
  verifyOtp(email: string, token: string): Promise<VerifyOtpResult>;
  
  exchangeCodeForSession(code: string): Promise<VerifyOtpResult>;
  
  verifyOtpWithTokenHash(tokenHash: string, type: 'email'): Promise<VerifyOtpResult>;
  
  getCurrentUser(): Promise<AuthUser | null>;
  
  signOut(): Promise<void>;
} 