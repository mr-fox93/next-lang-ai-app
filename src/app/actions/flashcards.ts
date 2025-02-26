'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { FlashCardSchema } from "@/lib/flashcard.schema";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { z } from "zod";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schematy walidacji dla parametrów
const GenerateFlashcardsInput = z.object({
  count: z.number().min(1).max(20),
  message: z.string().min(1),
  level: z.string()
});

const ProgressInput = z.object({
  flashcardId: z.number(),
  isCorrect: z.boolean()
});

export async function getFlashcards() {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { 
        userId: userId,
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    return flashcards;
  } catch (error) {
    console.error("Błąd pobierania fiszek:", error);
    throw new Error("Nie udało się pobrać fiszek");
  }
}

export async function generateFlashcards(count: number, message: string, level: string) {
  try {
    // Walidacja parametrów wejściowych
    GenerateFlashcardsInput.parse({ count, message, level });

    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      throw new Error("Nie jesteś zalogowany");
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user?.primaryEmailAddress?.emailAddress || "",
        preferredLanguage: "pl"
      }
    });

    const prompt = getFlashcardsPrompt(count, message, level);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning. Your response must be strictly valid JSON without any additional commentary or markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Nie udało się wygenerować fiszek - brak odpowiedzi od API");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (error) {
      console.error("Błąd parsowania JSON:", error);
      throw new Error("Nie udało się przetworzyć odpowiedzi z API");
    }

    let parsedData;
    try {
      parsedData = FlashCardSchema.parse(jsonData);
    } catch (error) {
      console.error("Błąd walidacji schematu:", error);
      throw new Error("Wygenerowane fiszki nie spełniają wymagań schematu");
    }

    const savedFlashcards = await Promise.all(
      parsedData.flashcards.map(async (flashcard) => {
        const saved = await prisma.flashcard.create({
          data: {
            origin_text: flashcard.origin_text,
            translate_text: flashcard.translate_text,
            example_using: flashcard.example_using,
            translate_example: flashcard.translate_example,
            category: flashcard.category,
            userId: userId,
          },
        });

        await prisma.progress.create({
          data: {
            flashcardId: saved.id,
            userId: userId,
            masteryLevel: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            nextReviewDate: new Date(),
          },
        });

        return saved;
      })
    );

    return savedFlashcards;
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd");
  }
}

export async function markFlashcardProgress(flashcardId: number, isCorrect: boolean) {
  try {
    // Walidacja parametrów wejściowych
    ProgressInput.parse({ flashcardId, isCorrect });

    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Nie jesteś zalogowany");
    }

    const progress = await prisma.progress.findFirst({
      where: {
        flashcardId,
        userId,
      },
    });

    if (!progress) {
      throw new Error("Nie znaleziono postępu dla tej fiszki");
    }

    await prisma.progress.update({
      where: { id: progress.id },
      data: {
        masteryLevel: isCorrect ? progress.masteryLevel + 1 : Math.max(0, progress.masteryLevel - 1),
        correctAnswers: isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers,
        incorrectAnswers: !isCorrect ? progress.incorrectAnswers + 1 : progress.incorrectAnswers,
        nextReviewDate: new Date(Date.now() + (isCorrect ? 24 : 4) * 60 * 60 * 1000),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Błąd aktualizacji postępu:", error);
    throw new Error("Nie udało się zaktualizować postępu");
  }
} 