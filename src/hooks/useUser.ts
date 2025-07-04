'use client';

import { useAuth } from './useAuth';

export function useUser() {
  const { user, isSignedIn, loading } = useAuth();

  return {
    user: user ? {
      id: user.id,
      primaryEmailAddress: {
        emailAddress: user.email || '',
      },
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      firstName: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
      username: user.user_metadata?.username || user.user_metadata?.preferred_username || user.email?.split('@')[0] || '',
      imageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    } : null,
    isSignedIn,
    isLoaded: !loading,
  };
} 