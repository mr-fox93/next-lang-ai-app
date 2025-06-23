"use client";

import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams, useParams } from "next/navigation";

function SignUpWithRedirect() {
  const search = useSearchParams();
  const { locale = "en" } = (useParams() as { locale?: string });
  const redirect = search.get("redirect") ?? `/${locale}/flashcards`;

  return (
    <SignUp
      path={`/${locale}/sign-up`}
      routing="path"
      fallbackRedirectUrl={redirect}
      signInFallbackRedirectUrl={redirect}
      forceRedirectUrl={redirect}
      signInForceRedirectUrl={redirect}
      appearance={{
        elements: {
          formButtonPrimary:
            "w-full h-12 text-lg relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-white/20 text-white hover:opacity-80 transition-opacity",
          formFieldInput: "border-gray-300 focus:border-blue-500",
          card: "shadow-lg rounded-lg p-6 bg-white",
          rootBox: "mx-auto",
          cardBox: "shadow-lg rounded-lg p-6 bg-white",
        },
      }}
    />
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full bg-black antialiased relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      }>
        <SignUpWithRedirect />
      </Suspense>
    </div>
  );
} 