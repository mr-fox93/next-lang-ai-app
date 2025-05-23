import { DemoProgressRepository } from "../../interfaces/repositories/DemoProgressRepository";
import { DemoProgress } from "../../entities/DemoProgress";

export interface UpdateDemoProgressRequest {
  flashcardId: number;
  isCorrect: boolean;
}

export interface UpdateDemoProgressResult {
  success: boolean;
  progress?: DemoProgress;
  error?: string;
}

export class UpdateDemoProgress {
  constructor(private readonly repository: DemoProgressRepository) {}

  public async execute(request: UpdateDemoProgressRequest): Promise<UpdateDemoProgressResult> {
    try {
      if (!this.repository.isStorageAvailable()) {
        return {
          success: false,
          error: "Storage not available",
        };
      }

      const updatedProgress = await this.repository.updateFlashcardProgress(
        request.flashcardId,
        request.isCorrect
      );

      return {
        success: true,
        progress: updatedProgress,
      };
    } catch (error) {
      console.error("Error updating demo progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
} 