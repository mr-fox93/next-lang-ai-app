import { redirect } from 'next/navigation';
import { getLocale } from '@/i18n/server';

export default async function TermsRedirectPage() {
  const locale = await getLocale();
  redirect(`/${locale}/terms`);
} 