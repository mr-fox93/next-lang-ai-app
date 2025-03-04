import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";

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
        nextReviewDate: this.calculateNextReviewDate(0)
      });
    }
    
    const correctAnswers = isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers;
    const incorrectAnswers = isCorrect ? progress.incorrectAnswers : progress.incorrectAnswers + 1;
    
    let newMasteryLevel = progress.masteryLevel;
    
    if (isCorrect) {
      if (progress.masteryLevel === 0) {
        newMasteryLevel = 2;
      } else if (progress.masteryLevel === 1) {
        newMasteryLevel = 3;
      } else {
        newMasteryLevel = Math.min(5, progress.masteryLevel + 1);
      }
    } else {
      newMasteryLevel = progress.masteryLevel;
    }
    
    const nextReviewDate = this.calculateNextReviewDate(newMasteryLevel);
    
    const updatedProgress = await this.progressRepository.updateProgress(flashcardId, userId, {
      correctAnswers,
      incorrectAnswers,
      masteryLevel: newMasteryLevel,
      nextReviewDate,
      lastReviewed: new Date()
    });
    
    return updatedProgress;
  }
  
  private calculateNextReviewDate(masteryLevel: number): Date {
    const now = new Date();
    const nextDate = new Date(now);
    
    switch (masteryLevel) {
      case 0:
        nextDate.setHours(nextDate.getHours() + 1);
        break;
      case 1:
        nextDate.setHours(nextDate.getHours() + 6);
        break;
      case 2:
        nextDate.setHours(nextDate.getHours() + 24);
        break;
      case 3:
        nextDate.setDate(nextDate.getDate() + 3);
        break;
      case 4:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 5:
        nextDate.setDate(nextDate.getDate() + 30);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }
} 