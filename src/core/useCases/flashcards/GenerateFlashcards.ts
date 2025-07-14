import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { 
  AIFlashcardGenerationService,
  UserManagementService,
  FlashcardProgressService 
} from "@/core/services";

export interface GenerateFlashcardsParams {
  count: number;
  message: string;
  level: string;
  userId: string;
  userEmail: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface GenerateFlashcardsResult {
  success: boolean;
  message?: string;
  error?: string;
  flashcards?: Flashcard[];
}

export class GenerateFlashcardsUseCase {
  constructor(
    private flashcardRepository: FlashcardRepository,
    private aiGenerationService: AIFlashcardGenerationService,
    private userManagementService: UserManagementService,
    private progressService: FlashcardProgressService
  ) {}

  async execute(
    params: GenerateFlashcardsParams
  ): Promise<GenerateFlashcardsResult> {
    try {
      const {
        count,
        message,
        level,
        userId,
        userEmail,
        sourceLanguage,
        targetLanguage,
      } = params;

      if (!userId) {
        return {
          success: false,
          error: "Nie jesteś zalogowany",
        };
      }

      if (!count || count <= 0) {
        return {
          success: false,
          error: "Liczba fiszek musi być większa niż 0",
        };
      }

      await this.userManagementService.upsertUser(userId, userEmail);

      const prompt = getFlashcardsPrompt(
        count,
        message,
        level,
        sourceLanguage,
        targetLanguage,
        [] // Empty array for new flashcards generation
      );

      const generatedFlashcards = await this.aiGenerationService.generateFlashcardsWithAI(prompt);

      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        return {
          success: false,
          error: "Nie udało się wygenerować fiszek",
        };
      }

      // Assign user-selected language settings to generated flashcards
      const flashcards = generatedFlashcards.map((flashcard) => ({
        ...flashcard,
        sourceLanguage,
        targetLanguage,
        difficultyLevel: level,
      }));

      const savedFlashcards = await this.saveFlashcards(flashcards, userId);
      await this.progressService.createInitialProgressRecords(savedFlashcards, userId);

      return {
        success: true,
        message: "Fiszki zostały pomyślnie wygenerowane i zapisane",
        flashcards: savedFlashcards,
      };
    } catch (error) {
      console.error("Flashcard generation error:", error);
      return {
        success: false,
        error: `Flashcard generation failed: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      };
    }
  }

  async generateMoreFlashcards(params: {
    count: number;
    message: string;
    level: string;
    userId: string;
    userEmail: string;
    sourceLanguage: string;
    targetLanguage: string;
    category: string;
    existingFlashcards: Array<{origin_text: string, translate_text: string}>;
  }): Promise<GenerateFlashcardsResult> {
    try {
      const {
        count,
        message,
        level,
        userId,
        userEmail,
        sourceLanguage,
        targetLanguage,
        category,
        existingFlashcards,
      } = params;

      if (!userId) {
        return {
          success: false,
          error: "Nie jesteś zalogowany",
        };
      }

      if (!count || count <= 0) {
        return {
          success: false,
          error: "Liczba fiszek musi być większa niż 0",
        };
      }

      await this.userManagementService.upsertUser(userId, userEmail);

      // Try up to 3 times to generate unique flashcards
      const maxAttempts = 3;
      let lastError: string | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { getEnhancedFlashcardsPrompt } = await import("@/lib/prompts");
        
        const prompt = getEnhancedFlashcardsPrompt(
          count,
          message,
          level,
          sourceLanguage,
          targetLanguage,
          existingFlashcards,
          category,
          attempt
        );

        try {
          const generatedFlashcards = await this.aiGenerationService.generateFlashcardsWithAI(prompt);

          if (!generatedFlashcards || generatedFlashcards.length === 0) {
            lastError = "AI nie wygenerował żadnych fiszek";
            continue;
          }

          // Check for duplicates using AI service
          const { unique: uniqueFlashcards, duplicates } = this.aiGenerationService.filterDuplicates(
            generatedFlashcards,
            existingFlashcards
          );

          if (duplicates.length > 0 && attempt < maxAttempts) {
            console.log(`Attempt ${attempt}: Found ${duplicates.length} duplicates, retrying...`);
            lastError = `Znaleziono ${duplicates.length} duplikatów, próbując ponownie...`;
            continue;
          }

          if (uniqueFlashcards.length === 0) {
            lastError = "Wszystkie wygenerowane fiszki były duplikatami";
            continue;
          }

          // Assign user-selected language settings to generated flashcards
          const flashcards = uniqueFlashcards.map((flashcard) => ({
            ...flashcard,
            sourceLanguage,
            targetLanguage,
            difficultyLevel: level,
            category, // Ensure correct category
          }));

          const savedFlashcards = await this.saveFlashcards(flashcards, userId);
          await this.progressService.createInitialProgressRecords(savedFlashcards, userId);

          return {
            success: true,
            message: `Pomyślnie wygenerowano ${savedFlashcards.length} nowych fiszek${duplicates.length > 0 ? ` (pominięto ${duplicates.length} duplikatów)` : ''}`,
            flashcards: savedFlashcards,
          };

        } catch (error) {
          console.error(`Generate more flashcards attempt ${attempt} error:`, error);
          lastError = error instanceof Error ? error.message : "Nieznany błąd";
          
          if (attempt < maxAttempts) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          }
        }
      }

      return {
        success: false,
        error: `Nie udało się wygenerować unikalnych fiszek po ${maxAttempts} próbach. Ostatni błąd: ${lastError}`,
      };

    } catch (error) {
      console.error("Generate more flashcards error:", error);
      return {
        success: false,
        error: `Generowanie dodatkowych fiszek nie powiodło się: ${
          error instanceof Error ? error.message : "Nieznany błąd"
        }`,
      };
    }
  }

  private async saveFlashcards(
    flashcards: Omit<Flashcard, "id" | "userId">[],
    userId: string
  ): Promise<Flashcard[]> {
    const flashcardPromises = flashcards.map((flashcard) =>
      this.flashcardRepository.createFlashcard({
        origin_text: flashcard.origin_text,
        translate_text: flashcard.translate_text,
        example_using: flashcard.example_using,
        translate_example: flashcard.translate_example,
        category: flashcard.category,
        translate_category: flashcard.translate_category,
        sourceLanguage: flashcard.sourceLanguage,
        targetLanguage: flashcard.targetLanguage,
        difficultyLevel: flashcard.difficultyLevel,
        userId: userId,
      })
    );

    return await Promise.all(flashcardPromises);
  }
}
