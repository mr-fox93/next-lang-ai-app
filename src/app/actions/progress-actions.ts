"use server";

import { auth } from "@clerk/nextjs/server";
import { getUpdateFlashcardProgressUseCase, getUserProgressStatsUseCase } from "@/lib/container";
import prisma from "@/lib/prisma";

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
    
    // Pobranie dziennego celu użytkownika
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true }
    });
    
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
        nextLevelPoints,
        dailyGoal: user?.dailyGoal || 10
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

/**
 * Funkcja zliczająca liczbę fiszek przejrzanych przez użytkownika dzisiaj
 * Wykorzystuje pole lastReviewed w tabeli Progress
 */
export async function getReviewedTodayCountAction() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Nie jesteś zalogowany",
        data: 0
      };
    }

    // Ustawienie daty początku dzisiejszego dnia (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Pobierz wszystkie rekordy postępu z dzisiaj
    const reviewedToday = await prisma.progress.count({
      where: {
        userId: userId,
        lastReviewed: {
          gte: today
        }
      }
    });
    
    return {
      success: true,
      data: reviewedToday
    };
  } catch (error) {
    console.error("Błąd pobierania liczby dzisiejszych fiszek:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas pobierania statystyk dziennych",
      data: 0
    };
  }
}

/**
 * Funkcja do aktualizacji dziennego celu użytkownika
 */
export async function updateDailyGoalAction(newGoal: number) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Nie jesteś zalogowany"
      };
    }

    // Sprawdzenie poprawności wartości
    if (newGoal < 1 || newGoal > 100) {
      return {
        success: false,
        error: "Nieprawidłowa wartość celu dziennego (1-100)"
      };
    }
    
    // Aktualizacja dziennego celu użytkownika
    await prisma.user.update({
      where: { id: userId },
      data: { dailyGoal: newGoal }
    });
    
    return {
      success: true,
      message: "Dzienny cel został zaktualizowany"
    };
  } catch (error) {
    console.error("Błąd aktualizacji dziennego celu:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas aktualizacji dziennego celu"
    };
  }
} 