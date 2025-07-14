import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";

export interface GetReviewedTodayCountParams {
  userId: string;
}

export interface GetReviewedTodayCountResult {
  success: boolean;
  data?: number;
  error?: string;
}

export class GetReviewedTodayCountUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(params: GetReviewedTodayCountParams): Promise<GetReviewedTodayCountResult> {
    try {
      const { userId } = params;

      if (!userId) {
        return {
          success: false,
          error: "Authentication required: User is not signed in",
          data: 0,
        };
      }

      const count = await this.progressRepository.getReviewedTodayCount(userId);

      return {
        success: true,
        data: count,
      };
    } catch (error) {
      console.error("Daily review count retrieval error:", error);
      return {
        success: false,
        error: `Failed to retrieve daily review count: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
        data: 0,
      };
    }
  }
} 