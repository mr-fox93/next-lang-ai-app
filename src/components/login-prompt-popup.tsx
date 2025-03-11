"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LogIn,
  UserPlus,
  LanguagesIcon,
  Check,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LoginPromptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginPromptPopup({
  isOpen,
  onClose,
  message = "Sign in to unlock all features including saving flashcards, tracking progress, and generating new content!",
}: LoginPromptPopupProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);

    // Gdy popup jest otwarty, blokujemy przewijanie strony
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Czyszczenie przy odmontowaniu
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignIn = () => {
    router.push("/sign-in?redirect=/flashcards");
    onClose();
  };

  const handleSignUp = () => {
    window.location.href =
      "https://nearby-mackerel-82.accounts.dev/sign-up?redirect=%2Fimport-guest-flashcards";
    onClose();
  };

  const handleClerkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open("https://clerk.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md mx-auto bg-gradient-to-br from-black to-gray-900 border border-purple-500/30 rounded-xl shadow-2xl p-6 z-[201] overflow-hidden"
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Glowing accent */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8 relative">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-full mb-4 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <LanguagesIcon className="h-10 w-10 text-purple-400" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 mb-3">
                Enhance Your Learning Experience
              </h3>
              <p className="text-gray-300 mb-2">{message}</p>
              <motion.p
                className="text-purple-400 text-sm font-medium"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.8, 1],
                  textShadow: [
                    "0 0 0px rgba(168, 85, 247, 0.5)",
                    "0 0 4px rgba(168, 85, 247, 0.8)",
                    "0 0 0px rgba(168, 85, 247, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
              >
                Registration is completely free!
              </motion.p>
            </div>

            <div className="space-y-4 relative">
              <div className="space-y-3 mb-5">
                <div className="flex items-center text-gray-300">
                  <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Unlimited access to flashcards in all languages.
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0" />
                  <span className="text-sm">Track your learning progress.</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Sync flashcards across all your devices.
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-0 font-medium"
                onClick={handleSignIn}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                className="w-full bg-transparent border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium"
                onClick={handleSignUp}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white font-medium group"
                onClick={onClose}
              >
                Continue as Guest
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              {/* Secured by Clerk */}
              <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>
                    Secured by{" "}
                    <button
                      onClick={handleClerkClick}
                      className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Clerk
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
