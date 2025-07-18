"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";

interface WelcomeNewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeNewUserModal({
  isOpen,
  onClose,
}: WelcomeNewUserModalProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(isOpen);
  const t = useTranslations('Flashcards');

  useEffect(() => {
    setIsVisible(isOpen);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleGenerateFirstFlashcards = () => {
    onClose();
    router.push("/");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto bg-gradient-to-br from-black via-gray-900 to-purple-900/20 border border-purple-500/30 rounded-2xl shadow-2xl p-4 sm:p-8 z-[201] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6 sm:mb-8 relative">
              {/* Welcome icon */}
              <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-full mb-4 sm:mb-6 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
                </motion.div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-3 sm:mb-4">
                {t('welcomeTitle')}
              </h2>
              
              <p className="text-gray-300 text-base sm:text-lg mb-4 sm:mb-6">
                {t('welcomeSubtitle')}
              </p>

              <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
                {t('welcomeDescription')}
              </p>
            </div>

            {/* Features preview */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center text-gray-300 bg-white/5 rounded-lg p-2.5 sm:p-3">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {t('unlimitedFlashcards')}
                </span>
              </div>
              <div className="flex items-center text-gray-300 bg-white/5 rounded-lg p-2.5 sm:p-3">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {t('trackProgress')}
                </span>
              </div>
              <div className="flex items-center text-gray-300 bg-white/5 rounded-lg p-2.5 sm:p-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {t('syncDevices')}
                </span>
              </div>
            </div>

            {/* Action button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleGenerateFirstFlashcards}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-0 font-medium py-3 sm:py-4 text-base sm:text-lg shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t('generateFirstFlashcards')}
              </Button>
            </motion.div>

            <p className="text-center text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
              {t('accessLater')}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 