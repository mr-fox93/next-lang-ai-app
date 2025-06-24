"use server";

import { auth } from "@/lib/auth";
import {
  getGenerateFlashcardsUseCase,
  getFlashcardRepository,
} from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { PrismaClient } from "@prisma/client";
import { isDemoMode } from "@/lib/demo-helpers";
import { 
  ImportableFlashcard, 
  FlashcardGenerationResponse, 
  GenerateFlashcardsActionParams,
  AIFlashcardGenerator 
} from "@/types/flashcard";

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
    const { userId, user } = await auth();

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
            email: user?.email || "",
            username: user?.user_metadata?.username || user?.email?.split('@')[0] || "User",
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
      userEmail: user?.email || "",
      sourceLanguage,
      targetLanguage,
    };

    const result = await getGenerateFlashcardsUseCase().execute(generateParams);

    return result;
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
  const { userId, user } = await auth();

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
            email: user.email || "",
            username: user.user_metadata?.username || user.email?.split('@')[0] || "User",
          },
        });
        // Secure: don't log user ID or sensitive data
        if (process.env.NODE_ENV === 'development') {
          console.log("[FLASHCARDS] New user created in database");
        }
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

    const { userId, user } = await auth();

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

    // Step 1: Verify that the category exists in user's flashcards
    const flashcardRepository = new PrismaFlashcardRepository();
    const userFlashcards = await flashcardRepository.getFlashcardsByUserId(userId);
    const existingCategory = userFlashcards.find(card => card.category === category);
    
    if (!existingCategory) {
      return {
        success: false,
        error: `Category "${category}" not found. Please select an existing category.`,
      };
    }

    // Step 2: Get all existing terms in this category to prevent duplicates
    const existingFlashcardsInCategory = userFlashcards.filter(card => card.category === category);
    const allExistingTerms = Array.from(
      new Set([
        ...existingTerms,
        ...existingFlashcardsInCategory.map(card => card.origin_text.toLowerCase()),
        ...existingFlashcardsInCategory.map(card => card.translate_text.toLowerCase())
      ])
    );

    // Step 3: Create a very explicit message that forces the exact category
    const excludeTermsText = allExistingTerms.length > 0 
      ? `- DO NOT include ANY of these existing terms: ${allExistingTerms.join(", ")}`
      : `- Generate completely new and unique terms`;
      
    const message = `Generate ${count} new flashcards SPECIFICALLY for the existing category "${category}". 

CRITICAL REQUIREMENTS:
- ALL flashcards MUST have category: "${category}" (use this EXACT name)
- DO NOT create variations of the category name
${excludeTermsText}
- All flashcards must be related to the same topic as the existing "${category}" category
- Generate unique terms that complement the existing flashcards in this category`;

    const generateParams: GenerateFlashcardsParams = {
      count,
      message,
      level: difficultyLevel,
      userId,
      userEmail: user?.email || "",
      sourceLanguage,
      targetLanguage,
    };

    const result = await getGenerateFlashcardsUseCase().execute(generateParams);

    // Step 4: Validate that AI returned the correct category and no duplicates
    if (result.success && result.flashcards) {
      const invalidFlashcards = result.flashcards.filter(card => 
        card.category !== category || 
        allExistingTerms.includes(card.origin_text.toLowerCase()) ||
        allExistingTerms.includes(card.translate_text.toLowerCase())
      );

      if (invalidFlashcards.length > 0) {
        return {
          success: false,
          error: `AI generated invalid flashcards: wrong category or duplicates detected. Please try again.`,
        };
      }

      // Note: Duplicates already checked in Step 4 with comprehensive allExistingTerms
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

    // Step 1: Create comprehensive list of existing terms to prevent duplicates
    const allExistingTerms = Array.from(new Set(existingTerms.map(term => term.toLowerCase())));

    // Step 2: Create a very explicit message that forces the exact category
    const excludeTermsText = allExistingTerms.length > 0 
      ? `- DO NOT include ANY of these existing terms: ${allExistingTerms.join(", ")}`
      : `- Generate completely new and unique terms`;
      
    const message = `Generate ${count} new flashcards SPECIFICALLY for the existing category "${category}". 

CRITICAL REQUIREMENTS:
- ALL flashcards MUST have category: "${category}" (use this EXACT name)
- DO NOT create variations of the category name
${excludeTermsText}
- All flashcards must be related to the same topic as the existing "${category}" category
- Generate unique terms that complement the existing flashcards in this category`;

    const result = await handleGuestFlashcardGeneration({
      count,
      message,
      level: difficultyLevel,
      sourceLanguage,
      targetLanguage,
    });

    if (result.success && result.flashcards) {
      // Step 3: Validate that AI returned the correct category and no duplicates
      const invalidFlashcards = result.flashcards.filter(card => 
        card.category !== category || 
        allExistingTerms.includes(card.origin_text.toLowerCase()) ||
        allExistingTerms.includes(card.translate_text.toLowerCase())
      );

      if (invalidFlashcards.length > 0) {
        return {
          success: false,
          error: `AI generated invalid flashcards: wrong category or duplicates detected. Please try again.`,
        };
      }

      // Step 4: Ensure all flashcards have the correct category
      const flashcardsWithCategory = result.flashcards.map((card) => ({
        ...card,
        category: category, // Force the exact category name
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
