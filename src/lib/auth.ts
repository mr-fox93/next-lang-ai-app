import { createClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoUserId } from "./demo-helpers";
import { debugLog, debugError } from '@/utils/debug';

export async function auth() {
  debugLog('Server-side auth() called');
  
  // Check if in demo mode
  if (await isDemoMode()) {
    debugLog('Demo mode detected');
    // Demo mode - return demo userId in demo format
    return { 
      userId: getDemoUserId(),
      user: null,
    };
  } else {
    debugLog('Normal mode - checking Supabase auth');
    try {
      // Normal mode - use Supabase auth
      const supabase = await createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      debugLog('Server auth result:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userId: session?.user?.id,
        error 
      });
      
      if (error) {
        debugError('Server auth error:', error);
      }
      
      return {
        userId: session?.user?.id || null,
        user: session?.user || null,
      };
    } catch (err) {
      debugError('Server auth exception:', err);
      return {
        userId: null,
        user: null,
      };
    }
  }
} 