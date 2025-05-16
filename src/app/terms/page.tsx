import { redirect } from 'next/navigation';
import { getLocale } from '@/i18n/server';

export default function TermsOfServicePage() {
  const locale = getLocale();
  redirect(`/${locale}/terms`);
} 