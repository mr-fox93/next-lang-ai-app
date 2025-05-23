import { DemoProgressRepository } from "../../core/interfaces/repositories/DemoProgressRepository";
import { DemoProgress, DemoProgressData, DemoProgressStats } from "../../core/entities/DemoProgress";

export class LocalStorageDemoProgressRepository implements DemoProgressRepository {
  private readonly storageKey = "demo_progress";

  public isStorageAvailable(): boolean {
    try {
      return typeof window !== "undefined" && window.localStorage !== undefined;
    } catch {
      return false;
    }
  }

  public async getFlashcardProgress(flashcardId: number): Promise<DemoProgress | null> {
    if (!this.isStorageAvailable()) return null;

    try {
      const allProgress = await this.getAllProgressData();
      const progressData = allProgress[flashcardId];
      
      return progressData ? DemoProgress.fromJSON(progressData) : null;
    } catch (error) {
      console.error("Error getting flashcard progress:", error);
      return null;
    }
  }

  public async getAllProgress(): Promise<Record<number, DemoProgress>> {
    if (!this.isStorageAvailable()) return {};

    try {
      const allProgressData = await this.getAllProgressData();
      const progressMap: Record<number, DemoProgress> = {};

      Object.entries(allProgressData).forEach(([id, data]) => {
        progressMap[parseInt(id)] = DemoProgress.fromJSON(data);
      });

      return progressMap;
    } catch (error) {
      console.error("Error getting all progress:", error);
      return {};
    }
  }

  public async updateFlashcardProgress(flashcardId: number, isCorrect: boolean): Promise<DemoProgress> {
    const currentProgress = await this.getFlashcardProgress(flashcardId);
    
    const baseProgress = currentProgress || new DemoProgress(flashcardId);
    const updatedProgress = baseProgress.updateProgress(isCorrect);
    
    await this.saveFlashcardProgress(updatedProgress);
    
    return updatedProgress;
  }

  public async saveFlashcardProgress(progress: DemoProgress): Promise<void> {
    if (!this.isStorageAvailable()) return;

    try {
      const allProgressData = await this.getAllProgressData();
      allProgressData[progress.flashcardId] = progress.toJSON();
      
      localStorage.setItem(this.storageKey, JSON.stringify(allProgressData));
    } catch (error) {
      console.error("Error saving flashcard progress:", error);
    }
  }

  public async getProgressStats(flashcardIds: number[]): Promise<DemoProgressStats> {
    const allProgress = await this.getAllProgress();
    
    let masteredCount = 0;
    let inProgressCount = 0;
    let untouchedCount = 0;

    flashcardIds.forEach(id => {
      const progress = allProgress[id];
      
      if (!progress || progress.isUntouched()) {
        untouchedCount++;
      } else if (progress.isMastered()) {
        masteredCount++;
      } else if (progress.isInProgress()) {
        inProgressCount++;
      }
    });

    return {
      totalFlashcards: flashcardIds.length,
      masteredFlashcards: masteredCount,
      inProgressFlashcards: inProgressCount,
      untouchedFlashcards: untouchedCount,
    };
  }

  public async clearAllProgress(): Promise<void> {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Error clearing progress:", error);
    }
  }

  private async getAllProgressData(): Promise<Record<number, DemoProgressData>> {
    if (!this.isStorageAvailable()) return {};

    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (!storedData) return {};

      return JSON.parse(storedData);
    } catch (error) {
      console.error("Error reading progress data:", error);
      return {};
    }
  }
} 