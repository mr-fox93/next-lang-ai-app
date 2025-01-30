"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export default function Home() {
  const [flashcards, setFlashcards] = useState<
    { origin_text: string; translate_text: string; example_using: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });

      if (!response.ok) throw new Error("Błąd pobierania fiszek");

      const data = await response.json();
      setFlashcards(data);
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
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        {loading ? "Generowanie..." : "Generuj fiszki"}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

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
