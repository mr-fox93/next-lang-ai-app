"use client";

import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";

function SignInWithRedirect() {
  const searchParams = useSearchParams();
  const params = useParams();
  const currentLocale = params?.locale as string || 'en';
  const redirect = searchParams.get("redirect");

  const fallbackRedirectUrl = redirect || `/${currentLocale}/flashcards`;

  return (
    <SignIn
      path={`/${currentLocale}/sign-in`}
      routing="path"
      fallbackRedirectUrl={fallbackRedirectUrl}
      signUpFallbackRedirectUrl={fallbackRedirectUrl}
      appearance={{
        elements: {
          formButtonPrimary:
            "w-full h-12 text-lg relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-white/20 text-white hover:opacity-80 transition-opacity",
          formFieldInput: "border-gray-300 focus:border-blue-500",
          card: "shadow-lg rounded-lg p-6 bg-white",
        },
      }}
    />
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full bg-black antialiased relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />{" "}
      <Suspense fallback={<div>Ładowanie...</div>}>
        <SignInWithRedirect />
      </Suspense>
    </div>
  );
} 