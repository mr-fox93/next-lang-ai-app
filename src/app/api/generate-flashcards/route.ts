import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { EdgeFlashcardGenerator, EdgeGenerateFlashcardsParams } from "./edge-handler";
import { getGenerateFlashcardsUseCase } from "@/lib/container";

// Zwiększam limit czasu do 60 sekund
export const maxDuration = 60;

// Określam, że ta funkcja ma używać Edge Runtime, ale tylko w produkcji
// W środowisku lokalnym używamy standardowego runtime
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

export async function POST(req: NextRequest) {
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

    if (process.env.NODE_ENV !== 'production') {
      const generateParams = {
        count,
        message,
        level,
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || "",
        sourceLanguage,
        targetLanguage
      };

      const result = await getGenerateFlashcardsUseCase().execute(generateParams);
      return NextResponse.json(result);
    }

    const edgeGenerator = new EdgeFlashcardGenerator();
    const generateParams: EdgeGenerateFlashcardsParams = {
      count,
      message,
      level,
      sourceLanguage,
      targetLanguage
    };

    const result = await edgeGenerator.generateFlashcards(generateParams);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // W Edge Runtime nie zapisujemy fiszek, tylko zwracamy je do klienta
    // Zapis do bazy danych może być obsłużony przez oddzielny endpoint lub server action
    return NextResponse.json({
      success: true,
      message: "Fiszki zostały pomyślnie wygenerowane",
      flashcards: result.flashcards,
      userId: userId // Dołączamy userId, aby klient mógł opcjonalnie zapisać fiszki w bazie
    });
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    return NextResponse.json(
      { error: `Wystąpił błąd podczas generowania fiszek: ${error instanceof Error ? error.message : "Nieznany błąd"}` },
      { status: 500 }
    );
  }
}
