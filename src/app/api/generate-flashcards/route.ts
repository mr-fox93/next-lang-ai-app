import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { FlashCardSchema } from "@/lib/flashcard.schema";
import { getFlashcardsPrompt } from "@/lib/prompts";
import { auth, currentUser } from "@clerk/nextjs/server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      );
    }

    // Sprawdź czy użytkownik istnieje w bazie, jeśli nie - utwórz go
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user?.primaryEmailAddress?.emailAddress || "",
        preferredLanguage: "pl"
      }
    });

    const { count, message, level } = await req.json();

    if (!count || count <= 0) {
      return NextResponse.json(
        { error: "Liczba fiszek musi być większa niż 0" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ 
      success: true, 
      message: "Fiszki zostały pomyślnie wygenerowane i zapisane", 
      flashcards: savedFlashcards 
    });
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania fiszek" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ flashcards: [] }, { status: 401 });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { userId },
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Błąd pobierania fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania fiszek" },
      { status: 500 }
    );
  }
}
