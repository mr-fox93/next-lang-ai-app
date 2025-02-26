import { auth } from "@clerk/nextjs/server";
import { getUserFlashcardsUseCase } from "@/lib/container";

export async function getFlashcardsForUser() {
  const { userId } = await auth();
  return await getUserFlashcardsUseCase().execute(userId || '');
} 