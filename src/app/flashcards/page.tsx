import { Suspense } from "react";
import { getFlashcardsForUser, getProgressStatsForUser } from "./actions";
import FlashcardsView from "./view";
import { Loader } from "@/components/ui/loader";

export default async function FlashcardsPage() {
  const { flashcards, error } = await getFlashcardsForUser();
  const progressStats = await getProgressStatsForUser();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <FlashcardsView
        initialFlashcards={flashcards}
        serverError={error}
        initialCategory={null}
        progressStats={progressStats}
      />
    </Suspense>
  );
}
