import fs from "fs";
import path from "path";

export const getFlashcardsPrompt = (
  count: number,
  message: string,
  level: string
) => {
  const getFlashcardsExamples = () => {
    const filePath = path.join(
      process.cwd(),
      "data",
      "flashcards_query_response.json"
    );
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
  };

  const previousExamples = getFlashcardsExamples();

  return `
  Generate ${count} unique and diverse flashcards for learning English in **valid JSON format** based on the following topic or description:
  **"${message}".** The difficulty of the flashcards should be appropriate for the **${level}** level of English.

  ### **Guidelines:**
  1. **Flashcards must be strictly relevant** to the given topic or description.
  2. **Each flashcard must include:**
     - **"origin_text"**: A word or phrase in English.
     - **"translate_text"**: The Polish translation.
     - **"example_using"**: A sample sentence demonstrating the word/phrase in a real-world context related to the provided topic.
      - **"translate_example"**: The Polish translation of the example sentence.
     - **"category"**: A short, meaningful category that represents the key theme of the flashcard (e.g., "Job Interview", "Car Rental", "ESG Work"). A single, consistent category that applies to **all** generated flashcards.
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
  - Choose a category that accurately reflects the user's input. 
  - If the user's input is broad (e.g., "travel"), use a meaningful subcategory such as "Airport", "Hotel Booking", or "Local Transport".
  - If uncertain, choose the most general but meaningful category.

  ### **Reference Previous Examples:**
  The user has previously requested flashcards for similar topics. Here are some examples:
  ${
    previousExamples.length > 0
      ? JSON.stringify(previousExamples, null, 2)
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
