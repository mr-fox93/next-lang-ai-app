'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useParams } from 'next/navigation';
import { defaultLocale } from '@/i18n/routing';

export default function ClientI18nProvider({ 
  children, 
  messages 
}: { 
  children: ReactNode;
  messages: Record<string, Record<string, string>>;
}) {
  const params = useParams();
  // Get locale directly from params or fall back to default
  const locale = (params?.locale as string) || defaultLocale;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Warsaw">
      {children}
    </NextIntlClientProvider>
  );
} 