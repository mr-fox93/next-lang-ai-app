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
import { AlertCircle, Loader } from "lucide-react";
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

      const shouldImport = sessionStorage.getItem("flashcardsToImport");

      if (guestFlashcards.length > 0 && shouldImport === "true") {
        importFlashcards(guestFlashcards);
        sessionStorage.removeItem("flashcardsToImport");
        sessionStorage.removeItem("directRedirectAfterImport");
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-700 bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Importing Flashcards</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Loader className="w-12 h-12 mb-4" />
            <p>Your flashcards are being imported...</p>
          </CardContent>
        </Card>
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
