import { redirect } from 'next/navigation';

export default function SignInRedirectPage() {
  // Redirect to the English version by default
  redirect('/en/sign-in');
}
