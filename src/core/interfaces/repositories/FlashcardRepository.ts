import { Flashcard } from "@/core/entities/Flashcard";
import { CategoryProgress } from "@/types/progress";

export interface FlashcardRepository {
  getFlashcardsByUserId(userId: string): Promise<Flashcard[]>;
  createFlashcard(flashcard: Omit<Flashcard, "id">): Promise<Flashcard>;
  deleteFlashcardsByCategory(userId: string, category: string): Promise<number>;
  getUserTargetLanguages(userId: string): Promise<string[]>;
  getUserFlashcardStats(userId: string): Promise<{
    totalFlashcards: number;
    masteredFlashcards: number;
    inProgressFlashcards: number;
    untouchedFlashcards: number;
    categories: CategoryProgress[];
  }>;
} 