import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  isSafe: boolean;
  reasons: string[];
}

/**
 * Uses OpenAI to check message content for inappropriate language
 * Will detect problematic content in any language
 */
export async function moderateContent(message: string): Promise<ModerationResult> {
  try {
    // First try OpenAI's moderation API
    const moderationResponse = await openai.moderations.create({
      input: message,
    });

    const moderationResult = moderationResponse.results[0];
    
    // If standard moderation API detects a problem - only flag for severe categories
    if (moderationResult.flagged) {
      // Get categories that were flagged
      const flaggedCategories = Object.entries(moderationResult.categories)
        .filter(([category, isFlagged]) => {
          // Only block for these severe categories
          const severeCategories = [
            'sexual',
            'hate',
            'violence',
            'self-harm',
            'sexual/minors',
            'hate/threatening',
            'violence/graphic'
          ];
          
          // Skip "harassment" category which can be too sensitive for tech support contexts
          return isFlagged && severeCategories.includes(category);
        })
        .map(([category]) => category);
      
      // Only flag if severe categories are detected
      if (flaggedCategories.length > 0) {
        return {
          isSafe: false,
          reasons: [`Content flagged for: ${flaggedCategories.join(', ')}`]
        };
      }
    }
    
    // For more nuanced checking that works in all languages, 
    // use the chat model to detect inappropriate content that the moderation API might miss
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a content moderator for a contact form in an educational application called "Flashcards AI".
          The application helps users learn languages using flashcards, and this contact form is for:
          - Reporting technical issues or bugs
          - Asking questions about using the application
          - Providing general feedback
          - Requesting support
          
          You should ALLOW users to:
          - Describe technical problems in detail (even if they use somewhat frustrated language)
          - Report bugs or errors they encounter
          - Ask questions about functionality
          - Request help with application features
          - Describe confusing or problematic experiences with the app
          
          You should ONLY flag content that is:
          1. Clear hate speech or slurs directed at people/groups
          2. Explicit threats of violence (not frustration with the app)
          3. Sexually explicit content
          4. Clear harassment directed at specific people
          
          DO NOT flag content merely because:
          - It contains descriptions of application errors
          - It uses some mild frustration or mild negative words to describe problems
          - It mentions receiving error messages or describes error messages
          - It contains technical terms or describes technical issues
          
          If you detect truly inappropriate content (based on the guidelines above), respond with a JSON object with "safe": false and 
          "reasons" as an array explaining what was detected.
          
          If the content is appropriate, respond with a JSON object with "safe": true and empty "reasons" array.
          
          IMPORTANT: Only respond with the JSON. Do not add any other text or explanation.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });
    
    // Parse result from content analysis
    const content = response.choices[0].message.content || '{"safe": true, "reasons": []}';
    const analysisResult = JSON.parse(content);
    
    if (!analysisResult.safe) {
      return {
        isSafe: false,
        reasons: analysisResult.reasons
      };
    }
    
    // Content passed both checks
    return {
      isSafe: true,
      reasons: []
    };
  } catch (error) {
    console.error("Error in content moderation:", error);
    // Allow content if moderation fails (assuming innocent until proven guilty)
    return {
      isSafe: true,
      reasons: ["Moderation service unavailable, message allowed"]
    };
  }
} 