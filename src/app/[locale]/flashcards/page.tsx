import { Suspense } from "react";
import {
  getFlashcardsForUser,
  getProgressStatsForUser,
  getMasteredCategoriesForUser,
} from "./actions";
import FlashcardsView from "./view";
import { Loader } from "@/components/ui/loader";
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';

// Force dynamic rendering because we use cookies for demo mode
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  // Równoległe wykonywanie zapytań dla lepszej wydajności
  const [
    { flashcards, error },
    progressStats,
    masteredCategoriesResult
  ] = await Promise.all([
    getFlashcardsForUser(),
    getProgressStatsForUser(),
    getMasteredCategoriesForUser(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <FlashcardsView
        initialFlashcards={flashcards}
        serverError={error}
        initialCategory={null}
        progressStats={progressStats}
        masteredCategories={
          masteredCategoriesResult.success ? masteredCategoriesResult.data : []
        }
      />
    </Suspense>
  );
} 