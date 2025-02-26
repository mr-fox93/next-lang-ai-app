"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { FlashCard } from "@/lib/flashcard.schema";
import { speak } from "@/utils/speak";
import { MultipleChoiceAnswers } from "./multiple-choice-answers";
import { Flashcard } from "@/core/entities/Flashcard";

interface FlashcardViewProps {
  card: Flashcard;
  onNext: (known: boolean) => void;
  allFlashcards: Flashcard[];
}

export function FlashcardView({ card, onNext, allFlashcards }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleAnswer = (isCorrect: boolean) => {
    setIsFlipped(false);
    onNext(isCorrect);
  };

  // Filtruj karty, aby uzyskać inne karty niż obecna
  const otherFlashcards = allFlashcards.filter(
    (c) => c.origin_text !== card.origin_text
  );

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 w-full max-w-2xl mx-auto">
      {/* Card */}
      <div
        className="w-full aspect-[3/2] relative cursor-pointer [perspective:1000px] group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Card glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

        <motion.div
          className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-150"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
            <div className="h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-8 flex flex-col group hover:border-purple-500/50 transition-all duration-300 hover:bg-black/50 hover:shadow-2xl">
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(card.origin_text, "en-US");
                  }}
                >
                  <Volume2 className="h-8 w-8" />
                </Button>
                <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80 mb-2">
                  {card.origin_text}
                </h2>
                <div className="text-gray-300 text-center italic text-sm sm:text-base max-w-md">
                  &quot;{card.example_using}&quot;
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-8 flex flex-col group hover:border-purple-500/50 transition-all duration-300 hover:bg-black/50 hover:shadow-2xl">
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80 mb-2">
                  {card.translate_text}
                </h2>
                <div className="text-gray-300 text-center italic text-sm sm:text-base max-w-md">
                  &quot;{card.translate_example}&quot;
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Komponent z opcjami wyboru */}
      <MultipleChoiceAnswers
        card={card}
        isFlipped={isFlipped}
        onAnswer={handleAnswer}
        otherFlashcards={otherFlashcards}
      />
    </div>
  );
}
