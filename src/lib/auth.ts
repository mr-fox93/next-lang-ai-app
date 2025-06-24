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
      // Normal mode - use Supabase auth
      const supabase = await createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Server auth error:', error);
      }
      
      return {
        userId: session?.user?.id || null,
        user: session?.user || null,
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