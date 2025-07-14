/**
 * Demo Progress Service
 * Manages flashcard progress in localStorage for demo mode users
 * Part of clean architecture - handles demo mode data persistence
 */

import { masteryLevelService } from "@/core/services/MasteryLevelService";

export interface DemoProgress {
  flashcardId: number;
  category: string;
  correctAnswers: number;
  incorrectAnswers: number;
  masteryLevel: number;
  lastReviewed: string;
}

export interface DemoProgressService {
  getProgress(): Record<number, DemoProgress>;
  updateProgress(flashcardId: number, category: string, isCorrect: boolean): void;
  getReviewedTodayCount(): number;
  getDailyGoal(): number;
  setDailyGoal(goal: number): void;
  clearProgress(): void;
}

class LocalStorageDemoProgressService implements DemoProgressService {
  private readonly PROGRESS_KEY = 'demo_flashcard_progress';
  private readonly DAILY_GOAL_KEY = 'demo_daily_goal';

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  getProgress(): Record<number, DemoProgress> {
    if (!this.isClient()) return {};
    
    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  updateProgress(flashcardId: number, category: string, isCorrect: boolean): void {
    if (!this.isClient()) return;
    
    const allProgress = this.getProgress();
    const current = allProgress[flashcardId] || {
      flashcardId,
      category,
      correctAnswers: 0,
      incorrectAnswers: 0,
      masteryLevel: 0,
      lastReviewed: new Date().toISOString(),
    };

    // Update counters and mastery level using centralized service
    if (isCorrect) {
      current.correctAnswers += 1;
    } else {
      current.incorrectAnswers += 1;
    }
    
    // Use MasteryLevelService for consistent calculation
    current.masteryLevel = masteryLevelService.calculateNewMasteryLevel(current.masteryLevel, isCorrect);

    current.lastReviewed = new Date().toISOString();
    allProgress[flashcardId] = current;

    try {
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to save demo progress to localStorage:', error);
    }
  }

  getReviewedTodayCount(): number {
    if (!this.isClient()) return 0;
    
    const progress = this.getProgress();
    const today = new Date().toDateString();
    
    return Object.values(progress).filter(p => {
      const reviewDate = new Date(p.lastReviewed).toDateString();
      return reviewDate === today;
    }).length;
  }

  getDailyGoal(): number {
    if (!this.isClient()) return 10;
    
    try {
      const stored = localStorage.getItem(this.DAILY_GOAL_KEY);
      return stored ? parseInt(stored, 10) : 10;
    } catch {
      return 10;
    }
  }

  setDailyGoal(goal: number): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(this.DAILY_GOAL_KEY, goal.toString());
    } catch (error) {
      console.error('Failed to save demo daily goal to localStorage:', error);
    }
  }

  clearProgress(): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.removeItem(this.PROGRESS_KEY);
      localStorage.removeItem(this.DAILY_GOAL_KEY);
    } catch (error) {
      console.error('Failed to clear demo progress from localStorage:', error);
    }
  }
}

// Singleton instance
export const demoProgressService: DemoProgressService = new LocalStorageDemoProgressService(); 