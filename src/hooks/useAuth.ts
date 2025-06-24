'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        // First check if this is an OAuth callback
        const { data: { session: oauthSession }, error: oauthError } = await supabase.auth.getSession();
        
        // Handle OAuth callback from URL hash
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const { data: { session: callbackSession } } = await supabase.auth.getSession();
          
          if (callbackSession?.user) {
            setUser(callbackSession.user);
            setLoading(false);
            // Clean up the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }
        
        if (oauthError) {
          console.error('Session error:', oauthError);
        }
        
        setUser(oauthSession?.user || null);
        setLoading(false);
      } catch (err) {
        console.error('Failed to get session:', err);
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

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