import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getGenerateFlashcardsUseCase } from "@/lib/container";
import { GenerateFlashcardsParams } from "@/core/useCases/flashcards/GenerateFlashcards";

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

    const { count, message, level, sourceLanguage = "en", targetLanguage = "pl" } = await req.json();

    const generateParams: GenerateFlashcardsParams = {
      count,
      message,
      level,
      userId,
      userEmail: user?.primaryEmailAddress?.emailAddress || "",
      sourceLanguage,
      targetLanguage
    };

    const result = await getGenerateFlashcardsUseCase().execute(generateParams);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
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
