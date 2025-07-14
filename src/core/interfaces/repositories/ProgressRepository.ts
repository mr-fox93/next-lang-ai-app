export interface ProgressData {
  flashcardId: number;
  userId: string;
  masteryLevel: number;
  correctAnswers: number;
  incorrectAnswers: number;
  nextReviewDate: Date | null;
  lastReviewed?: Date | null;
}

export interface Progress extends ProgressData {
  id?: number;
}

export interface ProgressRepository {
  createProgress(data: ProgressData): Promise<Progress>;
  getProgressByFlashcardId(flashcardId: number, userId: string): Promise<Progress | null>;
  updateProgress(flashcardId: number, userId: string, data: Partial<ProgressData>): Promise<Progress>;
  getReviewedTodayCount(userId: string): Promise<number>;
} 