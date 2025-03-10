"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface FlashcardImportAnimationProps {
  flashcardCount: number;
  onComplete: () => void;
}

export function FlashcardImportAnimation({ 
  flashcardCount, 
  onComplete 
}: FlashcardImportAnimationProps) {
  const [stage, setStage] = useState<'preparing' | 'importing' | 'complete'>('preparing');
  
  useEffect(() => {
    const startAnimation = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setStage('importing');
      
      const totalDuration = Math.max(2000, Math.min(flashcardCount * 120, 4000));
      
      setTimeout(() => {
        setStage('complete');
        setTimeout(onComplete, 800);
      }, totalDuration);
    };
    
    startAnimation();
    
    return () => {};
  }, [flashcardCount, onComplete]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full h-full max-w-3xl mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mx-auto p-8 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4b0082, #9400d3, #800080)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)'
          }}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-pink-500 blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-700 blur-3xl opacity-20"></div>
          
          <div className="text-center relative z-10">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              style={{ color: 'white' }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-200">
                Flashcards AI
              </span>{" "}
              {stage === 'preparing' && "preparing..."}
              {stage === 'importing' && "importing..."}
              {stage === 'complete' && "complete!"}
            </motion.h2>
            
            <div className="my-8 relative">
              <motion.div
                className="bg-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg w-4/5 mx-auto p-4 mb-2"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <div className="bg-purple-300/20 h-3 w-3/4 rounded mb-2"></div>
                <div className="bg-purple-300/20 h-3 w-full rounded mb-2"></div>
                <div className="bg-purple-300/20 h-3 w-2/3 rounded mb-2"></div>
                <div className="bg-purple-300/20 h-3 w-5/6 rounded"></div>
              </motion.div>
              
              <motion.div
                className="bg-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg w-4/5 mx-auto absolute top-3 left-0 right-0 p-4"
                style={{ zIndex: -1 }}
              >
                <div className="bg-purple-300/10 h-3 w-3/4 rounded mb-2"></div>
                <div className="bg-purple-300/10 h-3 w-full rounded mb-2"></div>
                <div className="bg-purple-300/10 h-3 w-2/3 rounded mb-2"></div>
                <div className="bg-purple-300/10 h-3 w-5/6 rounded"></div>
              </motion.div>
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4].map((dot) => (
                <motion.div
                  key={dot}
                  className="h-2 w-2 bg-pink-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: dot * 0.3,
                  }}
                />
              ))}
            </div>
            
            {stage === 'complete' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <CheckCircle className="h-16 w-16 mx-auto mb-2 text-green-400" />
                <p className="text-white text-sm">
                  Successfully imported {flashcardCount} flashcards!
                </p>
              </motion.div>
            ) : (
              <p className="text-purple-200 text-sm">
                {stage === 'preparing' && "Preparing your content..."}
                {stage === 'importing' && `Importing ${flashcardCount} flashcards...`}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 