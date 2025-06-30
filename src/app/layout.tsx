import './globals.css';

export const metadata = {
  title: 'Languito - Language Learning with AI Flashcards',
  description: 'Learn any language with AI-generated flashcards tailored to your needs',
  keywords: 'language learning, AI flashcards, vocabulary, language education, spaced repetition',
  authors: [{ name: 'Languito Team' }],
  creator: 'Languito',
  openGraph: {
    title: 'Languito - Language Learning with AI Flashcards',
    description: 'Transform your language learning with AI-generated flashcards tailored to your specific needs. Master vocabulary faster with our intelligent spaced repetition system.',
    url: 'https://languito.eu',
    siteName: 'Languito',
    images: [
      {
        url: '/landing.png',
        width: 1200,
        height: 630,
        alt: 'Languito - AI-powered language learning platform with flashcards',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Languito - Language Learning with AI Flashcards',
    description: 'Transform your language learning with AI-generated flashcards tailored to your specific needs.',
    images: ['/landing.png'],
    creator: '@languito_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Można dodać kod weryfikacji Google
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
