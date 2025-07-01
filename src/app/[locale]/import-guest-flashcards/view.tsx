"use client";

import { useEffect, useState } from "react";
import { useRouter } from '@/i18n/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FlashcardImportAnimation } from "@/components/flashcard-import-animation";
import { guestFlashcardsStorage } from "@/utils/guest-flashcards-storage";
import { importGuestFlashcardsAction } from "@/app/actions/flashcard-actions";
import { ImportableFlashcard } from "@/types/flashcard";

export default function ImportGuestFlashcardsView() {
  const [isImporting, setIsImporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const guestFlashcards = guestFlashcardsStorage.getFlashcards();
      setFlashcardCount(guestFlashcards.length);

      const shouldImport = localStorage.getItem("flashcardsToImport");

      if (guestFlashcards.length > 0 && shouldImport === "true") {
        importFlashcards(guestFlashcards);
        localStorage.removeItem("flashcardsToImport");
        localStorage.removeItem("directRedirectAfterImport");
      }
    }
  }, []);

  const importFlashcards = async (flashcards: ImportableFlashcard[]) => {
    if (flashcards.length === 0) {
      setError("No flashcards to import");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importGuestFlashcardsAction(flashcards);

      if (result.success) {
        guestFlashcardsStorage.clearFlashcards();
        setIsComplete(true);
      } else {
        setError(
          result.error || "An unknown error occurred while importing flashcards"
        );
      }
    } catch (err) {
      console.error("Flashcard import error:", err);
      setError(
        err instanceof Error
          ? `Import error: ${err.message}`
          : "An unknown error occurred while importing flashcards"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleComplete = () => {
    router.push('flashcards');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-700 bg-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Import Flashcards</CardTitle>
            <CardDescription className="text-gray-400">
              An error occurred during import
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-300 mb-2">{error}</p>
              <p className="text-gray-400">
                You can try again or go to your flashcard collection.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              onClick={() => router.push('flashcards')}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              Go to Flashcards
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isImporting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="w-full h-full max-w-3xl mx-auto flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md mx-auto p-8 rounded-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #4b0082, #9400d3, #800080)",
              boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
            }}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-pink-500 blur-3xl opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-700 blur-3xl opacity-20"></div>

            <div className="text-center relative z-10">
              <motion.h2
                className="text-3xl font-bold mb-4"
                style={{ color: "white" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-200">
                  Flashcards AI
                </span>{" "}
                importing...
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

              <p className="text-purple-200 text-sm">
                Importing...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <FlashcardImportAnimation
        flashcardCount={flashcardCount}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <FlashcardImportAnimation
      flashcardCount={flashcardCount}
      onComplete={handleComplete}
    />
  );
}
