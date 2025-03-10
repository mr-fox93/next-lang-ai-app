"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
  message = "Sign in to unlock all features including saving flashcards, tracking progress, and generating new content!"
}: LoginPromptPopupProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    
    // Gdy popup jest otwarty, blokujemy przewijanie strony
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Czyszczenie przy odmontowaniu
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSignIn = () => {
    router.push("/sign-in?redirect=/flashcards");
    onClose();
  };

  const handleSignUp = () => {
    router.push("/sign-up?redirect=/flashcards");
    onClose();
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
            className="relative w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-xl shadow-2xl p-6 z-[201]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Enhance Your Learning Experience
              </h3>
              <p className="text-gray-300">{message}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-transparent border border-purple-500 hover:bg-purple-500/20 text-white"
                onClick={handleSignUp}
              >
                Create Account
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={onClose}
              >
                Continue as Guest
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 