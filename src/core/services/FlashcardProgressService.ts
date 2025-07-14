/**
 * Flashcard Progress Service
 * Centralizes logic for creating and managing flashcard progress records
 * Used in flashcard generation and progress tracking
 */

import { Flashcard } from "@/core/entities/Flashcard";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { masteryLevelService } from "./MasteryLevelService";

export interface FlashcardProgressService {
  createInitialProgressRecords(flashcards: Flashcard[], userId: string): Promise<void>;
  createProgressRecord(flashcardId: number, userId: string): Promise<void>;
  updateProgressRecord(
    flashcardId: number, 
    userId: string, 
    isCorrect: boolean,
    currentProgress?: {
      masteryLevel: number;
      correctAnswers: number;
      incorrectAnswers: number;
    }
  ): Promise<{
    masteryLevel: number;
    correctAnswers: number;
    incorrectAnswers: number;
    nextReviewDate: Date;
  }>;
}

export class FlashcardProgressServiceImpl implements FlashcardProgressService {
  constructor(private progressRepository: ProgressRepository) {}

  /**
   * Create initial progress records for newly generated flashcards
   */
  async createInitialProgressRecords(flashcards: Flashcard[], userId: string): Promise<void> {
    const progressPromises = flashcards.map((flashcard) =>
      this.progressRepository.createProgress({
        flashcardId: flashcard.id,
        userId: userId,
        masteryLevel: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        nextReviewDate: masteryLevelService.calculateNextReviewDate(0),
      })
    );

    await Promise.all(progressPromises);
  }

  /**
   * Create a single progress record for a flashcard
   */
  async createProgressRecord(flashcardId: number, userId: string): Promise<void> {
    await this.progressRepository.createProgress({
      flashcardId,
      userId,
      masteryLevel: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      nextReviewDate: masteryLevelService.calculateNextReviewDate(0),
    });
  }

  /**
   * Update progress record based on user's answer
   */
  async updateProgressRecord(
    flashcardId: number, 
    userId: string, 
    isCorrect: boolean,
    currentProgress?: {
      masteryLevel: number;
      correctAnswers: number;
      incorrectAnswers: number;
    }
  ): Promise<{
    masteryLevel: number;
    correctAnswers: number;
    incorrectAnswers: number;
    nextReviewDate: Date;
  }> {
    // If no current progress provided, get it from repository
    let progress = currentProgress;
    if (!progress) {
      const existingProgress = await this.progressRepository.getProgressByFlashcardId(flashcardId, userId);
      if (!existingProgress) {
        // Create new progress if doesn't exist
        await this.createProgressRecord(flashcardId, userId);
        progress = { masteryLevel: 0, correctAnswers: 0, incorrectAnswers: 0 };
      } else {
        progress = {
          masteryLevel: existingProgress.masteryLevel,
          correctAnswers: existingProgress.correctAnswers,
          incorrectAnswers: existingProgress.incorrectAnswers,
        };
      }
    }

    // Calculate new values
    const correctAnswers = isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers;
    const incorrectAnswers = isCorrect ? progress.incorrectAnswers : progress.incorrectAnswers + 1;
    const newMasteryLevel = masteryLevelService.calculateNewMasteryLevel(progress.masteryLevel, isCorrect);
    const nextReviewDate = masteryLevelService.calculateNextReviewDate(newMasteryLevel);

    // Update in repository
    const updatedProgress = await this.progressRepository.updateProgress(flashcardId, userId, {
      correctAnswers,
      incorrectAnswers,
      masteryLevel: newMasteryLevel,
      nextReviewDate,
      lastReviewed: new Date()
    });

    return {
      masteryLevel: updatedProgress.masteryLevel,
      correctAnswers: updatedProgress.correctAnswers,
      incorrectAnswers: updatedProgress.incorrectAnswers,
      nextReviewDate: updatedProgress.nextReviewDate || nextReviewDate,
    };
  }
}

// Factory function for DI container
export const createFlashcardProgressService = (progressRepository: ProgressRepository): FlashcardProgressService => {
  return new FlashcardProgressServiceImpl(progressRepository);
}; 