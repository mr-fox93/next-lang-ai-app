'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { debugLog, debugError } from '@/utils/debug';

export function useSupabase() {
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      debugError('Sign out error:', error);
    }
    router.push('/');
  };

  const signInWithEmail = async (email: string, password: string) => {
    debugLog('Attempting sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    debugLog('Sign in result:', { data, error });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string, options?: {
    data?: {
      full_name?: string;
      username?: string;
    };
  }) => {
    debugLog('Attempting sign up with email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/flashcards')}`,
      },
    });
    
    debugLog('Sign up result:', { data, error });
    
    // If sign up was successful but user needs to confirm email
    if (data.user && !data.session && !error) {
      return { 
        data, 
        error: { 
          message: 'Please check your email and click the confirmation link to complete registration.' 
        } 
      };
    }
    
    return { data, error };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    debugLog('Attempting OAuth sign in with:', provider);
    
    const nextUrl = `/flashcards`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });
    debugLog('OAuth result:', { data, error });
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    debugLog('Attempting password reset for email:', email);
    
    // Build locale-aware redirect: {origin}/{locale?}/reset-password
    const { origin, pathname } = window.location;
    const localeSegment = pathname.split('/')[1]; // e.g. "en", "pl"
    const localePrefix = localeSegment && localeSegment.length <= 5 ? `/${localeSegment}` : '';
    const redirectUrl = `${origin}${localePrefix}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    debugLog('Password reset result:', { error });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    debugLog('Attempting password update');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    debugLog('Password update result:', { data, error });
    return { data, error };
  };

  return {
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    supabase,
  };
} 