"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Save, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SaveFlashcardsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveFlashcardsPopup({
  isOpen,
  onClose,
}: SaveFlashcardsPopupProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(isOpen);

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

  const handleSignIn = () => {
    try {
      sessionStorage.setItem("flashcardsToImport", "true");
      sessionStorage.setItem("directRedirectAfterImport", "true");
      router.push("/sign-in?redirect=/import-guest-flashcards");
    } catch (error) {
      console.error("Error preparing for import:", error);
    }
    onClose();
  };

  const handleSignUp = () => {
    window.location.href =
      "https://nearby-mackerel-82.accounts.dev/sign-up?redirect=%2Fimport-guest-flashcards";
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm mx-auto bg-gradient-to-br from-black to-gray-900 border border-purple-500/30 rounded-xl shadow-2xl p-5 z-[201] overflow-hidden"
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

            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-5 relative">
              <div className="inline-block p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-full mb-3 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <Save className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 mb-2">
                Save Your Flashcards
              </h3>
              <p className="text-gray-300 text-sm">
                To save your flashcards, you must log in or create a free
                account. This will allow you to access them anytime, from any
                device.
              </p>
            </div>

            <div className="space-y-3 relative">
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
                Create Account (Free)
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white font-medium group"
                onClick={onClose}
              >
                Continue as Guest
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
