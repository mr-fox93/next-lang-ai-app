import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { masteryLevelService } from "@/core/services/MasteryLevelService";

export interface UpdateFlashcardProgressParams {
  flashcardId: number;
  userId: string;
  isCorrect: boolean;
}

export interface ProgressResult {
  flashcardId: number;
  userId: string;
  masteryLevel: number;
  correctAnswers: number;
  incorrectAnswers: number;
  nextReviewDate: Date | null;
  lastReviewed?: Date | null;
}

export class UpdateFlashcardProgressUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(params: UpdateFlashcardProgressParams): Promise<ProgressResult> {
    const { flashcardId, userId, isCorrect } = params;
    
    let progress = await this.progressRepository.getProgressByFlashcardId(flashcardId, userId);
    
    if (!progress) {
      progress = await this.progressRepository.createProgress({
        flashcardId,
        userId,
        masteryLevel: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        nextReviewDate: masteryLevelService.calculateNextReviewDate(0)
      });
    }
    
    const correctAnswers = isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers;
    const incorrectAnswers = isCorrect ? progress.incorrectAnswers : progress.incorrectAnswers + 1;
    
    // Use MasteryLevelService for consistent calculation
    const newMasteryLevel = masteryLevelService.calculateNewMasteryLevel(progress.masteryLevel, isCorrect);
    const nextReviewDate = masteryLevelService.calculateNextReviewDate(newMasteryLevel);
    
    const updatedProgress = await this.progressRepository.updateProgress(flashcardId, userId, {
      correctAnswers,
      incorrectAnswers,
      masteryLevel: newMasteryLevel,
      nextReviewDate,
      lastReviewed: new Date()
    });
    
    return updatedProgress;
  }
} 