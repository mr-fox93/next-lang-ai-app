"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { speak } from "@/utils/speak";
import { SupportedTTSLanguage } from "@/types/locale";
import { Flashcard } from "@/core/entities/Flashcard";
import { MultipleChoiceAnswers } from "@/components/multiple-choice-answers";

const langToTTSMap: Record<string, SupportedTTSLanguage> = {
  en: "en-US",
  pl: "pl-PL",
  es: "es-ES",
  it: "it-IT"
};

interface FlashcardViewProps {
  card: Flashcard;
  onNext: (known: boolean) => void;
  allFlashcards: Flashcard[];
  isGuestMode?: boolean;
}

export function FlashcardView({ card, onNext, allFlashcards, isGuestMode = false }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleAnswer = (isCorrect: boolean) => {
    setTimeout(() => {
      setIsFlipped(false);
      onNext(isCorrect);
    }, 1500);
  };

  const otherFlashcards = allFlashcards.filter(
    (c) => c.origin_text !== card.origin_text
  );

  const targetTTS = langToTTSMap[card.targetLanguage] || "en-US";

  return (
    <div className="flex flex-col items-center justify-start w-full h-full max-w-3xl mx-auto overflow-hidden pt-10 sm:pt-8">
      <div className="w-full flex flex-col items-center justify-start gap-3 flex-1 overflow-hidden">
        <div
          className="relative [perspective:1000px] transition-all duration-500 w-full sm:w-[90%] md:w-[85%] lg:w-[80%] aspect-[5/3] sm:aspect-[3/2] cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-30 blur-sm group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-tilt ${
              isFlipped ? "animate-none" : ""
            }`}
          ></div>

          <div
            className="absolute w-full h-full transform-gpu transition-all duration-500 ease-in-out [transform-style:preserve-3d]"
            style={{
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div className="absolute w-full h-full [backface-visibility:hidden]">
              <Card className="w-full h-full flex flex-col justify-between border-0 shadow-xl bg-black/20 backdrop-blur-sm overflow-hidden rounded-xl">
                <motion.div
                  className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-1 md:mb-2 flex flex-col items-center">
                    <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                      {card.translate_text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(card.translate_text, targetTTS);
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 w-full">
                    <div className="text-gray-300 text-center italic text-xs sm:text-sm line-clamp-2 mt-1">
                      &quot;{card.translate_example}&quot;
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(card.translate_example, targetTTS);
                      }}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>

                <div className="p-1.5 sm:p-2 flex items-center justify-between text-xs text-gray-400 bg-gray-800/30 rounded-b-xl">
                  <div>
                    <Badge variant="outline" className="bg-gray-800/60 text-xs">
                      {card.category}
                    </Badge>
                  </div>
                  <div className="text-xs">Click to flip</div>
                </div>
              </Card>
            </div>

            <div
              className="absolute w-full h-full [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <Card className="w-full h-full flex flex-col justify-between border-0 shadow-xl bg-black/20 backdrop-blur-sm overflow-hidden rounded-xl">
                <motion.div
                  className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-1 md:mb-2">
                    <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                      {card.origin_text}
                    </span>
                  </div>
                  <div className="text-gray-300 text-center italic text-xs sm:text-sm line-clamp-2 mt-1">
                    &quot;{card.example_using}&quot;
                  </div>
                </motion.div>

                <div className="p-1.5 sm:p-2 flex items-center justify-between text-xs text-gray-400 bg-gray-800/30 rounded-b-xl">
                  <div>
                    <Badge variant="outline" className="bg-gray-800/60 text-xs">
                      {card.category}
                    </Badge>
                  </div>
                  <div className="text-xs">Click to flip</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%]">
          <MultipleChoiceAnswers
            card={card}
            isFlipped={isFlipped}
            onAnswer={handleAnswer}
            otherFlashcards={otherFlashcards}
            isGuestMode={isGuestMode}
          />
        </div>
      </div>
    </div>
  );
}
