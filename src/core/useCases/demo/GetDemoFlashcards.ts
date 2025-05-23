import { Flashcard } from "../../entities/Flashcard";

export interface GetDemoFlashcardsResult {
  flashcards: Flashcard[];
  error?: string;
}

export class GetDemoFlashcards {
  private readonly DEMO_USER_ID = "user_2xUe6mCEYobkFTqPSoN38kqnYGZ";

  constructor(
    private readonly getUserFlashcardsUseCase: { execute(userId: string): Promise<GetDemoFlashcardsResult> }
  ) {}

  public async execute(): Promise<GetDemoFlashcardsResult> {
    try {
      const result = await this.getUserFlashcardsUseCase.execute(this.DEMO_USER_ID);
      
      if (result.error) {
        return {
          flashcards: [],
          error: "Failed to load demo flashcards",
        };
      }

      return {
        flashcards: result.flashcards,
      };
    } catch (error) {
      console.error("Demo flashcards error:", error);
      return {
        flashcards: [],
        error: "Failed to load demo flashcards",
      };
    }
  }
} 