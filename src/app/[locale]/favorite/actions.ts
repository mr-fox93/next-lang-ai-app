import { auth } from "@/lib/auth";
import { getUserFavoritesUseCase, getUserFlashcardsUseCase } from "@/lib/container";
import { Flashcard } from "@/core/entities/Flashcard";
import { getUserProgressStatsAction } from "@/app/actions/progress-actions";
import { isDemoMode } from "@/lib/demo-helpers";

export async function getFavoriteFlashcardsForUser(): Promise<{ flashcards: Flashcard[]; error?: string }> {
  const { userId } = await auth();
  if (await isDemoMode()) {
    return await getUserFlashcardsUseCase().execute(userId || "");
  }
  const result = await getUserFavoritesUseCase().execute(userId || "");

  if (result.error) {
    return { flashcards: [], error: result.error };
  }

  return {
    flashcards: result.favorites.map((favorite) => favorite.flashcard)
  };
}

export async function getAllFlashcardsForUser(): Promise<{ flashcards: Flashcard[]; error?: string }> {
  const { userId } = await auth();
  return await getUserFlashcardsUseCase().execute(userId || "");
}

export async function getProgressStatsForUser() {
  return await getUserProgressStatsAction();
}
