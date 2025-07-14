import { UserRepository } from "@/core/interfaces/repositories/UserRepository";

export interface UpdateDailyGoalParams {
  userId: string;
  dailyGoal: number;
}

export interface UpdateDailyGoalResult {
  success: boolean;
  error?: string;
}

export class UpdateDailyGoalUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(params: UpdateDailyGoalParams): Promise<UpdateDailyGoalResult> {
    try {
      const { userId, dailyGoal } = params;

      if (!userId) {
        return {
          success: false,
          error: "Authentication required: User is not signed in",
        };
      }

      if (dailyGoal < 1 || dailyGoal > 100) {
        return {
          success: false,
          error: "Daily goal must be between 1 and 100",
        };
      }

      await this.userRepository.updateDailyGoal(userId, dailyGoal);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Update daily goal error:", error);
      return {
        success: false,
        error: `Failed to update daily goal: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      };
    }
  }
} 