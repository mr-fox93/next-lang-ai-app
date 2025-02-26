"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getUserProgressStatsAction } from "@/app/actions/progress-actions";
import { useToast } from "@/components/ui/use-toast";
import { UserProgressStats } from "@/types/progress";

export function ProgressPreview() {
  const router = useRouter();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pobieranie danych o postępie użytkownika
  useEffect(() => {
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
  }, [toast]);
  
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
  
  return (
    <div className="fixed top-4 right-4 z-40">
      <div 
        className={`
          transition-all duration-300 
          ${isExpanded 
            ? 'scale-100 opacity-100 translate-x-0' 
            : 'scale-95 opacity-0 translate-x-8 pointer-events-none'
          }
        `}
      >
        <Card className="bg-black/80 backdrop-blur-md border border-white/10 shadow-xl mb-2 w-64">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-white">Twój postęp</CardTitle>
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
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="text-yellow-500 h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">Poziom {userLevel}</span>
                      <span className="text-xs text-gray-400">{experiencePoints}/{nextLevelPoints} PD</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-1.5 bg-white/10" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">Biegłość</span>
                      <span className="text-xs text-gray-400">{masteryPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={masteryPercentage} 
                      className="h-1.5 bg-white/10" 
                      indicatorClassName="bg-gradient-to-r from-yellow-500 to-amber-500" 
                    />
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
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        className={`
          w-10 h-10 rounded-full 
          bg-black/60 backdrop-blur-md 
          border border-white/10 
          hover:bg-black/80 hover:border-purple-500/50 
          fixed right-4 top-4 shadow-lg
          ${isLoading ? 'animate-pulse' : ''}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Award 
          className={`h-5 w-5 transition-colors ${isExpanded ? 'text-yellow-500' : 'text-white'}`} 
        />
      </Button>
    </div>
  );
} 