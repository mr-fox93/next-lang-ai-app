import { redirect } from 'next/navigation';
import { getLocale } from '@/i18n/server';

export default function PrivacyPolicyPage() {
  const locale = getLocale();
  redirect(`/${locale}/privacy-policy`);
} 