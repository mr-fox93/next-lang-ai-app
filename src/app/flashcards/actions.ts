import { auth } from "@clerk/nextjs/server";
import { getUserFlashcardsUseCase } from "@/lib/container";
import { getUserProgressStatsAction } from "@/app/actions/progress-actions";

export async function getFlashcardsForUser() {
  const { userId } = await auth();
  return await getUserFlashcardsUseCase().execute(userId || '');
}

// Nowa funkcja do pobierania statystyk postępu bezpośrednio z serwera
export async function getProgressStatsForUser() {
  return await getUserProgressStatsAction();
} 