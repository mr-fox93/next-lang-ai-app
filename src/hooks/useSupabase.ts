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

  const signInWithEmail = async (email: string, password: string) => {
    console.log('Attempting sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in result:', { data, error });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string, options?: {
    data?: {
      full_name?: string;
      username?: string;
    };
  }) => {
    console.log('Attempting sign up with email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/flashcards')}`,
      },
    });
    
    console.log('Sign up result:', { data, error });
    
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
    console.log('Attempting OAuth sign in with:', provider);
    
    const nextUrl = `/flashcards`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });
    console.log('OAuth result:', { data, error });
    return { data, error };
  };

  return {
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    supabase,
  };
} 