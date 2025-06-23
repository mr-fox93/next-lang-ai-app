import { useState, useEffect, useCallback } from 'react';
import { demoModeService } from '@/core/useCases/session';
import { demoProgressService } from '@/core/useCases/session/demo-progress.service';
import { UserProgressStats, CategoryProgress } from '@/types/progress';

/**
 * Custom hook for demo mode management in React components
 * Uses the demo mode service from clean architecture
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkDemoMode = useCallback(() => {
    if (typeof document === 'undefined') return false;
    
    const cookies = document.cookie;
    const isDemo = demoModeService.isDemoMode(cookies);
    setIsDemoMode(isDemo);
    setIsLoading(false);
    return isDemo;
  }, []);

  useEffect(() => {
    // Initial check
    checkDemoMode();
    
    // Periodic check for cookie changes
    const interval = setInterval(() => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie;
        const isDemo = demoModeService.isDemoMode(cookies);
        setIsDemoMode(isDemo);
        // Po pierwszym sprawdzeniu nie ustawiamy już isLoading na true
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [checkDemoMode]);

  const exitDemoMode = useCallback(() => {
    // Clear demo mode cookie
    document.cookie = demoModeService.clearDemoMode();
    setIsDemoMode(false);
  }, []);

  return {
    isDemoMode,
    isLoading,
    checkDemoMode,
    exitDemoMode,
  };
}

/**
 * Hook for listening to demo progress changes
 * Uses custom event instead of polling for better performance
 */
export function useDemoProgressUpdates(initialStats: UserProgressStats) {
  const [stats, setStats] = useState<UserProgressStats>(initialStats);
  const [reviewedToday, setReviewedToday] = useState(0);

  const updateStats = useCallback(() => {
    const enhancedStats = enhanceStatsWithDemoProgress(initialStats);
    setStats(enhancedStats);
    
    const demoReviewedToday = getReviewedTodayCount();
    setReviewedToday(demoReviewedToday);
  }, [initialStats]);

  useEffect(() => {
    // Initial update
    updateStats();

    // Listen for custom demo progress events
    const handleDemoProgressUpdate = () => {
      updateStats();
    };

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', handleDemoProgressUpdate);
    
    // Listen for custom events (same-tab changes)
    window.addEventListener('demoProgressUpdate', handleDemoProgressUpdate);

    return () => {
      window.removeEventListener('storage', handleDemoProgressUpdate);
      window.removeEventListener('demoProgressUpdate', handleDemoProgressUpdate);
    };
  }, [updateStats]);

  return { stats, reviewedToday };
}

// Re-export demo progress service functions for convenience
export const getDemoProgress = () => demoProgressService.getProgress();
export const updateDemoProgress = (flashcardId: number, category: string, isCorrect: boolean) => {
  demoProgressService.updateProgress(flashcardId, category, isCorrect);
  
  // Dispatch custom event to notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('demoProgressUpdate'));
  }
};
export const getReviewedTodayCount = () => demoProgressService.getReviewedTodayCount();
export const getDemoDailyGoal = () => demoProgressService.getDailyGoal();
export const setDemoDailyGoal = (goal: number) => {
  demoProgressService.setDailyGoal(goal);
  
  // Dispatch custom event to notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('demoProgressUpdate'));
  }
};

// Enhanced stats calculation using the service
export function enhanceStatsWithDemoProgress(serverStats: UserProgressStats): UserProgressStats {
  if (typeof window === 'undefined') return serverStats;
  
  const progress = demoProgressService.getProgress();
  const dailyGoal = demoProgressService.getDailyGoal();
  
  let totalMastered = 0;
  let totalInProgress = 0;
  let totalUntouched = 0;
  
  // Enhance categories with localStorage progress
  const enhancedCategories: CategoryProgress[] = serverStats.categories.map(category => {
    // Find progress entries for this specific category
    const categoryProgress = Object.values(progress).filter(p => p.category === category.name);
    
    let mastered = 0;
    let inProgress = 0;
    let totalMasteryLevel = 0;
    
    categoryProgress.forEach(p => {
      totalMasteryLevel += p.masteryLevel;
      
      if (p.masteryLevel >= 5) {
        mastered++;
      } else if (p.masteryLevel > 0) {
        inProgress++;
      }
    });
    
    const untouched = category.total - mastered - inProgress;
    const averageMasteryLevel = categoryProgress.length > 0 ? totalMasteryLevel / categoryProgress.length : 0;
    
    totalMastered += mastered;
    totalInProgress += inProgress;
    totalUntouched += untouched;
    
    return {
      ...category,
      mastered,
      inProgress,
      untouched: Math.max(0, untouched),
      averageMasteryLevel,
    };
  });
  
  const experiencePoints = totalMastered * 50;
  const userLevel = Math.max(1, Math.floor(totalMastered / 10) + 1);
  const nextLevelPoints = userLevel * 500;
  
  return {
    ...serverStats,
    masteredFlashcards: totalMastered,
    inProgressFlashcards: totalInProgress,
    untouchedFlashcards: totalUntouched,
    categories: enhancedCategories,
    userLevel,
    experiencePoints,
    nextLevelPoints,
    dailyGoal,
  };
}

export function getMasteredCategoriesFromDemo(serverStats: UserProgressStats): string[] {
  if (typeof window === 'undefined') return [];
  
  const progress = demoProgressService.getProgress();
  
  return serverStats.categories
    .filter(category => {
      // Find all flashcards in this category and check if all are mastered
      const categoryFlashcards = Object.values(progress).filter(p => 
        p.category === category.name && p.masteryLevel >= 5
      );
      
      return category.total > 0 && categoryFlashcards.length >= category.total;
    })
    .map(category => category.name);
} 