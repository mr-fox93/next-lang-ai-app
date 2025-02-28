"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { AnimatedInput } from "@/components/animated-input";
import { Categories } from "@/components/categories";
import { useState } from "react";
import { AIGenerationLoader } from "@/components/ui/ai-generation-loader";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { generateFlashcardsAction } from "@/app/actions/flashcard-actions";
import { ErrorMessage } from "@/shared/ui/error-message";

export default function Hero() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleGenerateFlashcards = async () => {
    if (!userInput.trim()) return;

    if (!isSignedIn) {
      router.push("/sign-in?redirect=/");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await generateFlashcardsAction({
        count: 5,
        message: userInput,
        level: "beginner"
      });
      
      if (result.success) {
        setUserInput("");
        router.push("/flashcards");
        console.log("Fiszki zostały wygenerowane:", result.flashcards);
      } else {
        setErrorMessage(result.error || "Błąd generowania fiszek");
        console.error("Błąd generowania fiszek:", result.error);
      }
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      setErrorMessage("Wystąpił nieoczekiwany błąd podczas generowania fiszek");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center">
      {isLoading && <AIGenerationLoader />}

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 px-4 md:px-0">
              Transform Your Learning with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {" "}
                Flashcards AI
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto px-4 md:px-0"
          >
            Enter any text or scenario and let our AI create perfect flashcards
            for your learning journey.
          </motion.p>

          <Categories />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto px-4 md:px-0"
          >
            <ErrorMessage 
              message={errorMessage} 
              onClose={() => setErrorMessage(null)}
            />
            
            <div className="relative w-full group">
              <Textarea
                className="min-h-[120px] bg-white/[0.08] border-2 border-white/10 text-white resize-none text-lg p-6 focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-300"
                onFocus={() => setIsInputFocused(true)}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setIsInputFocused(false);
                  }
                }}
                onChange={(e) => setUserInput(e.target.value)}
                value={userInput}
                placeholder=""
                disabled={isLoading}
              />
              <AnimatedInput
                isInputFocused={isInputFocused}
                userInput={userInput}
              />
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl" />
            </div>
            <Button
              size="lg"
              className="w-full bg-purple-700 hover:bg-purple-600 text-white px-8 h-16 text-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerateFlashcards}
              disabled={isLoading || !userInput.trim()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                <LayoutTemplate className="h-6 w-6" />
                {isLoading ? "Generowanie..." : "Generate Flashcards"}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
