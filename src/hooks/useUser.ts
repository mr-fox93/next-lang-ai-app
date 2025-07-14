'use client';

import { useAuth } from './useAuth';

export function useUser() {
  const { user, isSignedIn, loading } = useAuth();

  return {
    user: user ? {
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      primaryEmailAddress: {
        emailAddress: user.email || '',
      },
    } : null,
    isSignedIn,
    isLoaded: !loading,
  };
} 