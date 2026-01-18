/**
 * Demo Favorites Service
 * Stores favorite flashcard IDs in localStorage for demo mode users
 */

export interface DemoFavoritesService {
  getFavorites(): number[];
  addFavorite(flashcardId: number): void;
  removeFavorite(flashcardId: number): void;
  isFavorite(flashcardId: number): boolean;
}

class LocalStorageDemoFavoritesService implements DemoFavoritesService {
  private readonly FAVORITES_KEY = "demo_favorite_flashcards";

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  getFavorites(): number[] {
    if (!this.isClient()) return [];

    try {
      const stored = localStorage.getItem(this.FAVORITES_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  addFavorite(flashcardId: number): void {
    if (!this.isClient()) return;

    const favorites = new Set(this.getFavorites());
    favorites.add(flashcardId);
    this.saveFavorites(Array.from(favorites));
  }

  removeFavorite(flashcardId: number): void {
    if (!this.isClient()) return;

    const favorites = new Set(this.getFavorites());
    favorites.delete(flashcardId);
    this.saveFavorites(Array.from(favorites));
  }

  isFavorite(flashcardId: number): boolean {
    return this.getFavorites().includes(flashcardId);
  }

  private saveFavorites(favorites: number[]): void {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save demo favorites to localStorage:", error);
    }
  }
}

// Singleton instance
export const demoFavoritesService: DemoFavoritesService =
  new LocalStorageDemoFavoritesService();
