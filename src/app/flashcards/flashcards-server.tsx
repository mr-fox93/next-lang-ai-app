import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getFlashcardsForUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.warn("Brak zalogowanego użytkownika - zwracam pustą tablicę");
      return { flashcards: [] };
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { 
        userId: userId,
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    console.log(`Znaleziono ${flashcards.length} fiszek dla użytkownika ${userId}`);
    
    return { flashcards };
  } catch (error) {
    console.error("Błąd pobierania fiszek:", error);
    return { flashcards: [], error: "Wystąpił błąd podczas pobierania fiszek" };
  }
} 