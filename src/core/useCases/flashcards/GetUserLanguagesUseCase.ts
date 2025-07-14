import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";

export interface GetUserLanguagesParams {
  userId: string;
}

export interface GetUserLanguagesResult {
  success: boolean;
  languages?: string[];
  error?: string;
}

export class GetUserLanguagesUseCase {
  constructor(private flashcardRepository: FlashcardRepository) {}

  async execute(params: GetUserLanguagesParams): Promise<GetUserLanguagesResult> {
    try {
      const { userId } = params;

      if (!userId) {
        return {
          success: false,
          error: "Authentication required: User is not signed in",
          languages: [],
        };
      }

      const languages = await this.flashcardRepository.getUserTargetLanguages(userId);

      return {
        success: true,
        languages,
      };
    } catch (error) {
      console.error("Get user languages error:", error);
      return {
        success: false,
        error: `Failed to get languages: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
        languages: [],
      };
    }
  }
} 