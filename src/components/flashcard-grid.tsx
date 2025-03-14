"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { Flashcard } from "@/core/entities/Flashcard";
import { speak, SupportedTTSLanguage } from "@/utils/speak";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mapowanie kodów języków na kody TTS
const langToTTSMap: Record<string, SupportedTTSLanguage> = {
  en: "en-US",
  pl: "pl-PL",
  es: "es-ES",
  it: "it-IT",
};

interface FlashcardGridProps {
  cards: Flashcard[];
}

export function FlashcardGrid({ cards }: FlashcardGridProps) {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <ScrollArea className="h-[calc(100vh-80px)] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
        {cards.map((card, index) => {
          const targetTTS = langToTTSMap[card.targetLanguage] || "en-US";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-[3/2] relative cursor-pointer [perspective:1000px] group"
              onClick={() => toggleCard(index)}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-150"
                animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
              >
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                  <div className="h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 flex flex-col group hover:border-purple-500/50 transition-all duration-300 hover:bg-black/50 hover:shadow-2xl overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80">
                        {card.translate_text}
                      </h3>
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
                      <div className="flex items-center justify-center gap-1 w-full">
                        <div className="text-gray-300 text-center italic text-sm line-clamp-2">
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
                    </div>

                    <div className="mt-auto pt-3 text-xs text-gray-400 border-t border-white/10">
                      Click to flip
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 flex flex-col group hover:border-purple-500/50 transition-all duration-300 hover:bg-black/50 hover:shadow-2xl overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80">
                        {card.origin_text}
                      </h3>
                      <div className="text-gray-300 text-center italic text-sm line-clamp-2">
                        &quot;{card.example_using}&quot;
                      </div>
                    </div>

                    <div className="mt-auto pt-3 text-xs text-gray-400 border-t border-white/10">
                      Click to flip
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
