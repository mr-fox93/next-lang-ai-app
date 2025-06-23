/**
 * Simple demo mode helpers
 * Eliminates code duplication without over-engineering
 */

import { cookies } from "next/headers";

export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('demo_mode')?.value === 'true';
}

export function getDemoUserId(): string | null {
  return process.env.DEMO_USER_ID || null;
} 