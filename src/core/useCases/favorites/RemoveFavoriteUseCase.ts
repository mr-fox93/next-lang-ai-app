import { FavoriteRepository } from "@/core/interfaces/repositories/FavoriteRepository";

interface RemoveFavoriteParams {
  userId: string;
  flashcardId: number;
}

export class RemoveFavoriteUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(params: RemoveFavoriteParams): Promise<{ error?: string }> {
    try {
      const { userId, flashcardId } = params;

      if (!userId || !flashcardId) {
        return { error: "Missing userId or flashcardId" };
      }

      await this.favoriteRepository.removeFavorite(userId, flashcardId);

      return {};
    } catch (error) {
      console.error("Remove favorite error:", error);
      return {
        error: `Failed to remove favorite: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      };
    }
  }
}
