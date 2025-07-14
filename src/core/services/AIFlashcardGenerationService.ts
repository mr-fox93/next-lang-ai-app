/**
 * AI Flashcard Generation Service
 * Centralizes logic for generating flashcards using OpenAI API
 * Used in flashcard generation use cases and guest generation
 */

import { Flashcard } from "@/core/entities/Flashcard";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { FlashCardSchema } from "@/lib/flashcard.schema";

export interface AIFlashcardGenerationService {
  generateFlashcardsWithAI(prompt: string, maxRetries?: number): Promise<Omit<Flashcard, "id" | "userId">[]>;
  validateFlashcards(flashcards: Record<string, unknown>[]): Omit<Flashcard, "id" | "userId">[];
  filterDuplicates(
    generated: Omit<Flashcard, "id" | "userId">[],
    existing: Array<{origin_text: string, translate_text: string}>
  ): {
    unique: Omit<Flashcard, "id" | "userId">[];
    duplicates: Omit<Flashcard, "id" | "userId">[];
  };
}

export class AIFlashcardGenerationServiceImpl implements AIFlashcardGenerationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate flashcards using OpenAI API with retry mechanism
   */
  async generateFlashcardsWithAI(
    prompt: string,
    maxRetries: number = 3
  ): Promise<Omit<Flashcard, "id" | "userId">[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning. Focus on creating DIVERSE vocabulary with different starting letters and semantic variety. Your response must be strictly valid JSON without any additional commentary or markdown formatting.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: zodResponseFormat(
            FlashCardSchema,
            "flashcardResponse"
          ),
          temperature: attempt > 1 ? 0.3 + (attempt - 1) * 0.2 : 0.1, // Increase creativity on retries
          max_tokens: 1000,
        });

        const parsedData = FlashCardSchema.parse(
          JSON.parse(response.choices[0].message.content || "[]")
        );

        const flashcardsWithDefaultLanguageSettings = parsedData.flashcards.map(
          (flashcard) => ({
            ...flashcard,
            sourceLanguage: "pl",
            targetLanguage: "en",
            difficultyLevel: "easy",
          })
        );

        return this.validateFlashcards(flashcardsWithDefaultLanguageSettings);
      } catch (error) {
        console.error(`AI flashcard generation error (attempt ${attempt}/${maxRetries}):`, error);
        lastError = error as Error;

        if (error instanceof Error && error.message.includes("429")) {
          throw new Error(
            "Przekroczono limit zapytań do API OpenAI. Spróbuj ponownie później lub skontaktuj się z administratorem w celu aktualizacji planu subskrypcji."
          );
        }

        // If this is not the last attempt, wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error(
      `Failed to generate flashcards with AI after ${maxRetries} attempts: ${
        lastError?.message || "Unknown error occurred"
      }`
    );
  }

  /**
   * Validate and clean flashcards from AI response
   */
  validateFlashcards(flashcards: Record<string, unknown>[]): Omit<Flashcard, "id" | "userId">[] {
    return flashcards
      .filter(flashcard => {
        // Basic validation
        if (!flashcard.origin_text || !flashcard.translate_text) {
          console.warn("Skipping flashcard with missing text:", flashcard);
          return false;
        }
        return true;
      })
      .map(flashcard => ({
        origin_text: String(flashcard.origin_text || ""),
        translate_text: String(flashcard.translate_text || ""),
        example_using: String(flashcard.example_using || ""),
        translate_example: String(flashcard.translate_example || ""),
        category: String(flashcard.category || "General"),
        translate_category: String(flashcard.translate_category || flashcard.category || "General"),
        sourceLanguage: String(flashcard.sourceLanguage || "pl"),
        targetLanguage: String(flashcard.targetLanguage || "en"),
        difficultyLevel: String(flashcard.difficultyLevel || "easy"),
      }));
  }

  /**
   * Filter duplicates from generated flashcards
   */
  filterDuplicates(
    generated: Omit<Flashcard, "id" | "userId">[],
    existing: Array<{origin_text: string, translate_text: string}>
  ): {
    unique: Omit<Flashcard, "id" | "userId">[];
    duplicates: Omit<Flashcard, "id" | "userId">[];
  } {
    const unique: Omit<Flashcard, "id" | "userId">[] = [];
    const duplicates: Omit<Flashcard, "id" | "userId">[] = [];

    generated.forEach(card => {
      const isDuplicate = existing.some(existing => 
        existing.origin_text.toLowerCase() === card.origin_text.toLowerCase() ||
        existing.translate_text.toLowerCase() === card.translate_text.toLowerCase()
      );

      if (isDuplicate) {
        duplicates.push(card);
      } else {
        unique.push(card);
      }
    });

    return { unique, duplicates };
  }
}

// Export singleton instance
export const aiFlashcardGenerationService: AIFlashcardGenerationService = new AIFlashcardGenerationServiceImpl(); 