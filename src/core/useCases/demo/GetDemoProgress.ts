import { DemoProgressRepository } from "../../interfaces/repositories/DemoProgressRepository";
import { DemoProgressStats } from "../../entities/DemoProgress";

export interface GetDemoProgressRequest {
  flashcardIds: number[];
}

export interface GetDemoProgressResult {
  success: boolean;
  stats?: DemoProgressStats;
  error?: string;
}

export class GetDemoProgress {
  constructor(private readonly repository: DemoProgressRepository) {}

  public async execute(request: GetDemoProgressRequest): Promise<GetDemoProgressResult> {
    try {
      if (!this.repository.isStorageAvailable()) {
        return {
          success: true,
          stats: {
            totalFlashcards: 0,
            masteredFlashcards: 0,
            inProgressFlashcards: 0,
            untouchedFlashcards: 0,
          },
        };
      }

      const stats = await this.repository.getProgressStats(request.flashcardIds);

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("Error getting demo progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export class ClearDemoProgress {
  constructor(private readonly repository: DemoProgressRepository) {}

  public async execute(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.repository.isStorageAvailable()) {
        return { success: true };
      }

      await this.repository.clearAllProgress();
      
      return { success: true };
    } catch (error) {
      console.error("Error clearing demo progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
} 