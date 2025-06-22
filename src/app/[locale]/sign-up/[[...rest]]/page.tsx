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
    />
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Suspense fallback={<div>Loading…</div>}>
        <SignUpWithRedirect />
      </Suspense>
    </div>
  );
} 