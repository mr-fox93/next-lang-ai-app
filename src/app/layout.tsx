import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { LoadingErrorProvider } from "@/shared/ui/loading-error-provider";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import Footer from "@/components/footer";
import { CookieConsentProvider } from "@/components/cookie-consent";
import { LanguageProvider } from "@/shared/language-context";
import { ContactModalProvider } from "@/shared/contact-modal-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ErrorBoundary>
            <LoadingErrorProvider>
              <LanguageProvider>
                <CookieConsentProvider>
                  <ContactModalProvider>
                    {children}
                    <Footer />
                  </ContactModalProvider>
                </CookieConsentProvider>
              </LanguageProvider>
            </LoadingErrorProvider>
          </ErrorBoundary>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
