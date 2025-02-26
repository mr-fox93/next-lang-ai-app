import { Suspense } from 'react';
import { getFlashcardsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";

// Zgodne z Next.js 15 typowanie dla komponentów App Router

type SearchParams = { [key: string]: string | string[] | undefined };

interface PageProps {
  params: { [key: string]: string };
  searchParams: SearchParams;
}

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
