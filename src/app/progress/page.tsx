import { redirect } from 'next/navigation';
import { getLocale } from '@/i18n/server';

export default function ProgressRedirectPage() {
  const locale = getLocale();
  redirect(`/${locale}/progress`);
}
