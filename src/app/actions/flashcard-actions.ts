"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { saveFlashcardsAction } from "./save-flashcards";

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

    if (process.env.NODE_ENV !== 'production') {
      const generateParams: GenerateFlashcardsParams = {
        count,
        message,
        level,
        userId,
        userEmail: user?.emailAddresses?.[0]?.emailAddress || "",
        sourceLanguage,
        targetLanguage
      };
  
      return await getGenerateFlashcardsUseCase().execute(generateParams);
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 
        process.env.VERCEL_URL || 
        'https://next-lang-ai-app.vercel.app';
        
      const response = await fetch(`${apiUrl}/api/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count,
          message,
          level,
          sourceLanguage,
          targetLanguage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.flashcards && result.flashcards.length > 0) {
        const saveResult = await saveFlashcardsAction({
          flashcards: result.flashcards,
          userId
        });

        if (!saveResult.success) {
          console.error("Error saving flashcards:", saveResult.error);
          return {
            success: false,
            error: `Fiszki zostały wygenerowane, ale nie można ich zapisać: ${saveResult.error}`
          };
        }

        return {
          success: true,
          message: "Fiszki zostały pomyślnie wygenerowane i zapisane",
          flashcards: result.flashcards
        };
      } else {
        return {
          success: false,
          error: result.error || "Nieznany błąd podczas generowania fiszek"
        };
      }
    } catch (error) {
      throw error;
    }
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