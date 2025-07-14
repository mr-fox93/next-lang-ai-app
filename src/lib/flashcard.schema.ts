import z from "zod";

export const ResponsStructure = z.object({
  id: z.number().optional(),
  origin_text: z.string(),
  translate_text: z.string(),
  example_using: z.string(),
  translate_example: z.string(),
  category: z.string(),
  translate_category: z.string(),
  sourceLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
  difficultyLevel: z.string().optional(),
});

export const FlashCardSchema = z.object({
  flashcards: z.array(ResponsStructure),
});

export type FlashCard = z.infer<typeof ResponsStructure>;
