export interface ProgressData {
  flashcardId: number;
  userId: string;
  masteryLevel: number;
  correctAnswers: number;
  incorrectAnswers: number;
  nextReviewDate: Date;
}

export interface ProgressRepository {
  createProgress(data: ProgressData): Promise<any>;
  getProgressByFlashcardId(flashcardId: number, userId: string): Promise<any>;
  updateProgress(flashcardId: number, userId: string, data: Partial<ProgressData>): Promise<any>;
} 