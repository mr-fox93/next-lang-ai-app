'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useSupabase() {
  const supabase = createClient();
  const router = useRouter();

  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
    
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    
    let callbackUrl = `${window.location.origin}/auth/callback`;
    if (redirectParam) {
      callbackUrl += `?redirect=${encodeURIComponent(redirectParam)}`;
    }
    
    return callbackUrl;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    router.push('/');
  };

  // OTP Code (for mobile-friendly authentication)
  const signInWithOtpCode = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // NO emailRedirectTo = sends OTP code instead of magic link
      },
    });
    return { data, error };
  };

  // Verify OTP Code
  const verifyOtpCode = async (email: string, code: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    return { data, error };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl(),
      },
    });
    return { data, error };
  };

  return {
    signOut,
    signInWithOtpCode,
    verifyOtpCode,
    signInWithOAuth,
    supabase,
  };
} 