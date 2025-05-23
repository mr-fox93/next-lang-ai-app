"use client";

import { useState, useEffect } from "react";
import { DemoProgressDashboard } from "./DemoProgressDashboard";
import { UserProgressStats, CategoryProgress } from "@/types/progress";
import { useDemoProgress } from "@/shared/hooks/useDemoProgress";
import { getDemoFlashcards } from "@/app/demo/actions";
import { Flashcard } from "@/core/entities/Flashcard";
import { useRouter } from "@/i18n/navigation";

// Demo data adapter to convert demo progress to UserProgressStats format
function createDemoProgressStats(
  totalFlashcards: number,
  masteredFlashcards: number,
  inProgressFlashcards: number,
  untouchedFlashcards: number,
  categories: CategoryProgress[]
): UserProgressStats {
  return {
    totalFlashcards,
    masteredFlashcards,
    inProgressFlashcards,
    untouchedFlashcards,
    userLevel: 1, // Demo users are always level 1
    experiencePoints: masteredFlashcards * 10, // 10 points per mastered card
    nextLevelPoints: 500,
    dailyGoal: 5, // Default demo goal
    categories,
  };
}

export function DemoProgressPage() {
  const { getProgressStats } = useDemoProgress();
  const router = useRouter();
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDemoStats = async () => {
      try {
        console.log("Loading demo stats...");
        
        // Get demo flashcards
        const flashcardsResult = await getDemoFlashcards();
        console.log("Demo flashcards result:", flashcardsResult);
        
        const flashcards: Flashcard[] = flashcardsResult.flashcards || [];
        console.log("Demo flashcards:", flashcards.length);

        if (flashcards.length === 0) {
          console.log("No flashcards found, using empty stats");
          setStats(createDemoProgressStats(0, 0, 0, 0, []));
          return;
        }

        // Get progress from localStorage
        const storedProgress = localStorage.getItem("demo_progress");
        const progressData = storedProgress ? JSON.parse(storedProgress) : {};
        console.log("Stored progress:", progressData);

        // Calculate overall stats
        const totalFlashcards = flashcards.length;
        let masteredFlashcards = 0;
        let inProgressFlashcards = 0;
        let untouchedFlashcards = 0;

        // Group by category and calculate per category stats 
        const categoryMap = new Map<string, {
          flashcards: Flashcard[];
          mastered: number;
          inProgress: number;
          untouched: number;
          totalMasteryLevel: number;
        }>();

        // Initialize categories
        for (const card of flashcards) {
          if (!categoryMap.has(card.category)) {
            categoryMap.set(card.category, {
              flashcards: [],
              mastered: 0,
              inProgress: 0,
              untouched: 0,
              totalMasteryLevel: 0,
            });
          }
          categoryMap.get(card.category)!.flashcards.push(card);
        }

        // Calculate stats for each flashcard and category
        for (const card of flashcards) {
          const cardProgress = progressData[card.id];
          const masteryLevel = cardProgress ? cardProgress.masteryLevel : 0;
          
          const categoryData = categoryMap.get(card.category)!;
          categoryData.totalMasteryLevel += masteryLevel;

          // Use same logic as main progress (>= 4 is mastered, not >= 5)
          if (masteryLevel >= 4) {
            masteredFlashcards++;
            categoryData.mastered++;
          } else if (masteryLevel >= 1) {
            inProgressFlashcards++;
            categoryData.inProgress++;
          } else {
            untouchedFlashcards++;
            categoryData.untouched++;
          }
        }

        // Convert to CategoryProgress array
        const categories: CategoryProgress[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
          name,
          total: data.flashcards.length,
          mastered: data.mastered,
          inProgress: data.inProgress,
          untouched: data.untouched,
          averageMasteryLevel: data.flashcards.length > 0 ? data.totalMasteryLevel / data.flashcards.length : 0,
        }));

        console.log("Calculated categories:", categories);
        console.log("Overall stats:", { totalFlashcards, masteredFlashcards, inProgressFlashcards, untouchedFlashcards });

        // Create final stats
        const demoStats = createDemoProgressStats(
          totalFlashcards,
          masteredFlashcards,
          inProgressFlashcards,
          untouchedFlashcards,
          categories
        );

        console.log("Final demo stats:", demoStats);
        setStats(demoStats);
      } catch (error) {
        console.error("Error loading demo progress stats:", error);
        // Fallback to empty stats
        setStats(createDemoProgressStats(0, 0, 0, 0, []));
      } finally {
        setIsLoading(false);
      }
    };

    loadDemoStats();
  }, [getProgressStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Progress</h2>
          <p className="text-gray-400 mb-6">
            Failed to load demo progress data.
          </p>
          <button
            onClick={() => router.push("/demo")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Back to Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <DemoProgressDashboard
      initialStats={stats}
      initialReviewedToday={0} // Demo doesn't track daily reviews
    />
  );
} 