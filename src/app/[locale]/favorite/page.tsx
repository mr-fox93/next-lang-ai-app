import { Suspense } from "react";
import { getAllFlashcardsForUser, getFavoriteFlashcardsForUser, getProgressStatsForUser } from "./actions";
import FlashcardsView from "@/app/[locale]/flashcards/view";
import { Loader } from "@/components/ui/loader";
import { setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FavoritePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ flashcards, error }, { flashcards: allFlashcards }, progressStats] = await Promise.all([
    getFavoriteFlashcardsForUser(),
    getAllFlashcardsForUser(),
    getProgressStatsForUser()
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
        answerFlashcards={allFlashcards.length ? allFlashcards : flashcards}
        initialFavoriteIds={flashcards.map((card) => card.id)}
        isFavoritesView
        serverError={error}
        initialCategory={null}
        progressStats={progressStats}
        masteredCategories={[]}
      />
    </Suspense>
  );
}
