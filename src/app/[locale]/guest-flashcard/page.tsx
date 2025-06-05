import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import GuestFlashcardView from './view';
import { Loader } from "@/components/ui/loader";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function GuestFlashcardPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader /></div>}>
      <GuestFlashcardView />
    </Suspense>
  );
} 