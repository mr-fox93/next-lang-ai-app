"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { FlashCard } from "@/lib/flashcard.schema";

interface FlashcardsContextType {
  flashcards: FlashCard[];
  setFlashcards: (flashcards: FlashCard[]) => void;
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(
  undefined
);

export const FlashcardsProvider = ({ children }: { children: ReactNode }) => {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);

  return (
    <FlashcardsContext.Provider value={{ flashcards, setFlashcards }}>
      {children}
    </FlashcardsContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);
  if (!context) {
    throw new Error("useFlashcards must be used within a FlashcardsProvider");
  }
  return context;
};
