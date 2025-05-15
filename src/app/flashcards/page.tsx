import { redirect } from 'next/navigation';

export default function FlashcardsRedirectPage() {
  // Redirect to the English version by default
  redirect('/en/flashcards');
}
