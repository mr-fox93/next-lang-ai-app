import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";

interface CategoryProgress {
  name: string;
  total: number;
  mastered: number;
  inProgress: number;
  untouched: number;
  averageMasteryLevel: number;
}

export interface UserProgressStats {
  totalFlashcards: number;
  masteredFlashcards: number;
  inProgressFlashcards: number;
  untouchedFlashcards: number;
  categories: CategoryProgress[];
  userLevel?: number;
  experiencePoints?: number;
  nextLevelPoints?: number;
  dailyGoal?: number;
}

export class GetUserProgressStatsUseCase {
  constructor(
    private flashcardRepository: FlashcardRepository,
    private progressRepository: ProgressRepository
  ) {}

  async execute(userId: string): Promise<UserProgressStats> {
    // Pobierz wszystkie fiszki użytkownika
    const flashcards = await this.flashcardRepository.getUserFlashcards(userId);
    
    // Pobierz cały postęp użytkownika
    const progressEntries = await this.progressRepository.getUserProgress(userId);
    
    // Znajdź wszystkie unikalne kategorie
    const categories = [...new Set(flashcards.map(card => card.category))];
    
    // Przygotuj statystyki dla każdej kategorii
    const categoryStats: CategoryProgress[] = categories.map(categoryName => {
      // Fiszki w tej kategorii
      const categoryFlashcards = flashcards.filter(card => card.category === categoryName);
      const total = categoryFlashcards.length;
      
      // Statystyki dla każdej fiszki w kategorii
      let mastered = 0;
      let inProgress = 0;
      let totalMasteryLevel = 0;
      
      categoryFlashcards.forEach(flashcard => {
        const progress = progressEntries.find(p => p.flashcardId === flashcard.id);
        
        if (progress) {
          totalMasteryLevel += progress.masteryLevel;
          
          if (progress.masteryLevel >= 4) { // Poziom 4-5 uznajemy za opanowany
            mastered++;
          } else if (progress.masteryLevel > 0) { // Poziom 1-3 uznajemy za w trakcie nauki
            inProgress++;
          }
        }
      });
      
      const untouched = total - mastered - inProgress;
      const averageMasteryLevel = total > 0 ? totalMasteryLevel / total : 0;
      
      return {
        name: categoryName,
        total,
        mastered,
        inProgress,
        untouched,
        averageMasteryLevel
      };
    });
    
    // Oblicz ogólne statystyki
    const totalFlashcards = flashcards.length;
    const masteredFlashcards = categoryStats.reduce((sum, cat) => sum + cat.mastered, 0);
    const inProgressFlashcards = categoryStats.reduce((sum, cat) => sum + cat.inProgress, 0);
    const untouchedFlashcards = categoryStats.reduce((sum, cat) => sum + cat.untouched, 0);
    
    return {
      totalFlashcards,
      masteredFlashcards,
      inProgressFlashcards,
      untouchedFlashcards,
      categories: categoryStats
    };
  }
} 