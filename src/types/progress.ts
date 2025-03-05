export interface CategoryProgress {
  name: string;
  total: number;
  mastered: number;
  inProgress: number;
  untouched: number;
  averageMasteryLevel: number;
}

export interface UserProgressStats {
  totalFlashcards: number;
  masteredFlashcards: number;
  inProgressFlashcards: number;
  untouchedFlashcards: number;
  categories: CategoryProgress[];
  userLevel: number;
  experiencePoints: number;
  nextLevelPoints: number;
  dailyGoal?: number;
}

export interface ProgressActionResult {
  success: boolean;
  data?: UserProgressStats;
  error?: string;
} 