"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase, getFlashcardRepository } from "@/lib/container";
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

export async function getUserLanguagesAction() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
        languages: []
      };
    }
    
    const flashcardRepository = new PrismaFlashcardRepository();
    const languages = await flashcardRepository.getUserTargetLanguages(userId);
    
    return {
      success: true,
      languages
    };
  } catch (error) {
    console.error("Get user languages error:", error);
    return {
      success: false,
      error: `Failed to get languages: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      languages: []
    };
  }
}

// Akcja dla generowania fiszek dla niezalogowanych użytkowników
// Ta funkcja ma podobną strukturę do generateFlashcardsAction, ale nie wymaga uwierzytelnienia
export async function generateFlashcardsForGuestAction(data: {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}) {
  // Uproszczona implementacja bez zapisu do bazy danych
  try {
    // Wykorzystujemy to samo API generowania co dla zalogowanych użytkowników,
    // ale nie zapisujemy wyników w bazie danych
    const result = await getGenerateFlashcardsUseCase().execute({
      count: data.count,
      message: data.message,
      level: data.level,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      userId: 'guest', // Używamy 'guest' jako identyfikatora
      userEmail: 'guest@example.com' // Dodajemy fikcyjny email dla gościa
    });

    return { 
      success: true, 
      flashcards: result.flashcards || [],
      // W przypadku gościa nie zwracamy ID sesji, ponieważ nie zapisujemy jej w bazie
      sessionId: null 
    };
  } catch (error) {
    console.error("Error generating flashcards for guest:", error);
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred while generating flashcards",
      flashcards: [],
      sessionId: null
    };
  }
}

// Akcja do importowania fiszek gościa do bazy danych po zalogowaniu
export async function importGuestFlashcardsAction(flashcards: any[]) {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    return {
      success: false,
      error: "User not authenticated"
    };
  }

  try {
    // Otrzymujemy repozytorium fiszek
    const flashcardRepository = getFlashcardRepository();
    
    // Tworzymy tablicę obietnic dla każdej fiszki
    const flashcardPromises = flashcards.map(card => 
      flashcardRepository.createFlashcard({
        origin_text: card.origin_text,
        translate_text: card.translate_text,
        example_using: card.example_using,
        translate_example: card.translate_example,
        category: card.category,
        sourceLanguage: card.sourceLanguage,
        targetLanguage: card.targetLanguage,
        difficultyLevel: card.difficultyLevel,
        userId: userId
      })
    );
    
    // Zapisujemy wszystkie fiszki równolegle
    await Promise.all(flashcardPromises);

    return {
      success: true
    };
  } catch (error) {
    console.error("Error importing guest flashcards:", error);
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred while importing flashcards"
    };
  }
} 