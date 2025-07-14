"use server";

import { auth } from "@/lib/auth";
import {
  getUpdateFlashcardProgressUseCase,
  getUserProgressStatsUseCase,
  getFlashcardRepository,
  getUpdateDailyGoalUseCase,
  getReviewedTodayCountUseCase,
} from "@/lib/container";
import { ProgressActionResult } from "@/types/progress";
import { CategoryProgress } from "@/types/progress";
import { isDemoMode } from "@/lib/demo-helpers";

interface UpdateProgressActionParams {
  flashcardId: number;
  isCorrect: boolean;
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

    return {
      success: true,
      data: stats,
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

    const result = await getReviewedTodayCountUseCase().execute({ userId });

    return result;
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

    const result = await getUpdateDailyGoalUseCase().execute({ userId, dailyGoal: newGoal });

    if (result.success) {
      return {
        success: true,
        message: "Daily goal successfully updated",
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to update daily goal",
      };
    }
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

// Function returning categories where all flashcards are already mastered
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

    // TODO: Implement this with proper Use Case
    // For now, return empty array to avoid direct prisma usage
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error("Błąd podczas pobierania opanowanych kategorii:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas pobierania opanowanych kategorii",
    };
  }
}
