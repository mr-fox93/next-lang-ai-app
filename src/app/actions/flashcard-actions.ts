"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase, getFlashcardRepository } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";

// Tymczasowa definicja interfejsu
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

// Definiuję typy dla response z GPT
interface FlashcardGenerationResponse {
  success: boolean;
  flashcards?: ImportableFlashcard[];
  error?: string;
  redirect?: string;
}

// Definiuję interfejs dla wewnętrznego API GenerateFlashcardsUseCase
interface AIFlashcardGenerator {
  generateFlashcardsWithAI(prompt: string): Promise<Record<string, string>[]>;
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
    const generateUseCase = getGenerateFlashcardsUseCase();
    
    // Tworzymy prompt dla AI
    const prompt = getFlashcardsPrompt(
      data.count,
      data.message,
      data.level,
      data.sourceLanguage,
      data.targetLanguage
    );
    
    // Bezpieczna konwersja typów
    const aiGenerator = generateUseCase as unknown as AIFlashcardGenerator;
    const generatedFlashcards = await aiGenerator.generateFlashcardsWithAI(prompt);
      
    // Uzupełniamy wygenerowane fiszki o informacje o językach i poziomie trudności
    const flashcards: ImportableFlashcard[] = generatedFlashcards.map((flashcard: Record<string, string>) => ({
      origin_text: flashcard.origin_text || '',
      translate_text: flashcard.translate_text || '',
      example_using: flashcard.example_using || '',
      translate_example: flashcard.translate_example || '',
      category: flashcard.category || '',
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      difficultyLevel: data.level
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
export async function importGuestFlashcardsAction(flashcards: ImportableFlashcard[]) {
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
    
    // Wykonujemy wszystkie obietnice równolegle
    await Promise.all(flashcardPromises);
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error importing guest flashcards:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during import"
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
}): Promise<FlashcardGenerationResponse> {
  try {
    const generateUseCase = getGenerateFlashcardsUseCase();
    
    // Tworzymy prompt dla AI
    const prompt = getFlashcardsPrompt(
      data.count,
      data.message,
      data.level,
      data.sourceLanguage,
      data.targetLanguage
    );
    
    // Bezpieczna konwersja typów
    const aiGenerator = generateUseCase as unknown as AIFlashcardGenerator;
    const generatedFlashcards = await aiGenerator.generateFlashcardsWithAI(prompt);
      
    // Uzupełniamy wygenerowane fiszki o informacje o językach i poziomie trudności
    const flashcards: ImportableFlashcard[] = generatedFlashcards.map((flashcard: Record<string, string>) => ({
      origin_text: flashcard.origin_text || '',
      translate_text: flashcard.translate_text || '',
      example_using: flashcard.example_using || '',
      translate_example: flashcard.translate_example || '',
      category: flashcard.category || '',
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      difficultyLevel: data.level
    }));

    return {
      success: true,
      flashcards: flashcards,
      redirect: "/guest-flashcard"
    };
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