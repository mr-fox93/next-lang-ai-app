"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { FlashCard } from "@/lib/flashcard.schema";
import { updateFlashcardProgressAction } from "@/app/actions/progress-actions";
import { useToast } from "@/components/ui/use-toast";
import { Flashcard } from "@/core/entities/Flashcard";
import { ErrorMessage } from "@/shared/ui/error-message";

interface MultipleChoiceAnswersProps {
  card: FlashCard | Flashcard;
  isFlipped: boolean;
  onAnswer: (isCorrect: boolean) => void;
  otherFlashcards: (FlashCard | Flashcard)[];
}

export function MultipleChoiceAnswers({
  card,
  isFlipped,
  onAnswer,
  otherFlashcards,
}: MultipleChoiceAnswersProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const correctAnswer = isFlipped ? card.translate_text : card.origin_text;

  useEffect(() => {
    setSelectedOption(null);
    setShowResults(false);
    setErrorMessage(null);

    const answerField = isFlipped ? "translate_text" : "origin_text";
    const currentCategory = card.category;

    // Filtruj fiszki tylko z tej samej kategorii co aktualna fiszka
    const sameCategory = otherFlashcards.filter(
      (otherCard) => otherCard.category === currentCategory
    );

    // Jeśli mamy zbyt mało fiszek w tej samej kategorii, używamy tylko dostępnych
    const wrongAnswersPool = sameCategory
      .filter((otherCard) => otherCard[answerField] !== correctAnswer)
      .map((otherCard) => otherCard[answerField])
      .sort(() => Math.random() - 0.5);

    // Pobierz do 3 błędnych odpowiedzi (lub mniej, jeśli nie ma wystarczająco fiszek w kategorii)
    const wrongAnswers = wrongAnswersPool.slice(0, 3);

    // Jeśli mamy mniej niż 3 błędne odpowiedzi, uzupełnij z innych kategorii
    if (wrongAnswers.length < 3) {
      console.log("Nie wystarczająco fiszek w kategorii", currentCategory, "- uzupełniam z innych kategorii");
      const otherCategoriesAnswers = otherFlashcards
        .filter((otherCard) => otherCard.category !== currentCategory)
        .filter((otherCard) => otherCard[answerField] !== correctAnswer)
        .map((otherCard) => otherCard[answerField])
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - wrongAnswers.length);
      
      wrongAnswers.push(...otherCategoriesAnswers);
    }

    const allOptions = [correctAnswer, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    setOptions(allOptions);
  }, [correctAnswer, otherFlashcards, isFlipped, card]);

  const handleSelectOption = async (option: string) => {
    if (showResults) return;
    
    setSelectedOption(option);
    setShowResults(true);
    setErrorMessage(null);
    
    const isCorrect = option === correctAnswer;
    
    // Diagnostyka - wyświetl informacje o fiszce w konsoli
    console.log("Card details:", card);
    console.log("Card ID type:", typeof card.id, "value:", card.id);
    
    // Sprawdź, czy karta ma identyfikator
    const flashcardId = 'id' in card ? 
      (typeof card.id === 'number' ? card.id : 
       typeof card.id === 'string' ? parseInt(card.id, 10) : null) 
      : null;
    
    console.log("Detected flashcard ID:", flashcardId);
    
    if (flashcardId) {
      // Aktualizuj postęp użytkownika
      try {
        console.log("Updating progress for flashcard ID:", flashcardId, "isCorrect:", isCorrect);
        const result = await updateFlashcardProgressAction({
          flashcardId,
          isCorrect
        });
        
        console.log("Progress update result:", result);
        
        if (!result.success) {
          console.error("Błąd aktualizacji postępu:", result.error);
          setErrorMessage("Wystąpił błąd podczas zapisywania postępu");
          toast({
            variant: "destructive",
            title: "Błąd aktualizacji postępu",
            description: result.error || "Nie udało się zapisać postępu, ale możesz kontynuować naukę"
          });
        }
      } catch (error) {
        console.error("Błąd podczas aktualizacji postępu:", error);
        setErrorMessage("Wystąpił nieoczekiwany błąd podczas zapisywania postępu");
        toast({
          variant: "destructive",
          title: "Błąd aktualizacji postępu",
          description: "Wystąpił problem z połączeniem, ale możesz kontynuować naukę"
        });
      }
    } else {
      console.warn("Nie można zaktualizować postępu - fiszka nie ma prawidłowego ID");
      setErrorMessage("Nie można zaktualizować postępu - fiszka nie ma prawidłowego ID");
    }
    
    // Natychmiastowe wywołanie funkcji onAnswer bez opóźnienia
    onAnswer(isCorrect);
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="w-full mx-auto">
      <ErrorMessage 
        message={errorMessage} 
        onClose={() => setErrorMessage(null)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {options.map((option, index) => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selectedOption;
          
          let gradientClass = "";
          const buttonClasses = "w-full min-h-[48px] py-2 sm:py-2.5 px-3 sm:px-4 text-left rounded-lg transition-colors duration-300";
          
          if (showResults) {
            if (isCorrect) {
              gradientClass = "from-emerald-800/40 to-emerald-600/40 border-l-4 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            } else if (isSelected) {
              gradientClass = "from-red-900/40 to-red-800/40 border-l-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
            } else {
              gradientClass = "from-gray-900/40 to-black/40 border-l-0 opacity-60";
            }
          } else {
            gradientClass = "from-violet-900/40 to-indigo-900/50 hover:from-violet-800/50 hover:to-indigo-700/60 border-l-0 hover:border-l-4 hover:border-l-purple-500";
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-auto"
            >
              <button
                onClick={() => handleSelectOption(option)}
                disabled={showResults}
                className={`${buttonClasses} bg-gradient-to-r ${gradientClass} backdrop-blur-md shadow-md overflow-hidden group`}
              >
                <div className="flex items-center w-full">
                  <div className="font-bold text-purple-300 mr-2 text-base min-w-[20px] flex-shrink-0">
                    {letters[index]}.
                  </div>
                  <span className="text-white text-sm sm:text-base font-medium pl-1 break-words hyphens-auto">{option}</span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 