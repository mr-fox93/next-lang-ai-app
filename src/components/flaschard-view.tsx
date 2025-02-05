"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import type { FlashCard } from "@/lib/flashcard.schema";

interface FlashcardViewProps {
  card: FlashCard;
  onNext: (known: boolean) => void;
}

export function FlashcardView({ card, onNext }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

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
                  &quot;{card.example_using}&quot;
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 w-full max-w-md mx-auto">
        <Button
          size="lg"
          className="flex-1 bg-black/40 backdrop-blur-sm hover:bg-red-500/20 text-white border-2 border-red-500/30 hover:border-red-500 transition-all duration-300 relative group overflow-hidden hover:shadow-lg hover:shadow-red-500/20"
          onClick={() => onNext(false)}
        >
          <span className="relative flex items-center gap-2">
            <ThumbsDown className="h-5 w-5" />I can&apos;t
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-black/40 backdrop-blur-sm hover:bg-green-500/20 text-white border-2 border-green-500/30 hover:border-green-500 transition-all duration-300 relative group overflow-hidden hover:shadow-lg hover:shadow-green-500/20"
          onClick={() => onNext(true)}
        >
          <span className="relative flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />I can
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>
    </div>
  );
}
