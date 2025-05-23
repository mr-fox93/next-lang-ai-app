import { auth } from "@/lib/auth";
import { getUserFlashcardsUseCase } from "@/lib/container";
import {
  getUserProgressStatsAction,
  getMasteredCategoriesAction,
} from "@/app/actions/progress-actions";

export async function getFlashcardsForUser() {
  const { userId } = await auth();
  return await getUserFlashcardsUseCase().execute(userId || "");
}

export async function getProgressStatsForUser() {
  return await getUserProgressStatsAction();
}

export async function getMasteredCategoriesForUser() {
  return await getMasteredCategoriesAction();
}
