import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
  }) => {
    if (!isSignedIn) {
      router.push(signInUrl);
      return { success: false };
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await generateFlashcardsAction(params);
      
      if (result.success && result.flashcards && result.flashcards.length > 0) {
        // Pobierz kategorię z pierwszej wygenerowanej fiszki
        const generatedCategory = result.flashcards[0].category;
        
        // Przekieruj do strony z fiszkami z parametrem kategorii
        router.push(`${redirectUrl}?category=${encodeURIComponent(generatedCategory)}`);
        return { success: true };
      } else {
        setErrorMessage(result.error || "Nie udało się wygenerować fiszek");
        console.error("Błąd generowania fiszek:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = "Wystąpił nieoczekiwany błąd";
      setErrorMessage(errorMsg);
      console.error("Nie udało się wygenerować fiszek:", error);
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