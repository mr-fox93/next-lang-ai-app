import z from "zod";

export const ResponsStructure = z.object({
  origin_text: z.string(),
  translate_text: z.string(),
  example_using: z.string(),
  translate_example: z.string(),
  category: z.string(),
});

export const FlashCardSchema = z.object({
  flashcards: z.array(ResponsStructure),
});

export type FlashCard = z.infer<typeof ResponsStructure>;
export type FlashCardResponse = z.infer<typeof FlashCardSchema>;
