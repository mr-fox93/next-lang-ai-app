import { Suspense } from "react";
import {
  getFlashcardsForUser,
  getProgressStatsForUser,
  getMasteredCategoriesForUser,
} from "../../flashcards/actions";
import FlashcardsView from "../../flashcards/view";
import { Loader } from "@/components/ui/loader";
import { setRequestLocale } from 'next-intl/server';

export default async function FlashcardsPage({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  setRequestLocale(locale);

  const { flashcards, error } = await getFlashcardsForUser();
  const progressStats = await getProgressStatsForUser();
  const masteredCategoriesResult = await getMasteredCategoriesForUser();

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
        masteredCategories={
          masteredCategoriesResult.success ? masteredCategoriesResult.data : []
        }
      />
    </Suspense>
  );
} 