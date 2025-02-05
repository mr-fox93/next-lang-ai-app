"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import type { Flashcard } from "@/lib/sample-flashcards";
import { useState } from "react";

interface FlashcardGridProps {
  cards: Flashcard[];
}

export function FlashcardGrid({ cards }: FlashcardGridProps) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="aspect-[3/2] relative cursor-pointer [perspective:1000px] group"
          onClick={() => toggleCard(card.id)}
        >
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

          <motion.div
            className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-150"
            animate={{ rotateY: flippedCards[card.id] ? 180 : 0 }}
          >
            {/* Front */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
              <div className="h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 flex flex-col group hover:border-purple-500/50 transition-all duration-300 hover:bg-black/50 hover:shadow-2xl">
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80">
                    {card.front.word}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">
                      {card.front.phonetic}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add pronunciation logic here
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-gray-300 text-center italic text-sm line-clamp-2">
                    &quot;{card.front.example}&quot;
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 flex flex-col group hover:border-purple-500/50 transition-all duration-300 hover:bg-black/50 hover:shadow-2xl">
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80">
                    {card.back.translation}
                  </h3>
                  <div className="text-gray-300 text-center italic text-sm line-clamp-2">
                    &quot;{card.back.example}&quot;
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
