import { FlashcardsProvider } from "./context/flashcards-context";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FlashcardsProvider> {children}</FlashcardsProvider>
      </body>
    </html>
  );
}
