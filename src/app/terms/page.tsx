import { redirect } from 'next/navigation';

export default function TermsOfServicePage() {
  // Redirect to the English version by default
  redirect('/en/terms');
} 