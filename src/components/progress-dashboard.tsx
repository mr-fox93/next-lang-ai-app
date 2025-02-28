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
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  getUserProgressStatsAction, 
  getReviewedTodayCountAction,
  updateDailyGoalAction
} from "@/app/actions/progress-actions";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { UserProgressStats } from "@/types/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ErrorMessage } from "@/shared/ui/error-message";

export function ProgressDashboard() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await getUserProgressStatsAction();
        
        if (result.success && result.data) {
          setStats(result.data);
          setDailyGoal(result.data.dailyGoal || 10);
        } else {
          setErrorMessage(result.error || "Nie udało się pobrać statystyk");
          toast({
            title: "Błąd",
            description: result.error || "Nie udało się pobrać statystyk",
            variant: "destructive"
          });
        }
        
        // Pobierz liczbę fiszek przejrzanych dzisiaj
        const todayResult = await getReviewedTodayCountAction();
        if (todayResult.success) {
          setReviewedToday(todayResult.data || 0);
        }
      } catch (error) {
        console.error("Błąd pobierania statystyk:", error);
        setErrorMessage("Nie udało się pobrać statystyk postępu");
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać statystyk postępu",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isSignedIn) {
      fetchStats();
    }
  }, [isSignedIn, toast]);
  
  // Funkcja do aktualizacji dziennego celu
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
            title: "Zapisano",
            description: "Twój dzienny cel został zaktualizowany",
          });
          // Aktualizujemy statystyki, aby uwzględnić nowy cel
          if (stats) {
            setStats({...stats, dailyGoal: newGoal});
          }
        } else {
          setErrorMessage(result.error || "Nie udało się zaktualizować dziennego celu");
          toast({
            title: "Błąd",
            description: result.error || "Nie udało się zaktualizować dziennego celu",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Błąd aktualizacji celu:", error);
        setErrorMessage("Nie udało się zaktualizować dziennego celu");
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować dziennego celu",
          variant: "destructive"
        });
      } finally {
        setIsSavingGoal(false);
      }
    }
  };
  
  // Obliczenia dla pasków postępu
  const progressToNextLevel = stats 
    ? (stats.experiencePoints % 500) / 5 
    : 0;
  
  const masteryPercentage = stats && stats.totalFlashcards > 0 
    ? (stats.masteredFlashcards / stats.totalFlashcards) * 100 
    : 0;
  
  // Procent wykonania dziennego celu
  const dailyProgress = (reviewedToday / dailyGoal) * 100;
  
  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Twój postęp</h1>
            <Link href="/flashcards">
              <Button 
                variant="outline" 
                className="ml-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30"
              >
                Wróć do nauki
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isSignedIn && (
              <>
                <UserButton />
                <span className="text-white font-medium">{user?.fullName}</span>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {errorMessage && (
          <div className="mb-6">
            <ErrorMessage 
              message={errorMessage} 
              onClose={() => setErrorMessage(null)} 
            />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-80px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : stats ? (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-400">Poziom</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Award className="text-yellow-500 h-6 w-6" /> {stats.userLevel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={progressToNextLevel} className="h-2 bg-white/10" />
                  <p className="text-sm text-gray-400 mt-2">
                    {stats.experiencePoints} / {stats.nextLevelPoints} PD
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-400">Fiszki</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <BookOpen className="text-blue-500 h-6 w-6" /> {stats.totalFlashcards}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    <span className="text-green-400">{stats.masteredFlashcards} opanowanych</span> • {stats.totalFlashcards - stats.masteredFlashcards} w nauce
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-400">Biegłość językowa</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Star className="text-yellow-500 h-6 w-6" /> {masteryPercentage.toFixed(0)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={masteryPercentage} 
                    className="h-2 bg-white/10" 
                    indicatorClassName="bg-gradient-to-r from-yellow-500 to-amber-500"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    {stats.masteredFlashcards} z {stats.totalFlashcards} fiszek opanowanych
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fiszka jest uznawana za opanowaną po uzyskaniu najwyższego poziomu (5/5). 
                    Każda poprawna odpowiedź przybliża Cię do osiągnięcia tego poziomu.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription className="text-gray-400">Aktywność dzienna</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    <Clock className="text-purple-500 h-6 w-6" /> {reviewedToday} / {dailyGoal}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dzisiejsze fiszki:</span>
                      <span className="text-white font-medium">
                        {Math.min(reviewedToday, dailyGoal)} z {dailyGoal}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(dailyProgress, 100)} 
                      className="h-2 bg-white/10 mt-2" 
                      indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                    <p className="text-xs text-gray-500 mt-2 mb-3">
                      Liczba unikalnych fiszek przeglądniętych dzisiaj (liczona tylko raz na fiszkę). Cel resetuje się o północy.
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-xs">Twój cel dzienny:</span>
                      <div className="flex-1">
                        <Select
                          value={dailyGoal.toString()}
                          onValueChange={handleDailyGoalChange}
                          disabled={isSavingGoal}
                        >
                          <SelectTrigger className="h-8 bg-black/40 border-white/10 text-white">
                            <SelectValue placeholder="Wybierz cel" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            {[5, 10, 15, 20, 25, 30, 40, 50].map(goal => (
                              <SelectItem key={goal} value={goal.toString()}>
                                {goal} fiszek
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
            
            <h2 className="text-xl font-bold text-white mb-4">Postęp według kategorii</h2>
            
            <div className="space-y-4">
              {stats.categories.length === 0 ? (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-gray-400">Nie masz jeszcze żadnych kategorii fiszek.</p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none"
                    onClick={() => router.push('/flashcards')}
                  >
                    Utwórz fiszki
                  </Button>
                </div>
              ) : (
                stats.categories.map((category, i) => (
                  <Card key={i} className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg text-white">{category.name}</CardTitle>
                        <Link href={`/flashcards?category=${encodeURIComponent(category.name)}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Opanowanie</span>
                          <span className="text-sm text-white">
                            {category.mastered} / {category.total} ({category.total > 0 ? ((category.mastered / category.total) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full" 
                            style={{ width: `${category.total > 0 ? (category.mastered / category.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                          <div className="font-semibold">{category.mastered}</div>
                          <div className="text-xs opacity-80">Opanowane</div>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                          <div className="font-semibold">{category.inProgress}</div>
                          <div className="text-xs opacity-80">W trakcie</div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <div className="font-semibold">{category.untouched}</div>
                          <div className="text-xs opacity-80">Nowe</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            <div className="mt-8">
              <Link href="/flashcards">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none">
                  Kontynuuj naukę <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[calc(100vh-80px)] flex-col p-8">
            <p className="text-white mb-4">Nie udało się załadować danych postępu.</p>
            <Button onClick={() => window.location.reload()}>
              Spróbuj ponownie
            </Button>
          </div>
        )}
      </main>
    </div>
  );
} 