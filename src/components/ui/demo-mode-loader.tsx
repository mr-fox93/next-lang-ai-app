"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Layers, Cpu, Sparkles, Zap } from "lucide-react";

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
    }, 1500);

    return () => {
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Modal Container */}
      <motion.div
        className="relative bg-black/95 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-10 max-w-lg w-full mx-4 shadow-2xl shadow-purple-500/10"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
        
        {/* Header with Logo */}
        <div className="relative flex items-center justify-center mb-10">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Layers className="w-10 h-10 text-purple-400" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -right-1"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cpu className="w-5 h-5 text-pink-400" />
              </motion.div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                Languito
              </h3>
              <motion.span 
                className="text-sm font-semibold text-purple-300 bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-3 py-1 rounded-full text-center border border-purple-400/30"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(168, 85, 247, 0.4)",
                    "0 0 20px 0 rgba(168, 85, 247, 0.4)",
                    "0 0 0 0 rgba(168, 85, 247, 0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                DEMO MODE
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Main Loading Animation */}
        <div className="relative flex flex-col items-center mb-10">
          {/* Central Rotating Ring */}
          <div className="relative w-32 h-32 mb-8">
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 border-2 border-purple-400/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle Ring */}
            <motion.div
              className="absolute inset-2 border-2 border-pink-400/60 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Core */}
            <motion.div
              className="absolute inset-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.5)",
                  "0 0 40px rgba(236, 72, 153, 0.7)",
                  "0 0 20px rgba(168, 85, 247, 0.5)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>


          </div>
        </div>

        {/* Status Text */}
        <div className="relative text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-white text-lg font-medium">
                {demoSteps[currentStep]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Enhancement */}
        <div className="relative flex justify-center">
          <motion.div
            className="flex items-center space-x-2 text-purple-300 text-sm"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4" />
            <span>Powered by AI</span>
          </motion.div>
        </div>

        {/* Subtle Border Glow */}
        <div className="absolute inset-0 rounded-3xl border border-purple-400/20 pointer-events-none"></div>
      </motion.div>
    </div>
  );
} 