import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getFlashcards } from "../actions/flashcards";
import { FlashcardsClient } from "@/components/flashcards-client";
import { UserButton } from "@clerk/nextjs";

export default async function FlashcardsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const flashcards = await getFlashcards();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
              <UserButton />
        </div>
      </div>

      <div className="flex">
        <Suspense fallback={<div>Ładowanie...</div>}>
          <FlashcardsClient initialFlashcards={flashcards} />
        </Suspense>
      </div>
    </div>
  );
}
