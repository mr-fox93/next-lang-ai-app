'use client';

import { useSearchParams } from 'next/navigation';
import { MobileAuthInstructions } from '@/components/auth/mobile-auth-instructions';
import { useRouter } from '@/i18n/navigation';
import { Suspense } from 'react';

function MobileAuthHelpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const fromCallback = searchParams.get('from') === 'callback';

  const handleContinueAnyway = () => {
    router.push('/flashcards');
  };

  return (
    <div className="min-h-screen w-full bg-black antialiased relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
      
      <MobileAuthInstructions
        email={email || undefined}
        onContinueAnyway={fromCallback ? handleContinueAnyway : undefined}
        showFallback={fromCallback}
      />
    </div>
  );
}

export default function MobileAuthHelpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-black antialiased relative overflow-hidden flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <MobileAuthHelpContent />
    </Suspense>
  );
} 