import { FavoriteDetails, FavoriteRepository } from "@/core/interfaces/repositories/FavoriteRepository";

export class GetUserFavoritesUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(userId: string): Promise<{ favorites: FavoriteDetails[]; error?: string }> {
    try {
      if (!userId) {
        return { favorites: [] };
      }

      const favorites = await this.favoriteRepository.getFavoritesByUserId(userId);

      return { favorites };
    } catch (error) {
      console.error("Favorites retrieval error:", error);
      return {
        favorites: [],
        error: `Failed to retrieve favorites: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      };
    }
  }
}
