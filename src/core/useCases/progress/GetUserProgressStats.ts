import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { UserRepository } from "@/core/interfaces/repositories/UserRepository";
import { UserProgressStats } from "@/types/progress";

export class GetUserProgressStatsUseCase {
  constructor(
    private flashcardRepository: FlashcardRepository,
    private progressRepository: ProgressRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<UserProgressStats> {
    // Get flashcard stats
    const stats = await this.flashcardRepository.getUserFlashcardStats(userId);
    
    // Get user data for dailyGoal
    const user = await this.userRepository.getUserById(userId);
    
    // Calculate user level and experience points
    const userLevel = Math.max(1, Math.floor(stats.masteredFlashcards / 10) + 1);
    const experiencePoints = stats.masteredFlashcards * 50;
    const nextLevelPoints = userLevel * 500;

    return {
      ...stats,
      userLevel,
      experiencePoints,
      nextLevelPoints,
      dailyGoal: user?.dailyGoal || 10,
    };
  }
}
