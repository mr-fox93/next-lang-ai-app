export const getFlashcardsPrompt = (count: number, message: string) => {
  return `
  Generate ${count} unique and diverse flashcards for learning English in **valid JSON format** based on the following topic or description:
  "${message}"
  
  ### **Guidelines:**
  1. **Flashcards must be strictly relevant** to the given topic or description. Whether it is a general category (e.g., "vacation") or a detailed scenario (e.g., "I have a job interview at a food corporation"), the flashcards should focus only on words and phrases directly useful in that context.
  2. **Each flashcard must include:**
     - **"origin_text"**: A word or phrase in English.
     - **"translate_text"**: The Polish translation.
     - **"example_using"**: A sample sentence demonstrating the word/phrase in a real-world context related to the provided topic.
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
        "example_using": "example sentence using the word in context"
      }
    ]
  }
  \`\`\`
  
  ### **Incorrect Example (for the topic "Job Interview")**
  - Words should help in **handling** the interview (e.g., "experience", "qualifications", "competency-based questions"), not **unrelated terms** (e.g., "professional attire", which is about dressing rather than the conversation itself).
  \`\`\`json
  {
    "flashcards": [
      {
        "origin_text": "professional attire",
        "translate_text": "profesjonalny strój",
        "example_using": "Wearing professional attire is crucial for making a good impression at a corporate interview."
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
        "example_using": "Before driving away, make sure to read the rental agreement carefully."
      }
    ]
  }
    
  \`\`\`
    `;
};
