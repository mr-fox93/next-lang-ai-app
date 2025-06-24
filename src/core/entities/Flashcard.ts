export interface Flashcard {
  id: number;
  origin_text: string;
  translate_text: string;
  example_using: string;
  translate_example: string;
  category: string;
  translate_category: string;
  userId: string;
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
} 