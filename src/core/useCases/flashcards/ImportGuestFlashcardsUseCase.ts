import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { UserManagementService } from "@/core/services/UserManagementService";
import { ImportableFlashcard } from "@/types/flashcard";

export interface ImportGuestFlashcardsParams {
  userId: string;
  userEmail: string;
  flashcards: ImportableFlashcard[];
}

export interface ImportGuestFlashcardsResult {
  success: boolean;
  error?: string;
}

export class ImportGuestFlashcardsUseCase {
  constructor(
    private flashcardRepository: FlashcardRepository,
    private userManagementService: UserManagementService
  ) {}

  async execute(params: ImportGuestFlashcardsParams): Promise<ImportGuestFlashcardsResult> {
    try {
      const { userId, userEmail, flashcards } = params;

      if (!userId || !userEmail) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // Ensure user exists using UserManagementService
      const userExists = await this.userManagementService.ensureUserExists(userId, userEmail);
      if (!userExists) {
        return {
          success: false,
          error: "Failed to create user record in database",
        };
      }

      // Import flashcards
      const flashcardPromises = flashcards.map((card) =>
        this.flashcardRepository.createFlashcard({
          origin_text: card.origin_text,
          translate_text: card.translate_text,
          example_using: card.example_using,
          translate_example: card.translate_example,
          category: card.category,
          translate_category: card.translate_category,
          sourceLanguage: card.sourceLanguage,
          targetLanguage: card.targetLanguage,
          difficultyLevel: card.difficultyLevel,
          userId: userId,
        })
      );

      await Promise.all(flashcardPromises);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error importing guest flashcards:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during import",
      };
    }
  }
} 