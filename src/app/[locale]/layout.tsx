import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import '../globals.css';
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { LoadingErrorProvider } from "@/shared/ui/loading-error-provider";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import Footer from "@/components/footer";
import { CookieConsentProvider } from "@/components/cookie-consent";
import { LanguageProvider } from "@/shared/language-context";
import { ContactModalProvider } from "@/shared/contact-modal-context";
import ClientI18nProvider from '@/components/client-i18n-provider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    messages = (await import(`../../../messages/en.json`)).default;
  }

  return (
    <ClerkProvider>
      <html lang={locale}>
        <body className="relative isolate overflow-x-hidden">
          <ErrorBoundary>
            <LoadingErrorProvider>
              <ClientI18nProvider messages={messages}>
                <LanguageProvider>
                  <CookieConsentProvider>
                    <ContactModalProvider>
                      {children}
                      <Footer />
                    </ContactModalProvider>
                  </CookieConsentProvider>
                </LanguageProvider>
              </ClientI18nProvider>
            </LoadingErrorProvider>
          </ErrorBoundary>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
} 