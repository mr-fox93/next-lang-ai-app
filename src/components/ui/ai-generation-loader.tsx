"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const generationSteps = [
  "Analyzing content...",
  "Extracting key concepts...",
  "Creating flashcards...",
  "Adding examples...",
  "Finalizing...",
];

export function AIGenerationLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % generationSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden">
      <div className="max-w-md w-full p-8 relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl" />
        
        {/* Pulsating circles in background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="flex flex-col items-center justify-center relative z-10">
          {/* "Flashcards AI" header */}
          <motion.h3
            className="text-2xl font-bold text-white mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Flashcards AI
            </span> working...
          </motion.h3>
          
          {/* Animated cards */}
          <div className="relative w-full h-40 mb-10">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 left-0 right-0 mx-auto w-64 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden"
                style={{ zIndex: 5 - i }}
                initial={{ y: 20 * i, opacity: 1 - i * 0.2, rotateZ: i % 2 === 0 ? -2 : 2 }}
                animate={{
                  y: [20 * i, 20 * i - 15, 20 * i],
                  opacity: [1 - i * 0.2, 1 - i * 0.1, 1 - i * 0.2],
                  rotateZ: i % 2 === 0 ? [-2, 0, -2] : [2, 0, 2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {/* Lines representing text */}
                <div className="p-4 h-full flex flex-col justify-between">
                  <motion.div
                    className="h-3 bg-white/20 rounded-full w-3/4"
                    animate={{ width: ["60%", "80%", "60%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="space-y-2">
                    <motion.div
                      className="h-2 bg-white/10 rounded-full"
                      animate={{ width: ["100%", "70%", "100%"] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-2 bg-white/10 rounded-full"
                      animate={{ width: ["85%", "100%", "85%"] }}
                      transition={{ duration: 2.7, repeat: Infinity }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* "Thinking" dots grid */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                animate={{
                  scale: i === currentStep % 5 ? [1, 1.5, 1] : 1,
                  opacity: i === currentStep % 5 ? 1 : 0.4,
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
          
          {/* Status text */}
          <div className="h-6 relative w-full text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                className="text-white/70 absolute w-full left-0 right-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {generationSteps[currentStep]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 