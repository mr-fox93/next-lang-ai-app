import { ProgressDashboard } from "@/components/progress-dashboard";
import {
  getUserProgressStatsAction,
  getReviewedTodayCountAction,
} from "@/app/actions/progress-actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Set the locale for this request
  setRequestLocale(locale);

  // Auth check
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  // Fetch data in parallel
  const [statsResult, reviewedTodayResult] = await Promise.all([
    getUserProgressStatsAction(),
    getReviewedTodayCountAction()
  ]);

  if (!statsResult.success || !statsResult.data) {
    console.error("Error retrieving statistics:", statsResult.error);
    redirect(`/${locale}`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <ProgressDashboard
        initialStats={statsResult.data}
        initialReviewedToday={
          reviewedTodayResult.success ? reviewedTodayResult.data || 0 : 0
        }
      />
    </main>
  );
} 