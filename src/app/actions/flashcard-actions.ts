"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";

interface GenerateFlashcardsActionParams {
  count: number;
  message: string;
  level: string;
}

export async function generateFlashcardsAction(params: GenerateFlashcardsActionParams) {
  try {
    const { count, message, level } = params;
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
      userEmail: user?.primaryEmailAddress?.emailAddress || ""
    };

    return await getGenerateFlashcardsUseCase().execute(generateParams);
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas generowania fiszek"
    };
  }
} 