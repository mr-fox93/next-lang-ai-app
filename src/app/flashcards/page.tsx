import { Suspense } from 'react';
import { getFlashcardsForUser, getProgressStatsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";

/**
 * Prosta implementacja komponentu strony bez parametrów.
 * Obsługa parametrów URL została przeniesiona do komponentu klienckiego
 * za pomocą hooka useSearchParams, co pozwala uniknąć problemów z typowaniem w Next.js 15.
 */
export default async function FlashcardsPage() {
  const { flashcards, error } = await getFlashcardsForUser();
  const progressStats = await getProgressStatsForUser();
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader /></div>}>
      <FlashcardsView 
        initialFlashcards={flashcards} 
        serverError={error} 
        initialCategory={null}
        progressStats={progressStats}
      />
    </Suspense>
  );
}

// Obsługa parametrów wyszukiwania została przeniesiona do komponentu FlashcardsView,
// co eliminuje problem z typowaniem w komponencie strony.
