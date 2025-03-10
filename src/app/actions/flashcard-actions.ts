"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase, getFlashcardRepository } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { Flashcard } from "@/core/entities/Flashcard";

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
// Zoptymalizowana wersja, która nie korzysta z bazodanowych aspektów GenerateFlashcardsUseCase
export async function generateFlashcardsForGuestAction(data: {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}) {
  try {
    // Używamy istniejącej instancji GenerateFlashcardsUseCase, ale tylko po to, aby skorzystać
    // z jej metody generateFlashcardsWithAI, bez zapisywania do bazy danych
    const generateUseCase = getGenerateFlashcardsUseCase();
    
    // Tworzymy prompt do generowania fiszek
    const prompt = getFlashcardsPrompt(
      data.count,
      data.message,
      data.level,
      data.sourceLanguage,
      data.targetLanguage
    );
    
    // Wywołujemy metodę prywatną executeGuestFlashcardGeneration, która obsługuje
    // tylko generowanie AI bez zapisywania do bazy
    const generatedFlashcards = await (generateUseCase as any)
      .generateFlashcardsWithAI(prompt);
      
    // Uzupełniamy wygenerowane fiszki o informacje o językach i poziomie trudności
    const flashcards = generatedFlashcards.map((flashcard: any) => ({
      ...flashcard,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      difficultyLevel: data.level,
      userId: 'guest'
    }));

    return { 
      success: true, 
      flashcards: flashcards,
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

/**
 * Akcja serwerowa do zarządzania procesem generowania fiszek dla gości
 * Przenosi logikę biznesową z komponentu klienta (hero.tsx) do akcji serwerowej
 */
export async function handleGuestFlashcardGeneration(data: {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}) {
  try {
    // Wywołujemy akcję generowania fiszek dla gościa
    const result = await generateFlashcardsForGuestAction(data);
    
    if (result.success) {
      return {
        success: true,
        flashcards: result.flashcards,
        redirect: "/guest-flashcard"
      };
    } else {
      return {
        success: false,
        error: result.error || "Error generating flashcards"
      };
    }
  } catch (error) {
    console.error("Guest flashcard generation error:", error);
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred during flashcard generation"
    };
  }
} 