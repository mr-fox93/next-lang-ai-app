import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { UserRepository } from "@/core/interfaces/repositories/UserRepository";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { FlashCardSchema } from "@/lib/flashcard.schema";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
  private openai: OpenAI;
  private prisma: PrismaClient;

  constructor(
    private flashcardRepository: FlashcardRepository,
    private progressRepository: ProgressRepository,
    private userRepository: UserRepository
  ) {
    this.prisma = prisma;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

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

      await this.upsertUser(userId, userEmail);

      const prompt = getFlashcardsPrompt(
        count,
        message,
        level,
        sourceLanguage,
        targetLanguage,
        [] // Empty array for new flashcards generation
      );
      const generatedFlashcards = await this.generateFlashcardsWithAI(prompt);

      if (!generatedFlashcards) {
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
      await this.createProgressRecords(savedFlashcards, userId);

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

      await this.upsertUser(userId, userEmail);

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
          const generatedFlashcards = await this.generateFlashcardsWithAI(prompt);

          if (!generatedFlashcards || generatedFlashcards.length === 0) {
            lastError = "AI nie wygenerował żadnych fiszek";
            continue;
          }

          // Check for duplicates
          const duplicates = generatedFlashcards.filter(card => 
            existingFlashcards.some(existing => 
              existing.origin_text.toLowerCase() === card.origin_text.toLowerCase() ||
              existing.translate_text.toLowerCase() === card.translate_text.toLowerCase()
            )
          );

          if (duplicates.length > 0 && attempt < maxAttempts) {
            console.log(`Attempt ${attempt}: Found ${duplicates.length} duplicates, retrying...`);
            lastError = `Znaleziono ${duplicates.length} duplikatów, próbując ponownie...`;
            continue;
          }

          // Filter out duplicates and keep unique ones
          const uniqueFlashcards = generatedFlashcards.filter(card => 
            !existingFlashcards.some(existing => 
              existing.origin_text.toLowerCase() === card.origin_text.toLowerCase() ||
              existing.translate_text.toLowerCase() === card.translate_text.toLowerCase()
            )
          );

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
          await this.createProgressRecords(savedFlashcards, userId);

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

  private async upsertUser(userId: string, userEmail: string): Promise<void> {
    const existingUser = await this.userRepository.getUserById(userId);

    if (!existingUser) {
      try {
        await this.prisma.user.create({
          data: {
            id: userId,
            email: userEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("User creation error:", error);
        throw new Error(
          `Failed to create user: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    }
  }

  private async generateFlashcardsWithAI(
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

        return flashcardsWithDefaultLanguageSettings;
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

  private async createProgressRecords(
    flashcards: Flashcard[],
    userId: string
  ): Promise<void> {
    const progressPromises = flashcards.map((flashcard) =>
      this.progressRepository.createProgress({
        flashcardId: flashcard.id,
        userId: userId,
        masteryLevel: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        nextReviewDate: new Date(),
      })
    );

    await Promise.all(progressPromises);
  }
}
