import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import TermsClient from './terms-client';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <TermsClient />;
} 