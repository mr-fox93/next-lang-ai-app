import { Suspense } from 'react';
import { getFlashcardsForGuest, getProgressStatsForGuest } from './actions';
import GuestFlashcardsView from './view';
import { Loader } from "@/components/ui/loader";


export default async function GuestFlashcardsPage() {
  const { flashcards, error } = await getFlashcardsForGuest();
  const progressStats = await getProgressStatsForGuest();
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader /></div>}>
      <GuestFlashcardsView 
        initialFlashcards={flashcards} 
        serverError={error} 
        initialCategory={null}
        progressStats={progressStats}
      />
    </Suspense>
  );
} 