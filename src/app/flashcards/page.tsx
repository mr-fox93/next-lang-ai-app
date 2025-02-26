import { Suspense } from 'react';
import { getFlashcardsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const { flashcards, error } = await getFlashcardsForUser();
  const selectedCategory = searchParams.category ? decodeURIComponent(searchParams.category) : null;
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader /></div>}>
      <FlashcardsView 
        initialFlashcards={flashcards} 
        serverError={error} 
        initialCategory={selectedCategory}
      />
    </Suspense>
  );
}
