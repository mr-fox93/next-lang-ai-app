import { ProgressDashboard } from "@/components/progress-dashboard";
import { getUserProgressStatsAction, getReviewedTodayCountAction } from "@/app/actions/progress-actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function ProgressPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const statsResult = await getUserProgressStatsAction();
  const reviewedTodayResult = await getReviewedTodayCountAction();
  
  if (!statsResult.success || !statsResult.data) {

    console.error("Błąd pobierania statystyk:", statsResult.error);
    redirect("/");
  }
  
  return (
    <main className="min-h-screen bg-black text-white">
      <ProgressDashboard 
        initialStats={statsResult.data} 
        initialReviewedToday={reviewedTodayResult.success ? reviewedTodayResult.data || 0 : 0} 
      />
    </main>
  );
} 