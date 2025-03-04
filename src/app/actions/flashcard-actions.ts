"use server";

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
        error: "Nie jesteś zalogowany"
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
    return {
      success: false,
      error: "Wystąpił błąd podczas generowania fiszek"
    };
  }
}

export async function deleteCategoryAction(category: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Nie jesteś zalogowany"
      };
    }
    
    const flashcardRepository = new PrismaFlashcardRepository();
    const deletedCount = await flashcardRepository.deleteFlashcardsByCategory(userId, category);
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    return {
      success: false,
      error: "Wystąpił błąd podczas usuwania kategorii"
    };
  }
} 