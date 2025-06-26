"use server";

import { auth } from "@/lib/auth";
import {
  getGenerateFlashcardsUseCase,
  getFlashcardRepository,
} from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";
import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { prisma } from "@/lib/prisma"; // Use secure configured client
import { isDemoMode } from "@/lib/demo-helpers";
import { 
  ImportableFlashcard, 
  FlashcardGenerationResponse, 
  GenerateFlashcardsActionParams,
  AIFlashcardGenerator 
} from "@/types/flashcard";
import { verifyRecaptcha } from "@/lib/recaptcha";

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
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        // Create new user without any logging
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
        // User created successfully - no logging needed
      } catch (createError) {
        console.error("Failed to create user:", createError);
        return {
          success: false,
          error: "Failed to create user record in database",
        };
      }
    }

    // Now that we're sure the user exists, import flashcards
    const flashcardRepository = getFlashcardRepository();

    const flashcardPromises = flashcards.map((card) =>
      flashcardRepository.createFlashcard({
        origin_text: card.origin_text,
        translate_text: card.translate_text,
        example_using: card.example_using,
        translate_example: card.translate_example,
        category: card.category,
        translate_category: card.translate_category,
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
  existingFlashcards?: Array<{origin_text: string, translate_text: string}>;
  recaptchaToken?: string;
}): Promise<FlashcardGenerationResponse> {
  try {
    // Verify reCAPTCHA for guest users
    if (data.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(data.recaptchaToken);
      if (!recaptchaResult.success) {
        return {
          success: false,
          error: recaptchaResult.error || "reCAPTCHA verification failed"
        };
      }
    } else if (!data.existingFlashcards || data.existingFlashcards.length === 0) {
      // For guest users, reCAPTCHA is required only for initial generation (not for generateMore)
      return {
        success: false,
        error: "reCAPTCHA verification required for guest users"
      };
    }

    const generateUseCase = getGenerateFlashcardsUseCase();

    const prompt = getFlashcardsPrompt(
      data.count,
      data.message,
      data.level,
      data.sourceLanguage,
      data.targetLanguage,
      data.existingFlashcards || []
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
        translate_category: flashcard.translate_category,
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
    const existingFlashcards = [
      ...existingFlashcardsInCategory.map(card => ({
        origin_text: card.origin_text,
        translate_text: card.translate_text
      })),
      // Add terms from existingTerms parameter (may come from frontend)
      ...existingTerms.map(term => ({
        origin_text: term,
        translate_text: term // Placeholder, will be filtered out by AI
      }))
    ];

    // Step 3: Use the enhanced generation with retry mechanism
    const message = `Generate more flashcards for the existing category "${category}". Focus on expanding vocabulary in this topic area with diverse, unique terms.`;

    const result = await getGenerateFlashcardsUseCase().generateMoreFlashcards({
      count,
      message,
      level: difficultyLevel,
      userId,
      userEmail: user?.email || "",
      sourceLanguage,
      targetLanguage, 
      category,
      existingFlashcards,
    });

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
    const existingFlashcards = existingTerms.map(term => ({
      origin_text: term,
      translate_text: term // Placeholder, exact matching will be done by AI
    }));

    // Step 2: Try up to 3 times to generate unique flashcards
    const maxAttempts = 3;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const message = `Generate more flashcards for the existing category "${category}". Focus on expanding vocabulary in this topic area with diverse, unique terms.`;
      
      try {
        const result = await handleGuestFlashcardGeneration({
          count,
          message,
          level: difficultyLevel,
          sourceLanguage,
          targetLanguage,
          existingFlashcards,
          recaptchaToken: undefined, // No recaptcha needed for generateMore
        });

        if (result.success && result.flashcards) {
          // Step 3: Validate and filter duplicates
          const uniqueFlashcards = result.flashcards.filter(card => 
            !existingTerms.some(term => 
              term.toLowerCase() === card.origin_text.toLowerCase() ||
              term.toLowerCase() === card.translate_text.toLowerCase()
            )
          );

          if (uniqueFlashcards.length > 0) {
            // Step 4: Ensure all flashcards have the correct category
            const flashcardsWithCategory = uniqueFlashcards.map((card) => ({
              ...card,
              category: category, // Force the exact category name
            }));

            return {
              success: true,
              flashcards: flashcardsWithCategory,
            };
          } else if (attempt < maxAttempts) {
            console.log(`Guest attempt ${attempt}: All generated flashcards were duplicates, retrying...`);
            lastError = `Wszystkie wygenerowane fiszki były duplikatami (próba ${attempt}/${maxAttempts})`;
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
        } else if (attempt < maxAttempts) {
          lastError = result.error || "Nieznany błąd podczas generowania";
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
      } catch (error) {
        console.error(`Guest generate more flashcards attempt ${attempt} error:`, error);
        lastError = error instanceof Error ? error.message : "Nieznany błąd";
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    return {
      success: false,
      error: `Nie udało się wygenerować unikalnych fiszek po ${maxAttempts} próbach. Ostatni błąd: ${lastError}`,
    };

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
