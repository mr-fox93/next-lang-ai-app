import { Suspense } from "react";
import { checkSessionState } from "../../import-guest-flashcards/actions";
import ImportGuestFlashcardsView from "../../import-guest-flashcards/view";
import { Loader } from "@/components/ui/loader";
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ImportGuestFlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  await checkSessionState();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <ImportGuestFlashcardsView />
    </Suspense>
  );
} 