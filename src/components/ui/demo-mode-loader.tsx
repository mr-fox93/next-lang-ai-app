"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Layers, Cpu, Sparkles } from "lucide-react";

const demoSteps = [
  "Initializing demo environment...",
  "Loading demo data...", 
  "Setting up your session...",
  "Ready to explore!",
];

export function DemoModeLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 1200);

    return () => {
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Modal Container */}
      <motion.div
        className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-8">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <Layers className="w-8 h-8 text-purple-500" />
              <Cpu className="w-4 h-4 text-pink-500 absolute -bottom-1 -right-1" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Languito
              </h3>
              <motion.span 
                className="text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full text-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                DEMO MODE
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Main Visual Animation - Morphing Geometric Loader */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-6">
            {/* Morphing geometric shapes */}
            <motion.div
              className="absolute inset-0 border-2 border-purple-500/60"
              animate={{
                borderRadius: ["0%", "50%", "25%", "0%"],
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.1, 0.9, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Inner morphing shape */}
            <motion.div
              className="absolute inset-3 bg-gradient-to-r from-purple-500/40 to-pink-500/40"
              animate={{
                borderRadius: ["50%", "0%", "50%", "25%", "50%"],
                rotate: [360, 270, 180, 90, 0],
                scale: [0.8, 1.2, 0.6, 1.1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Central pulsing core */}
            <motion.div
              className="absolute inset-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.3, 0.7, 1.2, 1],
                opacity: [0.8, 1, 0.6, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            {/* Orbiting particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translateX(${30 + i * 5}px)`,
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* DNA Helix-like animation */}
          <div className="relative w-full h-12 mb-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${10 + i * 10}%`,
                  background: `linear-gradient(45deg, ${i % 2 === 0 ? '#a855f7' : '#ec4899'}, ${i % 2 === 0 ? '#ec4899' : '#a855f7'})`,
                }}
                animate={{
                  y: [0, -20, 0, 20, 0],
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              className="text-white/80 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {demoSteps[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0, 1, 0],
                scale: [0, 2, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
} 