import { AIFlashcardGenerationService } from "@/core/services/AIFlashcardGenerationService";
import { FlashcardGenerationResponse } from "@/types/flashcard";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { verifyRecaptcha } from "@/lib/recaptcha";

export interface HandleGuestFlashcardGenerationParams {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
  existingFlashcards?: Array<{origin_text: string, translate_text: string}>;
  recaptchaToken?: string;
}

export class HandleGuestFlashcardGenerationUseCase {
  constructor(private aiGenerationService: AIFlashcardGenerationService) {}

  async execute(params: HandleGuestFlashcardGenerationParams): Promise<FlashcardGenerationResponse> {
    try {
      const { count, message, level, sourceLanguage, targetLanguage, existingFlashcards = [], recaptchaToken } = params;

      // Verify reCAPTCHA for guest users
      if (recaptchaToken) {
        const recaptchaResult = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaResult.success) {
          return {
            success: false,
            error: "reCAPTCHA verification failed. Please try again.",
          };
        }
      }

      if (!count || count <= 0) {
        return {
          success: false,
          error: "Number of flashcards must be greater than 0",
        };
      }

      const prompt = getFlashcardsPrompt(
        count,
        message,
        level,
        sourceLanguage,
        targetLanguage,
        existingFlashcards
      );

      const generatedFlashcards = await this.aiGenerationService.generateFlashcardsWithAI(prompt);

      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        return {
          success: false,
          error: "Failed to generate flashcards. Please try again.",
        };
      }

      // Filter duplicates
      const { unique: uniqueFlashcards } = this.aiGenerationService.filterDuplicates(
        generatedFlashcards,
        existingFlashcards
      );

      // Apply user-selected language settings
      const flashcards = uniqueFlashcards.map((flashcard) => ({
        ...flashcard,
        sourceLanguage,
        targetLanguage,
        difficultyLevel: level,
      }));

      return {
        success: true,
        flashcards,
      };
    } catch (error) {
      console.error("Guest flashcard generation error:", error);
      return {
        success: false,
        error: `Flashcard generation failed: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      };
    }
  }
} 