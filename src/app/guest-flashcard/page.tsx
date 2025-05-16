import { redirect } from 'next/navigation';
import { getLocale } from '@/i18n/server';

export default function GuestFlashcardRedirectPage() {
  const locale = getLocale();
  redirect(`/${locale}/guest-flashcard`);
} 