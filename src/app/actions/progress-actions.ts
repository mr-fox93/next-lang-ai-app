"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getUpdateFlashcardProgressUseCase,
  getUserProgressStatsUseCase,
} from "@/lib/container";
import prisma from "@/lib/prisma";
import { ProgressActionResult } from "@/types/progress";

interface UpdateProgressActionParams {
  flashcardId: number;
  isCorrect: boolean;
}

export async function updateFlashcardProgressAction(
  params: UpdateProgressActionParams
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const { flashcardId, isCorrect } = params;
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    const updateParams = {
      flashcardId,
      userId,
      isCorrect,
    };

    const result = await getUpdateFlashcardProgressUseCase().execute(
      updateParams
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Progress update error:", error);
    return {
      success: false,
      error: `Progress update failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}

export async function getUserProgressStatsAction(): Promise<ProgressActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    const stats = await getUserProgressStatsUseCase().execute(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });

    const userLevel = Math.max(
      1,
      Math.floor(stats.masteredFlashcards / 10) + 1
    );
    const experiencePoints = stats.masteredFlashcards * 50;
    const nextLevelPoints = userLevel * 500;

    return {
      success: true,
      data: {
        ...stats,
        userLevel,
        experiencePoints,
        nextLevelPoints,
        dailyGoal: user?.dailyGoal || 10,
      },
    };
  } catch (error) {
    console.error("Progress stats retrieval error:", error);
    return {
      success: false,
      error: `Failed to retrieve progress statistics: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}

export async function getReviewedTodayCountAction() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
        data: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewedToday = await prisma.progress.count({
      where: {
        userId: userId,
        lastReviewed: {
          gte: today,
        },
      },
    });

    return {
      success: true,
      data: reviewedToday,
    };
  } catch (error) {
    console.error("Daily review count retrieval error:", error);
    return {
      success: false,
      error: `Failed to retrieve daily review count: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
      data: 0,
    };
  }
}

export async function updateDailyGoalAction(newGoal: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    if (newGoal < 1 || newGoal > 100) {
      return {
        success: false,
        error: "Invalid daily goal value: Must be between 1 and 100",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { dailyGoal: newGoal },
    });

    return {
      success: true,
      message: "Daily goal successfully updated",
    };
  } catch (error) {
    console.error("Daily goal update error:", error);
    return {
      success: false,
      error: `Daily goal update failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}

// Funkcja zwracająca kategorie gdzie wszystkie fiszki są już opanowane
export async function getMasteredCategoriesAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Użytkownik nie jest zalogowany" };
    }

    // Jedno zapytanie SQL, które znajdzie wszystkie opanowane kategorie
    type CategoryResult = { category: string; total_count: bigint; mastered_count: bigint }[];
    
    const categoryStats = await prisma.$queryRaw<CategoryResult>`
      WITH category_counts AS (
        SELECT 
          f.category,
          COUNT(f.id) as total_count,
          COUNT(CASE WHEN p."masteryLevel" >= 5 THEN f.id END) as mastered_count
        FROM "Flashcard" f
        LEFT JOIN "Progress" p ON f.id = p."flashcardId" AND p."userId" = ${userId}
        WHERE f."userId" = ${userId}
        GROUP BY f.category
      )
      SELECT 
        category,
        total_count,
        mastered_count
      FROM category_counts
      ORDER BY category
    `;
    
    // Filtruj tylko kategorie, w których wszystkie fiszki są opanowane
    const masteredCategories = categoryStats
      .filter(({ total_count, mastered_count }) => 
        Number(total_count) > 0 && Number(total_count) === Number(mastered_count))
      .map(({ category }) => category);

    return {
      success: true,
      data: masteredCategories,
    };
  } catch (error) {
    console.error("Błąd podczas pobierania opanowanych kategorii:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas pobierania opanowanych kategorii",
    };
  }
}
