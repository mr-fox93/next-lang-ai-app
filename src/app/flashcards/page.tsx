import { Suspense } from 'react';
import { getFlashcardsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { flashcards, error } = await getFlashcardsForUser();
  const categoryParam = searchParams.category;
  const selectedCategory = categoryParam 
    ? decodeURIComponent(typeof categoryParam === 'string' ? categoryParam : categoryParam[0]) 
    : null;
  
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
