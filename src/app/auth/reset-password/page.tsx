'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debugLog } from '@/utils/debug';

function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get locale from browser and redirect to localized reset page
    const browserLocale = navigator.language.split('-')[0];
    const supportedLocales = ['en', 'pl', 'es', 'it'];
    const locale = supportedLocales.includes(browserLocale) ? browserLocale : 'en';
    
    // Preserve all search parameters 
    const queryString = searchParams.toString();
    const redirectUrl = `/${locale}/reset-password${queryString ? `?${queryString}` : ''}`;
    
    debugLog('Redirecting from /auth/reset-password to:', redirectUrl);
    router.replace(redirectUrl);
  }, [router, searchParams]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white">Redirecting...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordRedirect />
    </Suspense>
  );
} 