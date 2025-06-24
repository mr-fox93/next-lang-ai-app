import { createClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoUserId } from "./demo-helpers";

export async function auth() {
  // Check if in demo mode
  if (await isDemoMode()) {
    // Demo mode - return demo userId in demo format
    return { 
      userId: getDemoUserId(),
      user: null,
    };
  } else {
    try {
      // Normal mode - use Supabase auth with secure getUser()
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Handle auth-related errors - session missing is normal when logged out
      if (error) {
        if (error.message?.includes('session_missing') || error.message?.includes('AuthSessionMissingError')) {
          // User is not logged in - this is normal, not an error
          return {
            userId: null,
            user: null,
          };
        } else {
          // Real auth error - log it
          console.error('Server auth error:', error);
          return {
            userId: null,
            user: null,
          };
        }
      }
      
      return {
        userId: user?.id || null,
        user: user || null,
      };
    } catch (err) {
      console.error('Server auth exception:', err);
      return {
        userId: null,
        user: null,
      };
    }
  }
} 