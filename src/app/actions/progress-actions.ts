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
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true }
    });
    
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
    return {
      success: false,
      error: "Wystąpił błąd podczas pobierania statystyk postępu"
    };
  }
}

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    return {
      success: false,
      error: "Wystąpił błąd podczas pobierania statystyk dziennych",
      data: 0
    };
  }
}

export async function updateDailyGoalAction(newGoal: number) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Nie jesteś zalogowany"
      };
    }

    if (newGoal < 1 || newGoal > 100) {
      return {
        success: false,
        error: "Nieprawidłowa wartość celu dziennego (1-100)"
      };
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { dailyGoal: newGoal }
    });
    
    return {
      success: true,
      message: "Dzienny cel został zaktualizowany"
    };
  } catch (error) {
    return {
      success: false,
      error: "Wystąpił błąd podczas aktualizacji dziennego celu"
    };
  }
} 