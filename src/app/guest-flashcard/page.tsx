import { redirect } from 'next/navigation';

export default function GuestFlashcardRedirectPage() {
  // Redirect to the English version by default
  redirect('/en/guest-flashcard');
} 