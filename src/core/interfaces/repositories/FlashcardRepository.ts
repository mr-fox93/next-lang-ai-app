import { Flashcard } from "@/core/entities/Flashcard";

export interface FlashcardRepository {
  getFlashcardsByUserId(userId: string): Promise<Flashcard[]>;
  createFlashcard(flashcard: Omit<Flashcard, "id">): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard>;
  deleteFlashcard(id: number): Promise<boolean>;
} 