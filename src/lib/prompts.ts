export const getFlashcardsPrompt = (
  count: number,
  message: string,
  level: string,
  sourceLanguage: string = "en",
  targetLanguage: string = "pl"
) => {
  // Przykłady fiszek zdefiniowane bezpośrednio w kodzie zamiast wczytywania z pliku
  const previousExamples = [
    {
      "messages": [
        {
          "role": "system",
          "content": "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning."
        },
        {
          "role": "user",
          "content": "Generate 3 flashcards about job interviews, level: intermediate"
        }
      ],
      "response": [
        {
          "origin_text": "job interview",
          "translate_text": "rozmowa kwalifikacyjna",
          "example_using": "I have a job interview scheduled for tomorrow morning.",
          "translate_example": "Mam zaplanowaną rozmowę kwalifikacyjną na jutro rano.",
          "category": "Job Application",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "intermediate"
        },
        {
          "origin_text": "resume",
          "translate_text": "CV",
          "example_using": "I updated my resume to include my recent work experience.",
          "translate_example": "Zaktualizowałem moje CV, aby uwzględnić moje ostatnie doświadczenie zawodowe.",
          "category": "Job Application",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "intermediate"
        },
        {
          "origin_text": "qualifications",
          "translate_text": "kwalifikacje",
          "example_using": "The employer was impressed by my qualifications for the position.",
          "translate_example": "Pracodawca był pod wrażeniem moich kwalifikacji na to stanowisko.",
          "category": "Job Application",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "intermediate"
        }
      ]
    },
    {
      "messages": [
        {
          "role": "system",
          "content": "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning."
        },
        {
          "role": "user",
          "content": "I need 3 flashcards about car rental, level: beginner"
        }
      ],
      "response": [
        {
          "origin_text": "rental agreement",
          "translate_text": "umowa wynajmu",
          "example_using": "Before driving away, make sure to read the rental agreement carefully.",
          "translate_example": "Przed odjazdem upewnij się, że dokładnie przeczytałeś umowę wynajmu.",
          "category": "Car Rental",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "beginner"
        },
        {
          "origin_text": "insurance coverage",
          "translate_text": "ochrona ubezpieczeniowa",
          "example_using": "The insurance coverage for this rental car includes collision damage.",
          "translate_example": "Ochrona ubezpieczeniowa tego wynajmowanego samochodu obejmuje uszkodzenia w wyniku kolizji.",
          "category": "Car Rental",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "beginner"
        },
        {
          "origin_text": "mileage limit",
          "translate_text": "limit kilometrów",
          "example_using": "There is a daily mileage limit of 200 kilometers for this rental.",
          "translate_example": "Dla tego wynajmu obowiązuje dzienny limit kilometrów wynoszący 200 kilometrów.",
          "category": "Car Rental",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "beginner"
        }
      ]
    },
    {
      "messages": [
        {
          "role": "system",
          "content": "You are an expert language teacher who always provides high-quality, diverse, and contextually appropriate flashcards for language learning."
        },
        {
          "role": "user",
          "content": "Create 3 business meeting vocabulary cards, level: advanced"
        }
      ],
      "response": [
        {
          "origin_text": "agenda",
          "translate_text": "porządek obrad",
          "example_using": "Let's go through the agenda for today's meeting.",
          "translate_example": "Przejdźmy przez porządek obrad dzisiejszego spotkania.",
          "category": "Business Meeting",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "advanced"
        },
        {
          "origin_text": "quarterly report",
          "translate_text": "raport kwartalny",
          "example_using": "We need to discuss the quarterly report during our next meeting.",
          "translate_example": "Musimy omówić raport kwartalny podczas naszego następnego spotkania.",
          "category": "Business Meeting",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "advanced"
        },
        {
          "origin_text": "stakeholder",
          "translate_text": "interesariusz",
          "example_using": "All the key stakeholders will be attending tomorrow's presentation.",
          "translate_example": "Wszyscy kluczowi interesariusze będą obecni na jutrzejszej prezentacji.",
          "category": "Business Meeting",
          "sourceLanguage": "en",
          "targetLanguage": "pl",
          "difficultyLevel": "advanced"
        }
      ]
    }
  ];

  const languageNames: Record<string, string> = {
    "en": "English",
    "pl": "Polish",
    "es": "Spanish",
    "it": "Italian"
  };

  const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
  const targetLang = languageNames[targetLanguage] || targetLanguage;

  return `
  Generate ${count} unique and diverse flashcards for learning ${sourceLang} to ${targetLang} in **valid JSON format** based on the following topic or description:
  **"${message}".** The difficulty of the flashcards should be appropriate for the **${level}** level of language learning.

  ### **Guidelines:**
  1. **Flashcards must be strictly relevant** to the given topic or description.
  2. **Each flashcard must include:**
     - **"origin_text"**: A word or phrase in ${sourceLang}.
     - **"translate_text"**: The ${targetLang} translation.
     - **"example_using"**: A sample sentence demonstrating the word/phrase in a real-world context related to the provided topic, in ${sourceLang}.
      - **"translate_example"**: The ${targetLang} translation of the example sentence.
     - **"category"**: A short, meaningful category in the ${targetLang} language that represents the key theme of the flashcard (e.g., if learning Polish: "Rozmowa kwalifikacyjna", if learning Spanish: "Entrevista de trabajo", if learning Italian: "Colloquio di lavoro", all instead of the English "Job Interview"). A single, consistent category that applies to **all** generated flashcards.
  3. **Ensure the following:**
     - Words and phrases are **unique** (no repetitions).
     - Example sentences are **diverse** and **practical for real-world use**.
     - Avoid **overly simple, obvious, or off-topic words** that do not directly aid in learning the topic effectively.
  4. **The response must be in strict JSON format, following this exact structure, with no additional text or comments:**

  \`\`\`json
  {
    "flashcards": [
      {
        "origin_text": "example word",
        "translate_text": "example translation",
        "example_using": "example sentence using the word in context",
        "translate_example": "example translation of the sentence (example_using)",
        "category": "example category"
      }
    ]
  }
  \`\`\`

### **Category Guidelines:**
  - The category should be **concise and descriptive**, summarizing the primary theme of the flashcards.
  - **All generated flashcards must belong to the same category** (no mixing within one response).
  - **If the user specifies an EXACT category name in their request, use that EXACT name without any modifications.**
  - Choose a category that accurately reflects the user's input. 
  - If the user's input is broad (e.g., "travel"), use a meaningful subcategory such as "Airport", "Hotel Booking", or "Local Transport".
  - If uncertain, choose the most general but meaningful category.
  - **CRITICAL: When generating additional flashcards for an existing category, preserve the category name exactly as specified.**

  ### **Reference Previous Examples:**
  The user has previously requested flashcards for similar topics. Here are some examples:
  ${
    previousExamples.length > 0
      ? previousExamples.map(example => `
        **User Request:** "${example.messages[1].content}"
        **Response Structure:**
        \`\`\`json
        {
          "flashcards": ${JSON.stringify(example.response, null, 2)}
        }
        \`\`\`
        `).join('\n\n')
      : "No previous examples available."
  }
  
  ### **Incorrect Example (for the topic "Job Interview")**
  - Words should help in **handling** the interview (e.g., "experience", "qualifications"), not **general terms** (e.g., "business attire"), because probably such a term may not be used in a conversation with the HR department that will conduct the recruitment. The HR department will want information from us about ourselves, our professional experience, plans for the future, etc. 
  \`\`\`json
  {
    "flashcards": [
      {
        "origin_text": "business attire",
        "translate_text": "ubiór biznesowy",
        "example_using": "You have a nice business attire for the interview.",
        "translate_example": "Masz ładny ubiór biznesowy na rozmowę kwalifikacyjną.",
        "category": "Incorrect"
      }
    ]
  }
  \`\`\`
  
  ### **Correct Example (for the topic "Car Rental")**
  - Words should focus on **terms relevant to renting a car**, such as contract details, insurance, and rental policies.
  \`\`\`json
  {
    "flashcards": [
      {
        "origin_text": "rental agreement",
        "translate_text": "umowa wynajmu",
        "example_using": "Before driving away, make sure to read the rental agreement carefully.",
        "translate_example": "Przed odjazdem upewnij się, że dokładnie przeczytałeś umowę wynajmu.",
        "category": "Car Rental"
      }
    ]
  }
  \`\`\`
  
  ### **Incorrect Example (for the topic "Business Meeting")**
  \`\`\`json
  {
    "flashcards": [
      {
        "origin_text": "business etiquette",
        "translate_text": "etykieta biznesowa",
        "example_using": "Proper business etiquette helps maintain professional relationships.",
        "translate_example": "Prawidłowa etykieta biznesowa pomaga utrzymać profesjonalne relacje.",
        "category": "Incorrect"
      }
    ]
  }
  \`\`\`
  `;
};
