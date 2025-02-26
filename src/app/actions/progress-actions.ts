"use server";

import { auth } from "@clerk/nextjs/server";
import { getUpdateFlashcardProgressUseCase, getUserProgressStatsUseCase } from "@/lib/container";

interface UpdateProgressActionParams {
  flashcardId: number;
  isCorrect: boolean;
}

export async function updateFlashcardProgressAction(params: UpdateProgressActionParams) {
  try {
    const { flashcardId, isCorrect } = params;
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Nie jesteś zalogowany"
      };
    }

    const updateParams = {
      flashcardId,
      userId,
      isCorrect
    };

    const result = await getUpdateFlashcardProgressUseCase().execute(updateParams);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Błąd aktualizacji postępu:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas aktualizacji postępu"
    };
  }
}

export async function getUserProgressStatsAction() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Nie jesteś zalogowany"
      };
    }

    const stats = await getUserProgressStatsUseCase().execute(userId);
    
    // Obliczanie poziomu użytkownika w oparciu o opanowane fiszki
    const userLevel = Math.max(1, Math.floor(stats.masteredFlashcards / 10) + 1);
    const experiencePoints = stats.masteredFlashcards * 50;
    const nextLevelPoints = userLevel * 500;
    
    return {
      success: true,
      data: {
        ...stats,
        userLevel,
        experiencePoints,
        nextLevelPoints
      }
    };
  } catch (error) {
    console.error("Błąd pobierania statystyk postępu:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas pobierania statystyk postępu"
    };
  }
} 