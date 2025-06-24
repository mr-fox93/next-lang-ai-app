'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user - secure way with full error handling
    const getUser = async () => {
      try {
        // Use getUser() instead of getSession() for security
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          // Any auth error when not logged in is normal - don't log it
          setUser(null);
        } else {
          setUser(currentUser);
        }
        
        setLoading(false);
      } catch {
        // Any exception when checking auth is normal when not logged in
        // Could be AuthSessionMissingError or any other auth-related error
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