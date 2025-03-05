"use client";

import { useRouter } from "next/navigation";
import { Award, ChevronRight, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getUserProgressStatsAction } from "@/app/actions/progress-actions";
import { useToast } from "@/components/ui/use-toast";
import { UserProgressStats } from "@/types/progress";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressPreviewProps {
  progressStats?: {
    success: boolean;
    data?: UserProgressStats;
    error?: string;
  };
}

export function ProgressPreview({ progressStats }: ProgressPreviewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(!progressStats?.data);
  
  // Używamy statystyk z props, jeśli są dostępne, w przeciwnym razie pobieramy dane po stronie klienta
  useEffect(() => {
    if (progressStats?.success && progressStats.data) {
      setStats(progressStats.data);
      setIsLoading(false);
      return;
    }
    
    // Pobieramy dane tylko jeśli nie otrzymaliśmy ich z props
    if (!progressStats?.data) {
      async function fetchStats() {
        try {
          const result = await getUserProgressStatsAction();
          
          if (result.success && result.data) {
            setStats(result.data);
          } else {
            console.error("Błąd pobierania statystyk:", result.error);
            toast({
              title: "Błąd",
              description: "Nie udało się pobrać statystyk",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Błąd pobierania statystyk:", error);
          toast({
            title: "Błąd",
            description: "Wystąpił problem podczas ładowania danych",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
      
      fetchStats();
    }
  }, [progressStats, toast]);
  
  // Obliczenia dla paska postępu
  const progressToNextLevel = stats 
    ? (stats.experiencePoints % 500) / 5 
    : 0;
  
  const masteryPercentage = stats && stats.totalFlashcards > 0 
    ? (stats.masteredFlashcards / stats.totalFlashcards) * 100 
    : 0;
  
  // Pokaż gwiazdkę, nawet jeśli nie ma jeszcze danych
  const userLevel = stats ? stats.userLevel : 1;
  const experiencePoints = stats ? stats.experiencePoints : 0;
  const nextLevelPoints = stats ? stats.nextLevelPoints : 500;
  const masteredFlashcards = stats ? stats.masteredFlashcards : 0;
  const totalFlashcards = stats ? stats.totalFlashcards : 0;
  
  return (
    <div className="absolute top-[70px] right-4 z-40 flex flex-col items-end">
      {/* Przycisk wyświetlany jest cały czas, niezależnie czy podgląd jest otwarty czy nie */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`
          flex items-center justify-between gap-2
          px-4 py-2.5 
          bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md 
          border border-white/10 
          hover:border-purple-500/50
          shadow-lg shadow-purple-500/5
          rounded-xl
          ${isLoading ? 'animate-pulse' : ''}
          transition-all duration-300
          focus:outline-none
          max-w-full
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {!isLoading ? (
            <>
              <div className="relative flex-shrink-0">
                <div className="bg-amber-500 text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center text-black whitespace-nowrap">
                  LVL {userLevel}
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-semibold text-white">
                  {masteredFlashcards} opanowanych
                </span>
                <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500" 
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative flex-shrink-0">
                <div className="bg-amber-500 text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center text-black whitespace-nowrap">
                  LVL 1
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-white">
                Ładowanie postępu...
              </span>
            </>
          )}
        </div>
        <ChevronRight
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ml-1 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </motion.button>

      {/* Panel szczegółowy pojawia się poniżej przycisku */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 w-72 overflow-hidden"
          >
            <Card className="bg-black/80 backdrop-blur-md border border-white/10 shadow-xl">
              <CardHeader className="pb-2 pl-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-white">
                    Your Progress
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                    onClick={() => router.push('/progress')}
                  >
                    Pełny widok <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pl-6">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-lg shadow-lg">
                        <Award className="text-white h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-white">Level {userLevel}</span>
                          <span className="text-xs text-gray-400">{experiencePoints}/{nextLevelPoints} PD</span>
                        </div>
                        <Progress 
                          value={progressToNextLevel} 
                          className="h-2 bg-white/10" 
                          indicatorClassName="bg-gradient-to-r from-yellow-400 to-amber-600"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-400 to-indigo-600 p-2 rounded-lg shadow-lg">
                        <Star className="text-white h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-white">Biegłość</span>
                          <span className="text-xs text-gray-400">{masteryPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={masteryPercentage} 
                          className="h-2 bg-white/10" 
                          indicatorClassName="bg-gradient-to-r from-purple-400 to-indigo-600" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-lg shadow-lg">
                        <BookOpen className="text-white h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-white">Fiszki</span>
                          <span className="text-xs text-gray-400">
                            {masteredFlashcards}/{totalFlashcards} opanowanych
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400">
                      Nie udało się załadować danych postępu
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 