import { redirect } from 'next/navigation';
import { getLocale } from '@/i18n/server';

export default function FlashcardsRedirectPage() {
  const locale = getLocale();
  redirect(`/${locale}/flashcards`);
}
