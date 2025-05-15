import { redirect } from 'next/navigation';

export default function PrivacyPolicyPage() {
  // Redirect to the English version by default
  redirect('/en/privacy-policy');
} 