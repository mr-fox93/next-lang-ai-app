"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ImageModal } from "./image-modal";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function HowItWorks() {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const howItWorksSection = document.getElementById("how-it-works");

      if (howItWorksSection) {
        const sectionTop = howItWorksSection.offsetTop;
        setShowScrollButton(scrollY > sectionTop + 300);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div id="how-it-works" className="relative min-h-screen w-full py-20">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Works
            </span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Learn any language in three simple steps.
          </p>
        </motion.div>

        {/* Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32 relative"
        >
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500">
                Step 1: Choose & Create
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Start your language journey in seconds.
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>Select your native language from the left dropdown.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>Choose target language from the right dropdown.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>Pick flashcard difficulty level.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>
                  Type what you want to learn: job interviews, ordering tapas,
                  or vacation phrases.
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                <span className="font-bold mr-2">EN</span> English
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                <span className="font-bold mr-2">PL</span> Polish
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                <span className="font-bold mr-2">ES</span> Spanish
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                <span className="font-bold mr-2">IT</span> Italian
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="group inline-block rounded-xl border border-purple-600/40 shadow-lg shadow-purple-900/20 bg-black/40 p-[3px] group-hover:border-purple-500/70 group-hover:shadow-purple-700/30 transition-all duration-300">
              <ImageModal
                src="/step1.png"
                alt="Language Selection"
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32 relative"
        >
          <div className="flex items-center justify-center order-2 md:order-1">
            <div className="group inline-block rounded-xl border border-pink-600/40 shadow-lg shadow-pink-900/20 bg-black/40 p-[3px] group-hover:border-pink-500/70 group-hover:shadow-pink-700/30 transition-all duration-300">
              <ImageModal
                src="/flashcard.png"
                alt="Flashcard Interaction"
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="text-left order-1 md:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-500">
                Step 2: Practice & Learn
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Master new vocabulary through interactive exercises.
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>View your flashcard with 4 multiple-choice options.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>
                  Select answers and flip cards to check translations.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>
                  Listen to correct pronunciation of words and example
                  sentences.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>Add more flashcards to any existing category.</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-pink-600 text-white">
                Native speaker audio
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-pink-600 text-white">
                Smart learning system
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-pink-600 text-white">
                Context examples
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
        >
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Step 3: Track & Improve
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Monitor your progress and reach your goals faster.
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>
                  See what you&apos;ve mastered and what&apos;s left to learn.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>Set daily learning targets that work for you.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>View visual progress charts to stay motivated.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>
                  Benefit from smart repetition that adapts to your learning.
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                Progress analytics
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                Custom study plans
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                Cross-device sync
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="group inline-block rounded-xl border border-purple-600/40 shadow-lg shadow-purple-900/20 bg-black/40 p-[3px] group-hover:border-purple-500/70 group-hover:shadow-purple-700/30 transition-all duration-300">
              <ImageModal
                src="/progress.png"
                alt="Progress Tracking"
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 z-50 border border-white/10 hover:border-white/20 transition-all duration-300"
            aria-label="Przewiń do góry"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
