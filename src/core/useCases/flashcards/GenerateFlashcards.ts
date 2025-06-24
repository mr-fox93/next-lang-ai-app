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
        targetLanguage
      );
      const generatedFlashcards = await this.generateFlashcardsWithAI(prompt);

      if (!generatedFlashcards) {
        return {
          success: false,
          error: "Nie udało się wygenerować fiszek",
        };
      }

      // Przypisz wybrane przez użytkownika ustawienia językowe do wygenerowanych fiszek
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
    prompt: string
  ): Promise<Omit<Flashcard, "id" | "userId">[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning. Your response must be strictly valid JSON without any additional commentary or markdown formatting.",
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
        temperature: 0.1,
        max_tokens: 500,
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
      console.error("AI flashcard generation error:", error);

      if (error instanceof Error && error.message.includes("429")) {
        throw new Error(
          "Przekroczono limit zapytań do API OpenAI. Spróbuj ponownie później lub skontaktuj się z administratorem w celu aktualizacji planu subskrypcji."
        );
      }

      throw new Error(
        `Failed to generate flashcards with AI: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
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
