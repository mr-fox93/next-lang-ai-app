'use client';

import { ReactNode, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useParams } from 'next/navigation';
import { defaultLocale } from '@/i18n/routing';

type Locale = 'en' | 'pl' | 'es' | 'it';

export default function ClientI18nProvider({ 
  children, 
  messages 
}: { 
  children: ReactNode;
  messages: Record<string, Record<string, string>>;
}) {
  const params = useParams();
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  
  useEffect(() => {
    // Safely get locale from params
    const localeFromParams = params?.locale as string;
    if (localeFromParams) {
      setLocale(localeFromParams as Locale);
    }
  }, [params]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Warsaw">
      {children}
    </NextIntlClientProvider>
  );
} 