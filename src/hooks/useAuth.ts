'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { debugLog, debugError } from '@/utils/debug';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugLog('Getting initial session...');
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: oauthSession }, error: oauthError } = await supabase.auth.getSession();

      debugLog('Initial session result:', { session: oauthSession, error: oauthError });

      if (oauthError) {
        debugError('Session error:', oauthError);
      }

      setSession(oauthSession);
      setUser(oauthSession?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugLog('Auth state changed:', { event, session: !!session, user: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    isSignedIn: !!user,
  };
} 