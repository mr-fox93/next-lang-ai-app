import { Flashcard } from "@/core/entities/Flashcard";

const GUEST_FLASHCARDS_KEY = "guest_flashcards";

export const guestFlashcardsStorage = {
  // Pobieranie fiszek z localStorage
  getFlashcards: (): Flashcard[] => {
    if (typeof window === "undefined") return [];
    
    try {
      const storedData = localStorage.getItem(GUEST_FLASHCARDS_KEY);
      if (!storedData) return [];
      
      return JSON.parse(storedData);
    } catch (error) {
      console.error("Błąd odczytu fiszek gościa:", error);
      return [];
    }
  },
  
  // Zapisywanie fiszek do localStorage
  saveFlashcards: (flashcards: Flashcard[]): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(GUEST_FLASHCARDS_KEY, JSON.stringify(flashcards));
    } catch (error) {
      console.error("Błąd zapisu fiszek gościa:", error);
    }
  },
  
  // Dodawanie nowych fiszek do istniejących
  addFlashcards: (newFlashcards: any[]): Flashcard[] => {
    const existingFlashcards = guestFlashcardsStorage.getFlashcards();
    
    // Dodajemy nowe fiszki i upewniamy się, że ID są unikalne
    const highestId = existingFlashcards.reduce(
      (max, card) => (typeof card.id === 'number' && card.id > max ? card.id : max), 
      0
    );
    
    const flashcardsWithIds = newFlashcards.map((card, index) => ({
      ...card,
      id: highestId + index + 1,
      userId: 'guest',
    })) as Flashcard[];
    
    const updatedFlashcards = [...existingFlashcards, ...flashcardsWithIds];
    guestFlashcardsStorage.saveFlashcards(updatedFlashcards);
    
    return updatedFlashcards;
  },
  
  // Czyszczenie fiszek
  clearFlashcards: (): void => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(GUEST_FLASHCARDS_KEY);
    } catch (error) {
      console.error("Błąd usuwania fiszek gościa:", error);
    }
  }
}; 