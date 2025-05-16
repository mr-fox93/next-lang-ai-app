import { Suspense } from 'react';
import { getFlashcardsForGuest, getProgressStatsForGuest } from '../../guest-flashcard/actions';
import GuestFlashcardsView from '../../guest-flashcard/view';
import { Loader } from "@/components/ui/loader";
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function GuestFlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  const { flashcards, error } = await getFlashcardsForGuest();
  const progressStats = await getProgressStatsForGuest();
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader /></div>}>
      <GuestFlashcardsView 
        initialFlashcards={flashcards} 
        serverError={error || undefined} 
        initialCategory={null}
        progressStats={progressStats}
      />
    </Suspense>
  );
} 