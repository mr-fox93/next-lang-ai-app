"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { CheckCircle, AlertCircle } from "lucide-react";
import { FlashcardImportAnimation } from "@/components/flashcard-import-animation";
import { guestFlashcardsStorage } from "@/utils/guest-flashcards-storage";
import { importGuestFlashcardsAction } from "@/app/actions/flashcard-actions";

export default function ImportGuestFlashcardsPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [shouldDirectRedirect, setShouldDirectRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const guestFlashcards = guestFlashcardsStorage.getFlashcards();
    setFlashcardCount(guestFlashcards.length);
    
    const shouldImport = sessionStorage.getItem("flashcardsToImport");
    const directRedirect = sessionStorage.getItem("directRedirectAfterImport");
    
    setShouldDirectRedirect(true);
    
    if (guestFlashcards.length > 0 && shouldImport === "true") {
      importFlashcards(guestFlashcards);
      sessionStorage.removeItem("flashcardsToImport");
      sessionStorage.removeItem("directRedirectAfterImport");
    }
  }, []);

  const importFlashcards = async (flashcards: any[]) => {
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
        setError(result.error || "An unknown error occurred while importing flashcards");
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
    router.push("/flashcards");
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
              onClick={handleComplete}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              Go to Flashcards
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <FlashcardImportAnimation 
      flashcardCount={flashcardCount} 
      onComplete={handleComplete} 
    />
  );
} 