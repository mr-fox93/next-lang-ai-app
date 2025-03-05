"use server";

// Ustawiam maksymalny czas trwania funkcji na 60 sekund (maksimum dla planu Hobby)
export const maxDuration = 60;

import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";

interface GenerateFlashcardsActionParams {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function generateFlashcardsAction(params: GenerateFlashcardsActionParams) {
  try {
    const { count, message, level, sourceLanguage, targetLanguage } = params;
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in"
      };
    }

    const generateParams: GenerateFlashcardsParams = {
      count,
      message,
      level,
      userId,
      userEmail: user?.primaryEmailAddress?.emailAddress || "",
      sourceLanguage,
      targetLanguage
    };

    return await getGenerateFlashcardsUseCase().execute(generateParams);
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return {
      success: false,
      error: `Flashcard generation failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
    };
  }
}

export async function deleteCategoryAction(category: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in"
      };
    }
    
    const flashcardRepository = new PrismaFlashcardRepository();
    const deletedCount = await flashcardRepository.deleteFlashcardsByCategory(userId, category);
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    console.error("Category deletion error:", error);
    return {
      success: false,
      error: `Category deletion failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
    };
  }
} 