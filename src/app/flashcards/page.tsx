import { Suspense } from 'react';
import { getFlashcardsForUser } from './flashcards-server';
import FlashcardsClient from './flashcards-client';
import { Loader } from "@/components/ui/loader";

export default async function FlashcardsPage() {
  const { flashcards, error } = await getFlashcardsForUser();
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader /></div>}>
      <FlashcardsClient initialFlashcards={flashcards} serverError={error} />
    </Suspense>
  );
}
