import { FlashcardsProvider } from "./context/flashcards-context";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <FlashcardsProvider> {children}</FlashcardsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
