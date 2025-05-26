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

// Re-export demo progress service functions for convenience
export const getDemoProgress = () => demoProgressService.getProgress();
export const updateDemoProgress = (flashcardId: number, isCorrect: boolean) => 
  demoProgressService.updateProgress(flashcardId, isCorrect);
export const getReviewedTodayCount = () => demoProgressService.getReviewedTodayCount();
export const getDemoDailyGoal = () => demoProgressService.getDailyGoal();
export const setDemoDailyGoal = (goal: number) => demoProgressService.setDailyGoal(goal);

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
    let mastered = 0;
    let inProgress = 0;
    let totalMasteryLevel = 0;
    let progressCount = 0;
    
    // Count progress for this category
    // Note: This is simplified since we don't store category in progress
    // In a real implementation, we'd need to store category info or flashcard IDs
    Object.values(progress).forEach(p => {
      progressCount++;
      totalMasteryLevel += p.masteryLevel;
      
      if (p.masteryLevel >= 5) {
        mastered++;
      } else if (p.masteryLevel > 0) {
        inProgress++;
      }
    });
    
    // Distribute progress proportionally across categories
    const categoryRatio = category.total / serverStats.totalFlashcards;
    const categoryMastered = Math.round(mastered * categoryRatio);
    const categoryInProgress = Math.round(inProgress * categoryRatio);
    const categoryUntouched = category.total - categoryMastered - categoryInProgress;
    
    totalMastered += categoryMastered;
    totalInProgress += categoryInProgress;
    totalUntouched += categoryUntouched;
    
    return {
      ...category,
      mastered: categoryMastered,
      inProgress: categoryInProgress,
      untouched: Math.max(0, categoryUntouched),
      averageMasteryLevel: progressCount > 0 ? totalMasteryLevel / progressCount : 0,
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
        // We need to match by category somehow - this is a limitation
        // For now, we'll use a simple heuristic
        p.masteryLevel >= 5
      );
      
      // This is simplified - in real implementation we'd need category info in progress
      return category.total > 0 && categoryFlashcards.length >= category.total;
    })
    .map(category => category.name);
} 