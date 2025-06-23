import { Flashcard } from "@/core/entities/Flashcard";
import { ImportableFlashcard } from "@/types/flashcard";

const GUEST_FLASHCARDS_KEY = "guest_flashcards";

export const guestFlashcardsStorage = {
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

  saveFlashcards: (flashcards: Flashcard[]): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(GUEST_FLASHCARDS_KEY, JSON.stringify(flashcards));
    } catch (error) {
      console.error("Błąd zapisu fiszek gościa:", error);
    }
  },

  addFlashcards: (newFlashcards: ImportableFlashcard[]): Flashcard[] => {
    const flashcardsWithIds = newFlashcards.map((card, index) => ({
      ...card,
      id: index + 1,
      userId: "guest",
    })) as Flashcard[];

    guestFlashcardsStorage.saveFlashcards(flashcardsWithIds);

    return flashcardsWithIds;
  },

  addMoreFlashcardsToCategory: (newFlashcards: ImportableFlashcard[], category: string): Flashcard[] => {
    const existingFlashcards = guestFlashcardsStorage.getFlashcards();
    
    const existingCategory = existingFlashcards.length > 0 ? existingFlashcards[0].category : null;
    
    if (existingCategory && existingCategory !== category) {
      return guestFlashcardsStorage.addFlashcards(newFlashcards);
    }
    const highestId = existingFlashcards.reduce(
      (max, card) =>
        typeof card.id === "number" && card.id > max ? card.id : max,
      0
    );

    const flashcardsWithIds = newFlashcards.map((card, index) => ({
      ...card,
      id: highestId + index + 1,
      userId: "guest",
    })) as Flashcard[];

    const updatedFlashcards = [...existingFlashcards, ...flashcardsWithIds];
    guestFlashcardsStorage.saveFlashcards(updatedFlashcards);

    return updatedFlashcards;
  },

  deleteFlashcardsByCategory: (category: string): number => {
    const allFlashcards = guestFlashcardsStorage.getFlashcards();

    const remainingFlashcards = allFlashcards.filter(
      (card) => card.category !== category
    );

    const deletedCount = allFlashcards.length - remainingFlashcards.length;

    guestFlashcardsStorage.saveFlashcards(remainingFlashcards);

    return deletedCount;
  },

  clearFlashcards: (): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(GUEST_FLASHCARDS_KEY);
    } catch (error) {
      console.error("Błąd usuwania fiszek gościa:", error);
    }
  },

  hasFlashcards: (): boolean => {
    return guestFlashcardsStorage.getFlashcards().length > 0;
  },

  getCurrentCategory: (): string | null => {
    const flashcards = guestFlashcardsStorage.getFlashcards();
    return flashcards.length > 0 ? flashcards[0].category : null;
  },
};
