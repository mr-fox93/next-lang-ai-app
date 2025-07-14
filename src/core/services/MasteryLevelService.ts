/**
 * Mastery Level Service
 * Centralizes logic for calculating flashcard mastery levels and review dates
 * Used across progress tracking, demo mode, and flashcard generation
 */

export interface MasteryLevelService {
  calculateNewMasteryLevel(currentLevel: number, isCorrect: boolean): number;
  calculateNextReviewDate(masteryLevel: number): Date;
  getMasteryLevelInfo(level: number): {
    name: string;
    description: string;
    reviewInterval: string;
  };
}

export class MasteryLevelServiceImpl implements MasteryLevelService {
  /**
   * Calculate new mastery level based on current level and answer correctness
   * Same logic used in both server-side and demo mode
   */
  calculateNewMasteryLevel(currentLevel: number, isCorrect: boolean): number {
    if (!isCorrect) {
      // Incorrect answers don't change mastery level
      return currentLevel;
    }

    // Correct answer progression logic
    if (currentLevel === 0) {
      return 2;
    } else if (currentLevel === 1) {
      return 3;
    } else {
      return Math.min(5, currentLevel + 1);
    }
  }

  /**
   * Calculate next review date based on mastery level
   * Higher mastery level = longer intervals between reviews
   */
  calculateNextReviewDate(masteryLevel: number): Date {
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

  /**
   * Get descriptive information about mastery level
   */
  getMasteryLevelInfo(level: number): {
    name: string;
    description: string;
    reviewInterval: string;
  } {
    switch (level) {
      case 0:
        return {
          name: "New",
          description: "Just started learning",
          reviewInterval: "1 hour"
        };
      case 1:
        return {
          name: "Learning",
          description: "Getting familiar",
          reviewInterval: "6 hours"
        };
      case 2:
        return {
          name: "Practiced",
          description: "Basic understanding",
          reviewInterval: "1 day"
        };
      case 3:
        return {
          name: "Familiar",
          description: "Good understanding",
          reviewInterval: "3 days"
        };
      case 4:
        return {
          name: "Known",
          description: "Strong knowledge",
          reviewInterval: "1 week"
        };
      case 5:
        return {
          name: "Mastered",
          description: "Fully mastered",
          reviewInterval: "1 month"
        };
      default:
        return {
          name: "Unknown",
          description: "Invalid level",
          reviewInterval: "1 day"
        };
    }
  }
}

// Export singleton instance
export const masteryLevelService: MasteryLevelService = new MasteryLevelServiceImpl(); 