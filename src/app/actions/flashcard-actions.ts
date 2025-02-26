"use server";

import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { FlashCardSchema } from "@/lib/flashcard.schema";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { zodResponseFormat } from "openai/helpers/zod";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateFlashcardsParams {
  count: number;
  message: string;
  level: string;
}

export async function generateFlashcardsAction(params: GenerateFlashcardsParams) {
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

    if (!count || count <= 0) {
      return {
        success: false,
        error: "Liczba fiszek musi być większa niż 0"
      };
    }

    // Sprawdź czy użytkownik istnieje w bazie, jeśli nie - utwórz go
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning. Your response must be strictly valid JSON without any additional commentary or markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(FlashCardSchema, "flashcardResponse"),
      temperature: 0.1,
      max_tokens: 500,
    });

    const parsedData = FlashCardSchema.parse(
      JSON.parse(response.choices[0].message.content || "[]")
    );

    // Zapisywanie fiszek w bazie danych
    const savedFlashcards = await Promise.all(
      parsedData.flashcards.map(async (flashcard) => {
        return await prisma.flashcard.create({
          data: {
            origin_text: flashcard.origin_text,
            translate_text: flashcard.translate_text,
            example_using: flashcard.example_using,
            translate_example: flashcard.translate_example,
            category: flashcard.category,
            userId: userId,
          },
        });
      })
    );

    // Tworzenie początkowych rekordów postępu dla każdej fiszki
    await Promise.all(
      savedFlashcards.map(async (flashcard: { id: number }) => {
        await prisma.progress.create({
          data: {
            flashcardId: flashcard.id,
            userId: userId,
            masteryLevel: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            nextReviewDate: new Date(),
          },
        });
      })
    );

    return {
      success: true,
      message: "Fiszki zostały pomyślnie wygenerowane i zapisane",
      flashcards: savedFlashcards
    };
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas generowania fiszek"
    };
  }
} 