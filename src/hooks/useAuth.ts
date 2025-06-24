'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Secure logging helper
const secureLog = (message: string, data?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] ${message}`, data || '');
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      secureLog('Getting initial session');
      try {
        // First check if this is an OAuth callback
        const { data: { session: oauthSession }, error: oauthError } = await supabase.auth.getSession();
        
        // Handle OAuth callback from URL hash
        if (window.location.hash && window.location.hash.includes('access_token')) {
          secureLog('Handling OAuth callback');
          const { data: { session: callbackSession }, error: callbackError } = await supabase.auth.getSession();
          
          if (callbackError) {
            secureLog('OAuth callback error', { errorCode: callbackError.message?.substring(0, 50) });
          }
          
          if (callbackSession?.user) {
            setUser(callbackSession.user);
            setLoading(false);
            // Clean up the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
            secureLog('OAuth callback successful');
            return;
          }
        }
        
        if (oauthError) {
          secureLog('Session error', { errorCode: oauthError.message?.substring(0, 50) });
        } else {
          secureLog('Initial session retrieved', { hasUser: !!oauthSession?.user });
        }
        
        setUser(oauthSession?.user || null);
        setLoading(false);
      } catch (_err) {
        secureLog('Failed to get session');
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        secureLog('Auth state changed', { event, hasSession: !!session, hasUser: !!session?.user });
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