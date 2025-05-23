"use client";

import { useState, useCallback } from "react";
import { 
  getUpdateDemoProgressUseCase, 
  getDemoProgressUseCase, 
  getClearDemoProgressUseCase 
} from "@/lib/container";
import { DemoProgressStats } from "@/core/entities/DemoProgress";
import { DemoProgressHookReturn } from "@/shared/types/demo";

export const useDemoProgress = (): DemoProgressHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback(async (flashcardId: number, isCorrect: boolean): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const updateUseCase = getUpdateDemoProgressUseCase();
      const result = await updateUseCase.execute({ flashcardId, isCorrect });

      if (!result.success) {
        setError(result.error || "Failed to update progress");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProgressStats = useCallback(async (flashcardIds: number[]): Promise<DemoProgressStats> => {
    setIsLoading(true);
    setError(null);

    try {
      const getProgressUseCase = getDemoProgressUseCase();
      const result = await getProgressUseCase.execute({ flashcardIds });

      if (!result.success) {
        setError(result.error || "Failed to get progress stats");
        return {
          totalFlashcards: 0,
          masteredFlashcards: 0,
          inProgressFlashcards: 0,
          untouchedFlashcards: 0,
        };
      }

      return result.stats || {
        totalFlashcards: 0,
        masteredFlashcards: 0,
        inProgressFlashcards: 0,
        untouchedFlashcards: 0,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return {
        totalFlashcards: 0,
        masteredFlashcards: 0,
        inProgressFlashcards: 0,
        untouchedFlashcards: 0,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProgress = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const clearUseCase = getClearDemoProgressUseCase();
      const result = await clearUseCase.execute();

      if (!result.success) {
        setError(result.error || "Failed to clear progress");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateProgress,
    getProgressStats,
    clearProgress,
    isLoading,
    error,
  };
}; 