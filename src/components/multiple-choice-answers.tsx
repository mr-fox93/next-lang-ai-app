"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  const correctAnswer = isFlipped ? card.origin_text : card.translate_text;

  useEffect(() => {
    setSelectedOption(null);
    setShowResults(false);
    setErrorMessage(null);

    const answerField = isFlipped ? "origin_text" : "translate_text";
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
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1500);
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <ErrorMessage 
        message={errorMessage} 
        onClose={() => setErrorMessage(null)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option, index) => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selectedOption;
          
          let buttonStyle = "w-full h-auto py-4 px-6 text-left bg-black/40 backdrop-blur-md border-2";
          
          if (showResults) {
            if (isCorrect) {
              buttonStyle += " border-green-500 bg-green-500/20";
            } else if (isSelected) {
              buttonStyle += " border-red-500 bg-red-500/20";
            } else {
              buttonStyle += " border-white/10 text-white/60";
            }
          } else {
            buttonStyle += " border-white/10 hover:border-purple-500/50 hover:bg-black/50";
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={`${buttonStyle} rounded-xl shadow-md overflow-hidden`}
                onClick={() => handleSelectOption(option)}
                disabled={showResults}
              >
                <div className="flex items-center w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold mr-3 flex-shrink-0">
                    {letters[index]}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 