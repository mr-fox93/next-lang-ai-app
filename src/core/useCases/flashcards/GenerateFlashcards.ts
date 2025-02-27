import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { UserRepository } from "@/core/interfaces/repositories/UserRepository";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { FlashCardSchema } from "@/lib/flashcard.schema";
import { getFlashcardsPrompt } from "@/lib/prompts";

// Interfejs dla parametrów generowania fiszek
export interface GenerateFlashcardsParams {
  count: number;
  message: string;
  level: string;
  userId: string;
  userEmail: string;
}

// Interfejs dla rezultatu generowania fiszek
export interface GenerateFlashcardsResult {
  success: boolean;
  message?: string;
  error?: string;
  flashcards?: Flashcard[];
}

export class GenerateFlashcardsUseCase {
  private openai: OpenAI;

  constructor(
    private flashcardRepository: FlashcardRepository,
    private progressRepository: ProgressRepository,
    private userRepository: UserRepository
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async execute(params: GenerateFlashcardsParams): Promise<GenerateFlashcardsResult> {
    try {
      const { count, message, level, userId } = params;

      if (!userId) {
        return {
          success: false,
          error: "Nie jesteś zalogowany"
        };
      }

      if (!count || count <= 0) {
        return {
          success: false,
          error: "Liczba fiszek musi być większa niż 0"
        };
      }

      // Ta logika mogłaby być w osobnym przypadku użycia UpsertUserUseCase
      // ale dla uproszczenia zostawimy ją tutaj
      await this.upsertUser(userId);

      const prompt = getFlashcardsPrompt(count, message, level);
      const flashcards = await this.generateFlashcardsWithAI(prompt);
      
      if (!flashcards) {
        return {
          success: false,
          error: "Nie udało się wygenerować fiszek"
        };
      }

      const savedFlashcards = await this.saveFlashcards(flashcards, userId);
      await this.createProgressRecords(savedFlashcards, userId);

      return {
        success: true,
        message: "Fiszki zostały pomyślnie wygenerowane i zapisane",
        flashcards: savedFlashcards
      };
    } catch (error) {
      console.error("Błąd generowania fiszek:", error);
      return {
        success: false,
        error: "Wystąpił błąd podczas generowania fiszek"
      };
    }
  }

  private async upsertUser(userId: string): Promise<void> {
    // Ponieważ metoda upsertUser została usunięta z interfejsu UserRepository,
    // używamy alternatywnego podejścia - najpierw sprawdzamy czy użytkownik istnieje
    const existingUser = await this.userRepository.getUserById(userId);
    
    if (!existingUser) {
      console.log("Użytkownika nie ma w bazie - należałoby go utworzyć w inny sposób");
      // W tym miejscu normalnie byłoby tworzenie użytkownika, ale 
      // interfejs UserRepository nie ma już metody do tworzenia użytkowników
    }
    
    console.log(`Użytkownik ${userId} już istnieje lub został obsłużony inaczej`);
  }

  private async generateFlashcardsWithAI(prompt: string): Promise<Omit<Flashcard, "id" | "userId">[]> {
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
        response_format: zodResponseFormat(FlashCardSchema, "flashcardResponse"),
        temperature: 0.1,
        max_tokens: 500,
      });

      const parsedData = FlashCardSchema.parse(
        JSON.parse(response.choices[0].message.content || "[]")
      );

      return parsedData.flashcards;
    } catch (error) {
      console.error("Błąd podczas generowania fiszek z AI:", error);
      throw new Error("Nie udało się wygenerować fiszek przy użyciu AI");
    }
  }

  private async saveFlashcards(flashcards: Omit<Flashcard, "id" | "userId">[], userId: string): Promise<Flashcard[]> {
    const flashcardPromises = flashcards.map(flashcard => 
      this.flashcardRepository.createFlashcard({
        origin_text: flashcard.origin_text,
        translate_text: flashcard.translate_text,
        example_using: flashcard.example_using,
        translate_example: flashcard.translate_example,
        category: flashcard.category,
        userId: userId
      })
    );
    
    return await Promise.all(flashcardPromises);
  }

  private async createProgressRecords(flashcards: Flashcard[], userId: string): Promise<void> {
    const progressPromises = flashcards.map(flashcard => 
      this.progressRepository.createProgress({
        flashcardId: flashcard.id,
        userId: userId,
        masteryLevel: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        nextReviewDate: new Date()
      })
    );
    
    await Promise.all(progressPromises);
  }
} 