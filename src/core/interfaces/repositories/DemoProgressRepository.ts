import { DemoProgress, DemoProgressStats } from "../../entities/DemoProgress";

export interface DemoProgressRepository {
  /**
   * Get progress for a specific flashcard
   */
  getFlashcardProgress(flashcardId: number): Promise<DemoProgress | null>;

  /**
   * Get all progress data
   */
  getAllProgress(): Promise<Record<number, DemoProgress>>;

  /**
   * Update progress for a specific flashcard
   */
  updateFlashcardProgress(flashcardId: number, isCorrect: boolean): Promise<DemoProgress>;

  /**
   * Get progress statistics for given flashcard IDs
   */
  getProgressStats(flashcardIds: number[]): Promise<DemoProgressStats>;

  /**
   * Clear all progress data
   */
  clearAllProgress(): Promise<void>;

  /**
   * Save progress for a specific flashcard
   */
  saveFlashcardProgress(progress: DemoProgress): Promise<void>;

  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean;
} 