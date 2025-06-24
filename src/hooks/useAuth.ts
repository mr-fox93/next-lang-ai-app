'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user - secure way
    const getUser = async () => {
      try {
        // Use getUser() instead of getSession() for security
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        // Handle auth-related errors - session missing is normal when logged out
        if (error) {
          if (error.message?.includes('session_missing') || error.message?.includes('AuthSessionMissingError')) {
            // User is not logged in - this is normal, not an error
            setUser(null);
          } else {
            // Real auth error - log it
            console.error('Auth error:', error);
            setUser(null);
          }
        } else {
          setUser(currentUser);
        }
        
        setLoading(false);
      } catch (err) {
        // Handle any other exceptions
        console.error('Failed to get user:', err);
        setUser(null);
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return {
    user,
    isSignedIn: !!user,
    loading,
  };
} 