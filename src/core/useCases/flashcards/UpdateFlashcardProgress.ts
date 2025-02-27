import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";

export interface UpdateFlashcardProgressParams {
  flashcardId: number;
  userId: string;
  isCorrect: boolean;
}

export interface ProgressResult {
  flashcardId: number;
  userId: string;
  masteryLevel: number;
  correctAnswers: number;
  incorrectAnswers: number;
  nextReviewDate: Date | null;
  lastReviewed?: Date | null;
}

export class UpdateFlashcardProgressUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(params: UpdateFlashcardProgressParams): Promise<ProgressResult> {
    const { flashcardId, userId, isCorrect } = params;
    
    console.log(`UpdateFlashcardProgress: Rozpoczęcie aktualizacji postępu dla fiszki ID=${flashcardId}, użytkownik=${userId}, odpowiedź poprawna=${isCorrect}`);
    
    // Pobierz istniejący postęp lub stwórz nowy
    let progress = await this.progressRepository.getProgressByFlashcardId(flashcardId, userId);
    
    console.log("Istniejący postęp:", progress);
    
    if (!progress) {
      // Jeśli nie ma rekordu postępu, tworzymy nowy
      console.log("Brak wcześniejszego postępu, tworzenie nowego rekordu");
      progress = await this.progressRepository.createProgress({
        flashcardId,
        userId,
        masteryLevel: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        nextReviewDate: this.calculateNextReviewDate(0)
      });
      console.log("Utworzono nowy rekord postępu:", progress);
    }
    
    // Aktualizuj statystyki
    const correctAnswers = isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers;
    const incorrectAnswers = isCorrect ? progress.incorrectAnswers : progress.incorrectAnswers + 1;
    
    console.log(`Nowe statystyki: poprawne=${correctAnswers}, niepoprawne=${incorrectAnswers}`);
    
    // Zmodyfikowana logika obliczania nowego poziomu opanowania
    let newMasteryLevel = progress.masteryLevel;
    
    if (isCorrect) {
      // Dla nowych fiszek (poziom 0) lub fiszek z niskim poziomem (1) 
      // - szybszy postęp po pierwszej poprawnej odpowiedzi
      if (progress.masteryLevel === 0) {
        // Pierwsza poprawna odpowiedź daje większy skok - od razu poziom 2
        newMasteryLevel = 2;
      } else if (progress.masteryLevel === 1) {
        // Druga poprawna odpowiedź również przyspiesza progres
        newMasteryLevel = 3;
      } else {
        // Dla wyższych poziomów standardowy progres o 1
        newMasteryLevel = Math.min(5, progress.masteryLevel + 1);
      }
    } else {
      // ZMIANA: Niepoprawna odpowiedź nie zmniejsza poziomu opanowania
      // Pozostawiamy ten sam poziom, co wcześniej
      newMasteryLevel = progress.masteryLevel;
    }
    
    console.log(`Nowy poziom opanowania: ${newMasteryLevel} (poprzednio: ${progress.masteryLevel})`);
    
    // Oblicz datę następnej powtórki na podstawie poziomu opanowania
    const nextReviewDate = this.calculateNextReviewDate(newMasteryLevel);
    
    // Aktualizuj postęp
    const updatedProgress = await this.progressRepository.updateProgress(flashcardId, userId, {
      correctAnswers,
      incorrectAnswers,
      masteryLevel: newMasteryLevel,
      nextReviewDate,
      lastReviewed: new Date()
    });
    
    console.log("Zaktualizowany postęp:", updatedProgress);
    
    return updatedProgress;
  }
  
  // Algorytm spaced repetition - oblicza datę następnej powtórki
  private calculateNextReviewDate(masteryLevel: number): Date {
    const now = new Date();
    const nextDate = new Date(now);
    
    // Na podstawie poziomu opanowania, dodajemy odpowiednią liczbę dni
    switch (masteryLevel) {
      case 0: // Nie opanowane
        nextDate.setHours(nextDate.getHours() + 1); // 1 godzina
        break;
      case 1:
        nextDate.setHours(nextDate.getHours() + 6); // 6 godzin
        break;
      case 2:
        nextDate.setHours(nextDate.getHours() + 24); // 1 dzień
        break;
      case 3:
        nextDate.setDate(nextDate.getDate() + 3); // 3 dni
        break;
      case 4:
        nextDate.setDate(nextDate.getDate() + 7); // 7 dni
        break;
      case 5: // W pełni opanowane
        nextDate.setDate(nextDate.getDate() + 30); // 30 dni
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1); // domyślnie 1 dzień
    }
    
    return nextDate;
  }
} 