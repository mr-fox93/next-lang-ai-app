import { Suspense } from 'react';
import { getFlashcardsForUser } from './actions';
import FlashcardsView from './view';
import { Loader } from "@/components/ui/loader";

interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[]>;
}

export default async function FlashcardsPage(props: PageProps) {
  const { flashcards, error } = await getFlashcardsForUser();
  const categoryParam = props.searchParams.category;
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
