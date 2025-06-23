import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGenerateFlashcardsUseCase } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId, user } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      );
    }

    const {
      count,
      message,
      level,
      sourceLanguage = "en",
      targetLanguage = "pl",
    } = await req.json();

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

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania fiszek" },
      { status: 500 }
    );
  }
}
