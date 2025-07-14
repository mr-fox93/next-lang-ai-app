"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { LayoutTemplate, Play } from "lucide-react";
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
import { useUser, useDemoMode } from "@/hooks";
import { toast } from "@/components/ui/use-toast";
import { useTranslations } from 'next-intl';
import { RecaptchaV3 } from "@/components/recaptcha-v3";
import { DemoModeLoader } from "@/components/ui/demo-mode-loader";

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
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { isDemoMode } = useDemoMode();
  const t = useTranslations('Hero');

  useEffect(() => {
  }, [isSignedIn]);

  const handleTryDemo = () => {
    setIsDemoLoading(true);
    
    document.cookie = "demo_mode=true; path=/; max-age=86400";
    
    setTimeout(() => {
      router.push("/flashcards");
    }, 1500);
  };

  const handleGenerateFlashcards = async () => {
    if (!userInput.trim()) return;

    const authState = isSignedIn;

    // For guest users, trigger reCAPTCHA v3 verification
    if (!authState || !user) {
      // Check if reCAPTCHA is configured
      if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        setErrorMessage("reCAPTCHA is not configured. Please contact administrator.");
        return;
      }

      setShowRecaptcha(true);
      setRecaptchaError(null);
      return;
    }

    // For authenticated users, proceed directly
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await generateFlashcardsAction({
        count: 10,
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

  const handleRecaptchaVerified = async (token: string) => {
    setShowRecaptcha(false);
    setIsLoading(true);
    setErrorMessage(null);
    setRecaptchaError(null);

    try {
      const result = await handleGuestFlashcardGeneration({
        count: 10,
        message: userInput,
        level: languageSettings.difficultyLevel,
        sourceLanguage: languageSettings.sourceLanguage,
        targetLanguage: languageSettings.targetLanguage,
        recaptchaToken: token,
      });

      if (result.success && result.flashcards) {
        guestFlashcardsStorage.addFlashcards(result.flashcards);
        setUserInput("");
        router.push("guest-flashcard");
      } else {
        setErrorMessage(result.error || "Error generating flashcards");
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

  const handleRecaptchaError = (error: string) => {
    setRecaptchaError(error);
    setShowRecaptcha(false);
    setErrorMessage(`Security verification failed: ${error}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center">
      {isLoading && <AIGenerationLoader />}
      {isDemoLoading && <DemoModeLoader />}

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

          {/* Desktop subtitle - shown only on desktop */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto px-4 md:px-0"
          >
            {t('subtitle')}
          </motion.p>

          {/* Mobile Try Demo Button - Compact version above language settings */}
          {!isSignedIn && !isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:hidden mb-6 px-4"
            >
              <div className="text-center">
                <Button
                  onClick={handleTryDemo}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={isDemoLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isDemoLoading ? t('loading') : t('tryDemo')}
                </Button>
                
                <div className="flex items-center justify-center my-4 px-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-white/30"></div>
                  <span className="px-4 text-sm text-white font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('or')}</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-500/50 to-white/30"></div>
                </div>
                
                {/* Mobile subtitle - shown after OR separator */}
                <p className="text-gray-400 text-lg mb-4 max-w-2xl mx-auto">
                  {t('subtitleMobile')}
                </p>
              </div>
            </motion.div>
          )}

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
            
            {/* reCAPTCHA v3 component for guest users */}
            {showRecaptcha && (
              <div className="mt-4">
                <RecaptchaV3
                  trigger={showRecaptcha}
                  onVerified={handleRecaptchaVerified}
                  onError={handleRecaptchaError}
                  action="generate_flashcards"
                />
              </div>
            )}
            
            {recaptchaError && (
              <ErrorMessage
                message={recaptchaError}
                onClose={() => setRecaptchaError(null)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
