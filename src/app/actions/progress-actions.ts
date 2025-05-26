"use server";

import { auth } from "@/lib/auth";
import {
  getUpdateFlashcardProgressUseCase,
  getUserProgressStatsUseCase,
  getFlashcardRepository,
} from "@/lib/container";
import prisma from "@/lib/prisma";
import { ProgressActionResult } from "@/types/progress";
import { cookies } from "next/headers";
import { CategoryProgress } from "@/types/progress";

interface UpdateProgressActionParams {
  flashcardId: number;
  isCorrect: boolean;
}

// Helper function to check if in demo mode
async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('demo_mode')?.value === 'true';
}

// Helper function to get demo progress from localStorage (client-side only)
// This is a placeholder - actual localStorage access happens on client side

// Function to calculate demo mode stats from real flashcards + localStorage progress
async function getDemoModeStats() {
  try {
    // Get real flashcards from database for demo user
    const { userId } = await auth();
    if (!userId) {
      throw new Error("No demo user ID");
    }

    const flashcardRepository = getFlashcardRepository();
    const flashcards = await flashcardRepository.getFlashcardsByUserId(userId);

    // Since we can't access localStorage on server side, we'll return structure
    // that client can populate with localStorage data
    const categories: { [key: string]: { total: number; flashcards: Array<{ id: number; category: string }> } } = {};
    
    flashcards.forEach(flashcard => {
      if (!categories[flashcard.category]) {
        categories[flashcard.category] = { total: 0, flashcards: [] };
      }
      categories[flashcard.category].total++;
      categories[flashcard.category].flashcards.push(flashcard);
    });

    // Return structure that client can enhance with localStorage progress
    const categoryProgress: CategoryProgress[] = Object.entries(categories).map(([name, data]) => ({
      name,
      total: data.total,
      mastered: 0, // Will be calculated on client side from localStorage
      inProgress: 0, // Will be calculated on client side from localStorage
      untouched: data.total, // Will be calculated on client side from localStorage
      averageMasteryLevel: 0, // Will be calculated on client side from localStorage
    }));

    return {
      totalFlashcards: flashcards.length,
      masteredFlashcards: 0, // Will be calculated on client side
      inProgressFlashcards: 0, // Will be calculated on client side
      untouchedFlashcards: flashcards.length, // Will be calculated on client side
      categories: categoryProgress,
      userLevel: 1,
      experiencePoints: 0,
      nextLevelPoints: 500,
      dailyGoal: 10,
    };
  } catch (error) {
    console.error("Error getting demo mode stats:", error);
    // Fallback to empty stats
    return {
      totalFlashcards: 0,
      masteredFlashcards: 0,
      inProgressFlashcards: 0,
      untouchedFlashcards: 0,
      categories: [],
      userLevel: 1,
      experiencePoints: 0,
      nextLevelPoints: 500,
      dailyGoal: 10,
    };
  }
}

export async function updateFlashcardProgressAction(
  params: UpdateProgressActionParams
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // Check if in demo mode - if so, don't save to database
    if (await isDemoMode()) {
      return {
        success: true,
        data: { message: "Progress updated (demo mode)" },
      };
    }

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
    // Check if in demo mode - if so, return demo stats based on real flashcards
    if (await isDemoMode()) {
      const demoStats = await getDemoModeStats();
      return {
        success: true,
        data: demoStats,
      };
    }

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
    // Check if in demo mode - if so, return count from localStorage
    if (await isDemoMode()) {
      // Since we can't access localStorage on server side, return 0
      // Client side will calculate this from localStorage
      return {
        success: true,
        data: 0, // Will be calculated on client side
      };
    }

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
    // Check if in demo mode - if so, save to localStorage (handled on client side)
    if (await isDemoMode()) {
      return {
        success: true,
        message: "Daily goal updated (demo mode)",
      };
    }

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
    // Check if in demo mode - if so, calculate from real flashcards + localStorage
    if (await isDemoMode()) {
      // Since we can't access localStorage on server side, return empty array
      // Client side will calculate this from localStorage
      return {
        success: true,
        data: [], // Will be calculated on client side
      };
    }

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
