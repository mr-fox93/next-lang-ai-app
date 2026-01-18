import { auth } from "@/lib/auth";
import { getUserFlashcardsUseCase, getUserFavoritesUseCase } from "@/lib/container";
import {
  getUserProgressStatsAction,
  getMasteredCategoriesAction,
} from "@/app/actions/progress-actions";

export async function getFlashcardsForUser() {
  const { userId } = await auth();
  return await getUserFlashcardsUseCase().execute(userId || "");
}

export async function getFavoriteFlashcardIdsForUser() {
  const { userId } = await auth();
  const result = await getUserFavoritesUseCase().execute(userId || "");

  if (result.error) {
    return { favoriteIds: [], error: result.error };
  }

  return { favoriteIds: result.favorites.map((favorite) => favorite.flashcardId) };
}

export async function getProgressStatsForUser() {
  return await getUserProgressStatsAction();
}

export async function getMasteredCategoriesForUser() {
  return await getMasteredCategoriesAction();
}
