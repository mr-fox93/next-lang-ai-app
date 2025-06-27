export const getFlashcardsPrompt = (
  count: number,
  message: string,
  level: string,
  sourceLanguage: string = "en",
  targetLanguage: string = "pl",
  existingFlashcards: Array<{origin_text: string, translate_text: string}> = []
) => {
  const languageNames: Record<string, string> = {
    "en": "English",
    "pl": "Polish",
    "es": "Spanish",
    "it": "Italian"
  };

  const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
  const targetLang = languageNames[targetLanguage] || targetLanguage;

  // Check if user wants general vocabulary (not specific scenario)
  const isGeneralVocabulary = /^(vocabulary|słownictwo|words|słowa|general|ogólne|basic|podstawowe|mixed|różne)$/i.test(message.trim());

  // Define difficulty levels clearly
  const levelDefinitions = {
    "easy": `EASY LEVEL (A1-B1): 
- Use basic, everyday vocabulary
- Simple grammatical structures
- Common words used in daily life
- Basic conversational phrases
- Frequency: High-frequency words (top 2000 most common words)
- Complexity: Simple sentences, present tense focus`,
    
    "advanced": `ADVANCED LEVEL (B2+):
- Use sophisticated, nuanced vocabulary  
- Complex grammatical structures
- Professional, academic, or specialized terms
- Idiomatic expressions and phrasal verbs
- Frequency: Mid to low-frequency words (beyond top 2000 words)
- Complexity: Complex sentences, various tenses, conditional forms`
  };

  const currentLevelDefinition = levelDefinitions[level as keyof typeof levelDefinitions] || levelDefinitions["easy"];

  // Special instructions for general vocabulary
  const generalVocabularyInstructions = isGeneralVocabulary ? `
GENERAL VOCABULARY MODE DETECTED:
- Use "${targetLang === "Polish" ? "Słownictwo" : targetLang === "Spanish" ? "Vocabulario" : targetLang === "Italian" ? "Vocabolario" : "Vocabulary"}" as the category name
- Generate DIVERSE words from DIFFERENT life areas: daily life, work, travel, food, emotions, actions, objects
- Include mix of: nouns, verbs, adjectives, common phrases
- Vary topics within the flashcards: some about emotions, some about work, some about daily activities, etc.
- DO NOT create specific scenario categories like "job interview", "restaurant", "greetings"
- Each flashcard can be from a different life context but all under one "Vocabulary" category
` : '';

  // Create exclusion list from existing flashcards
  const exclusionList = existingFlashcards.length > 0 
    ? `\n\nCRITICAL: DO NOT INCLUDE ANY OF THESE EXISTING TERMS:
${existingFlashcards.map(card => `- "${card.origin_text}" / "${card.translate_text}"`).join('\n')}
\nGenerate COMPLETELY DIFFERENT words that are NOT on this list.`
    : '';

  return `
Generate ${count} DIVERSE flashcards for learning ${sourceLang} to ${targetLang}.

TOPIC: "${message}"
DIFFICULTY LEVEL: ${level.toUpperCase()}

${currentLevelDefinition}

${generalVocabularyInstructions}

CRITICAL: REAL-LIFE CONVERSATION FOCUS
This application focuses on PRACTICAL, REAL-CASE SCENARIOS. Users need vocabulary and phrases they will ACTUALLY use in real conversations.

EXAMPLE_USING REQUIREMENTS:
- Must be a complete sentence or question used in REAL conversations
- Must be something a person would ACTUALLY say in the given context
- Focus on practical communication scenarios (asking questions, making requests, expressing needs)
- Should reflect real-world interactions, not textbook examples

GOOD examples for "car rental" category:
✅ "I'd like to rent a car for three days"
✅ "Does the car have full insurance coverage?"
✅ "Am I liable for damages in case of an accident?"
✅ "What documents do I need to rent a car?"
✅ "Is there a fuel policy I should know about?"

BAD examples to AVOID:
❌ "Press the accelerator to speed up" (instructional, not conversational)
❌ "The suspension affects driving comfort" (technical description)
❌ "Cars have four wheels" (obvious facts)

GOOD examples for "job interview" category:
✅ "What are the main responsibilities of this position?"
✅ "I have several years of experience working with..."
✅ "What benefits does the company offer?"
✅ "When can I expect to hear back from you?"
✅ "Could you tell me about the team I'd be working with?"

DIVERSITY REQUIREMENTS:
- Use words starting with DIFFERENT letters (avoid clustering on same letters)
- Vary word types: nouns, verbs, adjectives, adverbs, phrases
- Include different semantic categories within the topic
- Mix questions and statements in example_using
- Include both formal and informal expressions when appropriate
- Ensure each flashcard teaches something unique

${exclusionList}

Required JSON format:
{
  "flashcards": [
    {
      "origin_text": "practical word/phrase in ${sourceLang}",
      "translate_text": "translation in ${targetLang}",
      "example_using": "REAL conversational sentence/question in ${sourceLang}",
      "translate_example": "example translation in ${targetLang}",
      "category": "category name in ${targetLang}",
      "translate_category": "category name in ${sourceLang}"
    }
  ]
}

MANDATORY RULES:
- All flashcards must have the SAME category name
- Category should be in ${targetLang} (learning language)
- translate_category should be in ${sourceLang} (interface language)  
- Words must match the specified difficulty level (${level})
- Examples must be CONVERSATIONAL and PRACTICAL - things people actually say
- Focus on COMMUNICATION needs, not academic knowledge
- NO repetitions or variations of existing terms
- Ensure maximum DIVERSITY in vocabulary selection
- Each example_using must be a COMPLETE, NATURAL sentence or question
- Prioritize phrases and expressions over single words when contextually appropriate

Context-specific guidance:
- For service/business contexts: Include customer-service interactions, inquiries, requests
- For travel contexts: Include practical travel needs, booking, navigation, problems
- For professional contexts: Include workplace communication, meetings, presentations
- For social contexts: Include conversations, expressing opinions, making plans
- For emergency/medical contexts: Include urgent communication needs

Example for GENERAL "vocabulary" request:
- category: "${targetLang === "Polish" ? "Słownictwo" : targetLang === "Spanish" ? "Vocabulario" : targetLang === "Italian" ? "Vocabolario" : "Vocabulary"}" (same for all flashcards)
- Diverse content: emotion words, work terms, daily objects, actions, travel phrases
- origin_text: "excited" → example_using: "I'm excited about the new project"
- origin_text: "appointment" → example_using: "I need to schedule an appointment"

Example for SPECIFIC "restaurant" topic at EASY level:
- origin_text: "bill" → example_using: "Could I have the bill, please?"
- origin_text: "reservation" → example_using: "I'd like to make a reservation for two people"

Example for SPECIFIC "job interview" topic at ADVANCED level:  
- origin_text: "qualifications" → example_using: "My qualifications include a Master's degree and five years of experience"
- origin_text: "challenging" → example_using: "I'm looking for a more challenging role where I can grow professionally"
  `;
};

// Helper function for generating more flashcards with retry mechanism
export const getEnhancedFlashcardsPrompt = (
  count: number,
  message: string,
  level: string,
  sourceLanguage: string,
  targetLanguage: string,
  existingFlashcards: Array<{origin_text: string, translate_text: string}>,
  category: string,
  attemptNumber: number = 1
) => {
  const basePrompt = getFlashcardsPrompt(count, message, level, sourceLanguage, targetLanguage, existingFlashcards);
  
  // Check if this is general vocabulary category
  const isGeneralVocabulary = /^(vocabulary|słownictwo|vocabulario|vocabolario)$/i.test(category.trim());
  
  const retryInstructions = attemptNumber > 1 
    ? `\n\nIMPORTANT: This is attempt #${attemptNumber}. Previous attempts may have generated duplicates. 
Be EXTRA creative and generate COMPLETELY DIFFERENT words that are NOT similar to existing ones.
Focus on UNEXPLORED vocabulary within the topic.
Try different CONVERSATION SCENARIOS and REAL-LIFE SITUATIONS within the same category.
Vary between QUESTIONS, STATEMENTS, REQUESTS, and EXPRESSIONS that people actually use.`
    : '';

  const enhancedInstructions = isGeneralVocabulary ? `
ENHANCED FOCUS FOR GENERAL VOCABULARY CATEGORY "${category}":
- Generate words from COMPLETELY DIFFERENT life areas than existing ones
- Cover diverse topics: emotions, work, daily life, travel, food, relationships, hobbies, etc.
- Each flashcard should be from a DIFFERENT semantic field
- Mix word types: nouns, verbs, adjectives, phrases
- Focus on practical words people use in everyday conversations
- Ensure maximum diversity across all areas of life` : `
ENHANCED FOCUS FOR CATEGORY "${category}":
- Generate vocabulary that covers DIFFERENT aspects of this topic
- Include various CONVERSATION TYPES: questions, requests, responses, expressions
- Think about DIFFERENT SCENARIOS within this category where people need to communicate
- Each flashcard should address a DIFFERENT communication need
- Focus on phrases people would ACTUALLY say in real-life situations`;

  return basePrompt.replace(
    'TOPIC: "' + message + '"',
    `TOPIC: "${message}"
CATEGORY: All flashcards MUST use category "${category}" (exact match)${enhancedInstructions}${retryInstructions}`
  );
};
