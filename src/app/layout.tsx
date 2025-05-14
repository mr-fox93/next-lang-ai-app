import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { LoadingErrorProvider } from "@/shared/ui/loading-error-provider";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import Footer from "@/components/footer";
import { CookieConsentProvider } from "@/components/cookie-consent";
import { LanguageProvider } from "@/shared/language-context";

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
                  {children}
                  <Footer />
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
