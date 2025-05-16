import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { UserProgressStats } from "@/types/progress";

export class GetUserProgressStatsUseCase {
  constructor(
    private flashcardRepository: FlashcardRepository,
    private progressRepository: ProgressRepository
  ) {}

  async execute(userId: string): Promise<UserProgressStats> {
    // Użyj nowej zoptymalizowanej metody zamiast wielu zapytań
    const stats = await this.flashcardRepository.getUserFlashcardStats(userId);

    // Dodajemy wartości domyślne dla wymaganych pól
    return {
      ...stats,
      userLevel: 1, // Domyślna wartość, zostanie nadpisana w akcji
      experiencePoints: 0, // Domyślna wartość, zostanie nadpisana w akcji
      nextLevelPoints: 100, // Domyślna wartość, zostanie nadpisana w akcji
      dailyGoal: undefined,
    };
  }
}
