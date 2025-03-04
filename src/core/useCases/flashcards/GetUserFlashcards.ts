import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";

export class GetUserFlashcardsUseCase {
  constructor(private flashcardRepository: FlashcardRepository) {}

  async execute(userId: string): Promise<{ flashcards: Flashcard[], error?: string }> {
    try {
      if (!userId) {
        return { flashcards: [] };
      }

      const flashcards = await this.flashcardRepository.getFlashcardsByUserId(userId);
      
      return { flashcards };
    } catch (error) {
      console.error("Flashcard retrieval error:", error);
      return { 
        flashcards: [], 
        error: `Failed to retrieve flashcards: ${error instanceof Error ? error.message : "Unknown error occurred"}` 
      };
    }
  }
} 