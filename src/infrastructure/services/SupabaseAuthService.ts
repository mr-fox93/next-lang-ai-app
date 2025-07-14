import { AuthService } from '@/core/services/AuthService';
import { 
  AuthUser, 
  SignInWithOtpResult, 
  SignInWithOAuthResult, 
  VerifyOtpResult 
} from '@/core/interfaces/services/AuthService';
import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

export class SupabaseAuthService extends AuthService {
  private supabase = createClient();

  async signInWithOtp(email: string): Promise<SignInWithOtpResult> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      return {
        data: {
          user: null, // OTP doesn't return user immediately
          session: null
        }
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }

  async signInWithOAuth(provider: 'google' | 'discord', redirectUrl?: string): Promise<SignInWithOAuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      return {
        data: {
          url: data.url,
          user: undefined, // OAuth redirect doesn't return user immediately
          session: undefined
        }
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }

  async verifyOtp(email: string, token: string): Promise<VerifyOtpResult> {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      if (!data.user || !data.session) {
        return {
          error: {
            message: 'Authentication failed',
            code: 'AUTH_FAILED'
          }
        };
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name
          },
          session: {
            user: {
              id: data.user.id,
              email: data.user.email || '',
              fullName: data.user.user_metadata?.full_name
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token || ''
          }
        }
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }

  async exchangeCodeForSession(code: string): Promise<VerifyOtpResult> {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      if (!data.user || !data.session) {
        return {
          error: {
            message: 'Authentication failed',
            code: 'AUTH_FAILED'
          }
        };
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name
          },
          session: {
            user: {
              id: data.user.id,
              email: data.user.email || '',
              fullName: data.user.user_metadata?.full_name
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token || ''
          }
        }
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }

  async verifyOtpWithTokenHash(tokenHash: string, type: 'email'): Promise<VerifyOtpResult> {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      if (!data.user || !data.session) {
        return {
          error: {
            message: 'Authentication failed',
            code: 'AUTH_FAILED'
          }
        };
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name
          },
          session: {
            user: {
              id: data.user.id,
              email: data.user.email || '',
              fullName: data.user.user_metadata?.full_name
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token || ''
          }
        }
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'UNEXPECTED_ERROR'
        }
      };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
} 