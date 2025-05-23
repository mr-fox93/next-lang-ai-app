import { getDemoFlashcardsUseCase } from "@/lib/container";
import { ProgressActionResult } from "@/types/progress";

export async function getDemoFlashcards() {
  try {
    const useCase = getDemoFlashcardsUseCase();
    const result = await useCase.execute();
    return result;
  } catch (error) {
    console.error("Demo flashcards error:", error);
    return {
      flashcards: [],
      error: "Failed to load demo flashcards",
    };
  }
}

export async function getDemoProgressStats(): Promise<ProgressActionResult> {
  return {
    success: true,
    data: {
      totalFlashcards: 0,
      masteredFlashcards: 0,
      inProgressFlashcards: 0,
      untouchedFlashcards: 0,
      categories: [],
      userLevel: 1,
      experiencePoints: 0,
      nextLevelPoints: 100,
      dailyGoal: 5,
    },
    error: undefined,
  };
} 