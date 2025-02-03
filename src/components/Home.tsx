"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { FlashCard } from "@/lib/flashcard.schema";

export default function Home() {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptMessage, setPromptMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      setProgress(0); // Resetuj progress
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + 10; // Stopniowe zwiększanie postępu
          return prev; // Utrzymanie wartości przed zakończeniem
        });
      }, 300);
    } else {
      setProgress(100); // Po zakończeniu ustawia na 100%
      setTimeout(() => setProgress(0), 500); // Reset po krótkim czasie
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5, message: promptMessage }),
      });

      if (!response.ok) throw new Error("Błąd pobierania fiszek");

      const data = await response.json();
      setFlashcards(data.flashcards);
      console.log("Wygenerowane fiszki:", data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił nieznany błąd.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Generator Fiszek</h1>
      <Input onChange={(e) => setPromptMessage(e.target.value)} />
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        {loading ? "Generowanie..." : "Generuj fiszki"}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && (
        <Progress
          value={progress}
          className="w-[60%] mt-4 transition-all duration-300"
        />
      )}

      <div className="mt-6">
        {flashcards.map((card, index) => (
          <div key={index} className="p-4 border rounded mb-2">
            <p className="font-bold">
              {card.origin_text} - {card.translate_text}
            </p>
            <p className="italic">&quot;{card.example_using}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
