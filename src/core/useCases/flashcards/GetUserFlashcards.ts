import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";

export class GetUserFlashcardsUseCase {
  constructor(private flashcardRepository: FlashcardRepository) {}

  async execute(userId: string): Promise<{ flashcards: Flashcard[], error?: string }> {
    try {
      if (!userId) {
        console.warn("Brak zalogowanego użytkownika - zwracam pustą tablicę");
        return { flashcards: [] };
      }

      const flashcards = await this.flashcardRepository.getFlashcardsByUserId(userId);
      console.log(`Znaleziono ${flashcards.length} fiszek dla użytkownika ${userId}`);
      
      return { flashcards };
    } catch (error) {
      console.error("Błąd pobierania fiszek:", error);
      return { flashcards: [], error: "Wystąpił błąd podczas pobierania fiszek" };
    }
  }
} 