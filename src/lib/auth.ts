import { auth as clerkAuth } from "@clerk/nextjs/server";
import { isDemoMode, getDemoUserId } from "./demo-helpers";

export async function auth() {
  // Check if in demo mode
  if (await isDemoMode()) {
    // Demo mode - return demo userId in Clerk format
    return { 
      userId: getDemoUserId(),
    };
  } else {
    // Normal mode - use original Clerk auth
    return await clerkAuth();
  }
} 