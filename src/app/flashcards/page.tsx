import { Suspense } from 'react';
import { getFlashcardsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";

// Next.js 15 automatycznie generuje typy dla komponentów strony
// Nie definiujemy żadnych własnych typów, aby uniknąć niezgodności

export default async function FlashcardsPage(props: {
  params: {};
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { searchParams } = props;
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
