/**
 * Simple demo mode helpers for server-side usage
 * Uses the centralized demoModeService for consistency
 */

import { cookies } from "next/headers";
import { demoModeService } from "@/core/useCases/session/demo-mode.service";

export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
  return demoModeService.isDemoMode(cookieString);
}

export function getDemoUserId(): string | null {
  return process.env.DEMO_USER_ID || null;
} 