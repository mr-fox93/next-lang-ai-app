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
      
      // Any auth error is normal when not logged in - don't log it
      if (error) {
        return {
          userId: null,
          user: null,
        };
      }
      
      return {
        userId: user?.id || null,
        user: user || null,
      };
    } catch {
      // Any exception when checking auth is normal when not logged in
      return {
        userId: null,
        user: null,
      };
    }
  }
} 