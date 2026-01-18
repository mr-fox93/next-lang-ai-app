import { Favorite } from "@/core/interfaces/repositories/FavoriteRepository";
import { FavoriteRepository } from "@/core/interfaces/repositories/FavoriteRepository";

interface AddFavoriteParams {
  userId: string;
  flashcardId: number;
}

export class AddFavoriteUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(params: AddFavoriteParams): Promise<{ favorite?: Favorite; error?: string }> {
    try {
      const { userId, flashcardId } = params;

      if (!userId || !flashcardId) {
        return { error: "Missing userId or flashcardId" };
      }

      const favorite = await this.favoriteRepository.addFavorite(userId, flashcardId);

      return { favorite };
    } catch (error) {
      console.error("Add favorite error:", error);
      return {
        error: `Failed to add favorite: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      };
    }
  }
}
