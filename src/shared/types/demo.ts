import { UserProgressStats } from "@/types/progress";
import { Flashcard } from "@/core/entities/Flashcard";
import { DemoProgressStats } from "@/core/entities/DemoProgress";

export interface DemoFlashcardsViewProps {
  initialFlashcards: Flashcard[];
  serverError?: string;
  initialCategory?: string | null;
  progressStats?: {
    success: boolean;
    data?: UserProgressStats;
    error?: string;
  };
}

export interface DemoProgressViewProps {
  onBackClick: () => void;
  onClearProgress: () => void;
  onSignInClick: () => void;
}

export interface DemoModeIndicatorProps {
  className?: string;
}

export interface DemoProgressHookReturn {
  updateProgress: (flashcardId: number, isCorrect: boolean) => Promise<void>;
  getProgressStats: (flashcardIds: number[]) => Promise<DemoProgressStats>;
  clearProgress: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface DemoLoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

export const DEMO_USER_ID = "user_2xUe6mCEYobkFTqPSoN38kqnYGZ" as const; 