"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getGenerateFlashcardsUseCase,
  getFlashcardRepository,
} from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";

interface ImportableFlashcard {
  origin_text: string;
  translate_text: string;
  example_using: string;
  translate_example: string;
  category: string;
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
}

interface GenerateFlashcardsActionParams {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface FlashcardGenerationResponse {
  success: boolean;
  flashcards?: ImportableFlashcard[];
  error?: string;
  redirect?: string;
}

interface AIFlashcardGenerator {
  generateFlashcardsWithAI(prompt: string): Promise<Record<string, string>[]>;
}

export async function generateFlashcardsAction(
  params: GenerateFlashcardsActionParams
) {
  try {
    const { count, message, level, sourceLanguage, targetLanguage } = params;
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    const generateParams: GenerateFlashcardsParams = {
      count,
      message,
      level,
      userId,
      userEmail: user?.primaryEmailAddress?.emailAddress || "",
      sourceLanguage,
      targetLanguage,
    };

    return await getGenerateFlashcardsUseCase().execute(generateParams);
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

export async function deleteCategoryAction(category: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    const flashcardRepository = new PrismaFlashcardRepository();
    const deletedCount = await flashcardRepository.deleteFlashcardsByCategory(
      userId,
      category
    );

    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error("Category deletion error:", error);
    return {
      success: false,
      error: `Category deletion failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}

export async function getUserLanguagesAction() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
        languages: [],
      };
    }

    const flashcardRepository = new PrismaFlashcardRepository();
    const languages = await flashcardRepository.getUserTargetLanguages(userId);

    return {
      success: true,
      languages,
    };
  } catch (error) {
    console.error("Get user languages error:", error);
    return {
      success: false,
      error: `Failed to get languages: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
      languages: [],
    };
  }
}

export async function importGuestFlashcardsAction(
  flashcards: ImportableFlashcard[]
) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }

  try {
    const flashcardRepository = getFlashcardRepository();

    const flashcardPromises = flashcards.map((card) =>
      flashcardRepository.createFlashcard({
        origin_text: card.origin_text,
        translate_text: card.translate_text,
        example_using: card.example_using,
        translate_example: card.translate_example,
        category: card.category,
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
      error:
        error instanceof Error ? error.message : "Unknown error during import",
    };
  }
}

export async function handleGuestFlashcardGeneration(data: {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<FlashcardGenerationResponse> {
  try {
    const generateUseCase = getGenerateFlashcardsUseCase();

    const prompt = getFlashcardsPrompt(
      data.count,
      data.message,
      data.level,
      data.sourceLanguage,
      data.targetLanguage
    );

    const aiGenerator = generateUseCase as unknown as AIFlashcardGenerator;
    const generatedFlashcards = await aiGenerator.generateFlashcardsWithAI(
      prompt
    );

    const flashcards: ImportableFlashcard[] = generatedFlashcards.map(
      (flashcard: Record<string, string>) => ({
        origin_text: flashcard.origin_text || "",
        translate_text: flashcard.translate_text || "",
        example_using: flashcard.example_using || "",
        translate_example: flashcard.translate_example || "",
        category: flashcard.category || "",
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        difficultyLevel: data.level,
      })
    );

    return {
      success: true,
      flashcards: flashcards,
      redirect: "/guest-flashcard",
    };
  } catch (error) {
    console.error("Guest flashcard generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during flashcard generation",
    };
  }
}
