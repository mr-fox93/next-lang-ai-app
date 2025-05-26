"use server";

import { auth } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import {
  getGenerateFlashcardsUseCase,
  getFlashcardRepository,
} from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

// Helper function to check if in demo mode
async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('demo_mode')?.value === 'true';
}

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
    // Check if in demo mode - if so, don't save to database
    if (await isDemoMode()) {
      return {
        success: false,
        error: "Demo mode: Please sign in to generate and save flashcards",
      };
    }

    const { count, message, level, sourceLanguage, targetLanguage } = params;
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    try {
      const prisma = new PrismaClient();
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        console.log(
          "Creating new user in database before generating flashcards:",
          userId
        );
        await prisma.user.create({
          data: {
            id: userId,
            email: user?.primaryEmailAddress?.emailAddress || "",
            username: user?.username || user?.firstName || "User",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    } catch (userError) {
      console.error("Error checking/creating user:", userError);
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
    // Check if in demo mode - if so, don't delete from database
    if (await isDemoMode()) {
      return {
        success: false,
        error: "Demo mode: Please sign in to delete categories",
      };
    }

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
    // Check if in demo mode - if so, return mock data
    if (await isDemoMode()) {
      return {
        success: true,
        languages: ["en", "es", "de"], // Mock languages for demo
      };
    }

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
    const prisma = new PrismaClient();
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email: user.primaryEmailAddress?.emailAddress || "",
            username: user.username || user.firstName || "User",
          },
        });
        console.log("Created new user in database:", dbUser.id);
      } catch (createError) {
        console.error("Failed to create user:", createError);
        return {
          success: false,
          error: "Failed to create user record in database",
        };
      }
    }

    // Teraz gdy mamy pewność, że użytkownik istnieje, importujemy fiszki
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

export async function generateMoreFlashcardsAction(params: {
  category: string;
  existingTerms: string[];
  count: number;
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
}) {
  try {
    // Check if in demo mode - if so, don't save to database
    if (await isDemoMode()) {
      return {
        success: false,
        error: "Demo mode: Please sign in to generate more flashcards",
      };
    }

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
      };
    }

    const {
      category,
      existingTerms,
      count,
      sourceLanguage,
      targetLanguage,
      difficultyLevel,
    } = params;

    const message = `Generate ${count} new flashcards for the category "${category}" that DO NOT CONTAIN the following terms: ${existingTerms.join(
      ", "
    )}. The flashcards should be related to the same category.`;

    const generateParams: GenerateFlashcardsParams = {
      count,
      message,
      level: difficultyLevel,
      userId,
      userEmail: user?.primaryEmailAddress?.emailAddress || "",
      sourceLanguage,
      targetLanguage,
    };

    const result = await getGenerateFlashcardsUseCase().execute(generateParams);

    if (result.success && result.flashcards) {
      // Currently the API doesn't allow direct category modification when using GenerateFlashcardsUseCase
      // In practice, the AI model should return flashcards in the requested category, but we may add additional
      // checks/modifications here in the future if needed
    }

    return result;
  } catch (error) {
    console.error("Additional flashcards generation error:", error);
    return {
      success: false,
      error: `Additional flashcards generation failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}

export async function generateMoreGuestFlashcardsAction(params: {
  category: string;
  existingTerms: string[];
  count: number;
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
}): Promise<FlashcardGenerationResponse> {
  try {
    const {
      category,
      existingTerms,
      count,
      sourceLanguage,
      targetLanguage,
      difficultyLevel,
    } = params;

    const message = `Generate ${count} new flashcards for the category "${category}" that DO NOT CONTAIN the following terms: ${existingTerms.join(
      ", "
    )}. The flashcards should be related to the same category.`;

    const result = await handleGuestFlashcardGeneration({
      count,
      message,
      level: difficultyLevel,
      sourceLanguage,
      targetLanguage,
    });

    if (result.success && result.flashcards) {
      const flashcardsWithCategory = result.flashcards.map((card) => ({
        ...card,
        category: category,
      }));

      return {
        success: true,
        flashcards: flashcardsWithCategory,
      };
    }

    return result;
  } catch (error) {
    console.error("Additional guest flashcards generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during guest flashcard generation",
    };
  }
}
