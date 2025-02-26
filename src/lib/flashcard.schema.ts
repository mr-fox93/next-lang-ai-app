import { z } from "zod";

const ResponsStructure = z.object({
  origin_text: z.string(),
  translate_text: z.string(),
  example_using: z.string(),
  translate_example: z.string(),
  category: z.string(),
  id: z.number().optional(),
});

export const FlashCardSchema = z.object({
  flashcards: z.array(ResponsStructure),
});

export type FlashCard = z.infer<typeof ResponsStructure> & { id: number };
export type FlashCardResponse = z.infer<typeof FlashCardSchema>;
