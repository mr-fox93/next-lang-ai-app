import { auth as clerkAuth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function auth() {
  // Sprawdź czy to tryb demo
  const cookieStore = await cookies();
  const isDemoMode = cookieStore.get('demo_mode')?.value === 'true';
  
  if (isDemoMode) {
    // Tryb demo - zwróć demo userId w formacie Clerk
    return { 
      userId: process.env.DEMO_USER_ID || null,
      // Dodaj inne pola jeśli potrzeba w przyszłości
    };
  } else {
    // Normalny tryb - użyj oryginalnego Clerk auth
    return await clerkAuth();
  }
} 