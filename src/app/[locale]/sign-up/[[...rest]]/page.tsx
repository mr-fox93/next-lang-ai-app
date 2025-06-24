"use client";

import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full bg-black antialiased relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      <Suspense fallback={<div className="text-white">Loading…</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
} 