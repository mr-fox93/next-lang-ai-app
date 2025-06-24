'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useSupabase() {
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    router.push('/');
  };

  const signInWithMagicLink = async (email: string) => {
    console.log('Attempting magic link sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    console.log('Magic link result:', { data, error });
    return { data, error };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    console.log('Attempting OAuth sign in with:', provider);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    console.log('OAuth result:', { data, error });
    return { data, error };
  };

  return {
    signOut,
    signInWithMagicLink,
    signInWithOAuth,
    supabase,
  };
} 