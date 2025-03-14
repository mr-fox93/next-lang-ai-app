import { auth } from "@clerk/nextjs/server";
import { getUserFlashcardsUseCase } from "@/lib/container";
import { getUserProgressStatsAction } from "@/app/actions/progress-actions";

export async function getFlashcardsForUser() {
  const { userId } = await auth();
  return await getUserFlashcardsUseCase().execute(userId || "");
}

export async function getProgressStatsForUser() {
  return await getUserProgressStatsAction();
}
