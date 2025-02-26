import { Suspense } from 'react';
import { getFlashcardsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";
import { PageProps } from 'next';

export default async function FlashcardsPage({
  searchParams,
}: PageProps) {
  const { flashcards, error } = await getFlashcardsForUser();
  
  const categoryParam = searchParams?.category;
  const selectedCategory = categoryParam 
    ? decodeURIComponent(typeof categoryParam === 'string' ? categoryParam : Array.isArray(categoryParam) ? categoryParam[0] : String(categoryParam)) 
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
