import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { generateFlashcardsAction } from "@/app/actions/flashcard-actions";

interface UseFlashcardsOptions {
  redirectUrl?: string;
  signInUrl?: string;
}

export function useFlashcards(options: UseFlashcardsOptions = {}) {
  const {
    redirectUrl = "/flashcards",
    signInUrl = "/sign-in?redirect=/"
  } = options;
  
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateFlashcards = async (params: {
    count: number;
    message: string;
    level: "beginner" | "intermediate" | "advanced";
    sourceLanguage?: string;
    targetLanguage?: string;
  }) => {
    if (!isSignedIn) {
      router.push(signInUrl);
      return { success: false };
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await generateFlashcardsAction({
        count: params.count,
        message: params.message,
        level: params.level,
        sourceLanguage: params.sourceLanguage || "en",
        targetLanguage: params.targetLanguage || "pl"
      });
      
      if (result.success && result.flashcards && result.flashcards.length > 0) {
        const generatedCategory = result.flashcards[0].category;
        
        router.push(`${redirectUrl}?category=${encodeURIComponent(generatedCategory)}`);
        return { success: true };
      } else {
        setErrorMessage(result.error || "Failed to generate flashcards");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Flashcard generation hook error:", error);
      const errorMsg = error instanceof Error 
        ? `Flashcard generation failed: ${error.message}` 
        : "An unexpected error occurred during flashcard generation";
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMessage,
    generateFlashcards,
    clearError: () => setErrorMessage(null)
  };
} 