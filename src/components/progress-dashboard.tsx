"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Star,
  Award,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { updateDailyGoalAction } from "@/app/actions/progress-actions";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { UserProgressStats } from "@/types/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/shared/ui/error-message";

interface ProgressDashboardProps {
  initialStats: UserProgressStats;
  initialReviewedToday: number;
}

export function ProgressDashboard({
  initialStats,
  initialReviewedToday,
}: ProgressDashboardProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserProgressStats>(initialStats);
  const [reviewedToday] = useState(initialReviewedToday);
  const [dailyGoal, setDailyGoal] = useState(initialStats.dailyGoal || 10);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const originalStyles = {
      html: document.documentElement.style.cssText,
      body: document.body.style.cssText,
    };

    document.documentElement.style.cssText += `
      background-color: black !important;
      overscroll-behavior: none !important;
    `;
    document.body.style.cssText += `
      background-color: black !important;
      color: white;
      overscroll-behavior: none !important;
    `;

    return () => {
      document.documentElement.style.cssText = originalStyles.html;
      document.body.style.cssText = originalStyles.body;
    };
  }, []);

  const handleDailyGoalChange = async (value: string) => {
    const newGoal = parseInt(value, 10);
    setDailyGoal(newGoal);

    if (isSignedIn) {
      setIsSavingGoal(true);
      setErrorMessage(null);
      try {
        const result = await updateDailyGoalAction(newGoal);
        if (result.success) {
          toast({
            title: "Saved",
            description: "Your daily goal has been updated",
          });
          if (stats) {
            setStats({ ...stats, dailyGoal: newGoal });
          }
        } else {
          setErrorMessage(result.error || "Failed to update daily goal");
          toast({
            title: "Error",
            description: result.error || "Failed to update daily goal",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Daily goal update error:", error);
        const errorMessage =
          error instanceof Error
            ? `Daily goal update failed: ${error.message}`
            : "An unexpected error occurred while updating daily goal";

        setErrorMessage(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSavingGoal(false);
      }
    }
  };

  const progressToNextLevel = stats ? (stats.experiencePoints % 500) / 5 : 0;

  const masteryPercentage =
    stats && stats.totalFlashcards > 0
      ? (stats.masteredFlashcards / stats.totalFlashcards) * 100
      : 0;

  const dailyProgress = (reviewedToday / dailyGoal) * 100;

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <header className="border-b border-white/10 p-3 bg-black">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/flashcards">
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30"
              >
                Back to Learning
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {isSignedIn && (
              <>
                <UserButton />
                <span className="text-white font-medium hidden sm:inline-block">
                  {user?.fullName}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 bg-black overflow-y-auto">
        {errorMessage && (
          <div className="mb-6">
            <ErrorMessage
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          </div>
        )}

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Level
                </CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2 text-white">
                  <Award className="text-yellow-500 h-6 w-6" />{" "}
                  {stats.userLevel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={progressToNextLevel}
                  className="h-2 bg-white/10"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {stats.experiencePoints} / {stats.nextLevelPoints} XP
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Flashcards
                </CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2 text-white">
                  <BookOpen className="text-blue-500 h-6 w-6" />{" "}
                  {stats.totalFlashcards}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  <span className="text-green-400">
                    {stats.masteredFlashcards} mastered
                  </span>{" "}
                  • {stats.totalFlashcards - stats.masteredFlashcards} in
                  progress
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Language Mastery
                </CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2 text-white">
                  <Star className="text-yellow-500 h-6 w-6" />{" "}
                  {masteryPercentage.toFixed(0)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={masteryPercentage}
                  className="h-2 bg-white/10"
                  indicatorClassName="bg-gradient-to-r from-yellow-500 to-amber-500"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {stats.masteredFlashcards} of {stats.totalFlashcards}{" "}
                  flashcards mastered
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  A flashcard is considered mastered when it reaches the highest
                  level (5/5). Each correct answer brings you closer to
                  achieving this level.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Daily Activity
                </CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2 text-white">
                  <Clock className="text-purple-500 h-6 w-6" /> {reviewedToday}{" "}
                  / {dailyGoal}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <span className="text-gray-400">
                      Today&apos;s flashcards:
                    </span>
                    <span className="text-white font-medium">
                      {Math.min(reviewedToday, dailyGoal)} of {dailyGoal}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(dailyProgress, 100)}
                    className="h-2 bg-white/10 mt-2"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                  <p className="text-xs text-gray-500 mt-2 mb-3">
                    Number of unique flashcards reviewed today (counted only
                    once per flashcard). Goal resets at midnight.
                  </p>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">
                      Your daily goal:
                    </span>
                    <div className="flex-1">
                      <Select
                        value={dailyGoal.toString()}
                        onValueChange={handleDailyGoalChange}
                        disabled={isSavingGoal}
                      >
                        <SelectTrigger className="h-8 bg-black/40 border-white/10 text-white">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/10 text-white">
                          {[5, 10, 15, 20, 25, 30, 40, 50].map((goal) => (
                            <SelectItem key={goal} value={goal.toString()}>
                              {goal} flashcards
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isSavingGoal && (
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">
            Progress by Category
          </h2>

          <div className="space-y-4">
            {stats.categories.length === 0 ? (
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <p className="text-gray-400">
                  You don&apos;t have any flashcard categories yet.
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none"
                  onClick={() => router.push("/flashcards")}
                >
                  Create Flashcards
                </Button>
              </div>
            ) : (
              stats.categories.map((category, i) => (
                <Card
                  key={i}
                  className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-white">
                        {category.name}
                      </CardTitle>
                      <Link
                        href={`/flashcards?category=${encodeURIComponent(
                          category.name
                        )}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Mastered</span>
                        <span className="text-sm text-white">
                          {category.mastered} / {category.total} (
                          {category.total > 0
                            ? (
                                (category.mastered / category.total) *
                                100
                              ).toFixed(0)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                          style={{
                            width: `${
                              category.total > 0
                                ? (category.mastered / category.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                        <div className="font-semibold">{category.mastered}</div>
                        <div className="text-xs opacity-80">Mastered</div>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                        <div className="font-semibold">
                          {category.inProgress}
                        </div>
                        <div className="text-xs opacity-80">In Progress</div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <div className="font-semibold">
                          {category.untouched}
                        </div>
                        <div className="text-xs opacity-80">Untouched</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-8 mb-12">
            <Link href="/flashcards">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none">
                Continue Learning <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
