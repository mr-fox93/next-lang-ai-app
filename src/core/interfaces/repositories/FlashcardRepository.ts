import { Flashcard } from "@/core/entities/Flashcard";
import { CategoryProgress } from "@/types/progress";

export interface FlashcardRepository {
  getFlashcardsByUserId(userId: string): Promise<Flashcard[]>;
  getUserFlashcards(userId: string): Promise<Flashcard[]>;
  createFlashcard(flashcard: Omit<Flashcard, "id">): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard>;
  deleteFlashcard(id: number): Promise<boolean>;
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