import { Flashcard } from "@/core/entities/Flashcard";
import { Progress } from "@/core/interfaces/repositories/ProgressRepository";

export interface Favorite {
  id: number;
  userId: string;
  flashcardId: number;
  createdAt: Date;
}

export interface FavoriteDetails extends Favorite {
  flashcard: Flashcard;
  progress: Progress | null;
}

export interface FavoriteRepository {
  addFavorite(userId: string, flashcardId: number): Promise<Favorite>;
  removeFavorite(userId: string, flashcardId: number): Promise<void>;
  getFavoritesByUserId(userId: string): Promise<FavoriteDetails[]>;
}
