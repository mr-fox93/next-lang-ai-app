export const getFlashcardsPrompt = (
  count: number,
  message: string,
  level: string,
  sourceLanguage: string = "en",
  targetLanguage: string = "pl"
) => {
  const languageNames: Record<string, string> = {
    "en": "English",
    "pl": "Polish",
    "es": "Spanish",
    "it": "Italian"
  };

  const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
  const targetLang = languageNames[targetLanguage] || targetLanguage;

  return `
Generate ${count} flashcards for learning ${sourceLang} to ${targetLang}, topic: "${message}", level: ${level}.

Required JSON format:
{
  "flashcards": [
    {
      "origin_text": "word in ${sourceLang}",
      "translate_text": "translation in ${targetLang}",
      "example_using": "example sentence in ${sourceLang}",
      "translate_example": "example translation in ${targetLang}",
      "category": "category name in ${targetLang}",
      "translate_category": "category name in ${sourceLang}"
    }
  ]
}

Rules:
- All flashcards must have the same category
- Category should be in ${targetLang} (learning language)
- translate_category should be in ${sourceLang} (interface language)
- Words must be relevant to the topic
- No repetitions
- Examples must be practical

Example:
For topic "restaurant" when learning Polish:
- category: "Restauracja" (Polish)
- translate_category: "Restaurant" (English)
  `;
};
