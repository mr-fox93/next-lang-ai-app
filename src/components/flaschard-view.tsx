"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { speak, SupportedTTSLanguage } from "@/utils/speak";
import { Flashcard } from "@/core/entities/Flashcard";
import { MultipleChoiceAnswers } from "@/components/multiple-choice-answers";

// Mapowanie kodów języków na kody TTS
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

  // Określenie odpowiednich kodów TTS dla języków źródłowego i docelowego
  const targetTTS = langToTTSMap[card.targetLanguage] || "en-US";

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-2xl mx-auto h-[calc(100vh-100px)] overflow-hidden">
      <div className="w-full flex flex-col items-center justify-start gap-2 flex-1 overflow-auto p-4">
        {/* Card */}
        <div
          className="relative [perspective:1000px] transition-all duration-500 w-full aspect-[4/2] cursor-pointer group max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shrink-0"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Glowing gradient effect */}
          <div
            className={`absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl opacity-30 blur group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-tilt ${
              isFlipped ? "animate-none" : ""
            }`}
          ></div>

          <div
            className="absolute w-full h-full transform-gpu transition-all duration-500 ease-in-out [transform-style:preserve-3d]"
            style={{
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front - Language Target (to co chcemy się nauczyć) */}
            <div className="absolute w-full h-full [backface-visibility:hidden]">
              <Card className="w-full h-full flex flex-col justify-between border-0 shadow-xl bg-black/40 backdrop-blur overflow-hidden rounded-xl">
                <motion.div
                  className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-1 md:mb-3 flex flex-col items-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 md:mb-3">
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

                <div className="p-2 flex items-center justify-between text-xs text-gray-400 bg-gray-800/30 rounded-b-xl">
                  <div>
                    <Badge variant="outline" className="bg-gray-800/60 text-xs">
                      {card.category}
                    </Badge>
                  </div>
                  <div className="text-xs">Click to flip</div>
                </div>
              </Card>
            </div>

            {/* Back - Language Source (nasz język ojczysty) */}
            <div
              className="absolute w-full h-full [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <Card className="w-full h-full flex flex-col justify-between border-0 shadow-xl bg-black/40 backdrop-blur overflow-hidden rounded-xl">
                <motion.div
                  className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-1 md:mb-3">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                      {card.origin_text}
                    </span>
                  </div>
                  <div className="text-gray-300 text-center italic text-xs sm:text-sm line-clamp-2 mt-1">
                    &quot;{card.example_using}&quot;
                  </div>
                </motion.div>

                <div className="p-2 flex items-center justify-between text-xs text-gray-400 bg-gray-800/30 rounded-b-xl">
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
        
        {/* Komponent z opcjami wyboru - umieszczony pod kartą */}
        <div className="w-full flex-shrink-0 mt-4">
          <MultipleChoiceAnswers
            card={card}
            isFlipped={isFlipped}
            onAnswer={handleAnswer}
            otherFlashcards={otherFlashcards}
          />
        </div>
      </div>
    </div>
  );
}
