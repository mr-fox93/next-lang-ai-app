"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { AnimatedInput } from "@/components/animated-input";
import { LanguageSettings as LanguageSettingsComponent } from "@/components/language-settings";
import type { LanguageSettings } from "@/types/component-props";
import { useState, useEffect } from "react";
import { AIGenerationLoader } from "@/components/ui/ai-generation-loader";
import { useRouter } from '@/i18n/navigation';
import {
  handleGuestFlashcardGeneration,
  generateFlashcardsAction,
} from "@/app/actions/flashcard-actions";
import { ErrorMessage } from "@/shared/ui/error-message";
import { guestFlashcardsStorage } from "@/utils/guest-flashcards-storage";
import { useAuth, useUser } from "@/hooks";
import { toast } from "@/components/ui/use-toast";
import { useTranslations } from 'next-intl';

export default function Hero() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [languageSettings, setLanguageSettings] =
    useState<LanguageSettings>({
      sourceLanguage: "pl",
      targetLanguage: "en",
      difficultyLevel: "easy",
    });
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const t = useTranslations('Hero');

  useEffect(() => {
    // Remove unnecessary auth state logging
  }, [isSignedIn]);

  const handleGenerateFlashcards = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const authState = isSignedIn;

    try {
      if (authState && user) {
        // Secure: don't log user ID or sensitive data

        const result = await generateFlashcardsAction({
          count: 5,
          message: userInput,
          level: languageSettings.difficultyLevel,
          sourceLanguage: languageSettings.sourceLanguage,
          targetLanguage: languageSettings.targetLanguage,
        });

        if (result.success) {
          setUserInput("");
          toast({
            title: t('success'),
            description: t('successMessage'),
            variant: "success",
          });

          setTimeout(() => {
            router.push("flashcards");
          }, 100);
        } else {
          setErrorMessage(result.error || "Error generating flashcards");
        }
      } else {
        // Remove guest mode logging

        const result = await handleGuestFlashcardGeneration({
          count: 5,
          message: userInput,
          level: languageSettings.difficultyLevel,
          sourceLanguage: languageSettings.sourceLanguage,
          targetLanguage: languageSettings.targetLanguage,
        });

        if (result.success && result.flashcards) {
          guestFlashcardsStorage.addFlashcards(result.flashcards);
          setUserInput("");
          router.push("guest-flashcard");
        } else {
          setErrorMessage(result.error || "Error generating flashcards");
        }
      }
    } catch (error) {
      console.error("Flashcard generation client error:", error);
      setErrorMessage(
        error instanceof Error
          ? `Flashcard generation failed: ${error.message}`
          : "An unexpected error occurred during flashcard generation"
      );
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
              {t('title')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {" "}
                {t('brandName')}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto px-4 md:px-0"
          >
            {t('subtitle')}
          </motion.p>

          <LanguageSettingsComponent onChange={setLanguageSettings} />

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
                {isLoading ? t('generating') : t('generateButton')}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
