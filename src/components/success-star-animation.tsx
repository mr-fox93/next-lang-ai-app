"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface SuccessStarAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export function SuccessStarAnimation({
  isVisible,
  onAnimationComplete,
}: SuccessStarAnimationProps) {
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const selectedButton = document.querySelector(
      '[class*="border-emerald-500"]'
    );
    if (selectedButton) {
      const rect = selectedButton.getBoundingClientRect();
      setStartPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      setStartPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    const progressElement = document.querySelector(
      '[class*="fixed top-2 right-5"]'
    );
    if (progressElement) {
      const rect = progressElement.getBoundingClientRect();
      setEndPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      setEndPosition({ x: window.innerWidth - 50, y: 40 });
    }

    setIsPositioned(true);
  }, [isVisible]);

  if (!isVisible || !isPositioned) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      ref={animationRef}
    >
      <motion.div
        className="absolute"
        initial={{
          x: startPosition.x,
          y: startPosition.y,
          scale: 0.1,
          opacity: 0,
        }}
        animate={{
          x: [startPosition.x, startPosition.x, endPosition.x],
          y: [startPosition.y, startPosition.y - 30, endPosition.y],
          scale: [0.1, 2, 0.8],
          opacity: [0, 1, 0],
        }}
        transition={{
          times: [0, 0.3, 1],
          duration: 1.2,
          ease: "easeInOut",
        }}
        onAnimationComplete={() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          setIsPositioned(false);
        }}
      >
        <div className="relative">
          <Star
            className="text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]"
            fill="#FBBF24"
            stroke="#FFA000"
            strokeWidth={1}
            size={48}
          />
          {/* Efekt blasku */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="w-full h-full rounded-full bg-yellow-300 blur-md"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.8, 0.4, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
          </div>

          {/* Małe gwiazdki */}
          <motion.div
            className="absolute top-0 left-0 w-3 h-3 rounded-full bg-yellow-200"
            animate={{
              x: [-15, -20, -15],
              y: [-15, -5, -15],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-yellow-200"
            animate={{
              x: [10, 15, 10],
              y: [10, 15, 10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
