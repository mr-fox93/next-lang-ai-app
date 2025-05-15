import { redirect } from 'next/navigation';

export default function ImportGuestFlashcardsRedirectPage() {
  // Redirect to the English version by default
  redirect('/en/import-guest-flashcards');
}
