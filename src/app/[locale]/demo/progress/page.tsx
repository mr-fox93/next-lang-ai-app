import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { DemoProgressPage } from '@/app/[locale]/demo/_components/DemoProgressPage';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Set the locale for this request
  setRequestLocale(locale);

  return <DemoProgressPage />;
} 