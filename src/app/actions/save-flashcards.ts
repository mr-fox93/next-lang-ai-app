"use server";

import { EdgeFlashcard } from "../api/generate-flashcards/edge-handler";
import { getFlashcardRepository, getProgressRepository, getUserRepository } from "@/lib/container";
import { auth } from "@clerk/nextjs/server";

export interface SaveFlashcardsParams {
  flashcards: EdgeFlashcard[];
  userId: string;
}

export interface SaveFlashcardsResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function saveFlashcardsAction(params: SaveFlashcardsParams): Promise<SaveFlashcardsResult> {
  try {
    const { flashcards, userId: providedUserId } = params;
    
    // Sprawdzamy, czy user jest zalogowany
    const { userId } = await auth();
    if (!userId || userId !== providedUserId) {
      return {
        success: false,
        error: "Nie jesteś autoryzowany do zapisania tych fiszek"
      };
    }

    if (!flashcards || flashcards.length === 0) {
      return {
        success: false,
        error: "Brak fiszek do zapisania"
      };
    }

    const flashcardRepository = getFlashcardRepository();
    const progressRepository = getProgressRepository();

    // Zapisz fiszki w bazie danych
    const savedFlashcards = await Promise.all(
      flashcards.map(flashcard => 
        flashcardRepository.createFlashcard({
          origin_text: flashcard.origin_text,
          translate_text: flashcard.translate_text,
          example_using: flashcard.example_using,
          translate_example: flashcard.translate_example,
          category: flashcard.category,
          sourceLanguage: flashcard.sourceLanguage,
          targetLanguage: flashcard.targetLanguage,
          difficultyLevel: flashcard.difficultyLevel,
          userId: userId
        })
      )
    );

    // Utwórz rekordy postępu dla każdej fiszki
    await Promise.all(
      savedFlashcards.map(flashcard => 
        progressRepository.createProgress({
          flashcardId: flashcard.id,
          userId: userId,
          masteryLevel: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          nextReviewDate: new Date()
        })
      )
    );

    return {
      success: true,
      message: "Fiszki zostały pomyślnie zapisane w bazie danych"
    };
  } catch (error) {
    console.error("Błąd zapisywania fiszek:", error);
    return {
      success: false,
      error: `Wystąpił błąd podczas zapisywania fiszek: ${error instanceof Error ? error.message : "Nieznany błąd"}`
    };
  }
} 