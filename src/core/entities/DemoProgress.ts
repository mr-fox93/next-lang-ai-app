export class DemoProgress {
  constructor(
    public readonly flashcardId: number,
    public readonly correctAnswers: number = 0,
    public readonly incorrectAnswers: number = 0,
    public readonly lastReviewed: Date = new Date(),
    public readonly masteryLevel: number = 0
  ) {
    this.validateMasteryLevel();
  }

  private validateMasteryLevel(): void {
    if (this.masteryLevel < 0 || this.masteryLevel > 5) {
      throw new Error("Mastery level must be between 0 and 5");
    }
  }

  public updateProgress(isCorrect: boolean): DemoProgress {
    const newCorrectAnswers = isCorrect ? this.correctAnswers + 1 : this.correctAnswers;
    const newIncorrectAnswers = isCorrect ? this.incorrectAnswers : this.incorrectAnswers + 1;
    const newMasteryLevel = this.calculateNewMasteryLevel(isCorrect);
    const newLastReviewed = new Date();

    return new DemoProgress(
      this.flashcardId,
      newCorrectAnswers,
      newIncorrectAnswers,
      newLastReviewed,
      newMasteryLevel
    );
  }

  private calculateNewMasteryLevel(isCorrect: boolean): number {
    if (isCorrect) {
      return Math.min(5, this.masteryLevel + 1);
    } else {
      return Math.max(0, this.masteryLevel - 1);
    }
  }

  public isMastered(): boolean {
    return this.masteryLevel >= 4;
  }

  public isInProgress(): boolean {
    return this.masteryLevel > 0 && this.masteryLevel < 4;
  }

  public isUntouched(): boolean {
    return this.masteryLevel === 0;
  }

  public getTotalAttempts(): number {
    return this.correctAnswers + this.incorrectAnswers;
  }

  public getSuccessRate(): number {
    const total = this.getTotalAttempts();
    return total > 0 ? (this.correctAnswers / total) * 100 : 0;
  }

  public toJSON(): DemoProgressData {
    return {
      flashcardId: this.flashcardId,
      correctAnswers: this.correctAnswers,
      incorrectAnswers: this.incorrectAnswers,
      lastReviewed: this.lastReviewed.toISOString(),
      masteryLevel: this.masteryLevel,
    };
  }

  public static fromJSON(data: DemoProgressData): DemoProgress {
    return new DemoProgress(
      data.flashcardId,
      data.correctAnswers,
      data.incorrectAnswers,
      new Date(data.lastReviewed),
      data.masteryLevel
    );
  }
}

export interface DemoProgressData {
  flashcardId: number;
  correctAnswers: number;
  incorrectAnswers: number;
  lastReviewed: string;
  masteryLevel: number;
}

export interface DemoProgressStats {
  totalFlashcards: number;
  masteredFlashcards: number;
  inProgressFlashcards: number;
  untouchedFlashcards: number;
} 