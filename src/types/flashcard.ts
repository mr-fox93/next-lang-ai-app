export interface ImportableFlashcard {
  origin_text: string;
  translate_text: string;
  example_using: string;
  translate_example: string;
  category: string;
  translate_category: string;
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
}

export interface FlashcardGenerationResponse {
  success: boolean;
  flashcards?: ImportableFlashcard[];
  error?: string;
  redirect?: string;
}

export interface GenerateFlashcardsActionParams {
  count: number;
  message: string;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface AIFlashcardGenerator {
  generateFlashcardsWithAI(prompt: string): Promise<Record<string, string>[]>;
} 