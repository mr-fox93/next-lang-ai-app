import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { FlashCardSchema } from "@/lib/flashcard.schema";
import { getFlashcardsPrompt } from "@/lib/prompts";

// Interfejs dla parametrów
export interface EdgeGenerateFlashcardsParams {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Interfejs dla wyniku
export interface EdgeFlashcard {
  origin_text: string;
  translate_text: string;
  example_using: string;
  translate_example: string;
  category: string;
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
}

export interface EdgeGenerateFlashcardsResult {
  success: boolean;
  message?: string;
  error?: string;
  flashcards?: EdgeFlashcard[];
}

// Klasa obsługująca generowanie fiszek w Edge Runtime
export class EdgeFlashcardGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generateFlashcards(params: EdgeGenerateFlashcardsParams): Promise<EdgeGenerateFlashcardsResult> {
    try {
      const { count, message, level, sourceLanguage, targetLanguage } = params;

      if (!count || count <= 0) {
        return {
          success: false,
          error: "Liczba fiszek musi być większa niż 0"
        };
      }

      const prompt = getFlashcardsPrompt(count, message, level, sourceLanguage, targetLanguage);
      const generatedFlashcards = await this.generateFlashcardsWithAI(prompt);
      
      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        return {
          success: false,
          error: "Nie udało się wygenerować fiszek"
        };
      }

      // Przypisz wybrane przez użytkownika ustawienia językowe do wygenerowanych fiszek
      const flashcards = generatedFlashcards.map(flashcard => ({
        ...flashcard,
        sourceLanguage,
        targetLanguage,
        difficultyLevel: level
      }));

      return {
        success: true,
        message: "Fiszki zostały pomyślnie wygenerowane",
        flashcards: flashcards
      };
    } catch (error) {
      console.error("Edge flashcard generation error:", error);
      return {
        success: false,
        error: `Flashcard generation failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      };
    }
  }

  private async generateFlashcardsWithAI(prompt: string): Promise<Omit<EdgeFlashcard, "sourceLanguage" | "targetLanguage" | "difficultyLevel">[]> {
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
      console.error("AI flashcard generation error:", error);
      throw new Error(
        `Failed to generate flashcards with AI: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  }
} 