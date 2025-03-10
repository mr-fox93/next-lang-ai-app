import { z } from 'zod';
import { Flashcard } from '@/core/entities/Flashcard';

// Ta funkcja będzie wywoływana na serwerze, więc nie ma dostępu do lokalnego localStorage.
// Zamiast tego będziemy przekazywać dane po stronie klienta poprzez komponent.
export async function getFlashcardsForGuest() {
  // Pusta implementacja, faktyczne dane będą pobierane po stronie klienta
  return {
    flashcards: [],
    error: null
  };
}

// Funkcja zwracająca puste statystyki postępu dla gościa
export async function getProgressStatsForGuest() {
  return {
    success: true,
    data: {
      totalCards: 0,
      cardsLearned: 0,
      percentageLearned: 0,
      categoriesProgress: []
    },
    error: null
  };
} 