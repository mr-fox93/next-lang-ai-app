"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { guestFlashcardsStorage } from "@/utils/guest-flashcards-storage";
import { importGuestFlashcardsAction } from "@/app/actions/flashcard-actions";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ImportGuestFlashcardsPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Sprawdzamy, czy istnieją fiszki do zaimportowania
    const guestFlashcards = guestFlashcardsStorage.getFlashcards();
    setFlashcardCount(guestFlashcards.length);
    
    // Sprawdzamy, czy mamy flagę w sessionStorage
    const shouldImport = sessionStorage.getItem("flashcardsToImport");
    
    if (guestFlashcards.length > 0 && shouldImport === "true") {
      importFlashcards(guestFlashcards);
      // Usuwamy flagę
      sessionStorage.removeItem("flashcardsToImport");
    }
  }, []);

  const importFlashcards = async (flashcards: any[]) => {
    if (flashcards.length === 0) {
      setError("Brak fiszek do zaimportowania");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importGuestFlashcardsAction(flashcards);
      
      if (result.success) {
        // Po udanym imporcie czyścimy localStorage
        guestFlashcardsStorage.clearFlashcards();
        setIsComplete(true);
      } else {
        setError(result.error || "Wystąpił nieznany błąd podczas importowania fiszek");
      }
    } catch (err) {
      console.error("Błąd importu fiszek:", err);
      setError(
        err instanceof Error 
          ? `Błąd importu: ${err.message}` 
          : "Wystąpił nieznany błąd podczas importowania fiszek"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleContinue = () => {
    router.push("/flashcards");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-700 bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Import Fiszek</CardTitle>
          <CardDescription className="text-gray-400">
            {isComplete 
              ? "Twoje fiszki zostały zaimportowane pomyślnie!"
              : isImporting 
                ? "Trwa importowanie twoich fiszek..." 
                : error 
                  ? "Wystąpił błąd podczas importowania fiszek" 
                  : `Importowanie ${flashcardCount} fiszek z trybu gościa`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-6">
          {isImporting ? (
            <Loader />
          ) : isComplete ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-300">
                Wszystkie twoje fiszki zostały pomyślnie dodane do twojego konta.
                Możesz teraz przeglądać je w swojej bibliotece.
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-300 mb-2">{error}</p>
              <p className="text-gray-400">
                Możesz spróbować ponownie lub przejść do kolekcji fiszek.
              </p>
            </div>
          ) : (
            <p className="text-gray-300 text-center">
              Za chwilę twoje fiszki z trybu gościa zostaną dodane do twojego konta.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleContinue}
            className="bg-purple-600 hover:bg-purple-500 text-white"
            disabled={isImporting}
          >
            {isComplete ? "Przejdź do moich fiszek" : "Kontynuuj"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 